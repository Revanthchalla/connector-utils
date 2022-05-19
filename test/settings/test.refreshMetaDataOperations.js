'use strict'

var assert = require('assert')
    , RefreshNSMetaDataOperations = require('../../settings/refreshMetaDataOperations')
    , nock = require('nock')
    , fs = require('fs')
    , CONSTS = require('../../constants')


describe('method | refreshMetaDataOperations', function () {
    before(function (done) {
        nock.cleanAll()
        nock(CONSTS.HERCULES_BASE_URL)
            .persist()
            .post('/v1/connections/nsConnectionId/proxy')
            .reply(200, [{ statusCode: 200, results: [{ id: 'a', text: 'b' }] }])
        done()
    })

    after(function (done) {
        nock.cleanAll()
        done()
    })

    it("Should call listLocations function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listLocations(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should call listPriceLevels function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listPriceLevels(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should call listShipMethods function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listShipMethods(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should call listPaymentMethods function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listPaymentMethods(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should call listShipMethodsWithoutIds function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listShipMethodsWithoutIds(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should call listNSItemRecordMetaData function successfully", function (done) {
        var paramObject =
        {
            options: { bearerToken: 'bearerToken' }
            , nsConnectionId: 'nsConnectionId'
            , scriptId: 'customscript_generic_bundle_install'
        }
        RefreshNSMetaDataOperations.listNSItemRecordMetaData(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should throw error in listLocations", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listLocations(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list locations for empty paramObject')
            done()
        })
    })

    it("Should throw error in listPriceLevels", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listPriceLevels(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list locations for empty paramObject')
            done()
        })
    })

    it("Should throw error in listShipMethods", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listShipMethods(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list Ship Methods for empty paramObject')
            done()
        })
    })

    it("Should throw error in listPaymentMethods", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listPaymentMethods(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list Payment Methods for empty paramObject')
            done()
        })
    })

    it("Should throw error in listShipMethodsWithoutIds", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listShipMethodsWithoutIds(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list Ship Methods for empty paramObject')
            done()
        })
    })

    it("Should throw error in listNSItemRecordMetaData", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listNSItemRecordMetaData(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list item record metadata for empty paramObject')
            done()
        })
    })

    it("Should throw error in listRecordSearchColumnMetadata", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listRecordSearchColumnMetadata(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list Search Columns for empty paramObject')
            done()
        })
    })

    it("Should throw error in listSelectOptions", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list valid-values for empty paramObject')
            done()
        })
    })

    it("Should throw error in dummyGeneratesMethod", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.dummyGeneratesMethod(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list locations for empty paramObject')
            done()
        })
    })

    it("Should throw error in dummyExtractsMethod", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.dummyExtractsMethod(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list locations for empty paramObject')
            done()
        })
    })

    it("Should throw error in listItemFieldSelectOptions", function (done) {
        var paramObject = ''
        RefreshNSMetaDataOperations.listItemFieldSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list valid-values metadata for empty paramObject')
            done()
        })
    })

    it("Should call listRecordSearchColumnMetadata function successfully", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken', metaDataConfig: {recordType: 'customer',fieldId: 'fieldId'} }
                , nsConnectionId: 'nsConnectionId'
                , scriptId: 'customscript_generic_bundle_install'
            }
        RefreshNSMetaDataOperations.listRecordSearchColumnMetadata(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should throw error in listRecordSearchColumnMetadata with missing metaDataConfig", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken'}
            }
        RefreshNSMetaDataOperations.listRecordSearchColumnMetadata(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "recordType" key is required.')
            done()
        })
    })
    
    it("Should call listSelectOptions function successfully", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken', metaDataConfig: {recordType: 'customer',fieldId: 'fieldId'} }
                , nsConnectionId: 'nsConnectionId'
                , scriptId: 'customscript_generic_bundle_install'
            }
        RefreshNSMetaDataOperations.listSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should throw error in listSelectOptions with missing metaDataConfig", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken'}
            }
        RefreshNSMetaDataOperations.listSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "recordType" and "fieldId" key is required.')
            done()
        })
    })

    it("Should call listItemFieldSelectOptions function successfully", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken', metaDataConfig: {recordType: 'customer',fieldId: 'fieldId'} }
                , nsConnectionId: 'nsConnectionId'
                , scriptId: 'customscript_generic_bundle_install'
            }
        RefreshNSMetaDataOperations.listItemFieldSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err, null)
            done()
        })
    })

    it("Should throw error in listItemFieldSelectOptions with missing metaDataConfig", function (done) {
        var paramObject =
            {
                options: { bearerToken: 'bearerToken'}
            }
        RefreshNSMetaDataOperations.listItemFieldSelectOptions(paramObject, function (err, res, body) {
            assert.equal(err.message, 'Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "fieldId" key is required.')
            done()
        })
    })

})