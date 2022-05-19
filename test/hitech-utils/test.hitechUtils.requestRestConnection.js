'use strict'

var assert = require('assert')
  , nock = require('nock')
  , utils = require('../../hitech-utils/utils.js').utils
  , TEST_URL = require('./test.hitechUtils.constants.js').constants.TEST_URL

describe('Testing the test.hitechUtils.requestRestConnection functionality', function() {

  before(function(done) {
    nock(TEST_URL)
      .matchHeader('Integrator-Relative-URI', '/path/to/endpoint')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validRestConnection/proxy')
      .reply(200, 'success data')

    nock(TEST_URL)
      .matchHeader('Integrator-Relative-URI', '/path/to/endpoint')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validRestConnection/proxy')
      .replyWithError('something awful happened')

    nock(TEST_URL)
      .matchHeader('Integrator-Relative-URI', '/path/to/endpoint2')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validRestConnection/proxy')
      .reply(200, 'success data2')

    nock(TEST_URL)
      .matchHeader('Integrator-Relative-URI', '/path/to/endpoint2')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validRestConnection/proxy')
      .replyWithError('something awful happened')

    nock(TEST_URL)
      .matchHeader('Integrator-Relative-URI', '/path/to/endpoint')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validRestConnection/proxy')
      .reply(404)

    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return expectedResult when hitechUtils.requestRestConnection is called - success', function(done) {

    var mainCb = function() {}

    utils.requestRestConnection('validRestConnection'
      , '/path/to/endpoint'
      , 'GET'
      , true
      , 'Could not get data from validRestConnection'
      , 'sampleBearerToken'
      , mainCb
      , function(data) {
        assert.deepEqual(data, 'success data')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestRestConnection is called - error', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'something awful happened')
      done()
    }

    utils.requestRestConnection('validRestConnection'
      , '/path/to/endpoint'
      , 'GET'
      , true
      , 'Could not get data from validRestConnection'
      , 'sampleBearerToken'
      , mainCb
      , function() {})

  })

  it('should return expectedResult when hitechUtils.requestRestConnection is called - plain request success', function(done) {

    utils.requestRestConnection('validRestConnection'
      , '/path/to/endpoint2'
      , 'GET'
      , true
      , null
      , 'sampleBearerToken'
      , null
      , function(error, response, body) {
        assert.deepEqual(response.statusCode, 200)
        assert.deepEqual(body, 'success data2')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestRestConnection is called - plain request error', function(done) {

    utils.requestRestConnection('validRestConnection'
      , '/path/to/endpoint2'
      , 'GET'
      , true
      , null
      , 'sampleBearerToken'
      , null
      , function(error) {
        assert.deepEqual(error.message, 'something awful happened')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestRestConnection is called - error with message', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'Could not get data from validRestConnection')
      done()
    }

    utils.requestRestConnection('validRestConnection'
      , '/path/to/endpoint'
      , 'GET'
      , true
      , 'Could not get data from validRestConnection'
      , 'sampleBearerToken'
      , mainCb
      , function() {})

  })

})