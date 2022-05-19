'use strict'

//set enviornment as production
process.env.NODE_ENV = 'production'
  
var assert = require('assert')
  , installerHelper = require('../../installer/installerHelper')
  , nock = require('nock')
  , fs = require('fs')
  , CONSTS = require('../../constants')
  , HERCULES_BASE_URL = 'https://api.integrator.io'

describe('Installer Helper Tests: ', function() {
  describe('Testing cyclic function of installer', function() {
    it('should pass if graph is cyclic', function(done) {
      var graph = JSON.parse(fs.readFileSync('./test/data/installer/test.data.cyclicRecord.json','utf8'))
      var isCyclic = installerHelper.isCyclic(graph)
      assert(true, isCyclic)
      return done()
    })
    it('should pass if graph is acyclic', function(done) {
      var graph = JSON.parse(fs.readFileSync('./test/data/installer/test.data.acyclicRecord.json','utf8'))
      var isCyclic = installerHelper.isCyclic(graph)
      assert(true, isCyclic)
      return done()
    })
  })
  describe('installerHelper.js integratorRestClient function unit test cases', function () {

    afterEach(function (done) {
      nock.cleanAll()
      done()
    })

    it('should throw no auth token error', function (done) {
      installerHelper.integratorRestClient({
        bearerToken: "",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No Auth Token is given!')
          done()
        }
      })
    })
    it('should throw no resourceType error', function (done) {
      installerHelper.integratorRestClient({
        bearerToken: 'TestToken',
        resourcetype: ''
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No resourcetype is given!')
          done()
        }
      })
    })
    it('should use GET if no id and data is provided', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(200, "GET http method has been used.");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        assert.equal(body, "GET http method has been used.")
        done()
      })
    })
    it('should use GET if externalIds provided and data is provided', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/exports?externalId=id1&externalId=id2")
        .reply(200, "GET http method has been used.");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'exports',
        externalIds: ['id1', 'id2']
      }, function (err, response, body) {
        assert.equal(body, "GET http method has been used.")
        done()
      })
    })
    it('should use POST if no id and but data is provided', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .post("/v1/integrations")
        .reply(200, "POST http method has been used.");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        data: "sample Data"
      }, function (err, response, body) {
        assert.equal(body, "POST http method has been used.")
        done()
      })
    })
    it('should use PUT if id(externally) but no data is provided', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .put("/v1/integrations/integrationId")
        .reply(200, "PUT http method has been used.");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        id: "integrationId",
        data: {}
      }, function (err, response, body) {
        assert.equal(body, "PUT http method has been used.")
        done()
      })
    })
    it('should use PUT if id(internally) but no data is provided', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .put("/v1/integrations/integrationId")
        .reply(200, "PUT http method has been used.");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        data: {
          "data": "dummy data",
          "_id": "integrationId"
        }
      }, function (err, response, body) {
        assert.equal(body, "PUT http method has been used.")
        done()
      })
    })

    it('should delete if delete method provided.', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .delete("/v1/integrations/integrationId")
        .reply(200);
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        id: "integrationId",
        method: "DELETE"
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
    })
    it('distributed should be added to url , with http method GET ', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations/integrationId/distributed")
        .reply(200, "distributed has been added to url");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        id: "integrationId",
        distributed: true
      }, function (err, response, body) {
        assert.equal(body, "distributed has been added to url")
        done()
      })
    })
    it('distributed should be added to url , with http method PUT, with id provided externally', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .put("/v1/integrations/integrationId1/distributed")
        .reply(200, "distributed has been added to url");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        id: "integrationId1",
        distributed: true,
        data: "sample data"
      }, function (err, response, body) {
        assert.equal(body, "distributed has been added to url")
        done()
      })
    })
    it('distributed should be added to url , with http method PUT, with id provided internally', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .put("/v1/integrations/integrationId2/distributed")
        .reply(200, "distributed has been added to url");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        distributed: true,
        data: {
          "data": "sample data",
          "_id": "integrationId2"
        }
      }, function (err, response, body) {
        assert.equal(body, "distributed has been added to url")
        done()
      })
    })
    it('distributed should be added to url , with http method POST, with no id', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .post("/v1/integrations/distributed")
        .reply(200, "distributed has been added to url");
      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations',
        distributed: true,
        data: {
          "data": "sample data"
        }
      }, function (err, response, body) {
        assert.equal(body, "distributed has been added to url")
        done()
      })
    })
    it('should return incorrect response error!', function (done) {

      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(401, "Hello World");

      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err.message, 'Unable to verify response, Status Code: 401')
          done()
        }
      })
    })
    it('should not return incorrect response error!', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(201, "Hello World");

      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          if (err.message !== 'Unable to verify response')
            done()
        }
        else {
          done()
        }
      })
    })
    it('should return error message inside body', function (done) {

      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(401, {
          errors: {
            message: "This is an error!"
          }
        });

      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err.message, 'This is an error!, Status Code: 401')
          done()
        }
      })
    })
    it('should return error message inside error array in body', function (done) {

      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(401, {
          errors: [{
            message: "This is an error!"
          }]
        });

      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err.message, 'This is an error!, Status Code: 401')
          done()
        }
      })
    })
    it('should return error message inside nested error array in body', function (done) {

      var api = nock(CONSTS.HERCULES_BASE_URL)
        .get("/v1/integrations")
        .reply(401, {
          errors: [{
            errors: [{
              message: "This is an error!"
            }]
          }]
        });

      installerHelper.integratorRestClient({
        bearerToken: "bearerToken",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err.message, 'This is an error!, Status Code: 401')
          done()
        }
      })
    })
  })
  describe('integratorApiIdentifierClient function unit test cases!', function () {
    beforeEach(function () {})
    afterEach(function () {})
    it('should throw no auth token error', function (done) {
      installerHelper.integratorApiIdentifierClient({
        bearerToken: "",
        apiIdentifier: 'apiIdentifier'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No Auth Token was provided!')
          done()
        }
      })
    })
    it('should throw no apiIdentifier error', function (done) {
      installerHelper.integratorApiIdentifierClient({
        bearerToken: "bearerToken",
        apiIdentifier: ""
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No apiIdentifier was provided!')
          done()
        }
      })
    })
    it('should return incorrect response error.', function (done) {
      var api = nock(CONSTS.HERCULES_BASE_URL)
        .post("/apiIdentifier")
        .reply(401, "POST http method has been used.");
      installerHelper.integratorApiIdentifierClient({
        bearerToken: "bearerToken",
        apiIdentifier: 'apiIdentifier',
        data: {
          "field1": "value1"
        }
      }, function (err, response, body) {
        assert.equal(err.message, 'Unable to verify response, Status Code: 401', 'Incorrect response from server was the expected result, but that does seem like case here')
        done()
      })
    })
  })
  describe('installerHelper.js integratorProxyCall function unit test cases', function () {
    it('should run succesfully.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/1234/proxy')
        .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      installerHelper.integratorProxyCall({
        'bearerToken': "bearerToken",
        'connectionId': 1234,
        'scriptId': 'scriptId',
        'deployId': 'deployId',
        'method': 'GET',
        'data': {'test': 'test'}
      }, function (err, response, body) {
          assert.equal(err, null)
          done()
      })
    })

    it('should throw error.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/1234/proxy')
        .reply(401, {'errors': 'error found'})
      installerHelper.integratorProxyCall({
        'bearerToken': "bearerToken",
        'connectionId': 1234,
        'scriptId': 'scriptId',
        'deployId': 'deployId',
        'method': 'GET',
        'data': {'test': 'test'}
      }, function (err, response, body) {
          assert.deepEqual(err, { statusCode: 401, message: 'error found, Status Code: 401' })
          done()
      })
    })

    it('should throw error in object.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/1234/proxy')
        .reply(401, {'errors': {'msg': 'error found'}})
      installerHelper.integratorProxyCall({
        'bearerToken': "bearerToken",
        'connectionId': 1234,
        'scriptId': 'scriptId',
        'deployId': 'deployId',
        'method': 'GET',
        'data': {'test': 'test'}
      }, function (err, response, body) {
          assert.deepEqual(err, { statusCode: 401,
  message: 'Errors : {"msg":"error found"}, Status Code: 401' })
          done()
      })
    })

    it('should throw no auth token error', function (done) {
      installerHelper.integratorProxyCall({
        'bearerToken': "",
        'connectionId': 1234,
        'method': 'GET',
        'relativeURI': '/admin/orders/' + 234 + '/transactions'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No Auth Token is given!')
          done()
        }
      })
    })

    it('should throw no connection id error', function (done) {
      installerHelper.integratorProxyCall({
        'bearerToken': "bearerToken",
        'method': 'GET',
        'relativeURI': '/admin/orders/' + 234 + '/transactions'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'connection id is not given')
          done()
        }
      })
    })
    it('should throw Proxy request headers are not in correct format error', function (done) {
      installerHelper.integratorProxyCall({
        'bearerToken': "testToken",
        'connectionId': "1234",
        'method': 'GET',
        'relativeURI': ''
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'Proxy request headers are not in correct format')
          done()
        }
      })
    })
  })

  describe('Test network retry logic - integratorProxyCall ', function(){
    afterEach(function(done) {
      nock.cleanAll()
      done()
    })

    it('should success after 2 retry', function(done){
      nock(CONSTS.HERCULES_BASE_URL)
        .post('/v1/connections/testConnectionId/proxy').twice()
        .reply(429,{},{
            'retry-after': '3'
        })
        .post('/v1/connections/testConnectionId/proxy')
        .reply(200,{
          message : 'success'
        })
        var options = {
          bearerToken : 'testToken'
          , connectionId : 'testConnectionId'
          , relativeURI : 'testRelativeURI'
          , method : 'GET'
          , data : { a : 'dummyData'}
          , retry : true

        }
      installerHelper.integratorProxyCall(options, function(err, res, body){
        assert.equal(body.message , 'success')
        done()
      })
    })

    it('should not retry as retry is false', function(done){
      nock(CONSTS.HERCULES_BASE_URL)
        .post('/v1/connections/testConnectionId/proxy').twice()
        .reply(429,{},{
            'retry-after': '3'
        })
        .post('/v1/connections/testConnectionId/proxy')
        .reply(200,{
          message : 'success'
        })
        var options = {
          bearerToken : 'testToken'
          , connectionId : 'testConnectionId'
          , relativeURI : 'testRelativeURI'
          , method : 'GET'
          , data : { a : 'dummyData'}
          , retry : false

        }
      installerHelper.integratorProxyCall(options, function(err, res, body){
        assert.equal(err.message , 'Unable to verify response, Status Code: 429')
        done()
      })
    })

    it('should throw error when retry method not available', function(done){
        var options = {
          retryLeft : 0
          , retryCount : 8
        }
      installerHelper.retryNetworkCall(options, function(err, res, body){
        assert.equal(err.message , 'Oops!! something went wrong. Please try later.')
        done()
      })
    })

    it('should retry even without retry param', function(done){
      nock(CONSTS.HERCULES_BASE_URL)
        .post('/v1/connections/testConnectionId/proxy').twice()
        .reply(429,{},{
            'retry-after': '3'
        })
        .post('/v1/connections/testConnectionId/proxy')
        .reply(200,{
          message : 'success'
        })
        var options = {
          bearerToken : 'testToken'
          , connectionId : 'testConnectionId'
          , relativeURI : 'testRelativeURI'
          , method : 'GET'
          , data : { a : 'dummyData'}
        }
      installerHelper.integratorProxyCall(options, function(err, res, body){
        assert.equal(body.message , 'success')
        done()
      })
    })

    it('should fail after default maximum number of retry', function(done){
      this.timeout(30000)
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .post('/v1/connections/testConnectionId/proxy')
        .reply(429,{},{
            'retry-after': '3'
        })

        var options = {
          bearerToken : 'testToken'
          , connectionId : 'testConnectionId'
          , relativeURI : 'testRelativeURI'
          , method : 'GET'
          , data : { a : 'dummyData'}
          , retry : true

        }
      installerHelper.integratorProxyCall(options, function(err, res, body){
        assert.equal(err.message, 'Unable to verify response, Status Code: 429')
        done()
      })
    })

    it('test isStatusCodeRetryAble : should return true', function(done){
      var isRetryAble = installerHelper.isStatusCodeRetryAble({
        statusCode : 429
      })
      assert.equal(isRetryAble, true)
      done()
    })

    it('test isStatusCodeRetryAble : should return false', function(done){
      var isRetryAble = installerHelper.isStatusCodeRetryAble({
        statusCode : 400
      })
      assert.equal(isRetryAble, false )
      done()
    })

    it('test isStatusCodeRetryAble : should return true for "Request Limit Exceeded" message', function(done){
      var isRetryAble = installerHelper.isStatusCodeRetryAble({
        statusCode : 400,
        body : {"errors":[{"message":"Request Limit Exceeded!"}]}
      })
      assert.equal(isRetryAble, true )
      done()
    })

    it('test isStatusCodeRetryAble : should return true for "sss_request_limit_exceeded" code', function(done){
      var isRetryAble = installerHelper.isStatusCodeRetryAble({
        statusCode : 422,
        body : {"errors":[{"message":"UN_IMPORTANT!"}, {"statusCode":"SSS_Request_Limit_Exceeded!", "statusMessage": "Request Limit Exceeded"}]}
      })
      assert.equal(isRetryAble, true )
      done()
    })

    it('test isStatusCodeRetryAble : should return false for different error code', function(done){
      var isRetryAble = installerHelper.isStatusCodeRetryAble({
        statusCode : 422,
        body : {"errors":[{"message":"Request can not be processed."}]}
      })
      assert.equal(isRetryAble, false )
      done()
    })

    it('test getRetryTimeInSec : should return time from header', function(done){
      var opts = {
        headerValue : 5
        , retryCount : 3
      }
      , time = installerHelper.getRetryTimeInSec(opts)
      assert.equal(time, opts.headerValue )
      done()
    })
    it('test getRetryTimeInSec : should calculate time', function(done){
      var opts = {
        headerValue : 5000
        , retryCount : 3
      }
      , time = installerHelper.getRetryTimeInSec(opts)
      assert.equal(time, Math.pow(2,opts.retryCount) )
      done()
    })

    it('test getRetryTimeInSec : should calculate time : headerValue is NaN', function(done){
      var opts = {
        headerValue : 'not a number'
        , retryCount : 5
      }
      , time = installerHelper.getRetryTimeInSec(opts)
      assert.equal(time, Math.pow(2,opts.retryCount) )
      done()
    })

    it('test getRetryTimeInSec : should calculate time : headerValue is undefined', function(done){
      var opts = {
        retryCount : 6
      }
      , time = installerHelper.getRetryTimeInSec(opts)
      assert.equal(time, Math.pow(2,opts.retryCount) )
      done()
    })
  })
  describe('Testing - verifyAndInjectDependency ', function(){
    afterEach(function(done) {
      nock.cleanAll()
      done()
    })

    it('should update recordArray with resolved dependency', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      installerHelper.verifyAndInjectDependency(recordArray, 'bigcommerce-save-integration')
      assert.deepEqual(updatedRecordArray, recordArray)
      done()
    })

    it('should throw error recordArray with resolved dependency with export-item', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      delete recordArray['bigcommerceintegration-load'].info.response
      try{
        installerHelper.verifyAndInjectDependency(recordArray, 'bigcommerce-save-integration')
      } catch(e) {
        assert.equal(e.message, 'Unable to find jsonpath [object Object]')
        done()
      }      
    })

    it('should throw error recordArray with resolved dependency with nsConnectorUtil-copy-fulfillmentExport-savedsearch', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      recordArray['nsConnectorUtil-copy-fulfillmentExport-savedsearch'].info.jsonpath = [{
				"readfrom": "Celigo BigCommerce Fulfillment Export Search",
				"writetopath": "$.proxyData.requestBody[0].configs",
				"writeto": "title"
			}]
      try{
        installerHelper.verifyAndInjectDependency(recordArray, 'nsConnectorUtil-copy-fulfillmentExport-savedsearch')
      } catch(e) {
        assert.equal(e.message, 'Unable to find jsonpath $.proxyData.requestBody[0].configs in {"proxyData":{"requestBody":[{"type":"savedsearch","operation":"copy","config":{"title":"Celigo BigCommerce Fulfillment Export Search","copyFromSearchId":"customsearch_celigo_bigc_fulfill_export","replaceFilters":false,"filters":[["custbody_celigo_etail_channel.name","is","BigCommerce"],"AND",["custbody_celigo_bgc_store_id","is"]]}}],"method":"POST","connectionId":"connectionId"}}')
        done()
      }      
    })

    it('should update recordArray with resolved dependency on not array readfrom', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      recordArray['bigcommerce-save-integration'].dependencyVerified = true
      updatedRecordArray['bigcommerce-save-integration'].dependencyVerified = true
      updatedRecordArray['nsConnectorUtil-copy-fulfillmentExport-savedsearch'].info.data.proxyData.requestBody[0].filter = {"test": "test"}
      updatedRecordArray['nsConnectorUtil-copy-fulfillmentExport-savedsearch'].info.jsonpath = [
          {
			  	"readfrom": [
					  {
						  "readfrom": "Celigo BigCommerce Fulfillment Export Search"
					  }
				  ],
				"writetopath": "$.proxyData.requestBody[0].config",
				"writeto": "title"
			},{
				"readfrom": [
					  {
						  "readfrom": {"test": "test"}
					  }
				  ],
				"writetopath": "$.proxyData.requestBody[0]",
				"writeto": "filter"
			},{
            "record": "magentointegration-load",
            "readfrom": [
              {
                "readfrom": "$.settings.commonresources.netsuiteConnectionId",
                "record": "magentointegration-load"
              }
            ],
            "writetopath": "$.proxyData",
            "writeto": "connectionId"
          }
        ]
      updatedRecordArray['nsConnectorUtil-copy-fulfillmentExport-savedsearch'].dependencyVerified = true
      installerHelper.verifyAndInjectDependency(recordArray, 'nsConnectorUtil-copy-fulfillmentExport-savedsearch')
      assert.deepEqual(updatedRecordArray, recordArray)
      done()
    })

    it('should update recordArray with resolved dependency with no jsonpath', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      delete recordArray['bigcommerce-save-integration'].info.jsonpath
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      updatedRecordArray['bigcommerce-save-integration'].info.jsonpath = []
      installerHelper.verifyAndInjectDependency(recordArray, 'bigcommerce-save-integration')
      assert.deepEqual(updatedRecordArray, recordArray)
      done()
    })

    it('should update recordArray with resolved dependency with resolved and dependancy false', function(done){
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var updatedRecordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.updatedRecordArray.json','utf8'))
      recordArray['bigcommerceintegration-load'].dependencyVerified = false
      recordArray['export-item'].dependencyVerified = false
      recordArray['bigcommerce-save-integration'].dependencyVerified = true
      updatedRecordArray['export-item'].dependencyVerified = false
      updatedRecordArray['bigcommerceintegration-load'].dependencyVerified = false
      updatedRecordArray['bigcommerce-save-integration'].dependencyVerified = true
      installerHelper.verifyAndInjectDependency(recordArray, 'export-item')
      assert.deepEqual(updatedRecordArray, recordArray)
      done()
    })
  })

  describe('installerHelper.js integratorStateClient function unit test cases', function () {
    it('should run succesfully with GET.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .get('/v1/integrations/state/serializeState')
        .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
      installerHelper.integratorStateClient({
        'bearerToken': "bearerToken",
        'resourcetype': 'integrations/state/serializeState',
        'method': 'GET'
      }, function (err, response, body) {
          assert.equal(err, null)
          done()
      })
    })

    it('should run succesfully with PUT.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .put('/v1/integrations/state/serializeState')
        .reply(200)
      installerHelper.integratorStateClient({
        'bearerToken': "bearerToken",
        'resourcetype': 'integrations/state/serializeState',
        'method': 'PUT',
        'data': { statusCode: 200, results: [{ id: 'a', text: 'b' }] }
      }, function (err, response, body) {
          assert.equal(err, null)
          done()
      })
    })

    it('should throw when unable to GET data', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .get('/v1/integrations/state/serializeState')
        .replyWithError('error occured')
      installerHelper.integratorStateClient({
        'bearerToken': "bearerToken",
        'resourcetype': 'integrations/state/serializeState',
        'method': 'GET'
      }, function (err, response, body) {
          assert.equal(err.message, 'error occured')
          done()
      })
    })

    it('should throw no auth token error', function (done) {
      installerHelper.integratorStateClient({
        bearerToken: "",
        resourcetype: 'integrations'
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No Auth Token is given!')
          done()
        }
      })
    })

    it('should throw no resourcetype error', function (done) {
      installerHelper.integratorStateClient({
        resourcetype: ''
      }, function (err, response, body) {
        if (err) {
          assert.equal(err, 'No resourcetype is given!')
          done()
        }
      })
    })
  })

  describe('installerHelper.js saveState function unit test cases', function () {
    it('should run succesfully with PUT.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .put('/v1/integrations/integrationId/state/serializedState')
        .reply(200)
      var serializeState = {
        "installerFunction": {
          "connection-netsuite": { "test": "test" }
        }
      }
      var recordArray = {
        "connection-magento": { "test": "test" }
      }
      installerHelper.saveState(
        recordArray,
        serializeState,
        'connection-magento',
        {
          'bearerToken': "bearerToken",
          '_integrationId': 'integrationId'
        }, function (err, response, body) {
          assert.equal(err, null)
          done()
        })
    })

    it('should run succesfully if any error in serializedState with PUT.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .put('/v1/integrations/integrationId/state/serializedState')
        .reply(200)
      var serializeState = {
        "installerFunction": {
          "connection-netsuite": { "test": "test" }
        },
        "errors": [{"error": "test"}]
      }
      var recordArray = {
        "connection-magento": { "test": "test" }
      }
      installerHelper.saveState(
        recordArray,
        serializeState,
        'connection-magento',
        {
          'bearerToken': "bearerToken",
          '_integrationId': 'integrationId'
        }, function (err, response, body) {
          assert.equal(err, null)
          done()
        })
    })

    it('should throw error while updating state.', function (done) {
      nock.cleanAll()
      nock(CONSTS.HERCULES_BASE_URL)
        .persist()
        .put('/v1/integrations/integrationId/state/serializedState')
        .replyWithError('error occured')
      var serializeState = {
        "installerFunction": {
          "connection-netsuite": { "test": "test" }
        },
        "errors": [{"error": "test"}]
      }
      var recordArray = {
        "connection-magento": { "test": "test" }
      }
      installerHelper.saveState(
        recordArray,
        serializeState,
        'connection-magento',
        {
          'bearerToken': "bearerToken",
          '_integrationId': 'integrationId'
        }, function (err, response, body) {
          assert.equal(err.message, 'error occured')
          done()
        })
    })
  })

  describe('Testing - loadJSON ', function(){
    afterEach(function(done) {
      nock.cleanAll()
      done()
    })

    it('should throw error on load file', function(done){
      var recordArrayFile = '../../test/data/installer/test.data.recordArray.json'
      try{
        var fileData = installerHelper.loadJSON(recordArrayFile)
      } catch(e){
        assert.equal(e.code, `MODULE_NOT_FOUND`)        
        done()
      }      
    })
  })

  describe('evalHandleBar function of installer', function() {
    it('should pass function', function(done) {
      var str = '{{{pathHelper \'state.connectorConstants.STORE_IDENTIFY_STORE_MAP_ATTR\'}}}'
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      var data = installerHelper.evalHandleBar(str, recordArray)
      return done()
    })

    it('should throw error when bar value is null', function(done) {
      var str = '{{{pathHelper \'state.connectorConstants.STORE_IDENTIFY_STORE_MAP_ATTR\'}}}'
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      recordArray.state.info.response.connectorConstants.STORE_IDENTIFY_STORE_MAP_ATTR = ''
      try{
        var data = installerHelper.evalHandleBar(str, recordArray)
      } catch(e){
        assert.equal(e.message, 'Cannot find the bar value for the path: state.connectorConstants.STORE_IDENTIFY_STORE_MAP_ATTR')
        done()
      }
    })

    it('should throw error when bar path is null', function(done) {
      var str = '{{{pathHelper \'state\'}}}'
      var recordArray = JSON.parse(fs.readFileSync('./test/data/installer/test.data.recordArray.json','utf8'))
      recordArray.state.info.response = null
      try{
        var data = installerHelper.evalHandleBar(str, recordArray)
      } catch(e){
        assert.equal(e.message, 'bar path is not in required format: state')
        done()
      }
    })
  })

  describe('validateIntegrationVersion function of installer', function() {
    it('should run succesfully.', function (done) {
      installerHelper.validateIntegrationVersion({
        'updateCodeRepo': "../test/data/updateCodeRepo",
        'integration': {
          _id: '123',
          name: 'M2',
          _connectorId: '234',
          version: '1.10.0'
        },
        'type': 'add new account'
      }, function (err, response, body) {
          assert.equal(err, null)
          done()
      })
    })

    it('should fail when integration old.', function (done) {
      installerHelper.validateIntegrationVersion({
        'updateCodeRepo': "../test/data/updateCodeRepo",
        'integration': {
          _id: '123',
          name: 'M2',
          _connectorId: '234',
          version: '1.9.0'
        },
        'type': 'add new store'
      }, function (err, response, body) {
          assert.equal(err.message, 'Unable to add new store. You are currently using an older version of M2 for your integrations. Please contact Celigo Support.')
          done()
      })
    })

    it('should fail while reading folder.', function (done) {
      installerHelper.validateIntegrationVersion({
        'updateCodeRepo': "../test/data/updateCodeRep",
        'integration': {
          _id: '123',
          name: 'M2',
          _connectorId: '234',
          version: '1.10.0'
        },
        'type': 'add new store'
      }, function (err, response, body) {
          assert.equal(err.message.indexOf('no such file or directory') > -1, true)
          done()
      })
    })
  })
  describe('validateConnectorEdition function of installer', function () {
    it('should return expected Error', function (done) {
      installerHelper.validateConnectorEdition({
        'licenseEdition': "enterprise",
        'integration': {
          _id: '123',
          name: 'M2',
          _connectorId: '234',
          version: '1.10.0',
          settings: {
            connectorEdition: "premium"
          }
        }
      }, function (err, response, body) {
        var errMessage = 'Error: Unable to add new Store/Account. Please upgrade your integration using "Settings > Subscription > Upgrade".'
        assert.equal(err, errMessage, 'Error did not match')
        done()
      })
    })
    it('should run without any error', function (done) {
      installerHelper.validateConnectorEdition({
        'licenseEdition': "enterprise",
        'integration': {
          _id: '123',
          name: 'M2',
          _connectorId: '234',
          version: '1.10.0',
          settings: {
            connectorEdition: "enterprise"
          }
        }
      }, function (err, response, body) {
        assert.equal(err, null)
        done()
      })
    })
  })
})
