'use strict'

var assert = require('assert')
  , genericOperations = require('../../settings/genericOperations')
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

describe('genericOperations Tests ', function(){
  var predefinedOps
  before(function(done){
    predefinedOps = genericOperations
    nock.cleanAll()
    done()
  })
  describe('method | updateAdaptorsWithConnections', function(done){
    it('Should throw error if paramObject is invalid', function(done) {
      var paramObject = {}

      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
      assert.equal(err.message, 'Invalid paramObject.Please contact celigo support')
      done()
      })
    })

    it('Should return error if defaultConenctionValue is empty', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].default = null

      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
      assert.equal(err.message, 'Please select a value for default connection.')
      done()
      })
    })

    it('Should return if both validAdaptors, map is empty', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.staticMapConfig.validAdaptors = null
      paramObject.newSettings[paramObject.setting].map = null

      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
      assert.equal(err, null)
      done()
      })
    })

    it('Should throw error if extracts/generates is empty', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].map = {
        a : 'b'
      }
      paramObject.oldSettings[paramObject.setting].generates = []
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
      assert.equal(err.message, 'StaticMap is not configured properly. Please contact celigo support')
      done()
      })
    })

    it('Should throw error if map contains invalid values', function(done) {
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].map = {
        a : 'b'
      }

      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
      assert.equal(err.message, 'Invalid data. Please choose data from dropdown only')
      done()
      })
    })

    it("Should throw error if getAllAdaptors failed while fetching export adaptors", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .replyWithError('error occured while fetching exports in getAllAdaptors')
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Could not make network call. error occured while fetching exports in getAllAdaptors')
        done()
      })
    })

    it("Should throw error if getAllAdaptors for export adaptors contain invalid body", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, 'invalidbody')
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Unable to fetch export adaptors.Please contact celigo support')
        done()
      })
    })

    it("Should throw error if getAllAdaptors failed while fetching imports adaptors", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{_id: '123'},{'_id': '345'}])
        .get('/v1/imports')
        .replyWithError('error occured while fetching imports in getAllAdaptors')
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Could not make network call. error occured while fetching imports in getAllAdaptors')
        done()
      })
    })

    it("Should throw error if getAllAdaptors for import adaptors contain invalid body", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{_id: '123'},{'_id': '345'}])
        .get('/v1/imports')
        .reply(200, 'invalidbody')
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Unable to fetch import adaptors.Please contact celigo support')
        done()
      })
    })

    it("Should throw error if adaptorBodys is empty", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [])
        .get('/v1/imports')
        .reply(200, [])
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Unable to fetch adaptors data. Please contact celigo support')
        done()
      })
    })

    it("Should throw error if requestOptionsArray is empty", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{'_id': '123'}])
        .get('/v1/imports')
        .reply(200, [])
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'Unable to perform operation due to invalid data.Please contact celigo support')
        done()
      })
    })

    it("Should return if adaptor connection is same as mapped one", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].map = {
        '596e17a221a886220891d2c1' : '596e15cf21a886220891d2a9'
      }

      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{'_id': '596e17a221a886220891d2c1', 'name': 'abc', '_connectionId': '596e15cf21a886220891d2a9'}])
        .get('/v1/imports')
        .reply(200, [])
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should throw error if putAdaptor call failed", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].map = {
        '596e17a221a886220891d2c1' : '596e257e21a886220891d315'
      }

      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{'_id': '596e17a221a886220891d2c1', 'name': 'abc-export', '_connectionId': '596e15cf21a886220891d2a9'}])
        .get('/v1/imports')
        .reply(200, [])
        .put('/v1/exports/596e17a221a886220891d2c1')
        .replyWithError('putAdaptor call failed')
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err.message, 'putAdaptor call failed')
        done()
      })
    })

    it("Should save adaptors successfully", function(done){
      nock.cleanAll()
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateAdaptorsParamObject.json','utf8'))
      paramObject.newSettings[paramObject.setting].map = {
        '596e17a221a886220891d2c1' : '596e257e21a886220891d315'
      }
      paramObject.newSettings[paramObject.setting].default = '596e15cf21a886220891d2a9'

      nock(HERCULES_BASE_URL)
        .get('/v1/exports')
        .reply(200, [{'_id': '596e17a221a886220891d2c1', 'name': 'abc-export', '_connectionId': '596e15cf21a886220891d2a9'}])
        .get('/v1/imports')
        .reply(200, [{'_id': '596e17a221a886220891d2ca', 'name': 'demandware-inventory-import-adaptor', '_connectionId': '596e257e21a886220891d315'}])
        .put('/v1/exports/596e17a221a886220891d2c1')
        .reply(200)
        .put('/v1/imports/596e17a221a886220891d2ca')
        .reply(200)
      predefinedOps.updateAdaptorsWithConnections(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

  })

  describe('method | updateDistributedAdaptor', function(done){

    afterEach(function(done) {
     nock.cleanAll()
     done()
    })

    it("Should add lookup for distributed adaptors if not present", function(done){
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateDistributedAdaptor.json','utf8'))

      nock(HERCULES_BASE_URL)
        .get('/v1/imports/_importId')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId'})
        .get('/v1/imports/_importId/distributed')
        .reply(200, {'_id': '_importId',  "lookups": [], "mapping": { "fields": []}})
        .put('/v1/imports/_importId/distributed')
        .reply(200)
      predefinedOps.updateDistributedAdaptor(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should update lookup for distributed adaptors if not present", function(done){
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateDistributedAdaptor.json','utf8'))
      paramObject.newSettings.imports_importId_connectionMap = {
        "map": {
  				"596e17a221a886220891d2ca": "596e257e21a886220891d315",
          "abc": "xyz"
  			},
  			"default": "596e15cf21a886220891d2a9",
  			"allowFailures": true
  		}

      nock(HERCULES_BASE_URL)
        .get('/v1/imports/_importId')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId'})
        .get('/v1/imports/_importId/distributed')
        .reply(200, {'_id': '_importId',  "lookups": [{ "map": { "596e17a221a886220891d2ca": "596e257e21a886220891d315"}, "default": "596e15cf21a886220891d2a9", "allowFailures": true, "name": "shipmethodLookup"}], "mapping": { "fields": [{"generate": "shipmethod", "extract": "ShipmentServiceLevelCategory", "lookupName": "shipmethodLookup", "internalId": true}]}})
        .put('/v1/imports/_importId/distributed')
        .reply(200)
      predefinedOps.updateDistributedAdaptor(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should add lookup for new adaptors if not present", function(done){
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateDistributedAdaptor.json','utf8'))

      nock(HERCULES_BASE_URL)
        .get('/v1/imports/_importId')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId', "netsuite_da": {"lookups": [], "mapping": { "fields": []}}})
        .get('/v1/imports/_importId/distributed')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId', "netsuite_da": {"lookups": [], "mapping": { "fields": []}}})
        .put('/v1/imports/_importId')
        .reply(200)
      predefinedOps.updateDistributedAdaptor(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

    it("Should update lookup for new adaptors if not present", function(done){
      var paramObject = JSON.parse(fs.readFileSync('./test/data/settings/test.updateDistributedAdaptor.json','utf8'))
      paramObject.newSettings.imports_importId_connectionMap = {
        "map": {
  				"596e17a221a886220891d2ca": "596e257e21a886220891d315",
          "abc": "xyz"
  			},
  			"default": "596e15cf21a886220891d2a9",
  			"allowFailures": true
  		}

      nock(HERCULES_BASE_URL)
        .get('/v1/imports/_importId')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId', "netsuite_da": {"lookups": [], "mapping": { "fields": []}}})
        .get('/v1/imports/_importId/distributed')
        .reply(200, {'_id': '_importId', 'name': 'abc-import', '_connectionId': '_connectionId', "netsuite_da": {"lookups": [], "mapping": { "fields": []}}})
        .put('/v1/imports/_importId')
        .reply(200)
      predefinedOps.updateDistributedAdaptor(paramObject, function(err, res) {
        assert.equal(err, null)
        done()
      })
    })

  })
})
