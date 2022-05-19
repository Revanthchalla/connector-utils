'use strict'

/**
  Operations defined in this module won't be overriden.
*/

var genericOperations = {}
, installerUtils = require('../installer/installerHelper')
, CONSTS = require('../constants')
, _ = require('lodash')
, async = require('async')
, logger = require('winston')
, utils = require('../installer/installerHelper')
, UtilSettings = require('./setting')
, settingsUtil = require('./settingsUtil')
, operations = require('./operations')
, refreshNSMetaDataUtil = require('../nsConnectorUtil/refreshNSMetaDataUtil')


genericOperations.validateParamObjectDataForStaticMap = function(paramObject, callback) {
  //TODO:
  //validate staticMapConfig object
  return callback()
}

/**
  This method updates the setting's static Map
*/
genericOperations.updateStaticMap = function(paramObject, callback) {
  try{
    var oldSettings = paramObject.oldSettings
      , newSettings = paramObject.newSettings
      , setting = paramObject.setting

    if(!oldSettings[setting].optionsMap && newSettings[setting].map) { // old static map setting
      oldSettings[setting].map = newSettings[setting].map
      oldSettings[setting].default = newSettings[setting].default
      oldSettings[setting].allowFailures = newSettings[setting].allowFailures
    } else {
      oldSettings[setting].value = newSettings[setting]
    }

    return callback()
  } catch (e) { return callback(e) }
}

/**

*/
genericOperations.updateDistributedAdaptor = function(paramObject, callback) {
  try {
    var oldSettings = paramObject.oldSettings
      , newSettings = paramObject.newSettings
      , settingParams = paramObject.settingParams
      , setting = paramObject.setting
      , options = paramObject.options
      , adaptorId = paramObject.customAdaptorId || settingParams[1]
      , resourceName = settingParams[0]
      , staticFielddMap = paramObject.customStaticFieldMap || paramObject.staticMapConfig.distributed.staticFielddMap
      , lookupName = paramObject.staticMapConfig.distributed.staticFielddMap.lookupName
      , requestData = {
        'resourcetype': resourceName
        , 'bearerToken': options.bearerToken
        , 'id': adaptorId
        , 'distributed': true
      }
  } catch(e) { return callback(e) }
  paramObject.options.isRefreshPage = true

  installerUtils.integratorRestClient(requestData, function(err, response, body) {
    try{
      if(err) return callback(err)
      var adaptorBody

      if (body && body.netsuite_da) {
        adaptorBody = body.netsuite_da
        delete requestData.distributed
      } else {
        adaptorBody = body
      }
      var indexOfLookupObj = _.findIndex(adaptorBody.lookups, function(obj) { return obj.name === lookupName})
      // Update the mapping if it exists for the given field map else push the mapping
      var indexOfStaticFieldMap = _.findIndex(adaptorBody.mapping.fields, function (obj) { return obj.generate === staticFielddMap.generate })
      if (indexOfStaticFieldMap !== -1) adaptorBody.mapping.fields[indexOfStaticFieldMap] = staticFielddMap
      else adaptorBody.mapping.fields.push(staticFielddMap)
      newSettings[setting].name = lookupName
      if (indexOfLookupObj < 0) {
        // push lookup value 
        adaptorBody.lookups.push(newSettings[setting])
      }
      else {
        adaptorBody.lookups[indexOfLookupObj] = newSettings[setting]
      }
      requestData.data = body
      installerUtils.integratorRestClient(requestData, function(err, response, body) {
        if(err) return callback(err)
        if(paramObject.customAdaptorId) delete paramObject.customAdaptorId
        if(paramObject.customStaticFieldMap) delete paramObject.customStaticFieldMap
        return callback()
      })
    } catch(e) {
      return callback(e)
    }
  })
}

genericOperations.updateSearchLocationFiltersFromMap = function (paramObject, callback) {
  logger.debug('updateSearchLocationFiltersFromMap, paramObject', JSON.stringify(paramObject))
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }

  var map = paramObject.newSettings[paramObject.setting].map
  var locationArray = []
  _.each(map, function(v, k){
    locationArray.push(k)
  })

  locationArray = _.uniq(locationArray)

  var setting = new UtilSettings()
  , options = paramObject.options
  , nsConnectionId = paramObject.nsConnectionId

  setting.getSavedSearchIdAsync(paramObject, function(err, paramObject) {
    if(err) return callback(err)
    logger.info('updateSearchLocationFiltersFromMap, paramObject.savedSearchId', paramObject.savedSearchId)

    var inventorySavedSearchId = paramObject.savedSearchId
      , opts =
        { bearerToken : options.bearerToken
        , connectionId : nsConnectionId
        , method : 'POST'
        , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
        , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
        , data :
          { requests :
            [
              { type : 'method'
              , operation : 'updateSearchLocationFilters'
              , config : {
                   "searchId": inventorySavedSearchId,
                   "locations" : locationArray
                 }
              }
            ]
          }
        }
     utils.integratorProxyCall(opts, function(e, r, b) {
       logger.info('updateSearchLocationFiltersFromMap body: ', JSON.stringify(b))
       if(e) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN + '. Details :' + e.message))
       b = b && b[0] || null
       if(!b || !b.statusCode || b.statusCode !== 200) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN + '. Details : Unable to update saved search in NetSuite'))
       return callback(null)
    })
  })
}

