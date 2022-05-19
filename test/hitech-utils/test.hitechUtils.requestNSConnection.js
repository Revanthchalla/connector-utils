'use strict'

var assert = require('assert')
  , nock = require('nock')
  , utils = require('../../hitech-utils/utils.js').utils
  , TEST_URL = require('./test.hitechUtils.constants.js').constants.TEST_URL

describe('Testing the test.hitechUtils.requestNSConnection functionality', function() {

  before(function(done) {
    nock(TEST_URL)
      .matchHeader('Integrator-Netsuite-ScriptId', 'customscript_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Netsuite-DeployId', 'customdeploy_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validNSConnection/proxy')
      .reply(200, 'success data')

    nock(TEST_URL)
      .matchHeader('Integrator-Netsuite-ScriptId', 'customscript_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Netsuite-DeployId', 'customdeploy_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validNSConnection/proxy')
      .replyWithError('something awful happened')

    nock(TEST_URL)
      .matchHeader('Integrator-Netsuite-ScriptId', 'customscript_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Netsuite-DeployId', 'customdeploy_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validNSConnection/proxy')
      .reply(200, 'success data2')

    nock(TEST_URL)
      .matchHeader('Integrator-Netsuite-ScriptId', 'customscript_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Netsuite-DeployId', 'customdeploy_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validNSConnection/proxy')
      .replyWithError('something awful happened')

    nock(TEST_URL)
      .matchHeader('Integrator-Netsuite-ScriptId', 'customscript_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Netsuite-DeployId', 'customdeploy_celigo_netsuite_service_iio')
      .matchHeader('Integrator-Method', 'GET')
      .post('/v1/connections/validNSConnection/proxy')
      .reply(404)

    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return expectedResult when hitechUtils.requestNSConnection is called - success', function(done) {

    var mainCb = function() {}

    utils.requestNSConnection('validNSConnection'
      , 'customscript_celigo_netsuite_service_iio'
      , 'customdeploy_celigo_netsuite_service_iio'
      , 'GET'
      , true
      , 'Could not get the data from NS'
      , 'sampleBearerToken'
      , mainCb
      , function(data) {
        assert.deepEqual(data, 'success data')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestNSConnection is called - error', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'something awful happened')
      done()
    }

    utils.requestNSConnection('validNSConnection'
      , 'customscript_celigo_netsuite_service_iio'
      , 'customdeploy_celigo_netsuite_service_iio'
      , 'GET'
      , true
      , 'Could not get the data from NS'
      , 'sampleBearerToken'
      , mainCb
      , function() {})

  })

  it('should return expectedResult when hitechUtils.requestNSConnection is called - plain request success', function(done) {

    utils.requestNSConnection('validNSConnection'
      , 'customscript_celigo_netsuite_service_iio'
      , 'customdeploy_celigo_netsuite_service_iio'
      , 'GET'
      , true
      , null
      , 'sampleBearerToken'
      , null
      , function(error, response, body) {
        assert.deepEqual(body, 'success data2')
        done()
      })

  })

  it('should return expectedResult when hitechUtils.requestNSConnection is called - plain request error', function(done) {

    utils.requestNSConnection('validNSConnection'
      , 'customscript_celigo_netsuite_service_iio'
      , 'customdeploy_celigo_netsuite_service_iio'
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

  it('should return expectedResult when hitechUtils.requestNSConnection is called - error with message', function(done) {

    var mainCb = function(err) {
      assert.deepEqual(err.message, 'Could not get the data from NS')
      done()
    }

    utils.requestNSConnection('validNSConnection'
      , 'customscript_celigo_netsuite_service_iio'
      , 'customdeploy_celigo_netsuite_service_iio'
      , 'GET'
      , true
      , 'Could not get the data from NS'
      , 'sampleBearerToken'
      , mainCb
      , function() {})

  })

})