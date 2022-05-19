'use strict'

var assert = require('assert')
  , RefreshNSMetaDataUtil = require('../../nsConnectorUtil/refreshNSMetaDataUtil')
  , nock = require('nock')
  , fs = require('fs')
  , CONSTS = require('../../constants')


describe('method | executeNsOperation', function () {
  var integration = require('../data/nsConnectorUtil/test.genericIntegration.json')
  it("Should call executeNsOperation function successfully", function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])

    var paramObject =
      {
        options: { bearerToken: 'bearerToken' }
        , nsConnectionId: 'nsConnectionId'
        , scriptId: 'customscript_generic_bundle_install'
      }
    RefreshNSMetaDataUtil.executeNsOperation(paramObject, function (err, res, body) {
      assert.equal(err, null)
      done()
    })
  })

  it("Should call executeNsOperation with statusCode mismatch error.", function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(200, [{ statusCode: 400 }])

    var paramObject =
      {
        options: { bearerToken: 'bearerToken' }
        , nsConnectionId: 'nsConnectionId'
        , scriptId: 'customscript_generic_bundle_install'
      }
    RefreshNSMetaDataUtil.executeNsOperation(paramObject, function (err, res, body) {
      assert.equal(err.message, 'Error while performing operation. Please contact Celigo Support. ')
      done()
    })
  })

  it("Should call executeNsOperation with error response.", function (done) {
    nock.cleanAll()
    nock(CONSTS.HERCULES_BASE_URL)
      .persist()
      .post('/v1/connections/nsConnectionId/proxy')
      .reply(400)

    var paramObject =
      {
        options: { bearerToken: 'bearerToken' }
        , nsConnectionId: 'nsConnectionId'
        , scriptId: 'customscript_generic_bundle_install'
      }
    RefreshNSMetaDataUtil.executeNsOperation(paramObject, function (err, res, body) {
      assert.equal(err.message, 'Error while performing operation. Please contact Celigo Support. ')
      done()
    })
  })
})