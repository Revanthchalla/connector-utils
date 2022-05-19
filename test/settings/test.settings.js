'use strict'

var assert = require('assert')
  , settings = require('../../settings/setting')
  , operations = require('../../settings/operations')
  , nock = require('nock')
  , fs = require('fs')

var HERCULES_BASE_URL = 'https://api.integrator.io'
if (process.env.NODE_ENV === 'staging') {
  HERCULES_BASE_URL = process.env.IO_DOMAIN ? ('https://api.' + process.env.IO_DOMAIN) : 'https://api.staging.integrator.io'
} else if (process.env.NODE_ENV === 'development') {
  //local testing of code
  HERCULES_BASE_URL = 'http://api.localhost.io:5000'
}

describe('Settings Tests: ', function () {
  var setting
  before(function (done) {
    setting = new settings()
    done()
  })

  describe('Constructor Settings: ', function () {
    it('should create object by Setting constructor', function (done) {
      assert.notStrictEqual(setting, null)
      done()
    })
  })

  describe('method registerSchema: ', function () {
    it('should register the connector schema', function (done) {
      //TODO need to write test once schema finalized
      var ret = setting.registerSchema()
      assert.equal(ret, true)
      done()
    })
  })

  describe('method registerFunction: ', function () {
    it('should register function in Setting class', function (done) {
      var dummyFunc = function () {
        //console.log('This is dummy function')
      }
      var ret = setting.registerFunction({ name: 'dummyFunc', method: dummyFunc })
      assert.equal(ret, true)
      done()
    })
    it('should not register function in Setting class without name property', function (done) {
      var dummyFunc = function () {
        //console.log('This is dummy function')
      }
      try {
        setting.registerFunction({ method: dummyFunc })
      }
      catch (err) {
        assert.equal(err.message, 'Either name or method property is missing while registering this function')
        done()
      }
    })
    it('should not register function in Setting class without method property', function (done) {
      try {
        setting.registerFunction({ name: 'dummy' })
      }
      catch (err) {
        assert.equal(err.message, 'Either name or method property is missing while registering this function')
        done()
      }
    })
    it('should not register function in Setting class if method is not type function', function (done) {
      var dummyFunc
      try {
        setting.registerFunction({ name: 'dummy', method: dummyFunc })
      }
      catch (err) {
        assert.equal(err.message, 'Function implementation is missing while registering this function | dummy')
        done()
      }
    })
  })

  describe('method persistSettings: ', function () {
    it('should run succesfully', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })

      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          "exports_exportId_setFieldValues": "capture"
        }
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(err.message, 'Error while connecting to integrator.io')
        done()
      })
    })

    it('should throw error "method not register in connector-utils"', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })

      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          "exports_exportId_registerWebhook": "capture"
        }
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(err.message, 'registerWebhook method not registered in connector-utils')
        done()
      })
    })

    it('should call disable slider for flow', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })
        .get('/v1/flows/flowId')
        .reply(200, {
          disabled: false,
          name: "test flow"
        })
        .put('/v1/flows/flowId')
        .reply(200)

      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          flowId: 'flowId'
          , disabled: true
        }
      }
      setting.persistSettings(options, function (err) {
        assert.equal(err, null)
        done()
      })
    })

    it('should throw error when section is missing', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          delete integration.settings.sections
          return integration
        })
        .get('/v1/flows/flowId')
        .reply(200, {
          disabled: false
        })
        .put('/v1/flows/flowId')
        .reply(200)

      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          "exports_exportId_registerWebhook": "capture"
        }
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(!!err, true)
        done()
      })
    })

    it('should throw error on disable slider for flow', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })
        .get('/v1/flows/flowId')
        .reply(400)

      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          flowId: 'flowId'
          , disabled: true
        }
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(!!err, true)
        done()
      })
    })

    it('should throw error for missing pending property', function (done) {
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })
      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(err.message, 'pending property is missing from options')
        done()
      })
    })
    it('should throw error for connection', function (done) {
      var options = {}
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(!!err, true)
        done()
      })
    })
    // skipping this tests as it is being timed out due to sinon module in test.installerUtils.js file
    it.skip('should throw error for connection from action slider', function (done) {
      nock(HERCULES_BASE_URL)
        .get('/v1/integrations/integrationId')
        .reply(200, function () {
          var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
          return integration
        })
        .get('/v1/flows/flowId')
        .reply(200, {
          disabled: false
        })
      var options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          flowId: 'flowId'
          , disabled: true
        }
      }
      var ret = setting.persistSettings(options, function (err) {
        assert.equal(!!err, true)
        done()
      })
    })
  })

  describe(' customerDeposit: ', function(){
    var options

    before(function(done){
      options = {
        _integrationId: "integrationId"
        , bearerToken: "bearerToken"
        , pending: {
          flowId: 'flowId'
          , disabled: true
        }
      }

      done()
    })
    describe(' positive test: ', function(){
      var isCurrentFlowOn
        , isOtherFlowOn
        , isCurrentFlowCustomerDeposit

      before(function(done){
        nock(HERCULES_BASE_URL)
          .persist()
          .get('/v1/integrations/integrationId')
          .reply(200, {
            "_id": "integrationId",
          	"settings": {
          		"commonresources": {
          			"isPaymentTransactionCustomRecordRequired": true,
          			"customerDepositFlowId": "customerDepositFlowId",
          			"transactionFlowId": "transactionFlowId",
          			"salesOrderImportId": "salesOrderImportId",
          			"customerDepositExportId": "customerDepositExportId",
          			"transactionExportId": "transactionExportId"
          		}
          	}
          })
          .get('/v1/flows/flowId')
          .reply(200, function(){
            if(isCurrentFlowCustomerDeposit){
              if(isCurrentFlowOn){
                return {
                  disabled: false,
                  name: "Commerce Cloud Transaction to NetSuite Customer Deposit Add"
                }
              } else {
                return {
                  disabled: true,
                  name: "Commerce Cloud Transaction to NetSuite Customer Deposit Add"
                }
              }
            } else {
              if(isCurrentFlowOn){
                return {
                  disabled: false,
                  name: "Commerce Cloud Order Transaction to NetSuite Add"
                }
              } else {
                return {
                  disabled: true,
                  name: "Commerce Cloud Order Transaction to NetSuite Add",
                  _importId: "TransactionImportId"
                }
              }
            }
          })
          .get('/v1/flows/transactionFlowId')
          .reply(200, function(){
            if(isOtherFlowOn){
              return {
                disabled: false,
                name: "Commerce Cloud Order Transaction to NetSuite Add",
                _importId: "TransactionImportId"
              }
            } else {
              return {
                disabled: true,
                name: "Commerce Cloud Order Transaction to NetSuite Add",
                _importId: "TransactionImportId"
              }
            }
          })
          .get('/v1/flows/customerDepositFlowId')
          .reply(200, function(){
            if(isOtherFlowOn){
              return {
                disabled: false,
                name: "Commerce Cloud Transaction to NetSuite Customer Deposit Add",
                _importId: "CustomerDepositImportId"
              }
            } else {
              return {
                disabled: true,
                name: "Commerce Cloud Transaction to NetSuite Customer Deposit Add",
                _importId: "CustomerDepositImportId"
              }
            }
          })
          .get('/v1/imports/TransactionImportId')
          .reply(200, {
          	"_id": "TransactionImportId"
          })
          .put('/v1/imports/TransactionImportId')
          .reply(200)
          .get('/v1/imports/salesOrderImportId')
          .reply(200, {
          	"_id": "salesOrderImportId"
          })
          .put('/v1/imports/salesOrderImportId')
          .reply(200)
          .put('/v1/integrations/integrationId')
          .reply(200)
          .put('/v1/flows/flowId')
          .reply(200)


        done()
      })

      after(function (done) {
        nock.cleanAll()
        done()
      })

      it('should call disable slider for Customer depsoit flow, when transaction flow is ON', function (done) {
        isCurrentFlowCustomerDeposit = true
        isCurrentFlowOn = true
        isOtherFlowOn = true
        options.pending.disabled = true
        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call disable slider for Customer depsoit flow, when transaction flow is OFF', function (done) {
        isCurrentFlowCustomerDeposit = true
        isCurrentFlowOn = true
        isOtherFlowOn = false
        options.pending.disabled = true
        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call enable slider for Customer depsoit flow, when transaction flow is ON', function (done) {
        isCurrentFlowCustomerDeposit = true
        isCurrentFlowOn = false
        isOtherFlowOn = true
        options.pending.disabled = false

        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call enable slider for Customer depsoit flow, when transaction flow is OFF', function (done) {
        isCurrentFlowCustomerDeposit = true
        isCurrentFlowOn = false
        isOtherFlowOn = false
        options.pending.disabled = false

        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })
      /////////
      it('should call disable slider for transaction flow, when Customer depsoit flow is ON', function (done) {
        isCurrentFlowCustomerDeposit = false
        isCurrentFlowOn = true
        isOtherFlowOn = true
        options.pending.disabled = true
        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call disable slider for transaction flow, when Customer depsoit flow is OFF', function (done) {
        isCurrentFlowCustomerDeposit = false
        isCurrentFlowOn = true
        isOtherFlowOn = false
        options.pending.disabled = true
        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call enable slider for transaction flow, when Customer depsoit flow is ON', function (done) {
        isCurrentFlowCustomerDeposit = false
        isCurrentFlowOn = false
        isOtherFlowOn = true
        options.pending.disabled = false

        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })

      it('should call enable slider for transaction flow, when Customer depsoit flow is OFF', function (done) {
        isCurrentFlowCustomerDeposit = false
        isCurrentFlowOn = false
        isOtherFlowOn = false
        options.pending.disabled = false

        setting.persistSettings(options, function (err) {
          assert.equal(err, null)
          done()
        })
      })
    })

    describe( ' negative test: ', function(){
      var originalMethod
        , opts
        , res

      it('should return error for flowSpecificSliderAction (), paramobject is passed as null', function(done){
        operations.flowSpecificSliderAction(null, function(err){
          assert.equal(err.message,'Something went wrong with the data!! customerDepositFlowsActions method has invalid arguments. Kindly retry, if issue persists please contact Celigo Support.')
          done()
        })
      })

      it('should return error for customerDepositFlowsActions (), paramobject is passed as empty object', function(done){
        operations.customerDepositFlowsActions({}, function(err){
          assert.equal(err.message,'Something went wrong with the data!! customerDepositFlowsActions method has invalid arguments. Kindly retry, if issue persists please contact Celigo Support.')
          done()
        })
      })

      it('should return error for customerDepositFlowsActions (), paramobject does not contain flow body', function(done){
        operations.customerDepositFlowsActions({options: {}}, function(err){
          assert.equal(err.message,'Something went wrong with the data!! customerDepositFlowsActions method has invalid options. Kindly retry, if issue persists please contact Celigo Support.')
          done()
        })
      })

      it('should return error for customerDepositFlowsActions (), paramobject does not contain flowbody.name', function(done){
        operations.customerDepositFlowsActions({options: {flowBody : {}}}, function(err){
          assert.equal(err.message,'Something went wrong with the data!! customerDepositFlowsActions method has invalid options. Kindly retry, if issue persists please contact Celigo Support.')
          done()
        })
      })

      /*it.skip('should return error for Integration not having flow ids', function(done){
        opts = { options : options}
        opts.options.flowBody = {
      			'disabled': true,
      			'name': 'Commerce Cloud Order Transaction to NetSuite Add'
      	}
        operations.customerDepositFlowsActions(opts, function(err){
          assert.equal(err.message , 'Oops!! something went wrong. Integration does not contain required flow ids. Please contact Celigo Support.')
          done()
        })
      })*/

      it('should return error for customerDepositFlowsActions (), integration does not contain salesOrderImportId', function(done){
        originalMethod = operations.getSalesOrderImportId
        operations.getSalesOrderImportId = function(options) {
          return undefined
        }
        opts = { options : options}
        opts.options.flowBody = {
      			'disabled': true,
      			'name': 'Commerce Cloud Order Transaction to NetSuite Add'
      	}
        opts.options.integrationRecord = {
    			"settings": {
    				"commonresources": {
    					"customerDepositFlowId": "customerDepositFlowId"
    				}
    			}
    		}
        operations.customerDepositFlowsActions(opts, function(err){
          assert.equal(err.message,'Oops!! something went wrong. Integration does not contain sales order/cash sales order import adaptor ids. Please contact Celigo Support.')
          operations.getSalesOrderImportId = originalMethod
          done()
        })
      })

      it('should return no error, basically no action for a normal flow (other than cusotmer deposit flows)', function(done){
        opts = { options : options}
        opts.options.flowBody = {
      			'disabled': true,
      			'name': 'normal flow'
      	}
        opts.options.integrationRecord = {
    			"settings": {
    				"commonresources": {
    					"customerDepositFlowId": "customerDepositFlowId"
    				}
    			}
    		}
        operations.customerDepositFlowsActions(opts, function(err){
          assert.equal(err , null)
          done()
        })
      })

      it('should log error for invalid options for getCustomerDepositFlowId ', function(done){
        res = operations.getCustomerDepositFlowId(null)
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getCustomerDepositFlowId, options is empty object ', function(done){
        res = operations.getCustomerDepositFlowId({})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getCustomerDepositFlowId, options.integrationRecord.setting does not exist ', function(done){
        res = operations.getCustomerDepositFlowId({integrationRecord : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getCustomerDepositFlowId, options.pending does not exist ', function(done){
        res = operations.getCustomerDepositFlowId({integrationRecord : {settings : {}}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getCustomerDepositFlowId, options.pending.flowId does not exist ', function(done){
        res = operations.getCustomerDepositFlowId({integrationRecord : {settings : {}}, pending : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getTransactionFlowId ', function(done){
        res = operations.getTransactionFlowId(null)
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getTransactionFlowId, options is empty object ', function(done){
        res = operations.getTransactionFlowId({})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getTransactionFlowId, options.integrationRecord.setting does not exist ', function(done){
        res = operations.getTransactionFlowId({integrationRecord : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getTransactionFlowId, options.pending does not exist ', function(done){
        res = operations.getTransactionFlowId({integrationRecord : {settings : {}}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getTransactionFlowId, options.pending.flowId does not exist ', function(done){
        res = operations.getTransactionFlowId({integrationRecord : {settings : {}}, pending : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getSalesOrderImportId ', function(done){
        res = operations.getSalesOrderImportId(null)
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getSalesOrderImportId, options is empty object ', function(done){
        res = operations.getSalesOrderImportId({})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getSalesOrderImportId, options.integrationRecord.setting does not exist ', function(done){
        res = operations.getSalesOrderImportId({integrationRecord : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getSalesOrderImportId, options.pending does not exist ', function(done){
        res = operations.getSalesOrderImportId({integrationRecord : {settings : {}}})
        assert.equal(res, undefined)
        done()
      })

      it('should log error for invalid options for getSalesOrderImportId, options.pending.flowId does not exist ', function(done){
        res = operations.getSalesOrderImportId({integrationRecord : {settings : {}}, pending : {}})
        assert.equal(res, undefined)
        done()
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired(null, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options is empty object ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options.integrationRecord.setting does not exist ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({integrationRecord : {}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options.pending does not exist ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({integrationRecord : {settings : {}}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options.pending.flowId does not exist ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({integrationRecord : {settings : {}}, pending : {}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options.bearerToken does not exist ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({integrationRecord : {settings : {}}, pending : {flowId : 'flowId'}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentTransactionCustomRecordRequired, options.integrationRecord._id does not exist ', function(done){
        operations.setIsPaymentTransactionCustomRecordRequired({integrationRecord : {settings : {}}, pending : {flowId : 'flowId'}, bearerToken : 'testToken'}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })


      it('should return error for invalid options for setIsPaymentCustomerDepositRequired ', function(done){
        operations.setIsPaymentCustomerDepositRequired(null, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options is empty object ', function(done){
        operations.setIsPaymentCustomerDepositRequired({}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options.integrationRecord.setting does not exist ', function(done){
        operations.setIsPaymentCustomerDepositRequired({integrationRecord : {}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options.pending does not exist ', function(done){
        operations.setIsPaymentCustomerDepositRequired({integrationRecord : {settings : {}}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options.pending.flowId does not exist ', function(done){
        operations.setIsPaymentCustomerDepositRequired({integrationRecord : {settings : {}}, pending : {}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options.bearerToken does not exist ', function(done){
        operations.setIsPaymentCustomerDepositRequired({integrationRecord : {settings : {}}, pending : {flowId : 'flowId'}}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })

      it('should return error for invalid options for setIsPaymentCustomerDepositRequired, options.integrationRecord._id does not exist ', function(done){
        operations.setIsPaymentCustomerDepositRequired({integrationRecord : {settings : {}}, pending : {shopId: {flowId : 'flowId'}}, bearerToken : 'testToken', shopId: 'shopId'}, function(err){
          assert.equal(err.message, 'Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.')
          done()
        })
      })
    })
  })
  describe('method consumeInput: ', function () {
    it('should return correct settings name and value in consume Input', function (done) {
      var options =
        {
          "pending":
          {
            "shopId":
            {
              "flows_flowsId1_method1": true
              , "flows_flowsId2_method2": false
              , "exports_exportsId1_method3": "test"
            }
          }
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken"
        }

      var expected = {
        "shopId": {
          "flows_flowsId1_method1": true
          , "flows_flowsId2_method2": false
          , "exports_exportsId1_method3": "test"
        }
      }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        if (err) return callback(err)
        assert.deepEqual(paramObject.newSettings, expected)
        done()
      })
    })
    it('should return error if pending property is missing in option', function (done) {
      var options =
        {
          "not_pending":
          {
          }
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken"
        }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        assert.equal(err.message, 'pending property is missing from options')
        done()
      })
    })
  })

  describe('method consumeInput: multi store ', function () {
    it('should return correct settings name and value in consume Input', function (done) {
      var options =
        {
          "pending":
          {
            "shopId":
            {
              "flows_flowsId1_method1": true
              , "flows_flowsId2_method2": false
              , "exports_exportsId1_method3": "test"
            }
          }
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken",
          integrationRecord: {
            settings: {
              supportsMultiStore: true
            }
          }
        }

      var expected = {
        "flows_flowsId1_method1": true
        , "flows_flowsId2_method2": false
        , "exports_exportsId1_method3": "test"
      }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        if (err) return callback(err)
        assert.deepEqual(paramObject.newSettings, expected)
        done()
      })
    })

    it('should return correct flow id and disabled in consume Input.', function (done) {
      var options =
        {
          "pending": {
            "shopId":
            {
              "flowId": "flowId",
              "disabled": false
            }
          }
          , "shopId": "shopId"
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken",
          integrationRecord: {
            settings: {
              supportsMultiStore: true
            }
          }
        }

      var expected = {
        "flowId": "flowId",
        "disabled": false
      }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        if (err) return callback(err)
        assert.deepEqual(paramObject.newSettings, expected)
        done()
      })
    })

    it('should return error for shopID not present in pending.', function (done) {
      var options =
        {
          "pending": {
            "flowId": "flowId",
            "disabled": false
          }
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken",
          integrationRecord: {
            settings: {
              supportsMultiStore: true
            }
          }
        }

      var expected = {
        "flows_flowsId1_method1": true
        , "flows_flowsId2_method2": false
        , "exports_exportsId1_method3": "test"
      }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        assert.equal(err.message, 'pending property has more than one shopId')
        done()
      })
    })

    it('should work succesfully consume Input with flowId settings', function (done) {
      var options =
        {
          "pending": {
            "flowId": "flowId",
            "disabled": false
          }
          , "_integrationId": "testIntegrationId"
          , "bearerToken": "testBearerToken"
        }

      var expected = {
        "flows_flowsId1_method1": true
        , "flows_flowsId2_method2": false
        , "exports_exportsId1_method3": "test"
      }
      var paramObject = {}
      paramObject.options = options
      var ret = setting.consumeInput(paramObject, function (err) {
        assert.equal(err, null)
        done()
      })
    })
  })

  describe('method loadSettings: ', function () {
    it('should load the old settings', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.json', 'utf8'))
        , oldSettingsResponse = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.json', 'utf8'))
      var paramObject = {}
      setting = new settings(true)
      paramObject.options = {}
      paramObject.options.integrationRecord = integration
      paramObject.options.shopId = '8127949'
      var ret = setting.loadSettings(paramObject, function (err) {
        if (err) return done(err)
        assert.deepEqual(paramObject.oldSettings, oldSettingsResponse)
        done()
      })
    })

    it('should load the old settings for multi-store', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
        , oldSettingsResponse = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.json', 'utf8'))
      var paramObject = {}
      setting = new settings(true)
      paramObject.options = {}
      paramObject.options.integrationRecord = integration
      paramObject.options.shopId = '8127949'
      var ret = setting.loadSettings(paramObject, function (err) {
        if (err) return done(err)
        assert.deepEqual(paramObject.oldSettings, oldSettingsResponse)
        done()
      })
    })

    it('should load the old settings if settings grouping enabled ', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.grouping.json', 'utf8'))
        , oldSettingsResponse = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.grouping.json', 'utf8'))
      var paramObject = {}
      paramObject.options = {}
      paramObject.options.integrationRecord = integration
      var ret = setting.loadSettings(paramObject, function (err) {
        if (err) return done(err)
        assert.deepEqual(paramObject.oldSettings, oldSettingsResponse)
        done()
      })
    })

    it('should throw error when section is missing', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.grouping.json', 'utf8'))
        , oldSettingsResponse = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.grouping.json', 'utf8'))
      delete integration.settings.sections
      var paramObject = {}
      paramObject.options = {}
      paramObject.options.integrationRecord = integration
      var ret = setting.loadSettings(paramObject, function (err) {
        assert.equal(err.message, 'sections under settings is missing')
        done()
      })
    })

    it('should throw error when settings is missing', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.grouping.json', 'utf8'))
        , oldSettingsResponse = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.grouping.json', 'utf8'))
      delete integration.settings
      var paramObject = {}
      paramObject.options = {}
      paramObject.options.integrationRecord = integration
      var ret = setting.loadSettings(paramObject, function (err) {
        assert.equal(err.message, 'Cannot read property \'sections\' of undefined')
        done()
      })
    })
  })

  describe('method validateSettings: ', function () {
    it('should validate setting if any required', function (done) {
      var oldSettings = {}
        , newSettings = {}
        , integrationRecord = {}
      var ret = setting.validateSettings(oldSettings, newSettings, integrationRecord)
      assert.equal(ret, true)
      done()
    })
  })

  describe('method verifyIfChanged: ', function () {
    it('should verify settings and return changes fields only', function (done) {
      var oldSettings = JSON.parse(fs.readFileSync('./test/data/settings/test.oldSettingsResponse.json', 'utf8'))
        , newSettings =
          {
            "flows_flowId_enable": true
            , "flows_flowId_toggleWebhook": false
            , "exports_exportId_registerWebhook": "authorize"
            , "imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods": 4
            , 'exports_exportId_yieldValueAndLabel': {
              'id': '123',
              'label': '456'
            }
          }
        , expected =
          {
            "flows_flowId_enable": true
            , "flows_flowId_toggleWebhook": false
            , "imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods": 4
          }
      var paramObject = {}
      paramObject.oldSettings = oldSettings
      paramObject.oldSettings['exports_exportId_yieldValueAndLabel'] = {
        type: 'select',
        properties: {
          yieldValueAndLabel: true
        },
        value: '123'
      }
      paramObject.newSettings = newSettings
      var ret = setting.verifyIfChanged(paramObject, function (err) {
        if (err) return done(err)
        assert.deepEqual(paramObject.newSettings, expected)
        done()
      })
    })
  })

  describe('method setFieldValues: ', function () {
    var paramObject = {
      oldSettings: {
        testField: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        testField: 'newValue'
      }
      , setting: 'testField'
    }
    it('Should change the old value of setting', function (done) {
      var ret = setting.setFieldValues(paramObject, function (err) {
      })
      assert.equal(paramObject.oldSettings.testField.value, 'newValue')
      done();
    })
  })

  describe('method getSettingsFromHerculesForSingleSection: ', function () {
    var herculesFlowData = {
      settings: {
        sections: [
          {
            fields: [
              {
                name: 'imports_importId_test'
                , value: 'test_field1'
              }
              , {
                name: 'imports_defaultGuestCustomer_test'
                , value: 'test_customer'
              }
            ]
          }
        ]
      }
      , _importId: 'importId'
    }
    it("Should get setting for single select store for import resource", function (done) {
      var ret = setting.getSettingsFromHerculesForSingleSection(herculesFlowData, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })
    it("Should get setting for single select store for export resource", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              fields: [
                {
                  name: 'imports_exportId_test'
                  , value: 'test_field2'
                }
                , {
                  name: 'imports_defaultGuestCustomer_test'
                  , value: 'test_customer'
                }
              ]
            }
          ]
        }
        , _exportId: 'exportId'
      }
      var ret = setting.getSettingsFromHerculesForSingleSection(herculesFlowData, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_exportId_test, 'test_field2')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get setting for tabbed setting single select store for export resource", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: "Order",
              fields: [
                {
                  name: 'imports_exportId_test'
                  , value: 'test_field2'
                }
                , {
                  name: 'imports_defaultGuestCustomer_test'
                  , value: 'test_customer'
                }
              ]
            }
          ]
        }
        , _exportId: 'exportId'
      }
      var ret = setting.getSettingsFromHerculesForSingleSection(herculesFlowData, 'Order', function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_exportId_test, 'test_field2')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get setting for single select store for any resource", function (done) {
      delete herculesFlowData._importId
      delete herculesFlowData._exportId
      var ret = setting.getSettingsFromHerculesForSingleSection(herculesFlowData, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret, undefined)
      done();
    })
  })

  describe('method getSettingsFromHercules: ', function () {
    it("Should get setting from getSettingsFromHercules", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: 'Order',
              sections: [
                {
                  fields: [
                    {
                      name: 'imports_importId_test'
                      , value: 'test_field1'
                    }
                    , {
                      name: 'imports_defaultGuestCustomer_test'
                      , value: 'test_customer'
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _importId: 'importId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData)
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get setting from getSettingsFromHercules with exports", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: 'Order',
              sections: [
                {
                  fields: [
                    {
                      name: 'imports_exportId_test'
                      , map: 'test_field1'
                      , allowFailures: false
                    }
                    , {
                      name: 'imports_exportId_test1'
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _exportId: 'exportId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData)
      assert.deepEqual(ret.imports_exportId_test, { map: 'test_field1', allowFailures: false })
      assert.equal(ret.imports_exportId_test1, null)
      done();
    })

    it("Should get empty setting from getSettingsFromHercules", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: 'Order',
              sections: [
                {
                  fields: [
                    {
                      value: 'imports_exportId_test1'
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _exportId: 'exportId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData)
      assert.deepEqual(ret, {})
      done();
    })

    it("Should get empty setting from getSettingsFromHercules no resource", function (done) {
      var herculesFlowData = {}
      var ret = setting.getSettingsFromHercules(herculesFlowData, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret, undefined)
      done();
    })

    it("Should get setting from getSettingsFromHercules with additional fields single store", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: 'Order',
              sections: [
                {
                  fields: [
                    {
                      name: 'imports_importId_test'
                      , value: 'test_field1'
                    }
                    , {
                      name: 'imports_defaultGuestCustomer_test'
                      , value: 'test_customer'
                    }
                    , {
                      name: 'export_defaultCustomer_test'
                      , value: 'test_gcustomer'
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _importId: 'importId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData, null, ['defaultCustomer'])
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      assert.equal(ret.defaultCustomer, 'test_gcustomer')
      done();
    })

    it("Should get setting from getSettingsFromHercules with additional fields with accountid with multi store", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              id: '123',
              sections: [
                {
                  title: 'Order',
                  sections: [
                    {
                      fields: [
                        {
                          name: 'imports_importId_test'
                          , value: 'test_field1'
                        }
                        , {
                          name: 'imports_defaultGuestCustomer_test'
                          , value: 'test_customer'
                        }
                        , {
                          name: 'export_defaultCustomer_test'
                          , value: 'test_gcustomer'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _importId: 'importId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData, "123", ['defaultCustomer'])
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      assert.equal(ret.defaultCustomer, 'test_gcustomer')
      done();
    })

    it("Should get setting from getSettingsFromHercules with additional fields without accountid with multi store", function (done) {
      var herculesFlowData = {
        settings: {
          storemap: [
            {
              accountid: '123'
            }
          ],
          sections: [
            {
              id: '123',
              sections: [
                {
                  title: 'Order',
                  sections: [
                    {
                      fields: [
                        {
                          name: 'imports_importId_test'
                          , value: 'test_field1'
                        }
                        , {
                          name: 'imports_defaultGuestCustomer_test'
                          , value: 'test_customer'
                        }
                        , {
                          name: 'export_defaultCustomer_test'
                          , value: 'test_gcustomer'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _importId: 'importId'
      }
      var ret = setting.getSettingsFromHercules(herculesFlowData, null, ['defaultCustomer'])
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      assert.equal(ret.defaultCustomer, 'test_gcustomer')
      done();
    })

  })
  describe('method getSettingsFromHerculesForSingleSectionWithGrouping: ', function () {
    var herculesFlowDataWithGrouping = {
      settings: {
        sections: [
          {
            title: 'Order',
            sections: [
              {
                fields: [
                  {
                    name: 'imports_importId_test'
                    , value: 'test_field1'
                  }
                  , {
                    name: 'imports_defaultGuestCustomer_test'
                    , value: 'test_customer'
                  }
                ]
              }
            ]
          }
        ]
      }
      , _importId: 'importId'
    }
      , herculesFlowDataWithoutGrouping = {
        settings: {
          sections: [
            {
              title: 'Order',
              fields: [
                {
                  name: 'imports_importId_test'
                  , value: 'test_field1'
                }
                , {
                  name: 'imports_defaultGuestCustomer_test'
                  , value: 'test_customer'
                }
              ]
            }
          ]
        }
        , _importId: 'importId'
      }

    it("Should get setting for single select store for import resource with grouping", function (done) {
      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithGrouping, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get setting for single select store for export resource with grouping", function (done) {
      delete herculesFlowDataWithGrouping._importId
      herculesFlowDataWithGrouping._exportId = 'exportId'
      herculesFlowDataWithGrouping.settings.sections[0].sections[0].fields.push({
        name: 'imports_exportId_test'
        , value: 'test_field2'
      })

      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithGrouping, 'Order', function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_exportId_test, 'test_field2')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get undefined for single select store without resource with grouping", function (done) {
      delete herculesFlowDataWithGrouping._importId
      delete herculesFlowDataWithGrouping._exportId
      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithGrouping, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret, undefined)
      done();
    })

    it("Should get setting for single select store for import resource without grouping", function (done) {
      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithoutGrouping, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_importId_test, 'test_field1')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get setting for single select store for export resource without grouping", function (done) {
      delete herculesFlowDataWithoutGrouping._importId
      herculesFlowDataWithoutGrouping._exportId = 'exportId'
      herculesFlowDataWithoutGrouping.settings.sections[0].fields.push({
        name: 'imports_exportId_test'
        , value: 'test_field2'
      })

      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithoutGrouping, 'Order', function (err) {
        assert(!!err, false)
      })
      assert.equal(ret.imports_exportId_test, 'test_field2')
      assert.equal(ret.defaultGuestCustomer, 'test_customer')
      done();
    })

    it("Should get undefined for single select store without resource without grouping", function (done) {
      delete herculesFlowDataWithoutGrouping._importId
      delete herculesFlowDataWithoutGrouping._exportId
      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowDataWithoutGrouping, null, function (err) {
        assert(!!err, false)
      })
      assert.equal(ret, undefined)
      done();
    })

    it("Should get empty setting from getSettingsFromHerculesForSingleSectionWithGrouping", function (done) {
      var herculesFlowData = {
        settings: {
          sections: [
            {
              title: 'Order',
              sections: [
                {
                  fields: [
                    {
                      value: 'imports_exportId_test1'
                    }
                  ]
                }
              ]
            }
          ]
        }
        , _exportId: 'exportId'
      }
      var ret = setting.getSettingsFromHerculesForSingleSectionWithGrouping(herculesFlowData, 'Order', function (err) {
        assert(!!err, false)
      })
      assert.deepEqual(ret, {})
      done();
    })
  })

  describe('method getSavedSearchId: ', function () {
    var paramObject = {
      options: {
        pending: {
          searchId: 'savedSearchId'
        }
      }
      , searchId: true
    }
    it('Should return savedSearchId', function (done) {
      var ret = setting.getSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done();
    })
    it('Should return savedSearchId using key', function (done) {
      paramObject.searchId = false
      paramObject.settingParams = ['param1', 'param2', 'param3']
      paramObject.settingsMethodName = 'settingsMethodName'
      paramObject.refreshMethodName = 'refreshMethodName'
      paramObject.options.pending.param1_param2_settingsMethodName_refreshMethodName = 'savedSearchId'
      var ret = setting.getSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done();
    })

    it('Should throw error savedSearchId by missing paramObject options', function (done) {
      delete paramObject.options.pending
      delete paramObject.searchId
      setting.getSavedSearchId(paramObject, function (err) {
        assert.equal(err.message, 'paramObject is not having valid values | paramObject:{"options":{},"savedSearchId":"savedSearchId","settingParams":["param1","param2","param3"],"settingsMethodName":"settingsMethodName","refreshMethodName":"refreshMethodName"}')
        done();
      })
    })
  })

  describe('method getSavedSearchIdAsync: ', function () {
    var paramObject = {
      options: {
        pending: {
          searchId: 'savedSearchId'
        }
      }
    }
    it('Should return getSavedSearchIdAsync', function (done) {
      setting.getSavedSearchIdAsync(paramObject, function (err) {
        assert.equal(paramObject.savedSearchId, 'savedSearchId')
        done()
      })
    })
    it('Should return getSavedSearchIdAsync with paramObject savedSearchId', function (done) {
      paramObject.savedSearchId = 'savedSearchId'
      setting.getSavedSearchIdAsync(paramObject, function (err) {
        assert.equal(paramObject.savedSearchId, 'savedSearchId')
        done()
      })
    })

    it('Should return getSavedSearchIdAsync using key', function (done) {
      delete paramObject.savedSearchId
      paramObject.settingParams = ['param1', 'param2', 'param3']
      paramObject.settingsMethodName = 'settingsMethodName'
      paramObject.refreshMethodName = 'refreshMethodName'
      paramObject.options.pending.param1_param2_settingsMethodName_refreshMethodName = 'savedSearchId'
      delete paramObject.options.pending.searchId
      setting.getSavedSearchIdAsync(paramObject, function (err) {
        assert.equal(paramObject.savedSearchId, 'savedSearchId')
        done()
      })
    })

    it('Should throw error getSavedSearchIdAsync by missing paramObject options', function (done) {
      delete paramObject.settingParams
      delete paramObject.savedSearchId
      setting.getSavedSearchIdAsync(paramObject, function (err) {
        assert.equal(err.message, 'paramObject is not having valid values | paramObject:{"options":{"pending":{"param1_param2_settingsMethodName_refreshMethodName":"savedSearchId"}},"settingsMethodName":"settingsMethodName","refreshMethodName":"refreshMethodName"}')
        done();
      })
    })
  })

  describe('method multistore getSavedSearchId: ', function () {
    var paramObject = {
      options: {
        pending: {
          shopid: {
            param1_param2_settingsMethodName_refreshMethodName: 'savedSearchId'
          }
        },
        integrationRecord: {
          settings: {
            supportsMultiStore: true
          }
        },
      }
      , settingParams: ['param1', 'param2', 'param3']
      , settingsMethodName: 'settingsMethodName'
      , refreshMethodName: 'refreshMethodName'
      , searchId: false
    }
    it('Should return savedSearchId using key', function (done) {
      var ret = setting.getSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done();
    })
  })

  describe('method getMultiExportSavedSearchId: ', function () {
    var paramObject = {
      options: {
        pending: {
          searchId: 'savedSearchId'
        }
      }
      , searchId: true
    }
    it('Should return savedSearchId', function (done) {
      var ret = setting.getMultiExportSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done()
    })
    it('Should return savedSearchId using key', function (done) {
      paramObject.searchId = false
      paramObject.settingParams = ['param1', 'param2', 'param3', 'param4']
      paramObject.settingsMethodName = 'settingsMethodName'
      paramObject.refreshMethodName = 'refreshMethodName'
      paramObject.options.pending.param1_param2_settingsMethodName_refreshMethodName_param4 = 'savedSearchId'
      var ret = setting.getMultiExportSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })

      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done()
    })
    it('Should return savedSearchId using key single param', function (done) {
      paramObject.searchId = false
      paramObject.settingParams = ['param1', 'param2', 'param3']
      paramObject.settingsMethodName = 'settingsMethodName'
      paramObject.refreshMethodName = 'refreshMethodName'
      paramObject.options.pending.param1_param2_settingsMethodName_refreshMethodName = 'savedSearchId'
      var ret = setting.getMultiExportSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done()
    })

    var paramObject1 = {
      options: {
        pending: {
        }
      }
      , searchId: true
    }
    it('Should return savedSearchId using multi-key single param', function (done) {
      paramObject1.searchId = false
      paramObject1.settingParams = ['param1', 'param2', 'param3']
      paramObject1.settingsMethodName = 'settingsMethodName'
      paramObject1.refreshMethodName = 'refreshMethodName'
      paramObject1.options.pending.param1_param2_settingsMethodName_refreshMethodName = 'savedSearchId'
      var ret = setting.getMultiExportSavedSearchId(paramObject1, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject1.savedSearchId, 'savedSearchId')
      done()
    })

    it('Should return savedSearchId using multi-store', function (done) {
      paramObject.searchId = false
      paramObject.settingParams = ['param1', 'param2', 'param3']
      paramObject.settingsMethodName = 'settingsMethodName'
      paramObject.refreshMethodName = 'refreshMethodName'
      paramObject.options.pending = {
        shopid: {
          param1_param2_settingsMethodName_refreshMethodName: 'savedSearchId'
        }
      }
      paramObject.options.integrationRecord = { settings: { supportsMultiStore: true } }
      var ret = setting.getMultiExportSavedSearchId(paramObject, function (err) {
        assert(!!err, false)
      })
      assert.equal(paramObject.savedSearchId, 'savedSearchId')
      done()
    })

    it('Should throw error getMultiExportSavedSearchId by missing paramObject options', function (done) {
      delete paramObject.settingParams
      delete paramObject.savedSearchId
      setting.getMultiExportSavedSearchId(paramObject, function (err) {
        assert.equal(err.message, 'paramObject is not having valid values | paramObject:{"options":{"pending":{"shopid":{"param1_param2_settingsMethodName_refreshMethodName":"savedSearchId"}},"integrationRecord":{"settings":{"supportsMultiStore":true}}},"searchId":false,"settingsMethodName":"settingsMethodName","refreshMethodName":"refreshMethodName"}')
        done();
      })
    })
  })

  describe('method | handleSliderInput', function () {
    it('Throw error if the handleSliderInput flag is not checked', function () {
      var input = {
        sliderInput: false
        , flowId: 'enableThisFlow'
        , disabled: false
        , options: {
          bearerToken: 'sampleToken'
        }
      }
      //nock the requests now
      setting.handleSliderInput(input, function (err) {
        assert.equal(err, 'Unable to identify the flowid for enabling')
      })
    })
  })

  describe('method | extendConnectorSpecificImplementionForStaticMap', function () {
    it('should run succesfully extendConnectorSpecificImplementionForStaticMap', function () {
      var paramObject = {}
      //nock the requests now
      setting.extendConnectorSpecificImplementionForStaticMap(paramObject, function (err) {
        assert.equal(err, null)
      })
    })
  })

  describe('method | updateResource', function () {
    it('should throw error on statusCode Mismatch update Resource', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200, { "netsuite": { "restlet": { "searchId": "213456" } } })
        .put('/v1/exports/exportId')
        .reply(400)
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123'], 'bearerToken', function (err) {
        assert.equal(err, 'PUT call failed for the resource : exports: exportId, statusCode :400')
      })
    })

    it('should throw error update Resource', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200, { "netsuite": { "restlet": { "searchId": "213456" } } })
        .put('/v1/exports/exportId')
        .replyWithError('error occured')
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123'], 'bearerToken', function (err) {
        assert.equal(err, 'Error: error occured')
      })
    })

    it('should throw error with empty body while get call to resource ', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200, '')
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123'], 'bearerToken', function (err) {
        assert.equal(err, 'Empty body returned for the resource : exports: exportId')
      })
    })

    it('should throw error with statuscode mismatch while get call to resource ', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(400)
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123'], 'bearerToken', function (err) {
        assert.equal(err, 'GET call failed for the resource : exports: exportId, statusCode :400')
      })
    })

    it('should throw error while get call to resource ', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .replyWithError('error occured')
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123'], 'bearerToken', function (err) {
        assert.equal(err, 'Error: error occured')
      })
    })

    it('should throw error when path and value length mismatch', function () {
      //nock the requests now
      setting.updateResource('exports', 'exportId', ['netsuite.restlet.searchId'], ['123', '321'], 'bearerToken', function (err) {
        assert.equal(err, 'Paths and Values arrays should have equal number of entries')
      })
    })

    it('should pass conversion of path and value to array', function () {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .get('/v1/exports/exportId')
        .reply(200,'{}')
        .put('/v1/exports/exportId')
        .reply(200)
      //nock the requests now
      setting.updateResource('exports', 'exportId', 'netsuite.restlet.searchId', '123', 'bearerToken', function (err) {
        assert.equal(err, null)
      })
    })
  })

  describe('method | getStoreMap', function () {
    it('should run succesfully without settingParams with export', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var options = { settings: integration.settings, _exportId: 'exportId' }
      //nock the requests now
      var storemap = setting.getStoreMap(options, null)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully without settingParams with import', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var options = { settings: integration.settings, _importId: 'importId' }
      //nock the requests now
      var storemap = setting.getStoreMap(options, null)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully without settingParams with flow', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var options = { settings: integration.settings, _flowId: 'flowId' }
      //nock the requests now
      var storemap = setting.getStoreMap(options, null)
      assert.deepEqual(storemap, expected)
    })


    it('should run succesfully with settingParams having export', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var settingParams = ['exports', 'exportId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully with settingParams having import', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var settingParams = ['imports', 'importId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully with settingParams having flow', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var expected = integration.settings.storemap[0]
      var settingParams = ['flows', 'flowId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully with incorrect settingParams', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      var settingParams = ['flow', 'flowId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.equal(storemap, undefined)
    })

    it('should run succesfully with settingParams gives undefined when storemap missing', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integration.multistore.json', 'utf8'))
      delete integration.settings.storemap
      delete integration.settings.commonresources
      var settingParams = ['flows', 'flowId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.equal(storemap, undefined)
    })

    it('should run succesfully with settingParams having import for single store', function () {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.grouping.json', 'utf8'))
      var expected = { "onDemandOrderImportFlowId": "onDemandOrderImportFlowId", "orderImportAdaptorId": "orderImportAdaptorId", "orderAckFlowId": "orderAckFlowId", "apiIdentifierCustomerImport": "apiIdentifierCustomerImport", "orderAckFlowExportId": "orderAckFlowExportId", "walmartConnectionId": "walmartConnectionId", "netsuiteConnectionId": "netsuiteConnectionId" }
      var settingParams = ['imports', 'importId', 'param3']
      var options = { integrationRecord: integration }
      //nock the requests now
      var storemap = setting.getStoreMap(options, settingParams)
      assert.deepEqual(storemap, expected)
    })

    it('should run succesfully with no settingParams - in case of configuration id', function () {
      var expected = {
        shopname: "vj-dev1",
        shopid: "123"
      }
      var options = {
        settings: {
          storemap: [{
            shopname: "vj-dev1",
            shopid: "123",
          }, {
            shopname: "vj-dev2",
            shopid: "234",
          }]
        }, configuration: { sectionId: "123" }
      }
      var storemap = setting.getStoreMap(options)
      assert.deepEqual(storemap, expected)
    })
  })

  describe('method staticMapFunctionFactory: ', function () {
    var paramObject = {
      oldSettings: {
        imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods: {
          value: 'oldValue'
        }
      }
      , newSettings: {
        imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods: {
          name: 'shipmethodLookup', map: 'newValue',
          default: 'newValue',
          allowFailures: false
        }
      }
      , setting: 'imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods'
      , settingParams: ['imports', 'importId', 'shipmethodLookup', 'dummyExtractsMethod', 'listShipMethods']
      , options: {
        pending: {
          imports_importId_shipmethodLookup_dummyExtractsMethod_listShipMethods: 'newValue'
        }
        , bearerToken: 'bearerToken'
      }
    }
    it('Should run succesfully staticMapFunctionFactory with distributed', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .reply(200, {
          "lookups": [{
            "name": "paymentmethodLookup",
            "allowFailures": true,
            "map": {
              "visa": "5"
            },
            "default": "5"
          }],
          "mapping": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
        .put('/v1/imports/importId/distributed')
        .reply(200)
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully staticMapFunctionFactory with distributed on missing mapping in adaptor', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .reply(200, {
          "lookups": [{
            "name": "paymentmethodLookup",
            "allowFailures": true,
            "map": {
              "visa": "5"
            },
            "default": "5"
          }],
          "mapping": {
            "fields": []
          }
        })
        .put('/v1/imports/importId/distributed')
        .reply(200)
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully staticMapFunctionFactory with distributed on lookup match in adaptor', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .reply(200, {
          "lookups": [{
            "name": "shipmethodLookup",
            "allowFailures": true,
            "map": {
              "visa": "5"
            },
            "default": "5"
          }],
          "mapping": {
            "fields": []
          }
        })
        .put('/v1/imports/importId/distributed')
        .reply(200)
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on update adaptor staticMapFunctionFactory with distributed', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .reply(200, {
          "lookups": [{
            "name": "paymentmethodLookup",
            "allowFailures": true,
            "map": {
              "visa": "5"
            },
            "default": "5"
          }],
          "mapping": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
        .put('/v1/imports/importId/distributed')
        .replyWithError('error occured')
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw exception on rendering adaptor data staticMapFunctionFactory with distributed', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .reply(200, {
          "lookups": [{
            "name": "paymentmethodLookup",
            "allowFailures": true,
            "map": {
              "visa": "5"
            },
            "default": "5"
          }],
          "mappings": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw exception on staticMapConfig staticMapFunctionFactory with distributed', function (done) {
      var staticMapConfig = {
        distributed: {
          staticFieldMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on get adaptor staticMapFunctionFactory with distributed', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId/distributed')
        .replyWithError('error occured')
      var staticMapConfig = {
        distributed: {
          staticFielddMap: {
            'generate': 'shipmethod',
            'extract': 'shipping_addresses_1.shipping_method',
            'lookupName': 'shipmethodLookup',
            'internalId': true
          }
        }
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .reply(200, {
          "rest": {
            "lookups": [{
              "name": "paymentmethodLookup",
              "allowFailures": true,
              "map": {
                "visa": "5"
              },
              "default": "5"
            }]
          },
          "mapping": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
        .put('/v1/imports/importId')
        .reply(200)
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully on mapping missing on adaptor staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .reply(200, {
          "rest": {
            "lookups": [{
              "name": "paymentmethodLookup",
              "allowFailures": true,
              "map": {
                "visa": "5"
              },
              "default": "5"
            }]
          },
          "mapping": {
            "fields": []
          }
        })
        .put('/v1/imports/importId')
        .reply(200)
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully on lookup match on adaptor staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .reply(200, {
          "rest": {
            "lookups": [{
              "name": "shipmethodLookup",
              "allowFailures": true,
              "map": {
                "visa": "5"
              },
              "default": "5"
            }]
          },
          "mapping": {
            "fields": []
          }
        })
        .put('/v1/imports/importId')
        .reply(200)
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on update adaptor staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .reply(200, {
          "rest": {
            "lookups": [{
              "name": "paymentmethodLookup",
              "allowFailures": true,
              "map": {
                "visa": "5"
              },
              "default": "5"
            }]
          },
          "mapping": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
        .put('/v1/imports/importId')
        .replyWithError('error occured')
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw exception on rendering adaptor data staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .reply(200, {
          "rest": {
            "lookups": [{
              "name": "paymentmethodLookup",
              "allowFailures": true,
              "map": {
                "visa": "5"
              },
              "default": "5"
            }]
          },
          "mappings": {
            "fields": [{
              "generate": "shipmethod",
              "extract": "shipping_addresses_1.shipping_method",
              "lookupName": "shipmethodLookup",
              "internalId": true
            }]
          }
        })
        .put('/v1/imports/importId')
        .replyWithError('error occured')
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on get adaptor staticMapFunctionFactory with importType rest', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .persist()
        .get('/v1/imports/importId')
        .replyWithError('error occured')
      var staticMapConfig = {
        staticFieldMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw exception on render paramObject staticMapFunctionFactory with importType rest', function (done) {
      var staticMapConfig = {
        staticFielddMap: {
          'generate': 'shipmethod',
          'extract': 'shipping_addresses_1.shipping_method',
          'lookupName': 'shipmethodLookup',
          'internalId': true
        }
        , importType: 'rest'
      }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should run succesfully staticMapFunctionFactory with updateSavedSearch location', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/connectionId/proxy')
        .reply(200, [{ "statusCode": 200, "data": { "message": "Found" } }])
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
      paramObject.options.integrationRecord = integration
      var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'location' }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on proxy call statusCode mismatch staticMapFunctionFactory with updateSavedSearch location', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/connectionId/proxy')
        .reply(200, [{ "statusCode": 400}])
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
      paramObject.options.integrationRecord = integration
      var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'location' }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on unable to make proxy call in staticMapFunctionFactory with updateSavedSearch location', function (done) {
      nock.cleanAll()
      nock(HERCULES_BASE_URL)
        .post('/v1/connections/connectionId/proxy')
        .replyWithError('error occured')
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
      paramObject.options.integrationRecord = integration
      var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'location' }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on getSavedSearchIdAsync when some value missing in paramObject for staticMapFunctionFactory with updateSavedSearch location', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
      paramObject.options.integrationRecord = integration
      delete paramObject.settingParams
      var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'location' }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })

    it('Should throw error on getSavedSearchIdAsync when commonresources not present for staticMapFunctionFactory with updateSavedSearch location', function (done) {
      var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
      delete integration.settings.commonresources
      paramObject.options.integrationRecord = integration
      delete paramObject.settingParams
      delete paramObject.nsConnectionId
      var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'location' }
      setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
        assert(err, null)
        done()
      })
    })
    describe('method staticMapFunctionFactory with updateMultipleSavedSearchLocationFilters: ', function () {
      var paramObject = {
          "oldSettings": {
            "exports_exportid_updateMultipleSavedSearchLocationFilters_listLocations": {
              "value": []
            }
          },
          "newSettings": {
            "exports_exportid_updateMultipleSavedSearchLocationFilters_listLocations": {
              name: 'shipmethodLookup', map: 'newValue',
              default: 'newValue',
              allowFailures: false
            }
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
      it('Should run succesfully staticMapFunctionFactory with updateSavedSearch locationForMultipleSearch', function (done) {
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/connectionId/proxy')
          .reply(200, [{ "statusCode": 200, "data": { "message": "Found" } }])
        var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
        paramObject.options.integrationRecord = integration
        var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'locationForMultipleSearch' }
        setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
          assert(err, null)
          done()
        })
      })

      it('Should throw error on proxy call statusCode mismatch staticMapFunctionFactory with updateSavedSearch locationForMultipleSearch', function (done) {
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/connectionId/proxy')
          .reply(200, [{ "statusCode": 400}])
        var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
        paramObject.options.integrationRecord = integration
        var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'locationForMultipleSearch' }
        setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
          assert(err, null)
          done()
        })
      })

      it('Should throw error on unable to make proxy call in staticMapFunctionFactory with updateSavedSearch locationForMultipleSearch', function (done) {
        nock.cleanAll()
        nock(HERCULES_BASE_URL)
          .post('/v1/connections/connectionId/proxy')
          .replyWithError('error occured')
        var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
        paramObject.options.integrationRecord = integration
        var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'locationForMultipleSearch' }
        setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
          assert(err, null)
          done()
        })
      })

      it('Should throw error on when pending missing in paramObject in staticMapFunctionFactory with updateSavedSearch locationForMultipleSearch', function (done) {
        var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
        paramObject.options.integrationRecord = integration
        var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'locationForMultipleSearch' }
        delete paramObject.options.pending
        setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
          assert(err, null)
          done()
        })
      })

      it('Should throw error on when commonresources missing in integration in staticMapFunctionFactory with updateSavedSearch locationForMultipleSearch', function (done) {
        var integration = JSON.parse(fs.readFileSync('./test/data/settings/test.data.integrations.staticMap.json', 'utf8'))
        delete integration.settings.commonresources
        paramObject.options.integrationRecord = integration
        var staticMapConfig = { updateSavedSearch: true, updateFiltersType: 'locationForMultipleSearch' }
        delete paramObject.nsConnectionId
        setting.staticMapFunctionFactory(staticMapConfig)(paramObject, function (err) {
          assert(err, null)
          done()
        })
      })
    })
  })
})