genericOperations.updateMultipleSearchLocationFiltersFromMap = function (paramObject, callback) {
  logger.debug('updateMultipleSearchLocationFiltersFromMap, paramObject', JSON.stringify(paramObject))
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }

  var map = paramObject.newSettings[paramObject.setting].map
  var locationArray = []
  _.each(map, function(v, k){
    locationArray.push(k)
  })

  locationArray = _.uniq(locationArray)
  logger.info('updateMultipleSearchLocationFiltersFromMap, locationArray', JSON.stringify(locationArray))

  var setting = new UtilSettings()
  , options = paramObject.options
  , nsConnectionId = paramObject.nsConnectionId
  , invSavedSearchIds = setting.getAllInventorySavedSearchIdsInSection(paramObject)
  , kitSavedSearchIds = setting.getKitInventorySavedSearchIdsInSection(paramObject)
  , opts =
    { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
      { requests :
        [
        ]
      }
    }

    if(invSavedSearchIds.error) {
      if(invSavedSearchIds.splunkLog) {
        utils.logInSplunk(invSavedSearchIds.splunkLog)
      }
      return callback(new Error(invSavedSearchIds.error))
    }

    if(kitSavedSearchIds.error) {
      if(kitSavedSearchIds.splunkLog) {
        utils.logInSplunk(kitSavedSearchIds.splunkLog)
      }
      return callback(new Error(kitSavedSearchIds.error))
    }

    _.each(invSavedSearchIds.results, function (savedSearchId) {
      var request =
          { type : 'method'
          , operation : 'updateSearchLocationFilters'
          , config : {
               "searchId": savedSearchId,
               "locations" : locationArray
             }
          }
      opts.data.requests.push(request)
    })

    _.each(kitSavedSearchIds.results, function (savedSearchId) {
      var request =
          { type : 'method'
          , operation : 'updateSearchFilters'
          , config : {
               "searchId": savedSearchId,
               "filterParam" : locationArray,
               "filterKey" : "memberitem.inventorylocation"
             }
          }
      opts.data.requests.push(request)
    })

     utils.integratorProxyCall(opts, function(e, r, b) {
       logger.info('updateMultipleSearchLocationFiltersFromMap, e', JSON.stringify(e))
       logger.info('updateMultipleSearchLocationFiltersFromMap, r', JSON.stringify(r))
       if(e) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN + '. Details :' + e.message))
       b = b && b[0] || null
       if(!b || !b.statusCode || b.statusCode !== 200) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN + '. Details : Unable to update saved search in NetSuite'))
       return callback(null)
    })
}

genericOperations.updateSearchPricingFiltersFromMap = function(paramObject, callback){
  var map = paramObject.newSettings[paramObject.setting] && paramObject.newSettings[paramObject.setting].map
  if(!map) {
    return callback(new Error('Settings does not contain static map data. Please retry, if issue persists kindly contact Celigo support.'))
  }
  var priceLevels = []
  _.each(map, function(value, key){
    priceLevels.push(key)
  })

  operations.updatePricingSavedSearchWithProvidedFilters(paramObject, priceLevels, callback)
}

