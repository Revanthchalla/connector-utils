'use strict'

var resourceUtils = {}
var installerUtils = require('../installer/installerHelper')
var _ = require('lodash')
var async = require('async')
/*
 * This Class contains utility functions useful in hanlding resources, like, imports,exports,flows, integration
 */

/*
 * Aim : To modify resource (exports/imports/flows). the custom logic (method) to modify adaptor is passed as helper function options
 *   options = {
     resourceType : exports/imports/flows
     , resourceId :
     , bearerToken :
     , updateResourceFunction : a function which performs the main logic of resource modification
   }
 * this methods expects resource type and resource Id. It load the resource, runs the custom logic (updateResourceFunction)
 * and saves the resource.
 *
 */
resourceUtils.loadAndUpdateResource =  function (options, callback) {
  if (!options) {
    installerUtils.logInSplunk('Inside loadAndUpdateResource,function does not has the required params', 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResource function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.resourceType) {
    installerUtils.logInSplunk('Inside loadAndUpdateResource,Options does not contain resourceType.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResource function Options does not contain resourceType. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.bearerToken) {
    installerUtils.logInSplunk('Inside loadAndUpdateResource,Options does not contain bearerToken.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResource function Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.' ))
  } else if (!options.resourceId) {
    installerUtils.logInSplunk('Inside loadAndUpdateResource,Options does not contain resourceID.' + JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResource function Options does not contain resourceId. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.updateResourceFunction || (typeof options.updateResourceFunction !== 'function')) {
    installerUtils.logInSplunk('Inside loadAndUpdateResource,Options does not contain updateResourceFunction.', 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResource function Options does not contain updateResourceFunction. Kindly retry, if issue persists, please contact Celigo Support.'))
  }
  var loadOpts = {
    'bearerToken': options.bearerToken,
    'resourcetype': options.resourceType,
    'id': options.resourceId
  }
  var saveOpts

  if(options.distributed){
    loadOpts.distributed = options.distributed
  }
  // load resource
  installerUtils.integratorRestClient(loadOpts, function (err, res, resource) {
    if (err) {
      installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResource, Error while loading resource #' + options.resourceId + '. Error ' + err.message, 'info')
      return callback(err)
    }

    //update resource, updates should be done in resource reference.
    options.updateResourceFunction(resource, function(err){
      if (err) {
        installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResource, error while executing updateResourceFunction for resource #' + options.resourceId + '. Error ' + err.message, 'info')
        return callback(err)
      }

      saveOpts = {
        'bearerToken': options.bearerToken,
        'resourcetype': options.resourceType,
        'resourceId': options.resourceId,
        'data': resource
      }
      if(options.distributed){
        saveOpts.distributed = options.distributed
      }
      //save resource
      installerUtils.integratorRestClient(saveOpts, function (err, res, resource) {
        if (err) {
          installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResource, Error while saving resource #' + options.resourceId + '. Error ' + err.message, 'info')
          return callback(err)
        }
        return callback()
      })
    })
  })
}

/*
 * Aim : To modify resource (exports/imports/flows). the custom logic (method) to modify adaptor is passed as helper function options
 *   options = {
     resourceType : exports/imports/flows
     , externalIds : []
     , bearerToken :
     , updateResourceFunction : a function which performs the main logic of resource modification
   }
 * this methods expects resource type and resource Id. It load the resource, runs the custom logic (updateResourceFunction)
 * and saves the resource.
 *
 */
resourceUtils.loadAndUpdateResourcesWithExternalId =  function (options, callback) {
  if (!options) {
    installerUtils.logInSplunk('Inside loadAndUpdateResourcesWithExternalId,function does not has the required params', 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.resourceType) {
    installerUtils.logInSplunk('Inside loadAndUpdateResourcesWithExternalId,Options does not contain resourceType.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain resourceType. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.bearerToken) {
    installerUtils.logInSplunk('Inside loadAndUpdateResourcesWithExternalId,Options does not contain bearerToken.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.' ))
  } else if (!options.externalIds) {
    installerUtils.logInSplunk('Inside loadAndUpdateResourcesWithExternalId,Options does not contain externalIds.' + JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain externalIds. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.updateResourceFunction || (typeof options.updateResourceFunction !== 'function')) {
    installerUtils.logInSplunk('Inside loadAndUpdateResourcesWithExternalId,Options does not contain updateResourceFunction.', 'info')
    return callback(new Error('Oops!! something went wrong, loadAndUpdateResourcesWithExternalId function Options does not contain updateResourceFunction. Kindly retry, if issue persists, please contact Celigo Support.'))
  }
  var loadOpts = {
    'bearerToken': options.bearerToken,
    'resourcetype': options.resourceType,
    'externalIds': options.externalIds
  }
  var saveOpts
  var helperResult

  // load resource
  installerUtils.integratorRestClient(loadOpts, function (err, res, resources) {
    if (err) {
      installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResourcesWithExternalId, Error while loading resource #' + options.resourceId + '. Error ' + err.message, 'info')
      return callback(err)
    }
    var resourceArray = []
    if (!_.isArray(resources) && _.isObject(resources)) {
      resourceArray.push(resources)
      resources = resourceArray
    }
    async.eachSeries(resources, function (resource, cbSeries) {
      helperResult = null
      if (resource.externalId && resource._id && options.externalIds.indexOf(resource.externalId) >= 0) {
      // update resource, updates should be done in resource reference.
        options.updateResourceFunction(resource, function (err, response) {
          if (err) {
            installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResourcesWithExternalId, error while executing updateResourceFunction for resource #' + options.resourceId + '. Error ' + err.message, 'info')
            return cbSeries(err)
          }
          helperResult = response
        if (helperResult && helperResult.skipUpdate) {
          return cbSeries()
        }
        saveOpts = {
          'bearerToken': options.bearerToken,
          'resourcetype': options.resourceType,
          'resourceId': resource._id,
          'data': resource
        }

          //save resource
          installerUtils.integratorRestClient(saveOpts, function (err, res, resource) {
            if (err) {
              installerUtils.logInSplunk('Inside resourceUtils.loadAndUpdateResourcesWithExternalId, Error while saving resource #' + options.resourceId + '. Error ' + err.message, 'info')
              return cbSeries(err)
            }
            return cbSeries()
          })
        })
      } else return cbSeries()
    }, function (err) {
      if (err) return callback(err)
      return callback()
    })
  })
}


/*
 * Aim : To add hook to any adaptor
 *      . this method loads the adaptor, make changes to it, and saves the adaptor.
 *   options = {
     , hookName : ex: "postSubmit" as a string
     , hookFunctionName : as string
     , bearerToken
     , resourcetype
     , resourceId
   }
 *
 */
resourceUtils.registerHookToAdaptor = function(options, callback){
  if (!options) {
    installerUtils.logInSplunk('Inside registerHookToAdaptor,function does not has the required params', 'info')
    return callback(new Error('Oops!! something went wrong, registerHookToAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  }
  options.action = resourceUtils.registerHookToAdaptorHelper
  resourceUtils.toggleHookFunctionFromAdaptor(options, callback)
}

/*
 * Aim : To add/remove hook to any adaptor
 *   options = {
     , hookName : ex: "postSubmit" as a string
     , hookFunctionName : as string / only incase of register hook to adaptor
     , bearerToken
     , resourcetype
     , resourceId
   }
 *
 */
resourceUtils.toggleHookFunctionFromAdaptor = function(options, callback){
  options.updateResourceFunction = function(resource, callback){
    var opts = {
      'resource': resource,
      'hookName': options.hookName,
      'hookFunctionName': options.hookFunctionName
    }

    if (!options.action || (typeof options.action !== 'function')) {
      installerUtils.logInSplunk('Inside toggleHookFunctionFromAdaptor,Options does not contain action.', 'info')
      return callback(new Error('Oops!! something went wrong, toggleHookFunctionFromAdaptor,Options does not contain action. Kindly retry, if issue persists, please contact Celigo Support.'))
    }
    options.action(opts, callback)
  }

  resourceUtils.loadAndUpdateResource(options, callback)
}

/*
 * Aim : To add hook to any adaptor. Should be used when u have adaptor body. If u dont have adaptor body, only have adaptor id, then refer resourceUtils.registerHookToAdaptor
 *   options = {
     resource : exports/imports/flows body
     , hookName : ex: "postSubmit" as a string
     , hookFunctionName : as string
   }
 *
 */
resourceUtils.registerHookToAdaptorHelper = function(options, callback){
  if (!options) {
    installerUtils.logInSplunk('Inside registerHookToAdaptor,function does not has the required params', 'info')
    return callback(new Error('Oops!! something went wrong, registerHookToAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.resource) {
    installerUtils.logInSplunk('Inside registerHookToAdaptor,Options does not contain resource body.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, registerHookToAdaptor Options does not resource body. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.hookName) {
    installerUtils.logInSplunk('Inside registerHookToAdaptor,Options does not contain hookName.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, registerHookToAdaptor Options does not contain hookName. Kindly retry, if issue persists, please contact Celigo Support.' ))
  } else if (!options.hookFunctionName) {
    installerUtils.logInSplunk('Inside registerHookToAdaptor,Options does not contain hookFunctionName.'+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong, registerHookToAdaptor Options does not contain hookFunctionName. Kindly retry, if issue persists, please contact Celigo Support.' ))
  }

  if( options.resource.hooks ) {
    if( options.resource.hooks[options.hookName] ) {
      options.resource.hooks[options.hookName].function = options.hookFunctionName
    } else {
      options.resource.hooks[options.hookName] = {
        'function': options.hookFunctionName
      }
    }
  } else{
    options.resource.hooks = {}
    options.resource.hooks[options.hookName] = {
      'function': options.hookFunctionName
    }
  }
  return callback()
}

/*
 * Aim : To remove hook to any adaptor
 *      . this method loads the adaptor, make changes to it, and saves the adaptor.
 *   options = {
     , hookName : ex: "postSubmit" as a string
     , bearerToken
     , resourcetype
     , resourceId
   }
 *
 */
resourceUtils.deRegisterHookFromAdaptor = function(options, callback){
  if (!options) {
    installerUtils.logInSplunk('Inside deRegisterHookFromAdaptor,function does not has the required params', 'info')
    return callback(new Error('Something went wrong!!. deRegisterHookFromAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  }
  options.action = resourceUtils.deRegisterHookFromAdaptorHelper
  resourceUtils.toggleHookFunctionFromAdaptor(options, callback)
}

/*
 * Aim : To remove hook from adaptor. Should be used when adaptor body is available. If adaptor body is not there, refer resourceUtils.deRegisterHookFromAdaptor
 *   options = {
     resource : exports/imports/flows body
     , hookName : ex: "postSubmit" as a string
   }
 *
 */
resourceUtils.deRegisterHookFromAdaptorHelper = function(options, callback){
  if (!options) {
    installerUtils.logInSplunk('Inside deRegisterHookFromAdaptor,function does not has the required params', 'info')
    return callback(new Error('Something went wrong!!. deRegisterHookFromAdaptor function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.resource) {
    installerUtils.logInSplunk('Inside deRegisterHookFromAdaptor,Options does not contain resource body.'+ JSON.stringify(options), 'info')
    return callback(new Error('Something went wrong!!. deRegisterHookFromAdaptor Options does not resource body. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.hookName) {
    installerUtils.logInSplunk('Inside deRegisterHookFromAdaptor,Options does not contain hookName.'+ JSON.stringify(options), 'info')
    return callback(new Error('Something went wrong!!. deRegisterHookFromAdaptor Options does not contain hookName. Kindly retry, if issue persists, please contact Celigo Support.' ))
  }

  if( options.resource.hooks && options.resource.hooks[options.hookName]) {
    options.resource.hooks[options.hookName].function = null
  }
  return callback()
}

/*
 * Options = {
    addMapping : [{"generate":"rate","internalId":false,"immutable":false,"extract":"line_items[*].price"}] // array of new mappings.
    , deleteMapping : ['couponcode'] // array of generate ids
    , listGenerateId : 'item' // if mapping belongs to list, provide generate id of list.
    , resourceId: import adaptor id
    }
 * addMapping : the generate id provided, if exists, then it updates the mapping. Utility need the entire field object.
 * deleteMapping: as there can be just one generate in a mapping, so it is considered as identifier.
 * listGenerateId
 * It makes a call to load the import adaptor, do the mapping changes and updates the adaptor.
 * as mapping exists in import adaptor, so it sets the resourcetype as import.
 */
resourceUtils.modifyMapping = function(options, callback){
  if (!options) {
    return callback(new Error('Something went wrong!! modifyMapping function does not has the required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.resourceId) {
    installerUtils.logInSplunk('Inside modifyMapping,Options does not contain resourceId.'+ JSON.stringify(options), 'info')
    return callback(new Error('Something went wrong!! modifyMapping Options does not contain resourceId. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.addMapping && !options.deleteMapping) {
    installerUtils.logInSplunk('Inside modifyMapping, returning without performing any action. Option does not contain any actionable item.'+ JSON.stringify(options), 'info')
    return callback()
  }

  var modifyMappingHelper = function( importAdaptor, callback){
    var mappingObj = importAdaptor && importAdaptor.netsuite_da ? importAdaptor.netsuite_da.mapping : importAdaptor.mapping
    var addMapping = options.addMapping || []
    var deleteMapping = options.deleteMapping || []
    var field
    var index
    var fieldsArray

    if (!_.isArray(addMapping)) {
      addMapping = [addMapping]
    }

    if (!_.isArray(deleteMapping)) {
      deleteMapping = [deleteMapping]
    }
    if(options.listGenerateId){
      // if mapping belongs to list, find the list based on generate identifier
      mappingObj = mappingObj && _.find(mappingObj.lists, {'generate': options.listGenerateId})
    }
    fieldsArray = mappingObj && mappingObj.fields
    if(!fieldsArray || !_.isArray(fieldsArray)){
      return callback(new Error('Failed to load mapping. Please retry, if issue persists kindly contact Celigo support.'))
    }
    for(var i = 0 ; i < fieldsArray.length; i++){
      field = fieldsArray[i]
      if(deleteMapping.indexOf(field.generate) > -1) {
        fieldsArray.splice(i--, 1)
        continue
      }
      if ((index = _.findIndex(addMapping, {'generate': field.generate})) > -1){
        // if found, then update the existing.
        fieldsArray[i] = addMapping[index]
        addMapping.splice(index, 1)
        continue
      }
    }
    // add the remaining ones
    mappingObj.fields = fieldsArray.concat(addMapping)
    return callback()
  }
  options.updateResourceFunction = modifyMappingHelper
  options.resourceType = 'imports'
  resourceUtils.loadAndUpdateResource(options, callback)
}

/*
  Aim: to get multiple resources of an integration
  Options = {
    bearerToken - token
    resourceTypes - array of resources (ex: ['flows', 'exports'])
 }
 @return - {
    flows: [{},{}],
    exports: [{},{}]
  }
*/
resourceUtils.getDocuments = function (options, callback) {
  if (!options) {
    return callback(new Error('Something went wrong!! getDocuments function doesn\'t have required params. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!options.bearerToken) {
    installerUtils.logInSplunk('Inside getDocuments,Options does not contain bearerToken.' + JSON.stringify(options), 'info')
    return callback(new Error('Something went wrong!! getDocuments Options does not contain bearerToken. Kindly retry, if issue persists, please contact Celigo Support.'))
  } else if (!_.isArray(options.resourceTypes) || _.isEmpty(options.resourceTypes)) {
    installerUtils.logInSplunk('Inside getDocuments, returning without performing any action. Option does not contain any actionable item.' + JSON.stringify(options), 'info')
    return callback()
  }

  var requestOptions = {
    'bearerToken': options.bearerToken
  }
  var response = {}
  async.each(options.resourceTypes, function (resourceType, eachCallback) {
    requestOptions.resourcetype = resourceType
    installerUtils.integratorRestClient(requestOptions, function (err, res, body) {
      if (err) return eachCallback(err)
      if (!body) return eachCallback(new Error('Unable to fetch ' + resourceType + ' in getDocuments, res : ' + JSON.stringify(res)))
      response[resourceType] = body
      return eachCallback()
    })
  }, function (err) {
    if (err) return callback(err)
    return callback(null, response)
  })
}

module.exports = resourceUtils
