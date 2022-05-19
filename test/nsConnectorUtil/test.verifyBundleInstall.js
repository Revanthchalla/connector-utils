'use strict'

var assert = require('assert')
  , VerifyBundleInstall = require('../../nsConnectorUtil/verifyBundleInstall')
  , nock = require('nock')
  , fs = require('fs')
  , utils = require('../../installer/installerHelper')
  , logger = require('winston')
  , CONSTS = require('../../constants')
  , mockery = require('mockery')
  , _ = require('lodash')

describe('verifyBundleInstall unit tests', function () {
  var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
  before(function(done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .reply(200, [{statusCode : 200, results : [1,2]}])
    .get('/v1/integrations/integrationId')
    .reply(200, integration)

    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return isBundlePresent true when the bundle is present', function (done) {

    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , nsConnectionId : 'nsConnectionId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      if(err) return done(err)
      assert.equal(isBundlePresent,true)
      assert.deepEqual(results, [1,2])
      done()
    })
  })

  it('should populate nsConnectionId when provided only with integrationId in paramObject', function (done) {

    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , integrationId : 'integrationId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      if(err) return done(err)
      assert.equal(isBundlePresent,true)
      assert.deepEqual(results, [1,2])
      done()
    })
  })

  it('should return isBundlePresent false if scriptId is not present', function (done) {

    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , nsConnectionId : 'nsConnectionId'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      if(err) return done(err)
      assert.equal(isBundlePresent,false)
      done()
    })
  })

  it('should return isBundlePresent false if bearerToken is not present', function (done) {

    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { integrationId : 'integrationId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      if(err) return done(err)
      assert.equal(isBundlePresent,false)
      done()
    })
  })

  it('Should throw an error for not connecting to IO', function(done){
    nock.cleanAll()
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , nsConnectionId : 'nsConnectionId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should return emty results if proxy call response is emty', function(done){
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .reply(200, [])
    .get('/v1/integrations/integrationId')
    .reply(200, integration)
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , nsConnectionId : 'nsConnectionId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      console.log("results", results)
      assert.deepEqual(results, [])
      done()
    })
  })

  it('Should return error when netsuiteConnectionId is not present in commonresource', function(done){
    var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
    delete integration.settings.commonresources.netsuiteConnectionId
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .reply(200, [{statusCode : 200, results : [1,2]}])
    .get('/v1/integrations/integrationId')
    .reply(200, integration)
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , integrationId : 'integrationId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should return error when commonresource is not present in integration', function(done){
    var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
    delete integration.settings.commonresources
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .reply(200, [{statusCode : 200, results : [1,2]}])
    .get('/v1/integrations/integrationId')
    .reply(200, integration)
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , integrationId : 'integrationId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should return error when unable to load integration', function(done){
    var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
    delete integration.settings.commonresources
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .reply(200, [{statusCode : 200, results : [1,2]}])
    .get('/v1/integrations/integrationId')
    .replyWithError('error occured')
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , integrationId : 'integrationId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should return error when netsuite proxy call fails', function(done){
    var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
    delete integration.settings.commonresources
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
    .persist()
    .post('/v1/connections/nsConnectionId/proxy')
    .replyWithError('error occured')
    var verifyBundleInstallObj = new VerifyBundleInstall()
    var paramObject =
      { bearerToken : 'bearerToken'
      , nsConnectionId : 'nsConnectionId'
      , scriptId : 'customscript_generic_bundle_install'
      }
    verifyBundleInstallObj.execute(paramObject, function (err, isBundlePresent, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

})
