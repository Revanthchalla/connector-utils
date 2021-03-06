/**
For now this file needs to be kept immediate in test folder as per mocha.opts rule
This file will be executed first after that other folders will be executed recursively
Reason: Since this file uses sinon, and other folders uses nock module. Some thread is
blocking to exeucte other tests.
Solution: in future all tests under this file need to be re-written using nock module // TODO
**/


'use strict'
var sinon = require('sinon')
  , logger = require('winston')
  , assert = require('assert')
  , mockery = require('mockery')
  , lodash = require('lodash');



var HERCULES_BASE_URL = 'https://api.integrator.io';
//set enviornment as production
process.env.NODE_ENV = 'production';
//create a stub
mockery.enable({
  warnOnReplace: false
  , warnOnUnregistered: false
  , useCleanCache: true
});

var stub = sinon.stub();

mockery.registerMock('request', stub);


var utils = require('../installer/installerHelper.js')

var createStubResponses = function(stub, allResponses) {
  lodash.each(allResponses, function(responsefile) {
    //default opts
    var response = require('./data/' + responsefile)
    var opts = {
      uri: HERCULES_BASE_URL + '/v1/' + response.resourcetype
      , method: 'GET'
      , headers: {
        Authorization: 'Bearer TestToken'
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : undefined
    };
    if (!!response.id) {
      opts.uri = opts.uri + '/' + response.id;
      if (!!response.data) {
        opts.method = 'PUT';
        opts.json = response.data;
      }
    } else if (!!response.data) {
      opts.method = 'POST';
      opts.json = response.data;
    }
    logger.info(JSON.stringify(opts) + ' resgistered!');
    //register responseBody with the request
    if (!response.statusCode) {
      response.statusCode = 200
    }

    if(!!response.setError){
      if(!!response.failStatusCode){
        stub.withArgs(opts).yields(null, {
          statusCode: 500
        }, response.responseBody);
      }
      else{
        stub.withArgs(opts).yields(true, {
          statusCode: 200
        }, response.responseBody);
      }
    }
    else{
      stub.withArgs(opts).yields(null, {
        statusCode: response.statusCode
      }, response.responseBody);
    }
  });
};
var createStubResponsesForApiIdentifiers = function(stub, allResponses) {
  lodash.each(allResponses, function(responsefile) {
    //default opts
    var response = require('./data/' + responsefile)
    logger.info(response)
    var opts = {
      uri: HERCULES_BASE_URL + '/' + response.apiIdentifier
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer TestToken'
        , 'Content-Type': 'application/json'
      }
      , json: true
    };
    if (!!response.data) {
      opts.json = response.data;
    }
    logger.info(JSON.stringify(opts) + ' resgistered!');
    //register responseBody with the request
    if (response.data && response.responseBody === 'data') {
      response.responseBody = response.data
    }

    if(!!response.setError){
      if(!!response.failStatusCode){
        stub.withArgs(opts).yields(null, {
          statusCode: 500
        }, response.responseBody);
      }
      else{
        stub.withArgs(opts).yields("error while connecting io", {
          statusCode: 200
        }, response.responseBody);
      }
    }
    else{
      stub.withArgs(opts).yields(null, {
        statusCode: 200
      }, response.responseBody);
    }

  });
};
var createStubResponsesForProxyCall = function(stub, allResponses) {
  lodash.each(allResponses, function(responsefile) {
    var response = require('./data/' + responsefile)

    var opts = {
      uri: HERCULES_BASE_URL + '/v1/connections/' + response.data.proxyData.connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer TestToken'
        , 'Content-Type': 'application/json'
        , 'Integrator-Netsuite-ScriptId' : response.data.proxyData.scriptId || null
        , 'Integrator-Netsuite-DeployId' : response.data.proxyData.deployId || null
        , 'Integrator-Method' : response.data.proxyData.method || null
      }
      , json: true
      , retry : undefined
    };

    if(!response.data.proxyData.deployId && !response.data.proxyData.scriptId)
      opts.headers['Integrator-Relative-URI'] = response.data.proxyData.relativeURI
    if (!!response.data.proxyData.requestBody) {
      opts.json = { requests : response.data.proxyData.requestBody }
    }
    logger.info(JSON.stringify(opts) + ' resgistered!');
    stub.withArgs(opts).yields(null, {
      statusCode: 200
    }, response.responseBody);
  });
};

