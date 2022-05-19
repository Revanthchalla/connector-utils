'use strict'

var assert = require('assert')
var _ = require('lodash')
var resourceUtils = require('../../resourceUtils/resourceUtils')
var nock = require('nock')
var CONSTS = require('../../constants')

describe('resourceUtils tests', function () {
    var options = {
        resourceType: 'connections',
        bearerToken: 'bearerToken',
        resourceId: '123654789',
        updateResourceFunction: function (resource, cb) {
            var err
            if (!resource.success) err = 'Error'
            else err = null
            cb(err)
        },
        distributed: true,
        action: true,
        resource: {
            hooks: {
                hookName: function () { }
            }
        },
        hookFunctionName: 'new',
        hookName: 'hookName',
        addMapping: [{
            'generate': 'import1'
        },
        {
            'generate': 'export1'
        },
        {
            'generate': 'rate',
            'internalId': false,
            'immutable': false,
            'extract': 'line_items[*].price'
        }],
        deleteMapping: ['export', 'import'],
        listGenerateId: '789789'
    }

    describe('Load and Update resource tests', function () {
        it('Should return error if the function does not has the required params', function (done) {

            var params1 = null
            resourceUtils.loadAndUpdateResource(params1, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResource function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.resourceType
            resourceUtils.loadAndUpdateResource(params2, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResource function Options does not contain resourceType. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params3 = _.cloneDeep(options)
            delete params3.bearerToken
            resourceUtils.loadAndUpdateResource(params3, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResource function Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params4 = _.cloneDeep(options)
            delete params4.resourceId
            resourceUtils.loadAndUpdateResource(params4, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResource function Options does not contain resourceId. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params5 = _.cloneDeep(options)
            delete params5.updateResourceFunction
            resourceUtils.loadAndUpdateResource(params5, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResource function Options does not contain updateResourceFunction. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params6 = _.cloneDeep(options)
            delete params6.distributed
            resourceUtils.loadAndUpdateResource(params6, function (err) {
                assert.equal(err.message, 'Unable to verify response, Status Code: 401')
                done()
            })

        })

        it('Should throw error if body is empty', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections/123654789/distributed')
                .reply(201, {})
            resourceUtils.loadAndUpdateResource(params, function (err) {
                assert.equal('Error', err)
                done()
            })
        })

        it('Should throw error while saving the resource, if there is any error while saving the resource', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections/123654789/distributed')
                .reply(201, { success: true })
                .post('/v1/connections/distributed')
                .reply(401, {})
            resourceUtils.loadAndUpdateResource(params, function (err) {
                assert.equal('Unable to verify response, Status Code: 401', err.message)
                done()
            })
        })

        it('Should execute loadAndUpdateResource function, if no error', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections/123654789/distributed')
                .reply(201, { success: true })
                .post('/v1/connections/distributed')
                .reply(201, { success: true })
            resourceUtils.loadAndUpdateResource(params, function (err) {
                assert.equal(err, null)
                done()
            })
        })
    })

    describe('registerHookToAdaptor tests', function () {
        it('Should return error if the function does not have all the required params', function (done) {
            var params = null
            resourceUtils.registerHookToAdaptor(params, function (err) {
                assert.equal('Oops!! something went wrong, registerHookToAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err.message)
                done()
            })
        })

        it('Should pass through the function and return params.action as resourceUtils.registerHookToAdaptorHelper function, if no error found', function (done) {
            var params = _.cloneDeep(options)
            resourceUtils.registerHookToAdaptor(params, function (err) {
                assert.equal(params.action, resourceUtils.registerHookToAdaptorHelper)
                done()
            })
        })
    })

    describe('toggleHookFunctionFromAdaptor tests', function () {
        it('Should return error if the function params does not contain action or typeof action is not a function', function (done) {
            var params = _.cloneDeep(options)
            delete params.action
            resourceUtils.toggleHookFunctionFromAdaptor(params, function (err) {
                assert.equal('Error: Oops!! something went wrong, toggleHookFunctionFromAdaptor,Options does not contain action. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })
    })

    describe('registerHookToAdaptorHelper tests', function () {
        it('Should return error if the function does not has the required params', function (done) {

            var params = null
            resourceUtils.registerHookToAdaptorHelper(params, function (err) {
                assert.equal('Error: Oops!! something went wrong, registerHookToAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.resource
            resourceUtils.registerHookToAdaptorHelper(params2, function (err) {
                assert.equal('Error: Oops!! something went wrong, registerHookToAdaptor Options does not resource body. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params3 = _.cloneDeep(options)
            delete params3.hookName
            resourceUtils.registerHookToAdaptorHelper(params3, function (err) {
                assert.equal('Error: Oops!! something went wrong, registerHookToAdaptor Options does not contain hookName. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params4 = _.cloneDeep(options)
            delete params4.hookFunctionName
            resourceUtils.registerHookToAdaptorHelper(params4, function (err) {
                assert.equal('Error: Oops!! something went wrong, registerHookToAdaptor Options does not contain hookFunctionName. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should return null if the function does not has the resource.hooks[options.hookName]', function (done) {
            var params = _.cloneDeep(options)
            params.resource.hooks = {}
            resourceUtils.registerHookToAdaptorHelper(params, function (err) {
                assert.equal(err, null)
                done()
            })
        })

        it('Should pass through the function and return options.resource.hooks[options.hookName].function as options.hookFunctionName, if no error found', function (done) {
            var params = _.cloneDeep(options)
            resourceUtils.registerHookToAdaptorHelper(params, function (err) {
                assert.equal(params.resource.hooks[params.hookName].function, options.hookFunctionName)
                done()
            })
        })
    })

    describe('deRegisterHookFromAdaptor tests', function () {
        it('Should return error if the function does not has the required params', function (done) {
            var params = null
            resourceUtils.deRegisterHookFromAdaptor(params, function (err) {
                assert.equal('Error: Something went wrong!!. deRegisterHookFromAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should pass through the function and return params.action as deRegisterHookFromAdaptorHelper function if no error found', function (done) {
            var params = _.cloneDeep(options)
            resourceUtils.deRegisterHookFromAdaptor(params, function (err) {
                assert.equal(params.action, resourceUtils.deRegisterHookFromAdaptorHelper)
                done()
            })
        })
    })

    describe('deRegisterHookFromAdaptorHelper tests', function () {
        it('Should return error if the function does not has the required params', function (done) {

            var params = null
            resourceUtils.deRegisterHookFromAdaptorHelper(params, function (err) {
                assert.equal('Error: Something went wrong!!. deRegisterHookFromAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.resource
            resourceUtils.deRegisterHookFromAdaptorHelper(params2, function (err) {
                assert.equal('Error: Something went wrong!!. deRegisterHookFromAdaptor Options does not resource body. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params3 = _.cloneDeep(options)
            delete params3.hookName
            resourceUtils.deRegisterHookFromAdaptorHelper(params3, function (err) {
                assert.equal('Error: Something went wrong!!. deRegisterHookFromAdaptor Options does not contain hookName. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should pass through the function and return options.resource.hooks[options.hookName].function as null if no error found', function (done) {
            var params = _.cloneDeep(options)
            resourceUtils.deRegisterHookFromAdaptorHelper(params, function (err) {
                assert.equal(params.resource.hooks[options.hookName].function, null)
                done()
            })
        })
    })

    describe('Modify Mapping tests', function () {
        it('Should return error if the function does not has the required params', function (done) {
            var params = null
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal('Error: Something went wrong!! modifyMapping function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.resourceId
            resourceUtils.modifyMapping(params2, function (err) {
                assert.equal('Error: Something went wrong!! modifyMapping Options does not contain resourceId. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should return null if the function does not have addmapping and deletemapping', function (done) {
            var params = _.cloneDeep(options)
            delete params.addMapping
            delete params.deleteMapping
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal(null, err)
                done()
            })
        })

        it('Should return error if the function does not have addMapping and deletemapping as arrays', function (done) {
            var params = _.cloneDeep(options)
            params.addMapping = {}
            params.deleteMapping = {}
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports/123654789/distributed')
                .reply(201, {})
                .post('/v1/imports/distributed')
                .reply(201, { success: true })
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal('Error: Failed to load mapping. Please retry, if issue persists kindly contact Celigo support.', err)
                done()
            })
        })

        it('Should return null if the function does not have listGenerateId', function (done) {
            var params = _.cloneDeep(options)
            delete params.listGenerateId
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports/123654789/distributed')
                .reply(201, { success: true, mapping: {}, netsuite_da: { mapping: { lists: [{ 'generate': params.listGenerateId }], fields: [{}] } } })
                .post('/v1/imports/distributed')
                .reply(201, { success: true })
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal(null, err)
                done()
            })
        })

        it('Should return error if mapping object does not belongs to list', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports/123654789/distributed')
                .reply(201, { success: true, mapping: {}, netsuite_da: { mapping: { lists: [{ 'generate': params.listGenerateId }], fields: [{ generate: 'export' }, { generate: 'import' }] } } })
                .post('/v1/imports/distributed')
                .reply(201, { success: true })
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal('Error: Failed to load mapping. Please retry, if issue persists kindly contact Celigo support.', err)
                done()
            })
        })

        it('Should pass through the function and set the resourceType to "imports" if no error is found', function (done) {
            var params = _.cloneDeep(options)
            delete params.listGenerateId
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports/123654789/distributed')
                .reply(201, { success: true, mapping: {}, netsuite_da: { mapping: { lists: [{ 'generate': params.listGenerateId }], fields: [{ generate: 'export' }, { generate: 'import' }, { generate: 'export1' }, { generate: 'import1' }] } } })
                .post('/v1/imports/distributed')
                .reply(201, { success: true })
            resourceUtils.modifyMapping(params, function (err) {
                assert.equal('imports', params.resourceType)
                done()
            })
        })
    })

    describe('getDocuments tests', function () {
        it('Should return error if the function does not has the required params', function (done) {
            var params = null
            resourceUtils.getDocuments(params, function (err) {
                assert.equal('Error: Something went wrong!! getDocuments function doesn\'t have required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.bearerToken
            resourceUtils.getDocuments(params2, function (err) {
                assert.equal('Error: Something went wrong!! getDocuments Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should return null if options.resourceTypes is empty or is not an array', function (done) {
            var params = _.cloneDeep(options)
            delete params.resourceTypes
            resourceUtils.getDocuments(params, function (err) {
                assert.equal(null, err)
                done()
            })
        })

        it('Should return error if network connection call fails', function (done) {
            var params = _.cloneDeep(options)
            params.resourceTypes = ['connections2']
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections2/wrongcall')
                .reply(201, {})
            resourceUtils.getDocuments(params, function (err) {
                assert.equal('Could not make network call. Nock: No match for request {\n  \"method\": \"GET\",\n  \"url\": \"https://api.integrator.io/v1/connections2\",\n  \"headers\": {\n    \"authorization\": \"Bearer bearerToken\",\n    \"content-type\": \"application/json\",\n    \"host\": \"api.integrator.io\",\n    \"accept\": \"application/json\"\n  }\n}', err.message)
                done()
            })
        })

        it('Should return error if connection doc does not have a body', function (done) {
            var params = _.cloneDeep(options)
            params.resourceTypes = ['connections']
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections')
                .reply(201)
            resourceUtils.getDocuments(params, function (err, res) {
                assert.equal('Unable to fetch ' + params.resourceType + ' in getDocuments, res : {"statusCode":201,"headers":{},"request":{"uri":{"protocol":"https:","slashes":true,"auth":null,"host":"api.integrator.io","port":443,"hostname":"api.integrator.io","hash":null,"search":null,"query":null,"pathname":"/v1/connections","path":"/v1/connections","href":"https://api.integrator.io/v1/connections"},"method":"GET","headers":{"Authorization":"Bearer bearerToken","Content-Type":"application/json","accept":"application/json"}}}', err.message)
                done()
            })
        })

        it('Should pass through the function and return response if no error', function (done) {
            var params = _.cloneDeep(options)
            params.resourceTypes = ['connections']
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/connections')
                .reply(201, { success: true })
            resourceUtils.getDocuments(params, function (err, response) {
                assert.deepEqual(response, { connections: { success: true } })
                done()
            })
        })


    })
    describe('loadAndUpdateResourcesWithExternalId tests', function () {
        var options = {
            resourceType: 'imports',
            resourceId: '5d95f0b8795b356dfcb5d3ac',
            externalIds: ['shopify_netsuite_customer_refund_import_adaptor'],
            bearerToken: 'bearerToken',
            updateResourceFunction: function (resource, cb) {
                var err
                if (!resource.success) err = 'Error while fetching the resource'
                else {
                    err = null
                    resource.skipUpdate = false
                }
                cb(err, resource)
            },
            resource: {
                _id: '5d95f0b8795b356dfcb5d3ac',
                lastModified: '2019-10-14T06:26:20.262Z',
                name: 'NetSuite Customer Refund Import Adaptor',
                _connectionId: '5d95ee3c74836b1acdcd2341',
                _integrationId: '5d95ee3a795b356dfcb5d226',
                _connectorId: '5c73b65e0f188667b7a0831a',
                externalId: 'shopify_netsuite_customer_refund_import_adaptor',
                distributed: true,
                apiIdentifier: 'ie97d828b9',
                ignoreExisting: true
            }
        }
        it('Should return error if the function does not has the required params', function (done) {
            var params1 = null
            resourceUtils.loadAndUpdateResourcesWithExternalId(params1, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params2 = _.cloneDeep(options)
            delete params2.resourceType
            resourceUtils.loadAndUpdateResourcesWithExternalId(params2, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain resourceType. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params3 = _.cloneDeep(options)
            delete params3.bearerToken
            resourceUtils.loadAndUpdateResourcesWithExternalId(params3, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params4 = _.cloneDeep(options)
            delete params4.externalIds
            resourceUtils.loadAndUpdateResourcesWithExternalId(params4, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain externalIds. Kindly retry, if issue persists, please contact Celigo Support.', err)
            })

            var params5 = _.cloneDeep(options)
            delete params5.updateResourceFunction
            resourceUtils.loadAndUpdateResourcesWithExternalId(params5, function (err) {
                assert.equal('Error: Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain updateResourceFunction. Kindly retry, if issue persists, please contact Celigo Support.', err)
                done()
            })
        })

        it('Should throw error if status code is other than 200 or 201 while loading the resource', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports?externalId=shopify_netsuite_customer_refund_import_adaptor')
                .reply(401, {})
            resourceUtils.loadAndUpdateResourcesWithExternalId(params, function (err) {
                assert.equal('Unable to verify response, Status Code: 401', err.message)
                done()
            })
        })

        it('Should throw error while saving the resource,if there is any error while saving the resource', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports?externalId=shopify_netsuite_customer_refund_import_adaptor')
                .reply(201, {
                    _id: '5d95f0b8795b356dfcb5d3ac',
                    lastModified: '2019-10-14T06:26:20.262Z',
                    name: 'NetSuite Customer Refund Import Adaptor',
                    _connectionId: '5d95ee3c74836b1acdcd2341',
                    _integrationId: '5d95ee3a795b356dfcb5d226',
                    _connectorId: '5c73b65e0f188667b7a0831a',
                    externalId: 'shopify_netsuite_customer_refund_import_adaptor',
                    distributed: true,
                    apiIdentifier: 'ie97d828b9',
                    ignoreExisting: true
                })
            resourceUtils.loadAndUpdateResourcesWithExternalId(params, function (err) {
                assert.equal(err, 'Error while fetching the resource')
                done()
            })
        })

        it('Should skip update if skipUpdate is present in the resource', function (done) {
            var params = _.cloneDeep(options)
            params.updateResourceFunction = function (resource, cb) {
                var err
                if (!resource.success) err = 'Error while fetching the resource'
                else {
                    err = null
                    resource.skipUpdate = true
                }
                cb(err, resource)
            }
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports?externalId=shopify_netsuite_customer_refund_import_adaptor')
                .reply(200, {
                    _id: '5d95f0b8795b356dfcb5d3ac',
                    lastModified: '2019-10-14T06:26:20.262Z',
                    name: 'NetSuite Customer Refund Import Adaptor',
                    externalId: 'shopify_netsuite_customer_refund_import_adaptor',
                    success: 'true'
                })
            resourceUtils.loadAndUpdateResourcesWithExternalId(params, function (err) {
                assert.deepEqual(!!err, false)
                done()
            })
        })

        it('Should execute loadAndUpdateResourcesWithExternalId function,if no error', function (done) {
            var params = _.cloneDeep(options)
            nock.cleanAll()
            nock(CONSTS.HERCULES_BASE_URL)
                .persist()
                .get('/v1/imports?externalId=shopify_netsuite_customer_refund_import_adaptor')
                .reply(200, {
                    _id: '5d95f0b8795b356dfcb5d3ac',
                    lastModified: '2019-10-14T06:26:20.262Z',
                    name: 'NetSuite Customer Refund Import Adaptor',
                    _connectionId: '5d95ee3c74836b1acdcd2341',
                    _integrationId: '5d95ee3a795b356dfcb5d226',
                    _connectorId: '5c73b65e0f188667b7a0831a',
                    externalId: 'shopify_netsuite_customer_refund_import_adaptor',
                    distributed: true,
                    apiIdentifier: 'ie97d828b9',
                    ignoreExisting: true,
                    success: 'true'
                })
                .put('/v1/imports/5d95f0b8795b356dfcb5d3ac')
                .reply(201, {
                    _id: '5d95f0b8795b356dfcb5d3ac',
                    name: 'NetSuite Customer Refund Import Adaptor',
                    _connectionId: '5d95ee3c74836b1acdcd2341',
                    _integrationId: '5d95ee3a795b356dfcb5d226',
                    _connectorId: '5c73b65e0f188667b7a0831a',
                    externalId: 'shopify_netsuite_customer_refund_import_adaptor',
                    success: 'true'
                })
            resourceUtils.loadAndUpdateResourcesWithExternalId(params, function (err) {
                assert.deepEqual(!!err, false)
                done()
            })
        })
    })
})