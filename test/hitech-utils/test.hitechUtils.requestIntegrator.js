'use strict'

var assert = require('assert')
  , nock = require('nock')
  , utils = require('../../hitech-utils/utils.js').utils
  , TEST_URL = require('./test.hitechUtils.constants.js').constants.TEST_URL

describe('Testing the test.hitechUtils.requestIntegrator functionality', function() {

  before(function(done) {
    nock(TEST_URL)
      .get('/path1')
      .reply(200, 'success data')
      .get('/path2')
      .replyWithError('something awful happened')
      .get('/path3')
      .reply(200, 'success data2')
      .get('/path4')
      .replyWithError('something awful happened')
      .get('/path5')
      .reply('404')

    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return expectedResult when hitechUtils.requestIntegrator is called - success', function(done) {

    var mainCb = function() {}

    utils.requestIntegrator('/path1'
      , 'GET'
      , true
      , 'Could not get data from integrator'
      , 'sampleBearerToken'
      , mainCb
      , function(data) {
        assert.deepEqual(data, 'success data')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestIntegrator is called - error', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'something awful happened')
      done()
    }

    utils.requestIntegrator('/path2'
      , 'GET'
      , true
      , 'Could not get data from integrator'
      , 'sampleBearerToken'
      , mainCb
      , function() {})

  })

  it('should return expectedResult when hitechUtils.requestIntegrator is called - plain request success', function(done) {

    utils.requestIntegrator('/path3'
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

  it('should return expectedResult when hitechUtils.requestIntegrator is called - plain request error', function(done) {

    utils.requestIntegrator('/path4'
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

  it('should return expectedResult when hitechUtils.requestIntegrator is called - error with message', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'Could not get data from integrator')
      done()
    }

    utils.requestIntegrator('/path5'
      , 'GET'
      , true
      , 'Could not get data from integrator'
      , 'sampleBearerToken'
      , mainCb
      , function() {})
  })

})