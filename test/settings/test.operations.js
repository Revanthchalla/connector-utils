'use strict'

var assert = require('assert')
  , operations = require('../../settings/operations')
  , nock = require('nock')
  , fs = require('fs')
  , _ = require('lodash')

var HERCULES_BASE_URL = 'https://api.integrator.io'
if (process.env.NODE_ENV === 'staging') {
  HERCULES_BASE_URL = process.env.IO_DOMAIN ? ('https://api.' + process.env.IO_DOMAIN) : 'https://api.staging.integrator.io'
} else if (process.env.NODE_ENV === 'development') {
  //local testing of code
  HERCULES_BASE_URL = 'http://api.localhost.io:5000'
}

describe('Operations Tests ', function(){
  var predefinedOps
  before(function(done){
    predefinedOps = operations
    nock.cleanAll()
    done()
  })
  describe('method | savedSearch', function(done){
    it('Throw error if unable to load the export', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObject.json','utf8'))

      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(403, "dummy error message")
      predefinedOps.savedSearch(paramObject, function(err, response, body) {
      assert.equal(body, null)
      done()
      })
    })
    it('Throw error if unable to update the export', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObject.json','utf8'))
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200, {"netsuite" : {"restlet": {"searchId": "213456"}}})
        .put('/v1/exports/exportId')
        .reply(403, "dummy error message")
      predefinedOps.savedSearch(paramObject, function(err, response, body) {
      assert.equal(body, null)
      done()
      })
    })

    it("Should call saved search function successfully", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200, {"netsuite" : {"restlet": {"searchId": "213456"}}})
        .put('/v1/exports/exportId')
        .reply(200)
      predefinedOps.savedSearch(paramObject, function(err, res, body) {
        done()
      })
    })
  })
  describe('method | validateLockedSavedSearch', function(done){
    it('should throw an error, if locked search is selected', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObject.json','utf8'))
      paramObject.lockedScriptIds = ['customsearch_celigo_sfio_cust_financial']
      var searchId = "123456"
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/570b867c5fa1ca98367409ff/proxy')
        .reply(200, [{"statusCode":200,"results":[{"scriptId":"customsearch_celigo_sfio_cust_financial","recordType":"savedsearch"}]}])
      predefinedOps.validateLockedSavedSearch(paramObject, searchId, function(error, response, body) {
        var expectedError = 'You’ve selected a locked saved search. Please select another saved search and try again.'
        assert.equal(error.message, expectedError)
        done()
      })
    })
    it("Should pass the error check for Saved Search Id", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObject.json','utf8'))
      paramObject.lockedScriptIds = ['customsearch_celigo_sfio_cust_financial']
      var searchId = "123456"
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/570b867c5fa1ca98367409ff/proxy')
        .reply(200, [{"statusCode":200,"results":[{"scriptId":"customSearch123123","recordType":"savedsearch"}]}])
        predefinedOps.validateLockedSavedSearch(paramObject, searchId, function(error, response, body) {
        assert.equal(error, null)
        done()
      })
    })
  })
  describe('method | actionSlider', function(){
    it('Throw error if the sliderInput flag is not checked', function(){
      var input = {
        sliderInput: false
        , flowId: 'enableThisFlow'
        , disabled: false
        , options:{
          bearerToken : 'sampleToken'
        }
      }
      //nock the requests now
      predefinedOps.actionSlider(input, function(err){
        assert.equal(err, 'Unable to identify the flowid for enabling')
      })
    })

    it('Throw error if the Unable to save the flow', function(){
      var input = {
        sliderInput: true
        , flowId: 'enableThisFlow'
        , disabled: false
        , options:{
          bearerToken : 'sampleToken'
        }
      }
      //nock the requests here
      nock('https://api.integrator.io')
        .get('/v1/flows/enableThisFlow')
        .reply(200, {_id:'enableThisFlow', disabled: true})
         predefinedOps.actionSlider(input, function (err) {
           assert.equal(err.message, 'Something went wrong with the data!! customerDepositFlowsActions method has invalid options. Kindly retry, if issue persists please contact Celigo Support.')
         })
    })

    it('Throw error if the Unable to load the flow', function(){
      var input = {
        sliderInput: true
        , flowId: 'enableThisFlow'
        , disabled: false
        , options:{
          bearerToken : 'sampleToken'
        }
      }
      //nock the requests here
      nock('https://api.integrator.io')
        .get('/v1/flows/enableThisFlow')
        .reply(422)

      predefinedOps.actionSlider(input, function(err){
        assert.equal(err.message, 'Unable to save the flow. Error: Unable to verify response, Status Code: 422. If error persists please contact Celigo support')
      })
    })

    it('should run actionSlider successfully', function(){
      var input = {
        sliderInput: true
        , flowId: 'enableThisFlow'
        , disabled: false
        , options:{
          bearerToken : 'sampleToken'
        }
      }
      //nock the requests here
      nock('https://api.integrator.io')
        .get('/v1/flows/enableThisFlow')
        .reply(200, {_id:'enableThisFlow', disabled: true})
        .put('/v1/flows/enableThisFlow')
        .reply(200, {})
      predefinedOps.actionSlider(input, function(err){
        assert.equal(err.message, 'Something went wrong with the data!! customerDepositFlowsActions method has invalid options. Kindly retry, if issue persists please contact Celigo Support.')
      })
    })
  })
  describe('method | updateSearchLocationFilters', function(){
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
      , options: {
        pending: {
          searchId: 'inventoryExportSavedSearchId'
        }
        , bearerToken: 'bearerToken'
      }
      , searchId: true
      , settingParams: ['imports', 'importId']
    }
    it("Should throw error for not conneting to IO", function(done){
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId')
        .reply(200)
      predefinedOps.updateSearchLocationFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while connecting to integrator.io')
        done()
      })
    })

    it("Should throw error for not conneting to IO for statusCode", function(done){
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId')
        .reply(200)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, {"statusCode":422,"error":{"message":"Not Found"}})
      predefinedOps.updateSearchLocationFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while connecting to integrator.io')
        done()
      })
    })

    it("Should pass the error check to complete execution", function(done){
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId')
        .reply(200)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, [{"statusCode":200,"data":{"message":"Found"}}])
      predefinedOps.updateSearchLocationFilters(paramObject, function(err, res, body) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should call updateSearchLocationFilters function successfully if no nsConnectionId in paramObject", function(done){
      delete paramObject.nsConnectionId
      paramObject.options.integrationRecord = {
                              'settings' : {
                                'commonresources' : {
                                  'netsuiteConnectionId' :  'nsConnectionId'
                                }
                              }
                            }
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200)
      predefinedOps.updateSearchLocationFilters(paramObject, function(err, res, body) {
        done()
      })
    })

    it("Should throw error updateSearchLocationFilters for missing netsuiteConnectionId", function(done){
      delete paramObject.nsConnectionId
      delete paramObject.options.integrationRecord
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200)
      predefinedOps.updateSearchLocationFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.')
        done()
      })
    })
  })

  describe('method | updateSearchPricingFilters', function(){
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
      , options: {
        pending: {
          "storeId": {
    				"exports_1_savedSearch_listSavedSearches": "savedSearch1",
    				"exports_2_savedSearch_listSavedSearches": "savedSearch2"
    			}
        }
        , bearerToken: 'bearerToken'
      }
      , settingParams: ['exports', 'exportId']
    }
    it("Should throw error for not conneting to IO", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .replyWithError('error occured')
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Failed to updated the saved search in NetSuite. Error: Could not make network call. error occured')
        done()
      })
    })

    it("Should throw error : nsConnectionId missing", function(done){
      var option = _.cloneDeep(paramObject)
      delete option.nsConnectionId
      predefinedOps.updateSearchPricingFilters(option, function(err, res, body) {
        assert.equal(err.message, 'Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.')
        done()
      })
    })

    it("Should throw error : body is invalid", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,'this is not an array')
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.')
        done()
      })
    })

    it("Should throw error : body status code is not 200", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,{"statusCode":422,"error":{"message":"Please provide request to be processed"}})
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Could not update saved search in NetSuite. Error: "Please provide request to be processed"')
        done()
      })
    })

    it("Should throw error : body status code is not 200 and no error message", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,{"statusCode":422})
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Could not update saved search in NetSuite.')
        done()
      })
    })

    it("Should throw error : body is null", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,null)
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.')
        done()
      })
    })

    it("success case", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,[{"statusCode":200,"searchId":"savedSearch1","searchInternalId":"1"},{"statusCode":200,"searchId":"savedSearch2","searchInternalId":"2"}])
      predefinedOps.updateSearchPricingFilters(paramObject, function(err, res, body) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should throw error : invalid update params", function(done){
      var option = _.cloneDeep(paramObject)

      delete option.options.pending
      delete option.nsConnectionId
      option.options.integrationRecord= {settings : {commonresources : {netsuiteConnectionId : 'nsConnectionId'}}}

      predefinedOps.updateSearchPricingFilters(option, function(err, res, body) {
        assert.equal(err.message, 'Update params does not have valid values. Please update integration data or contact Celigo Support')
        done()
      })
    })

  })

  describe('method | updateSearchCurrencyFilters', function(){
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
      , options: {
        pending: {
          "storeId": {
    				"exports_1_savedSearch_listSavedSearches": "savedSearch1",
    				"exports_2_savedSearch_listSavedSearches": "savedSearch2"
    			}
        }
        , bearerToken: 'bearerToken'
      }
      , settingParams: ['exports', 'exportId']
    }
    it("Should throw error for not conneting to IO", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .replyWithError('error occured')
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Failed to updated the saved search in NetSuite. Error: Could not make network call. error occured')
        done()
      })
    })

    it("Should throw error : nsConnectionId missing", function(done){
      var option = _.cloneDeep(paramObject)
      delete option.nsConnectionId
      predefinedOps.updateSearchCurrencyFilters(option, function(err, res, body) {
        assert.equal(err.message, 'Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.')
        done()
      })
    })

    it("Should throw error : body is invalid", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,'this is not an array')
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.')
        done()
      })
    })

    it("Should throw error : body status code is not 200", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,{"statusCode":422,"error":{"message":"Please provide request to be processed"}})
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Could not update saved search in NetSuite. Error: "Please provide request to be processed"')
        done()
      })
    })

    it("Should throw error : body status code is not 200 and no error message", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,{"statusCode":422})
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Could not update saved search in NetSuite.')
        done()
      })
    })

    it("Should throw error : body is null", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,null)
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.')
        done()
      })
    })

    it("success case", function(done){
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200,[{"statusCode":200,"searchId":"savedSearch1","searchInternalId":"1"},{"statusCode":200,"searchId":"savedSearch2","searchInternalId":"2"}])
      predefinedOps.updateSearchCurrencyFilters(paramObject, function(err, res, body) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should throw error : invalid update params", function(done){
      var option = _.cloneDeep(paramObject)
      delete option.options.pending
      delete option.nsConnectionId
      option.options.integrationRecord= {settings : {commonresources : {netsuiteConnectionId : 'nsConnectionId'}}}

      predefinedOps.updateSearchCurrencyFilters(option, function(err, res, body) {
        assert.equal(err.message, 'Update params does not have valid values. Please update integration data or contact Celigo Support')
        done()
      })
    })

  })

  describe('method | toggleNetsuiteExportType', function(){
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      done()
    })
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
      , options: {
        pending: {
          searchId: 'inventoryExportSavedSearchId'
        }
        , bearerToken: 'bearerToken'
      }
      , searchId: true
      , settingParams: ['imports', 'importId', 'param1', 'param2']
    }
    it("Should call toggleNetsuiteExportType successfully and delete delta", function(done){
      //nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200, function(){
          var body = {
            'test': 'test'
          }
          return body
        })
      predefinedOps.toggleNetsuiteExportType(paramObject, function(err) {
        done()
      })
    })
    it("Should call toggleNetsuiteExportType successfully and enable delta", function(done){
      //nock.cleanAll()
      paramObject.newSettings.testField = null
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId')
        .reply(200, function(){
          var body = {
            'test': 'test'
          }
          return body
        })
        .put('/v1/imports/importId')
        .reply(200)
      predefinedOps.toggleNetsuiteExportType(paramObject, function(err) {
        done()
      })
    })
    it("Should fail to get import adaptor", function(done){
      nock.cleanAll()
      paramObject.newSettings.testField = null
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId')
        .reply(422)
      predefinedOps.toggleNetsuiteExportType(paramObject, function(err) {
        done()
      })
    })
  })
  describe('method | setStartDateOnDeltaBasedExports', function(){
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      done()
    })
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
      , options: {
        pending: {
          searchId: 'inventoryExportSavedSearchId'
        }
        , bearerToken: 'bearerToken'
      }
      , searchId: true
      , settingParams: ['imports', 'importId', 'param1', 'param2']
    }
    it("Should call setStartDateOnDeltaBasedExports successfully", function(done){
      //nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200, function(){
          var body = {
            'test': 'test'
          }
          return body
        })
      predefinedOps.setStartDateOnDeltaBasedExports(paramObject, function(err) {
        done()
      })
    })
    it("Should call setStartDateOnDeltaBasedExports successfully with new setting", function(done){
      //nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200, function(){
          var body = {
            'test': 'test'
          }
          return body
        })
        .put('/v1/imports/importId').twice()
        .reply(200)
      predefinedOps.setStartDateOnDeltaBasedExports(paramObject, function(err) {
        done()
      })
    })
    it("Should call setStartDateOnDeltaBasedExports successfully with having body.delta", function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(200, function(){
          var body = {
            'delta': {'startDate':'test'}
          }
          return body
        })
        .put('/v1/imports/importId').twice()
        .reply(200)
      predefinedOps.setStartDateOnDeltaBasedExports(paramObject, function(err) {
        done()
      })
    })

    it("Should throw error when error occur on get adaptor", function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/imports/importId').twice()
        .reply(400)
      predefinedOps.setStartDateOnDeltaBasedExports(paramObject, function(err) {
        done()
      })
    })
  })

  describe('method | setDefaultCustomerId', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      done()
    })
    var paramObject = {
      nsConnectionId : 'nsConnectionId'
      , oldSettings: {
        defaultCustomerId: {
          value: 654321
        }
      }
      , newSettings: {
        defaultCustomerId: 123456
      }
      , setting: 'defaultCustomerId'
      , options: {
        integrationRecord: {
          settings:{
            commonresources:{
              netsuiteConnectionId: 'netsuiteConnectionId'
            }
          }
        }
        , bearerToken: 'bearerToken'
      }
      , searchId: true
      , settingParams: ['imports', 'importId', 'param1', 'param2']
    }
    it("Should call setDefaultCustomerId successfully", function(done){
      //nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/netsuiteConnectionId/proxy')
        .reply(200, function(){
          var body = [
            {'results': [{}]}
          ]
          return body
        })
      predefinedOps.setDefaultCustomerId(paramObject, function(err) {
        assert.equal(!!err, false)
        done()
      })
    })

    it("Should throw error on validateCustomerInternalId function when default customer id is NaN", function(done){
          paramObject.newSettings.defaultCustomerId = 'undefined'
          predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter a valid customer Internal Id.')
          done()
        })
      })

    it("Should throw error if handleMultipleCustomers is true but setting received as number", function(done){
          paramObject.handleMultipleCustomers = true
          paramObject.newSettings.defaultCustomerId = 654321
          predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Enter customer internal ID(s) in appropriate format.')
          done()
        })
      })

    it("Should throw error for handleMultipleCustomers if any customer in invalid format", function(done){
          paramObject.newSettings.defaultCustomerId = '1234,undefined'
          predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Enter a valid customer internal ID(s).')
          done()
        })
      })

    it("Should throw error for handleMultipleCustomers if any customer internal id does not exist", function(done){
          paramObject.newSettings.defaultCustomerId = '1234,4321'
          nock.cleanAll()
          nock(HERCULES_BASE_URL)
            .post('/v1/connections/netsuiteConnectionId/proxy')
            .reply(200, function(){
              var body = [
                {'results': [{}]}
              ]
            return body
          })
          predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Enter a valid customer internal ID(s). Customer Internal Id entered is not found in NetSuite.')
          done()
        })
      })

    it("Should set defaultCustomerId for handleMultipleCustomers successfully", function(done){
        paramObject.newSettings.defaultCustomerId = '1234,4321'
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/netsuiteConnectionId/proxy')
          .reply(200, function(){
            var body = [
              {'results': [{},{}]}
            ]
          return body
        })
        predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
        assert.equal(!!err, false)
        done()
      })
    })

    it("Should throw error on function when netsuiteConnectionId is missing", function(done){
          delete paramObject.options.integrationRecord.settings.commonresources.netsuiteConnectionId
          predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
          assert.equal(err.message, 'netsuiteConnectionId is missing in settings data.')
          done()
        })
      })

    it("Should throw error on function when commonResources is missing", function(done){
        delete paramObject.options.integrationRecord.settings.commonresources
        predefinedOps.setDefaultCustomerId(paramObject, function(err, res, body) {
        assert.equal(err.message, 'common resources are missing in Connector integration.')
        done()
      })
    })
  })

  describe('method | updateAdaptorLookupFilter', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
      "oldSettings": {
        "imports_importid_primaryCustomerLookupFilter": {
          "value": "[\"custentity_celigo_etail_cust_id\",\"is\",\"{{id}}\"]"
        },
      },
      "newSettings": {
        "imports_importid_primaryCustomerLookupFilter": "[\"custentity_celigo_etail_cust_id\",\"is\",\"{{cid}}\"]"
      },
      "setting": "imports_importid_primaryCustomerLookupFilter",
      "options": {
        "pending": {
          "imports_importid_primaryCustomerLookupFilter": "[\"custentity_celigo_etail_cust_id\",\"is\",\"{{cid}}\"]"
        },
        "_integrationId": "integrationid",
        "licenseOpts": {
          "connectorEdition": "enterprise"
        },
        "bearerToken": "bearerToken"
      },
      "settingParams": ["imports",
      "importid",
      "primaryCustomerLookupFilter"]
    }

    it("Should call updateAdaptorLookupFilter function successfully", function(done){
      predefinedOps.updateAdaptorLookupFilter(paramObject, function(err, res, body) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should throw error for not conneting to IO while get import", function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(400)
      predefinedOps.updateAdaptorLookupFilter(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error connecting to integrator.io Unable to verify response, Status Code: 400')
        done()
      })
    })

    it("Should throw error for not conneting to IO while put import", function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(400)
      predefinedOps.updateAdaptorLookupFilter(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Error connecting to integrator.io Unable to verify response, Status Code: 400')
        done()
      })
    })

    it("Should throw error when newSettings missing", function(done){
      paramObject.newSettings = ''
      predefinedOps.updateAdaptorLookupFilter(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Lookup criteria cannot be empty. Please add proper criteria and save it.')
        done()
      })
    })

    it("Should throw error when settingParams missing", function(done){
      delete paramObject.settingParams
      predefinedOps.updateAdaptorLookupFilter(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Integration is corrupted. Please contact Celigo for more information')
        done()
      })
    })
  })

  describe('method | savedSearchAllExports', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports')
        .reply(200, [{'_id': 'cashsaleExportId', 'netsuite': {'restlet' : { 'searchId' : '10855'}} },{'_id': 'invoiceExportId', 'netsuite': {'restlet' : { 'searchId' : '10855'}} }])
        .put('/v1/exports/invoiceExportId')
        .reply(200)
        .put('/v1/exports/cashsaleExportId')
        .reply(200)
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "oldSettings": {
          "exports_cashsaleExportId_savedSearchAllExports_listSavedSearches_invoiceExportId": {
            "value": "10855"
          }
        },
        "newSettings": {
          "exports_cashsaleExportId_savedSearchAllExports_listSavedSearches_invoiceExportId": "10151"
        },
        "setting": "exports_cashsaleExportId_savedSearchAllExports_listSavedSearches_invoiceExportId",
        "options": {
          "pending": {
            "11845118": {
              "exports_cashsaleExportId_savedSearchAllExports_listSavedSearches_invoiceExportId": "10151",
              "exports_cashsaleExportId_updateSearchSalesOrderStatusFilters_invoiceExportId": "SalesOrd:B",
              "exports_exportId_savedSearch_listSavedSearches": "10352"
            }
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken",
          "shopId": "shopId"
        },
        "settingParams": ["exports",
        "cashsaleExportId",
        "savedSearchAllExports",
        "listSavedSearches",
        "invoiceExportId"]
      }

      it("Should call savedSearchAllExports function successfully", function(done){
        predefinedOps.savedSearchAllExports(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on savedSearchAllExports function on put call", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports')
        .reply(200, [{'_id': 'cashsaleExportId', 'netsuite': {'restlet' : { 'searchId' : '10855'}} },{'_id': 'invoiceExportId', 'netsuite': {'restlet' : { 'searchId' : '10855'}} }])
        .put('/v1/exports/invoiceExportId')
        .reply(400)
        predefinedOps.savedSearchAllExports(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on savedSearchAllExports function on get call", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports')
        .reply(400)
        predefinedOps.savedSearchAllExports(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on savedSearchAllExports function if body does not have _id", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports')
        .reply(200, [{'netsuite': {'restlet' : { 'searchId' : '10855'}} },{'netsuite': {'restlet' : { 'searchId' : '10855'}} }])
        predefinedOps.savedSearchAllExports(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })
  })



  describe('method | updateSearchSalesOrderStatusFilters', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, [{"statusCode":200,"data":{"message":"Found"}}])
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "nsConnectionId" : 'nsConnectionId',
        "oldSettings": {
          "exports_cashsaleExportId_updateSearchSalesOrderStatusFilters_invoiceExportId": {
            "value": "SalesOrd:F"
          }
        },
        "newSettings": {
          "exports_cashsaleExportId_updateSearchSalesOrderStatusFilters_invoiceExportId": "SalesOrd:B"
        },
        "setting": "exports_cashsaleExportId_updateSearchSalesOrderStatusFilters_invoiceExportId",
        "options": {
          "pending": {
            "11845118": {
              "exports_cashsaleExportId_updateSearchSalesOrderStatusFilters_invoiceExportId": "SalesOrd:B"
            }
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken",
          "shopId": "11845118"
        },
        "settingParams": ["exports",
        "cashsaleExportId",
        "updateSearchSalesOrderStatusFilters",
        "invoiceExportId"]
      }

      it("Should call updateSearchSalesOrderStatusFilters function successfully", function(done){
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call updateSearchSalesOrderStatusFilters function successfully if no nsConnectionId in paramObject", function(done){
        delete paramObject.nsConnectionId
        paramObject.options.integrationRecord = {
                                'settings' : {
                                  'commonresources' : {
                                    'netsuiteConnectionId' :  'nsConnectionId'
                                  }
                                }
                              }
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error updateSearchSalesOrderStatusFilters for missing netsuiteConnectionId", function(done){
        delete paramObject.nsConnectionId
        delete paramObject.options.integrationRecord
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.')
          done()
        })
      })

      it("Should throw error for not conneting to IO", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .persist()
          .post('/v1/connections/nsConnectionId/proxy')
          .replyWithError({'message': 'Error', 'code': 'Error'});
          paramObject.nsConnectionId = 'nsConnectionId'
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Error while connecting to integrator.io')
          done()
        })
      })

      it("Should throw error for not conneting to IO for statusCode", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/nsConnectionId/proxy')
          .reply(200, {"statusCode":422,"error":{"message":"Not Found"}})
          paramObject.nsConnectionId = 'nsConnectionId'
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Error while connecting to integrator.io')
          done()
        })
      })

      it("Should call updateSearchSalesOrderStatusFilters function successfully if no settingParams length < 4", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/nsConnectionId/proxy')
          .reply(200, [{"statusCode":200,"data":{"message":"Found"}}])
          paramObject.nsConnectionId = 'nsConnectionId'
          paramObject.settingParams = ["exports", "cashsaleExportId", "updateSearchSalesOrderStatusFilters"]
        predefinedOps.updateSearchSalesOrderStatusFilters(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

  })


  describe('method | setDefaultCustomerIdForAllOrders', function() {
    before(function(done){
      predefinedOps = operations
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "nsConnectionId": 'nsConnectionId',
        "oldSettings": {
          "imports_importid_setDefaultCustomerIdForAllOrders": {
            "value": ""
          }
        },
        "newSettings": {
          "imports_importid_setDefaultCustomerIdForAllOrders": "123546"
        },
        "setting": "imports_importid_setDefaultCustomerIdForAllOrders",
        "options": {
          "pending": {
            "imports_importid_setDefaultCustomerIdForAllOrders": "123546"
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken",
          "orderImportAdaptorId": "importid",
          "integrationRecord": {
            'settings': {
              'commonresources': {
                'netsuiteConnectionId': 'nsConnectionId',
                'orderImportAdaptorId': 'importid'
              }
            }
          }
        },
        "settingParams": ["imports",
        "importid",
        "setDefaultCustomerIdForAllOrders"]
      }

      it("Should call setDefaultCustomerIdForAllOrders function successfully", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, [{"statusCode":200,"results":[{"message":"Found"}]}])
        .get('/v1/imports/importid/distributed')
        .reply(200, {'_id' : 'importid', 'mapping': {'fields': [{
                "generate": "entity",
                "extract": "netsuitecustomerid"
            }]}})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on PUT call import adaptor", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .persist()
          .post('/v1/connections/nsConnectionId/proxy')
          .reply(200, [{"statusCode":200,"results":[{"message":"Found"}]}])
          .get('/v1/imports/importid/distributed')
          .reply(200, {'_id' : 'importid', 'mapping': {'fields': [{
                  "generate": "entity",
                  "extract": "netsuitecustomerid"
              }]}})
          .put('/v1/imports/importid/distributed')
          .replyWithError({'message': 'Error', 'code': 'Error'});
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Failed to update the Order mapping for Customer# 123546, Could not make network call. Error. Please contact Celigo support.')
          done()
        })
      })

      it("Should throw error on PUT call import adaptor with statusCode", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .persist()
          .post('/v1/connections/nsConnectionId/proxy')
          .reply(200, [{"statusCode":200,"results":[{"message":"Found"}]}])
          .get('/v1/imports/importid/distributed')
          .replyWithError({'message': 'Error', 'code': 'Error'});
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Failed to load Order Import Adaptor, Could not make network call. Error. Please contact Celigo support.')
          done()
        })
      })

      it("Should throw error on validateCustomerInternalId function with netsuite call incorrect body format", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .persist()
          .post('/v1/connections/nsConnectionId/proxy')
          .reply(200, [{"statusCode":200,"results":{"message":"Found"}}])
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter a valid customer Internal Id. Customer with Internal Id# 123546 not found in NetSuite.')
          done()
        })
      })

      it("Should throw error on validateCustomerInternalId function with netsuite call on statusCode", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .persist()
          .post('/v1/connections/nsConnectionId/proxy')
          .replyWithError({'message': 'Error', 'code': 'Error'});
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Failed to get information from NetSuite for given Customer IDs, Could not make network call. Error. Please contact Celigo support.')
          done()
        })
      })

      it("Should throw error on validateCustomerInternalId function when default customer id is NaN", function(done){
          paramObject.newSettings.imports_importid_setDefaultCustomerIdForAllOrders = 'undefined'
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter a valid customer Internal Id.')
          done()
        })
      })
      it("Should throw error on function when netsuiteConnectionId is missing", function(done){
          delete paramObject.options.integrationRecord.settings.commonresources.netsuiteConnectionId
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'netsuiteConnectionId is missing in settings data.')
          done()
        })
      })

      it("Should throw error on function when commonResources is missing", function(done){
          delete paramObject.options.integrationRecord.settings.commonresources
          predefinedOps.setDefaultCustomerIdForAllOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'common resources are missing in Connector integration.')
          done()
        })
      })
  })

  describe('method | invokeOnDemandOrderImport', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'wrapper': {'configuration': {'autoAcknowledgeOnDemandOrders': 'false', 'onDemandOrderIds': ''}}})
        .put('/v1/exports/exportid')
        .reply(200)
        .post('/v1/flows/onDemandOrderImportFlowId/run')
        .reply(200)
        .get('/v1/flows/orderAckFlowId')
        .reply(200)
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "oldSettings": {
          "exports_exportid_invokeOnDemandOrderImport": {
            "value": ""
          },
          "exports_exportid_autoAcknowledgeOnDemandOrders": {
            "value": false
          }
        },
        "newSettings": {
          "exports_exportid_invokeOnDemandOrderImport": "123546,",
          "exports_exportid_autoAcknowledgeOnDemandOrders": false
        },
        "setting": "exports_exportid_invokeOnDemandOrderImport",
        "options": {
          "pending": {
            "exports_exportid_invokeOnDemandOrderImport": "123546"
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken",
          "integrationRecord": {
            'settings': {
              'commonresources': {
                'orderAckFlowId': 'orderAckFlowId',
                'onDemandOrderImportFlowId': 'onDemandOrderImportFlowId'
              }
            }
          }
        },
        "settingParams": ["exports",
        "exportid",
        "invokeOnDemandOrderImport"]
      }

      it("Should call invokeOnDemandOrderImport function successfully with ack false", function(done){
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call invokeOnDemandOrderImport function successfully with ack true", function(done){
        paramObject.newSettings.exports_exportid_autoAcknowledgeOnDemandOrders = true
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call invokeOnDemandOrderImport function successfully with no new setting for ack", function(done){
        delete paramObject.newSettings.exports_exportid_autoAcknowledgeOnDemandOrders
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error when unable to invoke order flow with statuscode check", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'wrapper': {'configuration': {'autoAcknowledgeOnDemandOrders': 'false', 'onDemandOrderIds': ''}}})
        .put('/v1/exports/exportid')
        .reply(200)
        .post('/v1/flows/onDemandOrderImportFlowId/run')
        .reply(422, {"errors": [{"message" : "undefined"}]})
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Cannot invoke the on demand order flow because : undefined')
          done()
        })
      })

      it("Should throw error when unable to invoke order flow", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'wrapper': {'configuration': {'autoAcknowledgeOnDemandOrders': 'false', 'onDemandOrderIds': ''}}})
        .put('/v1/exports/exportid')
        .reply(200)
        .post('/v1/flows/onDemandOrderImportFlowId/run')
        .replyWithError('error occured')
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error when Order Acknowledgement Flow is disabled", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/flows/orderAckFlowId')
        .reply(200, {'_id': 'orderAckFlowId', 'disabled' : true})
        paramObject.newSettings.exports_exportid_autoAcknowledgeOnDemandOrders = true
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Order Acknowledgement Flow is currently disabled. For setting "Auto Acknowledge On Demand Orders" as checked, this flow needs to be enabled')
          done()
        })
      })

      it("Should throw error when unable to get Order Acknowledgement Flow", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/flows/orderAckFlowId')
        .replyWithError('error occured')
        paramObject.newSettings.exports_exportid_autoAcknowledgeOnDemandOrders = true
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error updateresource of export adaptor", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .replyWithError('error occured')
        paramObject.newSettings.exports_exportid_autoAcknowledgeOnDemandOrders = false
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should not execute function when there is other character to invoke.", function(done){
        paramObject.newSettings.exports_exportid_invokeOnDemandOrderImport = ',,'
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should not execute function when there is empty newSettings.", function(done){
        paramObject.newSettings.exports_exportid_invokeOnDemandOrderImport = ''
        predefinedOps.invokeOnDemandOrderImport(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })
  })

  describe('method | selectDateFilterForOrders & setDeltaDays', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'rest': {'relativeURI': '/Orders/2013-09-01?Action=ListOrders&MarketplaceId.Id.1=ATVPDKIKX0DER&LastUpdatedAfter=2017-03-11T18:30:00.000Z&OrderStatus.Status.1=Shipped&FulfillmentChannel.Channel.1=AFN'}})
        .put('/v1/exports/exportid')
        .reply(200)
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "oldSettings": {
          "exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter": {
            "value": ""
          },
          "exports_exportid_setDeltaDays": {
            "value": ''
          }
        },
        "newSettings": {
          "exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter": "lastModified",
          "exports_exportid_setDeltaDays": '1'
        },
        "setting": "exports_exportid_setDeltaDays",
        "options": {
          "pending": {
            "68825": {
              "exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter": "lastModified",
              "exports_exportid_setDeltaDays": '1'
            }
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken",
          "shopId": "68825"
        },
        "settingParams": ["exports",
        "exportid",
        "selectDateFilterForOrders",
        "CreatedAfter",
        "LastUpdatedAfter"]
      }

      it("Should call setDeltaDays function successfully", function(done){
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call setDeltaDays function successfully without newSettings", function(done){
        paramObject.newSettings.exports_exportid_setDeltaDays = ''
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on get export adaptor during setDeltaDays", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .replyWithError('error occured')
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error on get export adaptor during setDeltaDays with newSettings", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .replyWithError('error occured')
        paramObject.newSettings.exports_exportid_setDeltaDays = '1'
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error on validateDeltaDays in setDeltaDays with newSettings", function(done){
        paramObject.newSettings.exports_exportid_setDeltaDays = '-'
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter non-zero numeric value for duration in days.')
          done()
        })
      })

      it("Should throw error on setDeltaDays which detla days empty on dateCreated", function(done){
        paramObject.newSettings.exports_exportid_setDeltaDays = ''
        paramObject.options.pending[paramObject.options.shopId].exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter = 'dateCreated'
        predefinedOps.setDeltaDays(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter duration in days to use Creation Time filter.')
          done()
        })
      })

      it("Should call selectDateFilterForOrders function successfully with lastModified", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'rest': {'relativeURI': '/Orders/2013-09-01?Action=ListOrders&MarketplaceId.Id.1=ATVPDKIKX0DER&LastUpdatedAfter=1489257000&OrderStatus.Status.1=Shipped&FulfillmentChannel.Channel.1=AFN'}})
        .put('/v1/exports/exportid')
        .reply(200)
        delete paramObject.newSettings.exports_exportid_setDeltaDays
        paramObject.setting = 'exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter'
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call selectDateFilterForOrders function successfully with dateCreated", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'http': {'relativeURI': '/Orders/2013-09-01?Action=ListOrders&MarketplaceId.Id.1=ATVPDKIKX0DER&CreatedAfter=1489257000&OrderStatus.Status.1=Shipped&FulfillmentChannel.Channel.1=AFN'}})
        .put('/v1/exports/exportid')
        .reply(200)
        paramObject.newSettings.exports_exportid_selectDateFilterForOrders_CreatedAfter_LastUpdatedAfter = 'dateCreated'
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call selectDateFilterForOrders function successfully with 0 deltaday", function(done){
        paramObject.newSettings.exports_exportid_setDeltaDays = '0'
        paramObject.options.pending.exports_exportid_setDeltaDays = '0'
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error on put export adaptor with statusCode mismatch", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'http': {'relativeURI': '/Orders/2013-09-01?Action=ListOrders&MarketplaceId.Id.1=ATVPDKIKX0DER&LastUpdatedAfter=2017-03-11T18:30:00.000Z&OrderStatus.Status.1=Shipped&FulfillmentChannel.Channel.1=AFN'}})
        .put('/v1/exports/exportid')
        .reply(400)
        delete paramObject.newSettings.exports_exportid_setDeltaDays
        paramObject.options.pending.exports_exportid_setDeltaDays = '1'
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'PUT call failed for the resource exports# exportid, statusCode: 400, message: ')
          done()
        })
      })

      it("Should throw error on put export adaptor", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid', 'http': {'relativeURI': '/Orders/2013-09-01?Action=ListOrders&MarketplaceId.Id.1=ATVPDKIKX0DER&LastUpdatedAfter=2017-03-11T18:30:00.000Z&OrderStatus.Status.1=Shipped&FulfillmentChannel.Channel.1=AFN'}})
        .put('/v1/exports/exportid')
        .replyWithError('error occured')
        delete paramObject.newSettings.exports_exportid_setDeltaDays
        paramObject.options.pending.exports_exportid_setDeltaDays = '1'
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error on processing updateRelativeURIForDeltaExportOrders ", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200, {'_id' : 'exportid'})
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Unable to update the resource exports# exportid. Exception : Cannot read property \'relativeURI\' of undefined')
          done()
        })
      })

      it("Should throw error on get export adaptor empty body during selectDateFilterForOrders", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(200)
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Empty body returned for the resource exports# exportid')
          done()
        })
      })

      it("Should throw error on get export adaptor statusCode mismatch during selectDateFilterForOrders", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .reply(400)
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'GET call failed for the resource exports# exportid, statusCode: 400, message: ')
          done()
        })
      })

      it("Should throw error on get export adaptor during selectDateFilterForOrders", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/exportid')
        .replyWithError('error occured')
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should throw error on selectDateFilterForOrders which detla days empty on dateCreated", function(done){
        delete paramObject.options.pending[paramObject.options.shopId].exports_exportid_setDeltaDays
        predefinedOps.selectDateFilterForOrders(paramObject, function(err, res, body) {
          assert.equal(err.message, 'Please enter duration in days to use Creation Time filter.')
          done()
        })
      })
  })

  describe('method | updateMultipleSavedSearchLocationFilters', function() {
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, [{"statusCode":200,"results":[{"message":"Found"}]}, {"statusCode":200,"results":[{"message":"Found"}]}])
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
        "nsConnectionId": "nsConnectionId",
        "oldSettings": {
          "exports_exportid_updateMultipleSavedSearchLocationFilters_listLocations": {
            "value": []
          }
        },
        "newSettings": {
          "exports_exportid_updateMultipleSavedSearchLocationFilters_listLocations": ["1"]
        },
        "setting": "exports_exportid_updateMultipleSavedSearchLocationFilters_listLocations",
        "options": {
          "pending": {
            "exports_exportid_savedSearch_listSavedSearches_inv": "12452",
            "exports_exportid_savedSearch_listSavedSearches_kit": "12154"
          },
          "_integrationId": "integrationId",
          "bearerToken": "bearerToken"
        },
        "settingParams": ["exports",
        "exportid",
        "updateMultipleSavedSearchLocationFilters",
        "listLocation"]
      }

      it("Should call updateMultipleSavedSearchLocationFilters function successfully", function(done){
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call updateMultipleSavedSearchLocationFilters function successfully if no nsConnectionId in paramObject", function(done){
        delete paramObject.nsConnectionId
        paramObject.options.integrationRecord = {
                                'settings' : {
                                  'commonresources' : {
                                    'netsuiteConnectionId' :  'nsConnectionId'
                                  }
                                }
                              }
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          done()
        })
      })

      it("Should throw error when netsuite call statusCode not 200", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200, [{"statusCode":200,"results":[{"message":"Found"}]}, {"statusCode":422,"results":[{"message":"Found"}]}])
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, "Failed to update saved searches in NetSuite. Please contact Celigo Support.")
          done()
        })
      })

      it("Should throw error when netsuite not return proper body", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .reply(200)
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, "Error while updating saved searches in NetSuite. Response from NetSuite is not in valid format. Please contact Celigo Support.")
          done()
        })
      })

      it("Should throw error returned on netsuite call", function(done){
        nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/nsConnectionId/proxy')
        .replyWithError('error occured')
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, "Failed to update saved searches in NetSuite. Error: Could not make network call. error occured")
          done()
        })
      })

      it("Should throw error when exports_exportid_savedSearch_listSavedSearches_kit missing in pending in paramObject", function(done){
        delete paramObject.options.pending
        predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
          assert.equal(err.message, "Update params does not have valid values. Please update integration data or contact Celigo Support")
          done()
        })
      })

      it("Should throw error updateMultipleSavedSearchLocationFilters for missing netsuiteConnectionId", function(done){
      delete paramObject.nsConnectionId
      delete paramObject.options.integrationRecord
      predefinedOps.updateMultipleSavedSearchLocationFilters(paramObject, function(err, res, body) {
        assert.equal(err.message, 'Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.')
        done()
      })
    })
  })

  describe('method | kitInventoryCalculationPerLocationEnabled', function() {

    var paramObject = {
          "oldSettings": {
            "exports_exportid_kitInventoryCalculationPerLocationEnabled": {
              "value": false
            }
          },
          "newSettings": {
            "exports_exportid_kitInventoryCalculationPerLocationEnabled": true
          },
          "setting": "exports_exportid_kitInventoryCalculationPerLocationEnabled",
          "options": {
            "pending": {
              "exports_exportid_kitInventoryCalculationPerLocationEnabled": true
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken"
          },
          "settingParams": ["exports",
          "exportid",
          "kitInventoryCalculationPerLocationEnabled"]
        }

      it("Should call kitInventoryCalculationPerLocationEnabled function successfully", function(done){
        predefinedOps.kitInventoryCalculationPerLocationEnabled(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })
  })

  describe('method | orderAdvancedLookupEnabled', function() {

    var paramObject = {
          "oldSettings": {
            "imports_importid_orderAdvancedLookupEnabled": {
              "value": false
            }
          },
          "newSettings": {
            "imports_importid_orderAdvancedLookupEnabled": true
          },
          "setting": "imports_importid_orderAdvancedLookupEnabled",
          "options": {
            "pending": {
              "shopId": {
                "imports_importid_orderAdvancedLookupEnabled": true,
                "imports_importid_orderImportLookupFilter": "[\"test\", \"is\", \"test\"]"
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "shopId": "shopId"
          },
          "settingParams": ["imports",
          "importid",
          "orderAdvancedLookupEnabled"]
        }

      it("Should call orderAdvancedLookupEnabled function successfully", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        predefinedOps.orderAdvancedLookupEnabled(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error message on load import adaptor orderAdvancedLookupEnabled", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .replyWithError('error occured')
        predefinedOps.orderAdvancedLookupEnabled(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should call orderAdvancedLookupEnabled function successfully when both settings available", function(done){
        paramObject.newSettings.imports_importid_orderImportLookupFilter = "[\"test\", \"is\", \"test\"]"
        predefinedOps.orderAdvancedLookupEnabled(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call orderAdvancedLookupEnabled function successfully for single store", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        paramObject.options.pending = {
                "imports_importid_orderAdvancedLookupEnabled": true,
                "imports_importid_orderImportLookupFilter": "[\"test\", \"is\", \"test\"]"
              }
        delete paramObject.newSettings.imports_importid_orderImportLookupFilter
        delete paramObject.options.shopId
        predefinedOps.orderAdvancedLookupEnabled(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })
  })

  describe('method | orderImportLookupFilter', function() {

    var paramObject = {
          "oldSettings": {
            "imports_importid_orderImportLookupFilter": {
              "value": ""
            }
          },
          "newSettings": {
            "imports_importid_orderImportLookupFilter": "[\"test\", \"is\", \"test\"]"
          },
          "setting": "imports_importid_orderImportLookupFilter",
          "options": {
            "pending": {
              "shopId": {
                "imports_importid_orderAdvancedLookupEnabled": true,
                "imports_importid_orderImportLookupFilter": "[\"test\", \"is\", \"test\"]"
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "shopId": "shopId"
          },
          "settingParams": ["imports",
          "importid",
          "orderImportLookupFilter"]
        }

      it("Should call orderImportLookupFilter function successfully", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error message on update import adaptor orderImportLookupFilter", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .replyWithError('error occured')
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })
      it("Should throw error message on missing new settingsvalue for orderImportLookupFilter", function(done){
        paramObject.newSettings.imports_importid_orderImportLookupFilter = ''
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should throw error message on parse internalIdLookup orderImportLookupFilter", function(done){
        paramObject.newSettings.imports_importid_orderImportLookupFilter = "['test', 'is', 'test']"
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err.message, "Unable to update the resource imports# importid. Exception : Unexpected token ' in JSON at position 1")
          done()
        })
      })
      it("Should throw error message on load import adaptor orderImportLookupFilter", function(done){
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .replyWithError('error occured')
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
      })

      it("Should call orderImportLookupFilter if orderAdvancedLookupEnabled missing function successfully", function(done){
        paramObject.newSettings.imports_importid_orderImportLookupFilter = "[\"test\", \"is\", \"test\"]"
        delete paramObject.options.pending.shopId.imports_importid_orderAdvancedLookupEnabled
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importid/distributed')
        .reply(200, {'internalIdLookup': 'test'})
        .put('/v1/imports/importid/distributed')
        .reply(200)
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })

      it("Should call orderImportLookupFilter function successfully for single store", function(done){
        paramObject.options.pending = {
                "imports_importid_orderAdvancedLookupEnabled": true,
                "imports_importid_orderImportLookupFilter": "[\"test\", \"is\", \"test\"]"
              }
        delete paramObject.options.shopId
        predefinedOps.orderImportLookupFilter(paramObject, function(err, res, body) {
          assert.equal(err, null)
          done()
        })
      })
  })



  describe('method | saveAdvancedSettingsToNSDistributed', function(){
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
       done()
     })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    it('Should update distributed record settings with advanced settings', function(done){
      var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))
      var updatedDistributedRecord
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, distributedRecord)
        .put('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, function(uri, body){
          updatedDistributedRecord = body
          return {}
        })
        .post('/v1/integrations/592d500cfae7551f2e4c20dd')
        .reply(400, {})

      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.advancedSetting.paramObject.json','utf8'))
      predefinedOps.saveAdvancedSettingsToNSDistributed(paramObject, function(err, res, body){
        var syncPrivateBillingSchedules = updatedDistributedRecord["settings"]["syncPrivateBillingSchedules"]
        var syncInactiveBillingSchedules = updatedDistributedRecord["settings"]["syncInactiveBillingSchedules"]
        assert.equal(syncPrivateBillingSchedules, true)
        assert.equal(syncInactiveBillingSchedules, true)
        done()
      })
    })

    it('Should error out - unable to fetch distributed record', function(done){
      var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))
      var updatedDistributedRecord
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(400, {})

      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.advancedSetting.paramObject.json','utf8'))
      predefinedOps.saveAdvancedSettingsToNSDistributed(paramObject, function(err, res, body){
        assert.equal(err.message, 'Error in fetching distributed record. Please contact Celigo support.')
        done()
      })
    })

    it('Should error out -  failed to updated distributed record', function(done){
      var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))

      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, distributedRecord)
        .put('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(400, {})

      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.advancedSetting.paramObject.json','utf8'))
      predefinedOps.saveAdvancedSettingsToNSDistributed(paramObject, function(err, res, body){
        assert.equal(err.message, 'Error in updating distributed record. Please contact Celigo support.')
        done()
      })
    })


  })

  describe('method | saveFlowSettingsToNSDistributed', function(){
    before(function(done){
      predefinedOps = operations
      nock.cleanAll()
       done()
     })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    it('Should update distributed record with flow settings', function(done){
      var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))
      var updatedDistributedRecord
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, distributedRecord)
        .put('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, function(uri, body){
          updatedDistributedRecord = body
          return {}
        })
        .post('/v1/integrations/592d500cfae7551f2e4c20dd')
        .reply(200, {})

      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.flowSetting.paramObject.json','utf8'))

      predefinedOps.saveFlowSettingsToNSDistributed(paramObject, function(err, res, body){

        var executionType = updatedDistributedRecord["executionType"]
        assert.equal(executionType.length, 3)
        assert.equal(executionType.indexOf('edit') > -1, true)
        assert.equal(executionType.indexOf('create') > -1, true)
        assert.equal(executionType.indexOf('xedit') > -1, true)
        done()
      })
    })

    it('Should error out - unable to fetch distributed record in save flow settings', function(done){
       var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))
       var updatedDistributedRecord
       nock.cleanAll()
       nock(HERCULES_BASE_URL)
         .persist()
         .get('/v1/exports/5923923425784d5998a3ca48/distributed')
         .reply(400, {})

       var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.flowSetting.paramObject.json','utf8'))

       predefinedOps.saveFlowSettingsToNSDistributed(paramObject, function(err, res, body){
        assert.equal(err.message, 'Error in fetching distributed record. Please contact Celigo support.')
         done()
       })
     })

    it('Should error out - unable to fetch distributed record in save flow settings', function(done){
      var distributedRecord = JSON.parse(fs.readFileSync('./test/data/settings/test.distributed.json','utf8'))
      var updatedDistributedRecord
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(200, distributedRecord)
        .put('/v1/exports/5923923425784d5998a3ca48/distributed')
        .reply(400, {})

      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.flowSetting.paramObject.json','utf8'))

      predefinedOps.saveFlowSettingsToNSDistributed(paramObject, function(err, res, body){
        assert.equal(err.message, 'Error in updating distributed record. Please contact Celigo support.')
        done()
      })
    })
  })

  describe('Testing method | handleSingleSearchVirtualVariations: ', function () {
    var paramObjectToPass
    before(function (done) {
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      done()
    })
    after(function (done) {
      nock.cleanAll()
      done()
    })

    it('should throw error if savedsearch is missing', function (done) {
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      delete paramObjectToPass.options.pending[paramObjectToPass.options.shopId].exports_5a1fd624b2976b3ec85fb44c_savedSearch_listSavedSearches
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Unable to get savedSearch value in Integration. Kindly contact Celigo Support.')
        done()
      })
    })

    it('should throw error if netsuiteConnectionId is missing', function (done) {
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      delete paramObjectToPass.options.integrationRecord.settings.commonresources.netsuiteConnectionId
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Integration record does not contain NetSuite connectionId. Kindly contact Celigo Support.')
        done()
      })
    })

    it('should set checkbox value if both virtualVariationCheckboxSetting,virtualVariationIdentifierSetting got modifed', function (done) {
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      paramObjectToPass.newSettings.exports_5a1fd624b2976b3ec85fb44c_bgcVariationParentIdentifier = 'setFieldvalues'
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        if (error) done(error)
        assert.equal(paramObjectToPass.oldSettings.exports_5a1fd624b2976b3ec85fb44c_bgcUpdateItemSearchesTypeFilters.value, true)
        done()
      })
    })

    it('should set field values if virtualVariationCheckboxSetting got disabled', function (done) {
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      paramObjectToPass.newSettings.exports_5a1fd624b2976b3ec85fb44c_bgcUpdateItemSearchesTypeFilters = false
      paramObjectToPass.options.pending[paramObjectToPass.options.shopId].exports_5a1fd624b2976b3ec85fb44c_bgcUpdateItemSearchesTypeFilters = false

      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        if (error) done(error)
        assert.equal(paramObjectToPass.oldSettings.exports_5a1fd624b2976b3ec85fb44c_bgcUpdateItemSearchesTypeFilters.value, false)
        done()
      })
    })

    it('Should throw error in case of netwrok call failure', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/5a1fd4f1b2976b3ec85fb425/proxy')
        .replyWithError('network failure')
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Could not make network call. network failure')
        done()
      })
    })

    it('Should throw error for invalid statusCode', function (done) {
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/5a1fd4f1b2976b3ec85fb425/proxy')
        .reply(422, 'network failure')
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Unable to verify response, Status Code: 422')
        done()
      })
    })

    it('Should throw error if response body is not an array', function (done) {
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/5a1fd4f1b2976b3ec85fb425/proxy')
        .reply(200, {})
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Failed to update virtual variation settings. Please retry, if error persists, contact Celigo Support')
        done()
      })
    })

    it('Should throw proper error message in case of NS error', function (done) {
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/5a1fd4f1b2976b3ec85fb425/proxy')
        .reply(200, [{
          statusCode: 422,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Please provide valid operation(method) name and config'
          }
        }])
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        assert.equal(error.message, 'Please provide valid operation(method) name and config')
        done()
      })
    })

    it('Should save values successfully', function (done) {
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/5a1fd4f1b2976b3ec85fb425/proxy')
        .reply(200, [{
          statusCode: 200
        }])
      paramObjectToPass = JSON.parse(fs.readFileSync('./test/data/settings/test.paramObjectItem.json','utf8'))
      predefinedOps.handleSingleSearchVirtualVariations(paramObjectToPass, function (error, response) {
        if (error) done(error)
        assert.equal(paramObjectToPass.oldSettings.exports_5a1fd624b2976b3ec85fb44c_bgcUpdateItemSearchesTypeFilters.value, true)
        done()
      })
    })
  })

  describe('method | setAccountName', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .persist()
      .get('/v1/flows/flowid1')
      .reply(200, {'name': 'test [AMZ-US-1]'})
      .put('/v1/flows/flowid1')
      .reply(200)
      .get('/v1/flows/flowid2')
      .reply(200, {'name': 'test [AMZ-US-1]'})
      .put('/v1/flows/flowid2')
      .reply(200)
      .get('/v1/flows/flowid3')
      .reply(200, {'name': 'test [AMZ-US-1]'})
      .put('/v1/flows/flowid3')
      .reply(200)
      .get('/v1/flows/flowid4')
      .reply(200, {'name': 'test [AMZ-US-1]'})
      .put('/v1/flows/flowid4')
      .reply(200)
      .put('/v1/integrations/integrationId')
      .reply(200)
      .get('/v1/connections')
      .reply(200, [{'_id': 'amazonHttpConnectionId', 'name': 'Amazon Connection'}])
      .put('/v1/connections/amazonHttpConnectionId')
      .reply(200)
      .post('/v1/connections/netsuiteConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
          "oldSettings": {
            "general_accountid_setAccountName": {
        			"value": "",
        		},
            "exports_exportid_savedSearch_listSavedSearches": {
              "value": "savedSearchId",
              "options": [["savedSearchId", "Celigo Amazon Fulfillment Export Search [AMZ-US-1]"]]
            }
          },
          "newSettings": {
            "general_accountid_setAccountName": "Ghost Account"
          },
          "setting": "general_accountid_setAccountName",
          "options": {
            "pending": {
              "accountid": {
                "general_accountid_setAccountName": "Ghost Account",
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "integrationRecord": {
              "_id": "integrationId",
              "name": "Amazon - Netsuite Connector",
              "settings": {
                "sections": [{
                  "sections": [{}],
                  "id": "accountid",
                  "title": "AMZ-US-1",
                  "shopInstallComplete": "true"
                }],
                "storemap": [{
                  "shopInstallComplete": "true",
      						"amazonWrapperConnectionId": "amazonWrapperConnectionId",
      						"amazonHttpConnectionId": "amazonHttpConnectionId",
                  "savedSeaches": [null, "savedSearchId"],
                  "flows": [null, "flowid1", "flowid2"],
                  "accountid": "accountid",
  			          "accountname": "AMZ-US-1",
                }],
                "general": [{
                  "id": "null"
                },
                {
      						"id": "accountid",
      						"fields": [{
      								"value": "",
                      "name": "general_accountid_setAccountName"
      							}
      						],
      						"title": "General"
      					}],
                "commonresources": {
                  "netsuiteConnectionId": "netsuiteConnectionId"
                }
              }
            },
            "shopId": "accountid"
          },
          "settingParams": ["general", "accountid", "setAccountName"]
        }

    it("Should set account name without any errors", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err, null)
        return done()
      })
    })

    it("Should throw error if account name is empty", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.newSettings = {'general_accountid_setAccountName': ''}
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err.message, "Please enter non-empty account name.")
        return done()
      })
    })

    it("Should throw error if account name has more than 20 characters", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.newSettings = {'general_accountid_setAccountName': 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu'}
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err.message, "Account name# Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu exceeds 20 characters. Please choose a different name.")
        return done()
      })
    })

    it("Should throw error if account name is already selected in other store", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.options.integrationRecord.settings.general[1].fields[0].value = "Ghost Account"
      opts.options.integrationRecord.settings.general.push({
        "id": "accountid1",
        "fields": [{
            "value": "Ghost Account",
            "name": "general_accountid1_setAccountName"
          }
        ],
        "title": "General"
      })
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err.message, "Account Name# Ghost Account is already set in one of the accounts. Please set a different account name.")
        return done()
      })
    })

    it("Should throw error if don't find store with the account id", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.options.integrationRecord.settings.storemap[0].accountid = 'accountid1'
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err.message, "Cannot find store or section with the account id# accountid")
        return done()
      })
    })

    it("Should throw error if don't find section with the account id", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.options.integrationRecord.settings.sections[0].id = 'accountid1'
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err.message, "Cannot find store or section with the account id# accountid")
        return done()
      })
    })

    it("Should not update connection if it not editable", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      opts.options.integrationRecord.name = 'Test'
      predefinedOps.setAccountName(opts, function(err, response) {
        assert.equal(err, null)
        return done()
      })
    })

    it('Should not throw error when sucessful', function (done) {
      var addOnMap = {
        "accountid":{
          "transferorder": {
            "mode": "settings",
            "savedSearches": [null, "savedSearchId2"],
            "flows": ["flowid3", "flowid4"]
          }
        }
      }
      var options = JSON.parse(JSON.stringify(paramObject))
      options["options"]["integrationRecord"]["settings"]["addOnMap"] = addOnMap
      predefinedOps.setAccountName(options, function(err, response) {
        assert.equal(err, null)
        return done()
      })
    })
  })

  describe('method | handleDefaultSkuInOrderImport', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/netsuiteConnectionId/proxy')
        .reply(200, [
          {
              "statusCode": 200,
              "searchId": null,
              "results": [
                  {
                      "id": "21458",
                      "recordType": "inventoryitem"
                  }
              ]
          }
      ])
      .get('/v1/imports/importid1')
      .reply(200, {
        _id: 'importid1',
        netsuite_da: {
          mapping: {
            lists: [
              {
                generate: 'item',
                fields: [
                  {
                    generate: 'item',
                    lookupName: 'item_lookup'
                  }
                ]
              }
            ]
          },
          lookups: [
            {
              name: 'item_lookup'
            }
          ]
        }
      })
      .put('/v1/imports/importid1')
      .reply(200, {})
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
          "requestOptions": {
            importIds: ['importid1']
          },
          "oldSettings": {
            "imports_importid1_setDefaultSkuField": {
        			"value": "",
        		}
          },
          "newSettings": {
            "imports_importid1_setDefaultSkuField": "123"
          },
          "setting": "imports_importid1_setDefaultSkuField",
          "options": {
            "pending": {
              "accountid": {
                "imports_importid1_setDefaultSkuField": "123",
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "integrationRecord": {
              "_id": "integrationId",
              "settings": {
                "sections": [{
                  "sections": [{}],
                  "id": "accountid",
                }],
                "storemap": [{
                  "accountid": "accountid",
                }],
                "commonresources": {
                  "netsuiteConnectionId": "netsuiteConnectionId"
                }
              }
            },
            "shopId": "accountid"
          },
          "settingParams": ["imports", "importid1", "setDefaultSkuField"]
        }

    it("Should update import adaptors without any errors", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      predefinedOps.handleDefaultSkuInOrderImport(opts, function(err, response) {
        if (err) done(err)
        assert.equal(opts.newSettings[opts.setting], opts.oldSettings[opts.setting].value)
        return done()
      })
    })
  })

  describe('method | setDefaultSkuFields', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/netsuiteConnectionId/proxy')
        .reply(200, [
          {
              "statusCode": 200,
              "searchId": null,
              "results": [
                  {
                      "id": "21458",
                      "recordType": "inventoryitem"
                  }
              ]
          }
      ])
      .get('/v1/imports')
      .reply(200, [{
        _id: 'importid1',
        name: 'netsuite-variants-rest-massimport-adaptor',
        netsuite_da: {
          "internalIdLookup": {
            "expression": "[[\"custrecord_celigo_shpf_siim_shpf_storeid\",\"is\",\"{{{storeid}}}\"],\"AND\",[\"custrecord_celigo_shpf_siim_nsid.nameinternal\",\"is\",\"{{{sku}}}\"],\"AND\",[\"custrecord_celigo_shpf_siim_nsid.isinactive\",\"is\",\"F\"]]"
            },
          mapping: {
            fields: [
              {
                generate: 'custrecord_celigo_shpf_siim_nsid',
                lookupName: 'itemlookup',
              }
            ]
          },
          lookups: [
            {
              name: 'itemlookup',
              "expression": "[[\"nameinternal\",\"is\",\"{{{sku}}}\"],\"AND\",[\"isinactive\",\"is\",\"F\"]]"
            }
          ]
        }
      }])
      .get('/v1/exports')
      .reply(200, [{
        _id: 'exportid1',
        name: 'netsuite-shopify-item-delta-exportadaptor',
        netsuite: {
          restlet: {
            searchId: '123'
          }
        }
      }])
      .put('/v1/imports/importid1')
      .reply(200, {})
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
          "resources": ['imports', 'exports'],
          "requestOptions": {
            'netsuite-variants-rest-massimport-adaptor': [
              {
                'type': 'lookup',
                'generate': 'custrecord_celigo_shpf_siim_nsid'
              },
              {
                'type': 'internalidlookup',
                'extract': 'sku',
                'join': 'custrecord_celigo_shpf_siim_nsid'
              }
            ],
            'netsuite-shopify-item-delta-exportadaptor': [
              {
                'type': 'savedsearch',
                'columnLabel': 'Item Name (Variant)',
                'default': "CASE NVL({parent},'0') WHEN '0' THEN{itemid} ELSE SUBSTR({itemid}, INSTR({itemid}, ' : ', -1) + 3) END"
              }
            ]
          },
          "oldSettings": {
            "imports_importid1_setNetSuiteSkuMissing": {
        			"value": "",
        		}
          },
          "newSettings": {
            "imports_importid1_setNetSuiteSkuMissing": "123"
          },
          "setting": "imports_importid1_setNetSuiteSkuMissing",
          "options": {
            "pending": {
              "accountid": {
                "imports_importid1_setNetSuiteSkuMissing": "123",
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "integrationRecord": {
              "_id": "integrationId",
              "settings": {
                "sections": [{
                  "sections": [{}],
                  "id": "accountid",
                }],
                "storemap": [{
                  "accountid": "accountid",
                  "imports": ['importid1'],
                  "exports": ['exportid1']
                }],
                "commonresources": {
                  "netsuiteConnectionId": "netsuiteConnectionId"
                }
              }
            },
            "shopId": "accountid"
          },
          "settingParams": ["imports", "importid1", "setNetSuiteSkuMissing"]
        }

    it("Should update import adaptors and saved searches without any errors", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      predefinedOps.setDefaultSkuFields(opts, function(err, response) {
        if (err) done(err)
        assert.equal(opts.newSettings[opts.setting], opts.oldSettings[opts.setting].value)
        return done()
      })
    })
  })
  describe('method | updateNetSuiteExportBatchSize', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .persist()
      .get('/v1/exports/exportid')
      .reply(200, {
        _id: 'exportid',
        name: 'netsuite-shopify-item-delta-exportadaptor',
        netsuite: {
          restlet: {
            searchId: '123',
            hooks: {}
          }
        }
      })
      .put('/v1/exports/exportid')
      .reply(200, {})
      done()
    })

    after(function (done) {
      nock.cleanAll()
      done()
    })

    var paramObject = {
          "resources": ['exports'],
          "oldSettings": {
            "exports_exportid_BatchSizeUpdate": {
        			"value": 100,
        		}
          },
          "newSettings": {
            "exports_exportid_BatchSizeUpdate": 200
          },
          "setting": "exports_exportid_BatchSizeUpdate",
          "options": {
            "pending": {
              "accountid": {
                "exports_exportid_BatchSizeUpdate": 200,
              }
            },
            "_integrationId": "integrationId",
            "bearerToken": "bearerToken",
            "integrationRecord": {
              "_id": "integrationId",
              "settings": {
                "sections": [{
                  "sections": [{}],
                  "id": "accountid",
                }]
              }
            },
            "shopId": "accountid"
          },
          "settingParams": ["exports", "exportid", "BatchSizeUpdate"]
        }

    it("Should update exports adaptors any errors", function(done) {
      var opts = JSON.parse(JSON.stringify(paramObject))
      predefinedOps.updateNetSuiteExportBatchSize(opts, function(err, response) {
        if (err) done(err)
        assert.equal(opts.newSettings[opts.setting], opts.oldSettings[opts.setting].value)
        return done()
      })
    })
  })
  describe('method | updateExportPageSize', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .persist()
      .get('/v1/exports/exportid')
      .reply(200, {
        _id: 'exportid',
        name: 'netsuite-shopify-item-delta-exportadaptor'
        })
      .put('/v1/exports/exportid')
      .reply(201, {
        _id: 'exportid',
        name: 'netsuite-shopify-item-delta-exportadaptor',
        pagesize : 20
        })
      done()
    })
    after(function (done) {
      nock.cleanAll()
      done()
    })
    var paramObject = {
      "resources": ['exports'],
      "oldSettings": {
        "exports_exportid_updateExportPageSize": {
          "value": 100,
        }
      },
      "newSettings": {
        "exports_exportid_updateExportPageSize": '20'
      },
      "setting": "exports_exportid_updateExportPageSize",
      "options": {
        "pending": {
          "accountid": {
            "exports_exportid_updateExportPageSize": 20,
          }
        },
        "_integrationId": "integrationId",
        "bearerToken": "bearerToken",
        "integrationRecord": {
          "_id": "integrationId",
          "settings": {
            "sections": [{
              "sections": [{}],
              "id": "accountid",
            }]
          }
        },
        "shopId": "accountid"
      },
      "settingParams": ["exports", "exportid", "updateExportPageSize"]
    }

  it("Should update export adaptor without any errors", function(done) {
    var opts = JSON.parse(JSON.stringify(paramObject))
    predefinedOps.updateExportPageSize(opts, function(err, response) {
      if (err) {
        done(err)
      }
      assert.equal(opts.newSettings[opts.setting], opts.oldSettings[opts.setting].value)
      return done()
    })
    })
  })


  describe('method | updateFlowIdRunNextFlowIds', function() {
    before(function(done){
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .get('/v1/flows/flowid')
      .reply(200, {
        _id: 'flowid',
        name: 'flow name',
      })
      .put('/v1/flows/flowid')
      .reply(200, {
        _id: 'flowid',
        name: 'flow name',
        _runNextFlowIds: ['1234556']
      })
      done()
    })
    after(function (done) {
      nock.cleanAll()
      done()
    })
    var flowId = 'flowid'
    var pendingBody = {
      accountid: {
        exports_exportid_BatchSizeUpdate: 200,
      },
      flowId: '1234556'
    }
    var paramObject = {
      "newSettings": {
        "flows_flowid_addFlowIdToItemExportFlowRunNextFlowIds": true
      },
      "setting": "flows_flowid_addFlowIdToItemExportFlowRunNextFlowIds",
      "options": {
        "pending": pendingBody,
        "_integrationId": "integrationId",
        "bearerToken": "bearerToken",
        "shopId": "accountid"
      }
    }

    it("Should update flow adaptor without any errors", function(done) {
      predefinedOps.updateFlowIdRunNextFlowIds(paramObject, flowId, function(err, response, body) {
        if (err) {
          done(err)
        }
        done()
      })
    })
    it("Should throw an error if Flow Id is missing in ParamObject", function(done) {
      pendingBody.flowId = null
      predefinedOps.updateFlowIdRunNextFlowIds(paramObject, flowId, function(err, response, body) {
        if (!err) {
          done(new Error('No error!'))
        } else {
          assert.equal(err.message, 'Flow Id missing in ParamObject\'s options. Please contact Celigo support.')
          done()
        }
      })
    })
  })

  describe('method setTransactionDefaultTaxableCode', function () {
    var paramObject
    beforeEach(function (done) {
      paramObject = {
        'oldSettings': {
          "imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode": {
            "name": "imports_5e70d424b5573a7e386b2b96_setTransactionDefaultTaxableCode",
            "required": false,
            "value": "0637"
          }
        },
        'newSettings': {
          'imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode': 'abc'
        },
        'setting': 'imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode',
        'options': {
          'bearerToken': 'testToken',
          'integrationRecord': {
            'settings': {
              'storemap': [
                {
                  'shopid': '26746716231',
                  'flows': [
                    'flowId'
                  ]
                }
              ],
              'sections': [
                {
                  'id': '13171327076'
                }
              ],
              'commonresources': {
                'netsuiteConnectionId': '5e5f76f13d52e03e0f0484db'
              }
            }
          },
          'shopId': '26746716231'
        },
        'settingParams': [
          'imports',
          '5c2cc0d0d039a4eb417fd476',
          'singleCustomerEnabledInNS'
        ]
      }
      nock.cleanAll()
      done()
    })

    it('Should throw an error in case of values which are not numeric', function (done) {
      paramObject.newSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'] = 'abc##$%^^'
      nock(HERCULES_BASE_URL)
      .get('/v1/integrations/5e5f76ef3d52e03e0f0484d8')
      .reply(200, 'done')
      predefinedOps.setTransactionDefaultTaxableCode(paramObject, function (err) {
        assert.equal(err.message, 'Enter a tax code or tax group in a valid format. The tax code or tax group must either be a positive or negative numeric value.')
        done()
      })
    })

    it('Should throw an error in case of values -7 or -8', function (done) {
      paramObject.newSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'] = '-7'
      nock(HERCULES_BASE_URL)
      .get('/v1/integrations/5e5f76ef3d52e03e0f0484d8')
      .reply(200, 'done')
      predefinedOps.setTransactionDefaultTaxableCode(paramObject, function (err) {
        assert.equal(err.message, 'Enter a tax code or tax group that is taxable. Any positive or negative numeric, other than “-7“ or “-8“, as these codes are not taxable.')
        done()
      })
    })

    it('should throw error if invalid tax code/tax group is entered', function (done) {
      paramObject.newSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'] = '99099099'
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .post('/v1/connections/5e5f76f13d52e03e0f0484db/proxy')
      .reply(200, { "statusCode":200, "body":[{ "results": [] }, { "results": [] }] })
      predefinedOps.setTransactionDefaultTaxableCode(paramObject, function (err) {
        assert.equal(err.message, 'Enter a tax code or tax group that is valid. The tax code or tax group is not available in your NetSuite account.')
      })
      done()
    })

    it('should return success if valid tax code/tax group is entered', function (done) {
      paramObject.newSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'] = '-100'
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
      .post('/v1/connections/5e5f76f13d52e03e0f0484db/proxy')
      .reply(200, [{ "results": [] },{ "statusCode": 200, "results": [{ "id": -100, "recordType": "salestaxitem" }] }])
      predefinedOps.setTransactionDefaultTaxableCode(paramObject, function (err) {
        if (paramObject && paramObject.oldSettings && paramObject.oldSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'] && paramObject.oldSettings['imports_5e5f782f3d52e03e0f048522_setTransactionDefaultTaxableCode'].value === '-100') {
          done()
        }
      })
    })
  })
})