genericOperations.updateImportAdaptorLookup = function (paramObject, callback) {
  try {
    var oldSettings = paramObject.oldSettings
      , newSettings = paramObject.newSettings
      , settingParams = paramObject.settingParams
      , setting = paramObject.setting
      , options = paramObject.options
      , adaptorId = settingParams[1]
      , resourceName = settingParams[0]
      , staticFieldMap = paramObject.staticMapConfig.staticFieldMap
      , importType = paramObject.staticMapConfig.importType
      , lookupName = paramObject.staticMapConfig.staticFieldMap.lookupName
      , requestData = {
        'resourcetype': resourceName
        , 'bearerToken': options.bearerToken
        , 'id': adaptorId
      }
  } catch(e) { return callback(e) }

  installerUtils.integratorRestClient(requestData, function(err, response, body) {
    if(err) return callback(err)

    try {
      var adaptorBody = body
      , indexOfLookupObj = _.findIndex(adaptorBody[importType].lookups, function(obj) { return obj.name === lookupName})

      logger.info('genericOperations, updateImportAdaptorLookup, adaptorBody before : ', JSON.stringify(adaptorBody))
      logger.info('genericOperations, updateImportAdaptorLookup, indexOfLookupObj : ', indexOfLookupObj)

      // if lookup does not exist then push it else update the lookup
      if(indexOfLookupObj < 0) {
        //Update the mapping if it exists for the given field map else push the mapping
        var indexOfStaticFieldMap = _.findIndex(adaptorBody.mapping.fields, function(obj) { return obj.generate === staticFieldMap.generate})
        logger.info('genericOperations, updateImportAdaptorLookup, indexOfStaticFieldMap : ', indexOfStaticFieldMap)

        if(indexOfStaticFieldMap !== -1) adaptorBody.mapping.fields[indexOfStaticFieldMap] = staticFieldMap
        else adaptorBody.mapping.fields.push(staticFieldMap)
        //push lookup value
        newSettings[setting].name = lookupName
        adaptorBody[importType].lookups.push(newSettings[setting])
      } else {
        newSettings[setting].name = lookupName
        adaptorBody[importType].lookups[indexOfLookupObj] = newSettings[setting]
      }

      logger.info('genericOperations, updateImportAdaptorLookup, adaptorBody after : ', JSON.stringify(adaptorBody))

      var requestData = {
        'resourcetype': resourceName
        , 'bearerToken': options.bearerToken
        , 'id': adaptorId
        , data: adaptorBody
      }

      installerUtils.integratorRestClient(requestData, function(err, response, body) {
        if(err) return callback(err)
        return callback()
      })
    } catch(ex) {
      return callback(ex)
    }
  })
}

genericOperations.updateAdaptorsWithConnections = function(paramObject, callback) {
  logger.debug('updateAdaptorsWithConnections, paramObject', JSON.stringify(paramObject))
  if(!paramObject || !paramObject.staticMapConfig || !paramObject.newSettings || !paramObject.oldSettings || !paramObject.setting || !paramObject.options) {
    logger.debug('updateAdaptorsWithConnections, paramObject', JSON.stringify(paramObject))
    return callback(new Error('Invalid paramObject.Please contact celigo support'))
  }
  var staticMapConfig = paramObject.staticMapConfig
    , map = paramObject.newSettings[paramObject.setting] && paramObject.newSettings[paramObject.setting].map
    , options = paramObject.options
    , validExtracts = paramObject.oldSettings[paramObject.setting] && paramObject.oldSettings[paramObject.setting].extracts
    , validGenerates = paramObject.oldSettings[paramObject.setting] && paramObject.oldSettings[paramObject.setting].generates
    , errored = false
    , defaultConenctionValue = paramObject.oldSettings[paramObject.setting] && paramObject.newSettings[paramObject.setting].default
    , updateAdaptorsOptions = {}

  validExtracts = _.map(validExtracts, 'id')
  validGenerates = _.map(validGenerates, 'id')
  //TODO do not make defaultConenctionValue mandatory if map contains all validAdaptors
  if(!defaultConenctionValue) return callback(new Error('Please select a value for default connection.'))
  if((!(staticMapConfig.validAdaptors) || !_.isArray(staticMapConfig.validAdaptors)) && _.isEmpty(map)) return callback()

  //TODO remove validation when IO enhanced staticMap features & When added refresh method
  if(staticMapConfig.validateValues) {
    if(!validExtracts || !validGenerates || !_.isArray(validExtracts) || !_.isArray(validGenerates) || _.isEmpty(validExtracts) || _.isEmpty(validGenerates)) return callback(new Error('StaticMap is not configured properly. Please contact celigo support'))
    _.each(map, function(connectionId, adaptorId) {
      if(!connectionId || !adaptorId || validExtracts.indexOf(adaptorId) === -1 || validGenerates.indexOf(connectionId) === -1) {
        errored = true
        return false
      }
    })
  }

  if(errored) return callback(new Error("Invalid data. Please choose data from dropdown only"))
  updateAdaptorsOptions = {
    staticMapConfig : staticMapConfig,
    map : map,
    defaultConenctionValue : defaultConenctionValue,
    bearerToken : options.bearerToken
  }
  updateAdaptors(updateAdaptorsOptions, function(err){
    if(err) return callback(err)
    return callback()
  })
}

