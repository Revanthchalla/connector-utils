'use strict'

//set enviornment as production
process.env.NODE_ENV = 'production'

var assert = require('assert')
  , Installer = require('../../installer/installer')
  , nock = require('nock')
  , fs = require('fs')
  , CONSTS = require('../../constants')
  , HERCULES_BASE_URL = 'https://api.integrator.io'
  , installer = new Installer()

describe('Installer Tests: ', function () {

  before(function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {})
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(200)
      done()
  })

  it('should create record by createRecordsInOrder', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should create record by createRecordsInOrder with position', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.new.json', 'utf8'))
    recordArray['bigcommerce-save-integration'].dependencyVerified = false
    recordArray['bigcommerce-save-integration'].resolved = false
    installer.createRecordsInOrder(
      recordArray,
      'bigcommerce-save-integration',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should create record by createRecordsInOrder with upgrage', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': true,
        'currentEdition': 'standard',
        'upgradeEdition': 'premium'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should throw error createRecordsInOrder with upgrage if current edition is not present', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': true,
        'upgradeEdition': 'premium'
      }, function (err, response, body) {
        assert.equal(err.message, '"Config Error: missing edition info to upgrade"')
        done()
      })
  })

  it('should throw error createRecordsInOrder if file location not present', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    recordArray['nsConnectorUtil-copy-fulfillmentExport'].isLoaded = false
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': false
      }, function (err, response, body) {
        assert.equal(err.message, '"Config Error: no filelocation given in record : nsConnectorUtil-copy-fulfillmentExport"')
        done()
      })
  })

  it('should create record by createRecordsInOrder with no serializedState', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, null)
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(200)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should create record by createRecordsInOrder with resolve true', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {
        "verifyConnectorBundle": {
          "export-itemid-webhook": {
            "info": {
              "data": {
                "name": "itemids-export-webhook"
              },
              "response": {
                "name": "itemids-export-webhook"
              }
            },
            "isLoaded": true,
            "dependencyVerified": true,
            "resolved": true
          }
        }
      })
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(200)
      .post('/v1/exports')
      .reply(200)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'verifyConnectorBundle',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': true,
        'currentEdition': 'standard',
        'upgradeEdition': 'premium'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should create record by createRecordsInOrder with resolve false', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {
        "verifyConnectorBundle": {
          "nsConnectorUtil-copy-fulfillmentExport": {
            "name": "nsConnectorUtil-copy-fulfillmentExport",
            "info": {
              "data": {
                "apiIdentifier": "apiIdentifier",
                "apiIdentifierData": { "test": "test" }
              },
              "apiIdentifier": true
            },
            "isLoaded": true,
            "dependencyVerified": false,
            "resolved": false
          }
        }
      })
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(200)
      .post('/v1/exports')
      .reply(200)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'verifyConnectorBundle',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': true,
        'currentEdition': 'standard',
        'upgradeEdition': 'premium'
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
  })

  it('should throw error in NS proxy call', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {})
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(422)
      .post('/apiIdentifier')
      .reply(200)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId',
        'upgradeMode': false,
        'connectorEdition': 'premium'
      }, function (err, response, body) {
        assert.strictEqual(err.message, 'An Error occurred while processing the resources creation. Error: [{"statusCode":422,"message":"Unable to verify response, Status Code: 422"}]')
        done()
      })
  })

  it('should throw error in API identifier', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {})
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(200)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(422)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.strictEqual(err.message, 'An Error occurred while processing the resources creation. Error: [{"statusCode":422,"message":"Unable to verify response, Status Code: 422"}]')
        done()
      })
  })

  it('should throw error in rest call', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, {})
      .get('/v1/integrations/integrationId')
      .reply(200, {})
      .put('/v1/integrations/integrationId')
      .reply(422)
      .post('/v1/connections/connectionId/proxy')
      .reply(200)
      .post('/apiIdentifier')
      .reply(200)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.strictEqual(err.message, 'An Error occurred while processing the resources creation. Error: [{"statusCode":422,"message":"Unable to verify response, Status Code: 422"}]')
        done()
      })
  })

  it('should throw error in get state call', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .replyWithError('error occurred')
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err.message, 'error occurred')
        done()
      })
  })

  it('should throw error in get state call if status of response is 401', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(401)
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err.message, '401 Unauthorized. Please retry, if the issue persists, please contact Celigo Support.')
        done()
      })
  })

  it('should throw error in get state call if serialized state is not an object', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId/state/serializedState')
      .reply(200, "123")
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      'export-itemid-webhook',
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err.message, 'Received unexpected format for state. Please retry, if the issue persists, please contact Celigo Support.')
        done()
      })
  })

  it('should throw error if key is missing', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      null,
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, 'key is missing, Please provide key to proceed')
        done()
      })
  })

  it('should throw error if recordArray is cyclic', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.cyclicRecord.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      null,
      {
        'bearerToken': "bearerToken",
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, 'The recordsArray has cyclic refreneces')
        done()
      })
  })

  it('should throw error if bearerToken is missing', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.cyclicRecord.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      null,
      {
        '_integrationId': 'integrationId'
      }, function (err, response, body) {
        assert.equal(err, 'Either bearerToken or integration id missing from option')
        done()
      })
  })

  it('should throw error if _integrationId is missing', function (done) {
    var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.cyclicRecord.json', 'utf8'))
    installer.createRecordsInOrder(
      recordArray,
      null,
      {
        'bearerToken': "bearerToken"
      }, function (err, response, body) {
        assert.equal(err, 'Either bearerToken or integration id missing from option')
        done()
      })
  })
})
