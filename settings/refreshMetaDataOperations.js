'use strict'

var refreMetaDataOperations = {}
var _ = require('lodash')
var refreshNSMetaDataUtil = require('../nsConnectorUtil/refreshNSMetaDataUtil')
var resourceUtils = require('../resourceUtils/resourceUtils')

refreMetaDataOperations.listLocations = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list locations for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listLocations'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listPriceLevels = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list locations for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listPriceLevels'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listCurrency = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list Currency for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listCurrency'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listShipMethods = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list Ship Methods for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listShipMethods'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listAccount = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list accounts for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listAccount'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listPaymentMethods = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list Payment Methods for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listPaymentMethods'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

refreMetaDataOperations.listShipMethodsWithoutIds = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list Ship Methods for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listShipMethods'
  refreshNSMetaDataUtil.executeNsOperation(paramObject, function(err, results) {
    if(err) return callback(err)
    _.each(results, function(result) {
      result['id'] = result['text']
    })
    return callback(null, results)
  })
}

refreMetaDataOperations.dummyGeneratesMethod = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list locations for empty paramObject'))
  return callback(null, [])
}

refreMetaDataOperations.dummyExtractsMethod = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list locations for empty paramObject'))
  return callback(null, [])
}

refreMetaDataOperations.listNSItemRecordMetaData = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list item record metadata for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listNSItemRecordMetaData'
  options.metaDataConfig = {
      recordTypes: ['kititem', 'inventoryitem', 'assemblyitem'],
      includeSelectOptions: false
  }
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

/*
* sample metaDataConfig is:
*	{
*	"recordType": <record type for which metadata is to be fetched, Required parameter>,
*	"includeJoins": <Boolean value, default is false>
*	}
*/
refreMetaDataOperations.listRecordSearchColumnMetadata = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list Search Columns for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listRecordSearchColumnMetadata'
  if(!options.metaDataConfig || !options.metaDataConfig.recordType){
    return callback(new Error('Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "recordType" key is required.'))
  }
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

/*
* sample metaDataConfig is:
*	{
*	"recordType": <record type for which metadata is to be fetched, Required parameter>,
*	"fieldId": <field Id for which valid values metadata is to be fetched, Required parameter>,
* "sublistId": <sublist Id, to which above fieldId corresponds to>
*	}
*/
refreMetaDataOperations.listSelectOptions = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list valid-values for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listSelectOptions'
  if(!options.metaDataConfig || !options.metaDataConfig.recordType || !options.metaDataConfig.fieldId){
    return callback(new Error('Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "recordType" and "fieldId" key is required.'))
  }
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

/*
* sample metaDataConfig is:
*	{
*	"recordTypes": String[] <record types for which metadata is to be fetched, Required parameter>,
*	"fieldId": <field Id for which valid values metadata is to be fetched>,
* "sublistId": <sublist Id, to which above fieldId corresponds to>
*	}
*/
refreMetaDataOperations.listItemFieldSelectOptions = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list valid-values metadata for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listItemFieldSelectOptions'
  if(!options.metaDataConfig || !options.metaDataConfig.fieldId){
    return callback(new Error('Cannot list valid-values metadata. Missing required information: metaDataConfig with valid "fieldId" key is required.'))
  }

  if(!options.metaDataConfig.recordTypes){
    options.metaDataConfig.recordTypes = ['kititem', 'inventoryitem', 'assemblyitem']
  }

  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}
