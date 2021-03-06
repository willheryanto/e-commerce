const app = require('../app')
const chai = require('chai')
const chaiHttp = require('chai-http')
const { expect } = chai
const mongoose = require('mongoose')

chai.use(chaiHttp)

let token

describe('User /users', function () {
  describe('Register POST /users/register', function () {
    before(function (done) {
      mongoose.connect('mongodb://localhost/e-commerce-test', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, function () {
        mongoose.connection.db.dropDatabase(function () {
          done()
        })
      })
    })

    it('should not create with blank string in email field', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: '',
          email: '',
          password: '123456'
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include(`Email is required`)
          done()
        })
    })

    it('should not create with blank string in password field', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: '',
          email: 'buzz@gmail.com',
          password: ''
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include(`Password is required`)
          done()
        })
    })

    it('should not create with blank string in name field', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: '',
          email: 'buzz@gmail.com',
          password: '123456'
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include(`Name is required`)
          done()
        })
    })

    it('should not create with empty in all field', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: '',
          email: '',
          password: ''
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include(`Email is required`)
          expect(res.body.errors).to.include(`Password is required`)
          done()
        })
    })

    it('should not create with invalid email format', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: '',
          email: 'buzz.com',
          password: ''
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include('Invalid email format')
          done()
        })
    })

    it('should create with valid email address', function (done) {
      chai.request(app)
        .post('/users/register')
        .send({
          name: 'buzz',
          email: 'buzz@gmail.com',
          password: '123456'
        })
        .end(function (err, res) {
          // console.log(res.body.user)
          expect(err).to.be.null
          expect(res).to.have.status(201)
          expect(res.body.user).to.have.property('email')
          expect(res.body.user).to.have.property('password')
          expect(res.body.user.password).to.not.equal('123456')
          expect(res.body).to.have.property('token')
          done()
        })
    })
  })

  describe('Sign In POST /users/login/', function () {
    after(function (done) {
      module.exports = token
      done()
    })

    it('should not get a token from invalid email or password', function (done) {
      chai.request(app)
        .post('/users/login')
        .send({
          email: 'buzz@gmail.com',
          password: '1234567'
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.not.have.property('token')
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include('Invalid login or password')
          done()
        })
    })

    it('should be failed from blank input from both email or password', function (done) {
      chai.request(app)
        .post('/users/login')
        .send({
          email: '',
          password: ''
        })
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.not.have.property('token')
          expect(res.body).to.have.property('errors')
          expect(res.body.errors).to.include('Invalid login or password')
          done()
        })
    })

    it('should get a token from sign in', function (done) {
      chai.request(app)
        .post('/users/login')
        .send({
          email: 'buzz@gmail.com',
          password: '123456'
        })
        .end(function (err, res) {
          // console.log(res.body)
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('user')
          expect(res.body).to.have.property('token')
          token = res.body.token
          done()
        })
    })
  })

  describe('Get One GET /users', function () {
    it('should not get one with invalid token', function (done) {
      chai.request(app)
        .get('/users')
        .set('token', 'asd')
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          done()
        })
    })

    it('should not get one with no token', function (done) {
      chai.request(app)
        .get('/users')
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(400)
          expect(res.body).to.have.property('errors')
          done()
        })
    })

    it('should return user object with valid token', function (done) {
      chai.request(app)
        .get('/users')
        .set('token', token)
        .end(function (err, res) {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.have.property('name')
          expect(res.body).to.have.property('email')
          expect(res.body).to.have.property('password')
          done()
        })
    })
  })
})