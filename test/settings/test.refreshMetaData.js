'use strict'

var assert = require('assert')
  , RefreshMetaData = require('../../settings/refreshMetaData')
  , nock = require('nock')
  , fs = require('fs')
  , logger = require('winston')
  , CONSTS = require('../../constants')
  , _ = require('lodash')

describe('RefreshMetaData unit tests', function () {

  var integration = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.genericIntegration.json', 'utf8'))
  var integrationWithGrouping = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.genericIntegrationGrouping.json', 'utf8'))
  var searchResults = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.listSavedSearchesResult.json', 'utf8'))
  var updatedIntegration = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.updatedIntegration.json', 'utf8'))
  var updatedIntegrationWithGrouping = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.updatedIntegrationGrouping.json', 'utf8'))


  afterEach(function (done) {
    nock.cleanAll()
    done()
  })

  it('should update integration json with saved searches', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy/')
      .reply(200, [{ "a": "b" }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)


    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    var setupdata = {}
    refreshMetaDataObj.loadIntegration(options, setupdata, function (err, connectionId) {
      if (err) return done(err)
      var paramObject =
        {
          options: options
          , nsConnectionId: connectionId
        }

      var results = searchResults
      refreshMetaDataObj.findFieldToBeUpdated(setupdata, options, function (err, fieldfound) {
        if (err || !fieldfound) return done(new Error('Unable to find field in Integration settings : ' + options.fieldName))
        //convert results to UI format
        var fieldoptions = []
        _.each(results, function (result) {
          logger.info('result', JSON.stringify(result))
          var entry = []
          entry.push(result['id'])
          entry.push(result['text'])
          fieldoptions.push(entry)
        })
        //set field options
        fieldfound.options = fieldoptions
        assert.deepEqual(setupdata.integration.sections, updatedIntegration.sections)
        done()
      })
    })
  })

  it('should update integration json with saved searches when grouping is enabled', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy/')
      .reply(200, [{ "a": "b" }])
      .get('/v1/integrations/integrationId')
      .reply(200, integrationWithGrouping)


    var refreshMetaDataObj = new RefreshMetaData(true)
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    var setupdata = {}
    refreshMetaDataObj.loadIntegration(options, setupdata, function (err, connectionId) {
      if (err) return done(err)
      var paramObject =
        {
          options: options
          , nsConnectionId: connectionId
        }

      var results = searchResults
      refreshMetaDataObj.findFieldToBeUpdated(setupdata, options, function (err, fieldfound) {
        if (err || !fieldfound) return done(new Error('Unable to find field in Integration settings : ' + options.fieldName))
        //convert results to UI format
        var fieldoptions = []
        _.each(results, function (result) {
          logger.info('result', JSON.stringify(result))
          var entry = []
          entry.push(result['id'])
          entry.push(result['text'])
          fieldoptions.push(entry)
        })
        //set field options
        fieldfound.options = fieldoptions
        assert.deepEqual(setupdata.integration.settings.sections, updatedIntegrationWithGrouping.settings.sections)
        done()
      })
    })
  })

  it('should get saved searches', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      if (err) return done(err)
      logger.info('listSavedSearches, results', results)
      done()
    })
  })

  it('should get listShipMethods with option type extract', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'imports_importid_shipmethodLookup_dummyExtractsMethod_listShipMethods'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
        , type: 'extracts'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      if (err) return done(err)
      logger.info('listShipMethods, results', results)
      done()
    })
  })

  it('should get listShipMethods with option type of n col map', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'imports_importid_shipmethodLookup_listshipmethod'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
        , type: 'shipmethod_listShipMethods'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      if (err) return done(err)
      logger.info('listShipMethods, results', results)
      assert.deepEqual(results.optionsMap[2].options, [ { id: 'a', text: 'b' } ], "options should not be empty")
      done()
    })
  })

  it('should get listPaymentMethods with option type generates', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'imports_importid_paymentmethodLookup_listPaymentMethods'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
        , type: 'generates'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      if (err) return done(err)
      logger.info('listPaymentMethods, results', results)
      done()
    })
  })

  it('Should performs the execution of refreshMetaData by calling listSavedSearches method', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      if (err) return done(err)
      assert.deepEqual(results.options[0], ['a', 'b'], "options should not be empty")
      done()
    })
  })

  it('Should return emty array if field length is less than 4', function (done) {
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      console.log("results", results)
      assert.deepEqual(results, [])
      done()
    })
  })

  it('Should throw an error unable to find field', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)

    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_unknnownField_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Unable to find field in Integration settings : exports_exportId_unknnownField_listSavedSearches')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for proxy call', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .reply(200)
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Error while performing operation. Please contact Celigo Support. ')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for save integration', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
      .put('/v1/integrations/integrationId')
      .replyWithError('error occured')
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for wrong setting function', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'imports_importid_shipmethodLookup_dummyExtractsMethod_listShipMethods'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
        , type: 'extracts'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for load integration', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId')
      .replyWithError('error occured')
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for load integration for missing connection id', function (done) {
    var integration = JSON.parse(fs.readFileSync('./test/data/nsConnectorUtil/test.genericIntegration.json', 'utf8'))
    delete integration.settings.commonresources.netsuiteConnectionId
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId')
      .reply(200, integration)
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Error while connecting to integrator.io')
      done()
    })
  })

  it('Should throw an error for not connecting to IO for load integration for missing commonresources', function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .get('/v1/integrations/integrationId')
      .reply(200)
    var refreshMetaDataObj = new RefreshMetaData()
    var options =
      {
        fieldName: 'exports_exportId_savedSearch_listSavedSearches'
        , bearerToken: 'bearerToken'
        , _integrationId: 'integrationId'
      }

    refreshMetaDataObj.execute(options, function (err, results) {
      assert.equal(err.message, 'Integration does not contain netsuiteConnectionId at location settings.commonresources.netsuiteConnectionId ')
      done()
    })
  })
})
describe('refreshMetaData Tests: ', function () {
  var refreshMetaDataObj = new RefreshMetaData()

  var expected = {
    'label': 'NetSuite Saved Search for syncing inventory levels',
    'value': 'customsearch16085',
    'type': 'select',
    'name': 'exports_exportId_savedSearch_refreshItemSeaches',
    'supportsRefresh': true,
    'options': [
      [
        'customsearch16085',
        'Celigo Shopify Inventory Export [Store-US] Store'
      ]
    ]
  }
  it('should find field for refreshMetaData for multi-store', function (done) {
    var integrations = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))

    var options = {}
    options.fieldName = 'exports_exportId_savedSearch_refreshItemSeaches'
    var setupdata = {}
    setupdata.integration = integrations
    refreshMetaDataObj.findFieldToBeUpdated(setupdata, options, function (err, fieldFound) {
      if (err) return done(err)
      assert.deepEqual(fieldFound, expected)
      done()
    })
  })

  it('should find field for refreshMetaData for other-store', function (done) {
    var integrations = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
    var options = {}
    options.fieldName = 'exports_exportId_savedSearch_refreshItemSeaches'
    var setupdata = {}
    setupdata.integration = integrations
    refreshMetaDataObj.findFieldToBeUpdated(setupdata, options, function (err, fieldFound) {
      if (err) return done(err)
      assert.deepEqual(fieldFound, expected)
      done()
    })
  })
})
describe('registerFunction Tests: ', function () {
  var refreshMetaDataObj = new RefreshMetaData()

  it('should throw error registerFunction method missing', function (done) {
    var funcObj = {name: 'name', method: ''}
    try{
      refreshMetaDataObj.registerFunction(funcObj)
    } catch(e) {
      logger.error('error occured')
      done()
    }
  })

  it('should throw error registerFunction method missing', function (done) {
    var funcObj = {name: 'name'}
    try{
      refreshMetaDataObj.registerFunction(funcObj)
    } catch(e) {
      logger.error('error occured')
      done()
    }
  })

})