/*
  AMZNS-847
  Aim: to prepare the NS adaptor dependecies per flow. It should be called from the connector to override the default behaviour
  @Sample connectorConfig:
  {
    identifier: 'name', //should be name or externalId and all other inputs(flowsToBeDiscarded, additionalDependencies) should be based on this
    flowsToBeDiscarded: ['Amazon (FBA) Order to NetSuite Order On Demand Add', 'Amazon (MFN) Order to NetSuite Order On Demand Add', 'Amazon (FBA) Customer to NetSuite Customer Add', 'Amazon (MFN) Customer to NetSuite Customer Add'],
    additionalDependencies: {
      'Amazon (FBA) Order to NetSuite Order Add' : {
        imports: ['Amazon (FBA) Customer Import Adaptor']
      },
      'Amazon (MFN) Order to NetSuite Order Add' : {
        imports: ['Amazon (MFN) Customer Import Adaptor']
      }
    }
  }

expected output format:
  [
  [
    [
      "imports_5bd9535edd347e3ca23f8e92",
      "imports_5bd9535edd347e3ca23f8e93"
    ],
    "Amazon (FBA) Order to NetSuite Order Add [AMZ-US-1]"
  ],
  [
    [
      "imports_5bd9535edd347e3ca23f8e86"
    ],
    "Amazon Product ASIN to NetSuite Item Add [AMZ-US-1]"
  ],
  [
    [
      "imports_5bd9536add347e3ca23f8ebf"
    ],
    "Amazon Settlement Report to NetSuite Add [AMZ-US-1]"
  ]]
*/
refreMetaDataOperations.getConfigurableFlows = function (paramObject, callback) {
  var options = paramObject.options
  var connectorConfig = paramObject.connectorConfig
  var storeId = _.isArray(options.operationArray) && options.operationArray[1]
  var storeMapArr = options.storemap
  var storeMap
  var primaryNetSuiteConnectionId = paramObject.nsConnectionId
  var secondaryNetSuiteConnectionId = options.commonresources && options.commonresources.secondaryNetSuiteConnectionId
  var results = []
  var flowsToBeDiscarded = (connectorConfig && connectorConfig.flowsToBeDiscarded) || []
  var identifier = (connectorConfig && connectorConfig.identifier) || 'name'
  var additionalDependencies = (connectorConfig && connectorConfig.additionalDependencies) || {}

  if (!storeMapArr || !storeId || !primaryNetSuiteConnectionId || !secondaryNetSuiteConnectionId) {
    return callback(new Error('Integration is corrupted, does not contain store/connections data. Kindly retry, if issue persists, please contact Celigo Support'))
  }

  storeMap = _.find(storeMapArr, function (storemap) {
    return storeId === (storemap.accountid || storemap.shopid)
  })

  if (!storeMap || !storeMap.flows || !storeMap.exports || !storeMap.imports) {
    return callback(new Error('Integration is corrupted, storeMap does not contain flows/exports/imports info. Kindly retry, if issue persists, please contact Celigo Support'))
  }

  // in case of name identifier, attach the shopname to flowsToBeDiscarded,additionalDependencies to do the exact match
  if (identifier === 'name') {
    flowsToBeDiscarded = _.map(flowsToBeDiscarded, function (flow) {
      return flow + ' [' + (storeMap.accountname || storeMap.shopname) + ']'
    })
    _.each(additionalDependencies, function (value, key) {
      additionalDependencies[key + ' [' + (storeMap.accountname || storeMap.shopname) + ']'] = value
      delete additionalDependencies[key]
    })
  }

  // get all the documents to prepare the lis
  resourceUtils.getDocuments({bearerToken: options.bearerToken, resourceTypes: ['exports', 'imports', 'flows']}, function (err, response) {
    if (err) return callback(err)

    if (!response || !response.flows || !response.exports || !response.imports) {
      return callback(new Error("Unable to get the documents for the integration. Please retry, if issue persists, kindly contact Celigo support."))
    }

    /* iterate over the flows and prepare the result options
    @steps:
      1. check whether flow needs to be considered or not - storemap check, discarded check
      2. for each qualified flow, identify the dependent components
        1. Should be having one of the NS connection and id should match with flow's _exportId/_.importId
        2. add the exports, imports which are mentioned in additionalDependencies
        3. for each pageGenerators, pageProcessors, iterate and identify the components
      3. modify the dependents to expected format
      4. add {flowName, dependents} to results
    */
    _.each(response.flows, function (flowDocument) {
      var dependecies = {
        exports: [],
        imports: []
      }

      // #1
      if (flowDocument[identifier] && _.includes(storeMap.flows, flowDocument._id) && !_.includes(flowsToBeDiscarded, flowDocument[identifier])) {
        _.each(['exports', 'imports'], function (adaptorType) {
          dependecies[adaptorType] = _.filter(response[adaptorType], function (adaptor) {
            if (_.includes(storeMap[adaptorType], adaptor._id) && _.includes([primaryNetSuiteConnectionId, secondaryNetSuiteConnectionId], adaptor._connectionId)) {
              // #2.1
              if (flowDocument[adaptorType === 'exports' ? '_exportId' : '_importId'] === adaptor._id) return true

              // #2.2
              if (additionalDependencies[flowDocument[identifier]] && additionalDependencies[flowDocument[identifier]][adaptorType]) {
                return _.includes(additionalDependencies[flowDocument[identifier]][adaptorType], adaptor[identifier])
              }

              // #2.3
              if (flowDocument.pageGenerators && flowDocument.pageProcessors) {
                if (adaptorType === 'exports' && _.find(flowDocument.pageGenerators, {_exportId: adaptor._id})) {
                  return true
                }

                return _.find(flowDocument.pageProcessors, function (pageProcessor) {
                  return (pageProcessor.type === (adaptorType === 'exports' ? 'export' : 'import')) && (pageProcessor[(adaptorType === 'exports' ? '_exportId' : '_importId')] === adaptor._id)
                })
              }
            }
          })

          // #3
          dependecies[adaptorType] = _.map(dependecies[adaptorType], function (adaptor) {
            return adaptorType + '_' + adaptor._id
          })
        })

        // #4
        var finalDependecies = _.union(dependecies.exports, dependecies.imports)

        if (!_.isEmpty(finalDependecies)) {
          results.push({id: JSON.stringify(finalDependecies), text: flowDocument.name})
        }
      }
    })
    return callback(null, results)
  })
}

refreMetaDataOperations.listSalesRoles = function (paramObject, callback) {
  if(!paramObject) return callback(new Error('Cannot list SalesRoles for empty paramObject'))
  var options = paramObject.options
  options.methodName = 'listSalesRoles'
  return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

module.exports = refreMetaDataOperations