genericOperations.validateSearchFromMap = function(paramObject, callback) {
  logger.debug('validateSearchFromMap, paramObject', JSON.stringify(paramObject))
  var staticMapConfig = paramObject.staticMapConfig
    , map = paramObject.newSettings[paramObject.setting].map
    , commonresources = settingsUtil.getCommonResources(paramObject)
    , columns = []

    if(_.isEmpty(map)) return callback()
    if(!staticMapConfig.filters && !(staticMapConfig.columns || staticMapConfig.loadColumnsFromMap)) return callback()

    if(!paramObject.nsConnectionId) {
      if(commonresources) {
        paramObject.nsConnectionId = commonresources.netsuiteConnectionId
      } else {
        return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
      }
    }

    if(staticMapConfig.loadColumnsFromMap)
    {
      _.each(map, function(v, k){
        columns.push({"name": v, "label": k})
      })
    }
    paramObject.options.methodName = 'validateSearch'
    paramObject.options.searchConfig = {
        recordType : staticMapConfig.recordType
      , searchId : staticMapConfig.searchId || null
      , filters : staticMapConfig.filters || [[]]
      , columns : staticMapConfig.columns || columns
    }

    return refreshNSMetaDataUtil.executeNsOperation(paramObject, callback)
}

var updateAdaptors = function(options, callback) {
  var requestOptionsArray = []

  getAllAdaptors(options, function(err, adaptorBodys) {
    if(err) return callback(err)

    if(!adaptorBodys || !_.isArray(adaptorBodys) || _.isEmpty(adaptorBodys)) return callback(new Error('Unable to fetch adaptors data. Please contact celigo support'))
    requestOptionsArray = prepareRequestOptions(options, adaptorBodys)
    if(!requestOptionsArray || !_.isArray(requestOptionsArray) || _.isEmpty(requestOptionsArray)) return callback(new Error('Unable to perform operation due to invalid data.Please contact celigo support'))

    async.eachSeries(requestOptionsArray, function(requestOpts, eachCallback) {
      if(requestOpts.body._connectionId === requestOpts.newconnectionId) return eachCallback()
      requestOpts.body._connectionId = requestOpts.newconnectionId
      requestOpts.bearerToken = options.bearerToken
      installerUtils.putAdaptor(requestOpts, function(err, b) {
        if(err) return eachCallback(err)
        return eachCallback()
      })
    }, function(err) {
      if(err) return callback(err)
      return callback()
    })
  })
}

var prepareRequestOptions = function(options, adaptorBodys) {
  var validAdaptorBodys = [],
      requestOptionsArray = []

  validAdaptorBodys = _.filter(adaptorBodys, function(adaptorBody) {
    return adaptorBody._id && adaptorBody.name && options && ((options.staticMapConfig && options.staticMapConfig.validAdaptors && _.isArray(options.staticMapConfig.validAdaptors) && options.staticMapConfig.validAdaptors.indexOf(adaptorBody.name) > -1) || (options.map && options.map.hasOwnProperty(adaptorBody._id)))
  })

  if(!validAdaptorBodys || _.isEmpty(validAdaptorBodys)) return null;
  _.each(validAdaptorBodys, function(adaptorBody) {
    if(options.map.hasOwnProperty(adaptorBody._id)) {
      requestOptionsArray.push({
        'resourceType': adaptorBody.name.indexOf('export') > -1 ? 'exports' : 'imports'
        , 'resourceId': adaptorBody._id
        , 'body' : adaptorBody
        , 'newconnectionId': options.map[adaptorBody._id]
      })
    } else if(options.defaultConenctionValue){
      requestOptionsArray.push({
        'resourceType': adaptorBody.name.indexOf('export') > -1 ? 'exports' : 'imports'
        , 'resourceId': adaptorBody._id
        , 'body' : adaptorBody
        , 'newconnectionId': options.defaultConenctionValue
      })
    }
  })
  return requestOptionsArray
}

var getAllAdaptors = function(options, callback) {
  var requestOptions = {
    'resourcetype': 'exports'
  , 'bearerToken': options.bearerToken
  }
  , adaptorBodys = []
  installerUtils.integratorRestClient(requestOptions, function(err, res, body) {
    if(err) return callback(err)
    if(!body || !_.isArray(body)) return callback(new Error('Unable to fetch export adaptors.Please contact celigo support'))
    adaptorBodys = body
    requestOptions.resourcetype = 'imports'
    installerUtils.integratorRestClient(requestOptions, function(err, res, body) {
      if(err) return callback(err)
      if(!body || !_.isArray(body)) return callback(new Error('Unable to fetch import adaptors.Please contact celigo support'))
      adaptorBodys.push.apply(adaptorBodys, body)
      return callback(null, adaptorBodys)
    })
  })
}

module.exports = genericOperations
