var assert = require('assert')
  , nock = require('nock')
  , logger = require('winston')
  , _ = require('lodash')
  , utils = require('../../hitech-utils/utils.js').utils
  , TEST_URL = require('./test.hitechUtils.constants.js').constants.TEST_URL
  , connData = [{
      "_id": "validNetsuiteConnId"
      , "_integrationId": "ADP - NetSuite Connector"
      , "_connectorId": ""
      , "type": "netsuite"
      , "resourceType": "connections"
      , "name": "NetSuite Connection(ADP Connector)"
    }
    , {
      "_id": "validADPConnId"
      , "_integrationId": "ADP - NetSuite Connector"
      , "_connectorId": ""
      , "type": "ftp"
      , "resourceType": "connections"
      , "name": "ADP Connection(ADP Connector)"
    }
  ]
  , distributedData = [{
    "recordType": "journalentry"
    , "operation": "add"
    , "_id": "ADP_Payroll_To_NetSuite_Journal_Entry_Add_Import"
    , "resourceType": "imports"
    , "isDistributed": true
    , "mapping": {}
  }]

describe('Testing the test.hitechUtils.createIOresource functionality', function() {
  before(function(done) {
    nock(TEST_URL)
      .post('/v1/connections')
      .reply(200, connData[0])
      .post('/v1/connections')
      .reply(200, connData[1])
    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return expectedResult when hitechUtils.createIOresource is called', function(done) {
    var expectedResult = {
      "bearerToken": "sampleBearerToken"
      , "_integrationId": "validIntegrationId"
    }
    var globalState = {
      bearerToken: ''
      , configs: []
    }
    globalState.bearerToken = expectedResult.bearerToken
    globalState.configs.push({
      "_id": "validNetsuiteConnId"
      , "_connectorId": "validIntegrationId"
      , "name": "ADP - NetSuite Connector"
    })

    var result = utils.createIOResource(connData, globalState, function(error) {
      if (error) {
        logger.info('Received Error' + error);
        assert.ifError(error)
      }
      logger.info('received Data from callback' + JSON.stringify(globalState))
      assert.deepEqual(expectedResult.bearerToken, globalState.bearerToken)
      assert.deepEqual(globalState.configs.length, 3)
      done();
    });
    logger.info('printing the result here' + JSON.stringify(result))
  })

})

describe('Testing the test.hitechUtils.createIOresource distributed functionality', function() {
  before(function(done) {
    nock(TEST_URL)
      .put('/v1/imports/ADP_Payroll_To_NetSuite_Journal_Entry_Add_Import/distributed')
      .reply(200, distributedData[0])
    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return expectedResult when distributed hitechUtils.createIOresource is called', function(done) {
    var expectedResult = {
      "bearerToken": "sampleBearerToken"
      , "_integrationId": "validIntegrationId"
    }
    var globalState = {
      bearerToken: ''
      , configs: []
    }
    globalState.bearerToken = expectedResult.bearerToken
    globalState.configs.push({
      "_id": "validNetsuiteConnId"
      , "_connectorId": "validIntegrationId"
      , "name": "ADP - NetSuite Connector"
    })

    var result = utils.createIOResource(distributedData, globalState, function(error) {
      if (error) {
        logger.info('Received Error' + error)
        assert.ifError(error)
      }
      logger.info('received Data from callback' + JSON.stringify(globalState))
      assert.deepEqual(expectedResult.bearerToken, globalState.bearerToken)
      assert.deepEqual(globalState.configs.length, 2)
      done()
    })
    logger.info('printing the result here' + JSON.stringify(result))
  })
})

describe('Testing the test.hitechUtils.createIOresource error functionality', function() {
  before(function(done) {
    nock(TEST_URL)
      .post('/v1/connections')
      .replyWithError({
        'message': 'Error while creating the connection data'
        , 'code': 'AWFUL_ERROR'
      })
      .post('/v1/connections')
      .reply(200, connData[1])
    done()
  })

  after(function(done) {
    nock.cleanAll()
    done()
  })

  it('should return error when hitechUtils.createIOresource is called', function(done) {
    var expectedError = {
      'message': 'Error while creating the connection data'
      , 'code': 'AWFUL_ERROR'
    };
    var globalState = {
      bearerToken: ''
      , configs: []
    }
    globalState.bearerToken = 'sampleBearerToken'
    globalState.configs.push({
      "_id": "validNetsuiteConnId"
      , "_connectorId": "validIntegrationId"
      , "name": "ADP - NetSuite Connector"
    })

    var result = utils.createIOResource(connData, globalState, function(error) {
      logger.info('Received Error' + error);
      if (error) {
        assert.deepEqual(error, expectedError);
      }
      logger.info('received Data from callback' + JSON.stringify(globalState))
        //assert.deepEqual(globalState.configs.length, 3)
      done();
    });
    logger.info('printing the result here' + JSON.stringify(result))
  })
})