var initializeData = function(records, data) {

  var temprecord;
  for (temprecord in records) {
    records[temprecord].isLoaded = true
    records[temprecord].info = require(records[temprecord].filelocation)
    records[temprecord].info.bearerToken = 'TestToken';
  }
  data.bearerToken = 'TestToken';
  data._integrationId = '551c7be9accca83b3e00000c';
}
var sandbox;
describe('VerifyDependency Function', function() {

  beforeEach(function(done) {
    sandbox = sinon.sandbox.create();
    done()
  });
  afterEach(function(done) {
    sandbox.restore();
    done()
  });

  it('Should return success if there is no dependson property in records', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-noDependson.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(success['connection-netsuite'].resolved, true, 'should return resolved as true')
      done();
    })
  })

  it('Should return success for Proxy call for multiple records', function (done) {
    var stubstoload = [
      'proxy/utils-mock-netsuite-proxy.json',
      'proxy/utils-mock-netsuite-proxy-2.json'
    ]
    createStubResponsesForProxyCall(stub, stubstoload)
    var records = require('./data/proxy/utils-proxyMeta.json');
    var data = {}
    initializeData(records, data)

    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(success['savedsearch-netsuite'].resolved, true, 'should return resolved as true')
      assert.equal(success['savedsearch-netsuite-2'].resolved, true, 'should return resolved as true')
      done();
    })
  })

  it('Should return success if there is dependson property in records', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-export-fulfillment.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-withDependson.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(success['connection-netsuite'].resolved, true, 'should return resolved as true')
      assert.equal(!!success['export-fulfillment'].info.data._connectionId, true,
        'Should set tempWriteto = data if there is no writetopath')
      done();
    })
  })

  it('Should return false if resolved is false', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-export-fulfillment.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-withUnresolvedDependson.json');

    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      assert(success['connection-netsuite'].resolved, true, 'should return resolved as true')
      done();
    })
  })

  it('Should put jsonpath as [], if jsonpath is not available', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-export-fulfillment-withoutJsonpath.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-withoutJsonpath.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(!!success['export-fulfillment'].info.jsonpath, true, 'should set jsonpath as []')
      done();
    })
  })

  it('Should replace object with incoming data if readfrom and writeto both are $', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite-readWrite$.json',
      'verifyDependency/utils-mock-export-fulfillment-readWrite$.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-readWrite$.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(success['export-fulfillment'].info.data, success['connection-netsuite'].info.responseBody,
       'export-fulfillment Data should be equal to connection-netsuite responseBody')
      done();
    })
  })

  it('Should use value directly if there is no record', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-export-fulfillment-noRecordField.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-noRecordField.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }

      assert.equal(success['export-fulfillment'].info.data._connectionId, '_id',
        'should return _id')
      done();
    })
  })
  it('Should use value directly if there is no record and readFrom is object', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-export-fulfillment-noRecordReadFromObject.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-noRecordReadFromObject.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      var tmpObj = {
        "Code": "_id"
      }
      assert.deepEqual(success['export-fulfillment'].info.data._connectionId, tmpObj,
        'should return _id')
      done();
    })
  })
  it('Should push null if unable to find the readFrom value', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-withoutIdResponse.json',
      'verifyDependency/utils-mock-exportData-nullConnection.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-noReadFrom.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(success['export-fulfillment'].info.data._connectionId, null,
        'should return _connectionId as null')
      done();
    })
  })

  it('Should throw an error if unable to find jsonpath for writetopath key', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-noWriteToPath.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      var compareData = require('./data/verifyDependency/utils-exportData-noWriteToPath.json')
      assert.equal(error.message, 'Unable to find jsonpath writeHere in ' + JSON.stringify(compareData.data),
        'Should return error as unable to find jsonpath')
      done();
    })
  })

  it('Should push tempvalue if writeto property is an array', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-exportData-writetoArray.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-writetoArray.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(success['export-fulfillment'].info.data._connectionId[0], '1234567',
        'Should return first index value of the array')
      done();
    })
  })

  it('Should add value in writtopath if writetopath exits', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-mock-exportData-withWriteToPath.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-withWriteToPath.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.equal(!!success['export-fulfillment'].info.data.writeHere._connectionId, true,
        'Should add a new field to writeHere Object')
      done();
    })
  })

  it('Should convert tempvalue as string if its not string', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-exportData-readFromObject.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordsMeta-readFromObject.json');
    var data = {}
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(!!success['export-fulfillment'].info.data.writeHere._connectionId, true,
       'export-fulfillment Data should be equal to connection-netsuite responseBody')
      done();
    })
  })
  it('Should inlude node for premiun edition only', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-exportData-readFromObject.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordMeta-edition.json');
    var data = {}
    data.connectorEdition = "premium"
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(!!success['export-fulfillment'] && !success['connection-netsuite'], true,
       'should include premium nodes')
      done();
    })
  })
  it('Should include only preium node in upgradeMode', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-exportData-readFromObject.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordMeta-edition.json');
    var data = {}
    data.upgradeMode = true
    data.currentEdition = "standard"
    data.upgradeEdition = "premium"
    initializeData(records, data)
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(!!success['export-fulfillment'] && !success['connection-netsuite'], true,
       'should include premium nodes only')
      done();
    })
  })
  it('Should handle bar by calling evalHandleBar method', function(done){
    var stubstoload = [
      'verifyDependency/utils-mock-connection-netsuite.json',
      'verifyDependency/utils-exportData-readFromObject_withHandleBar.json'
    ]
    createStubResponses(stub, stubstoload)
    var records = require('./data/verifyDependency/utils-recordMeta-barHandler.json');
    var data = {}
    , state = {
      resolved : true
      , isLoaded : true
    }
    initializeData(records, data)
    records.state = state
    records.state.info = {}
    records.state.info.response = {
      storeIdentifyAttr : "test"
      , storeIdentifyValue : true
    }
    utils.createRecordsInOrderHelper(records, data, function(error, success){
      if(error){
        logger.debug('Test failed : ' + JSON.stringify(error));
      }
      assert.deepEqual(!!success['export-fulfillment'].info.data.writeHere[0]._connectionId, true,
       'bar handler should be performed correctly')
      done();
    })
  })
})
