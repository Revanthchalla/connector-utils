'use strict'

var operations = {}
, logger = require('winston')
, UtilSettings = require('./setting')
, CONSTS = require('../constants')
, _ = require('lodash')
, async = require('async')
, request = require('request')
, jsonpath = require('jsonpath')
, installerUtils = require('../installer/installerHelper')
, resourceUtils = require('../resourceUtils/resourceUtils')
, settingsUtil = require('./settingsUtil')
, refreshNSMetaDataUtil = require('../nsConnectorUtil/refreshNSMetaDataUtil')


operations.updateSearchLocationFilters = function(paramObject, cb) {
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }

  var setting = new UtilSettings()
    , locationArray = paramObject.newSettings[paramObject.setting]
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
  setting.getSavedSearchId(paramObject, cb)
  var inventorySavedSearchId = paramObject.savedSearchId
    , opts = { bearerToken : options.bearerToken
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
   installerUtils.integratorProxyCall(opts, function(e, r, b) {
     if(e) return cb(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
     b = b[0]||null
     if(!b || !b.statusCode || b.statusCode !== 200) return cb(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
     return setting.setFieldValues(paramObject, cb)
  })
}

/*
* The following method updates multiple saved searches based on the multi-select location setting values.
* 1) It searches for search fields with namimg convention <resource>_<id>_savedSearch_listSavedSearches_inv in the section. Then adds "location is any of" filter to them.
* 2) It searches for kit inventory searches with namimg convention <resource>_<id>_savedSearch_listSavedSearches_kit in the section. Then adds "memberitem.inventorylocation filter" to them.
*/

operations.updateMultipleSavedSearchLocationFilters = function (paramObject, callback) {
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }

  var settingObj = new UtilSettings()
  , invSavedSearchIds = settingObj.getAllInventorySavedSearchIdsInSection(paramObject)
  , kitSavedSearchIds = settingObj.getKitInventorySavedSearchIdsInSection(paramObject)
  , locationArray = paramObject.newSettings[paramObject.setting]
  , opts =
    { bearerToken : paramObject.options.bearerToken
    , connectionId : paramObject.nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
      { requests :[]
      }
    }
  , updateErrors = []

    if(invSavedSearchIds.error) {
      if(invSavedSearchIds.splunkLog) {
        installerUtils.logInSplunk(invSavedSearchIds.splunkLog)
      }
      return callback(new Error(invSavedSearchIds.error))
    }

    if(kitSavedSearchIds.error) {
      if(kitSavedSearchIds.splunkLog) {
        installerUtils.logInSplunk(kitSavedSearchIds.splunkLog)
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

    installerUtils.integratorProxyCall(opts, function(e, r, b) {
      if(e) return callback(new Error('Failed to update saved searches in NetSuite. Error: '+ e.message))
      if(b && _.isArray(b) && b.length > 0) {
        _.each(b, function(responseNode) {
          if(!responseNode || !responseNode.statusCode || responseNode.statusCode !== 200) {
            installerUtils.logInSplunk('Method: updateMultipleSavedSearchLocationFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
            updateErrors.push(responseNode.error)
          }
        })
        if (updateErrors && updateErrors.length > 0) {
          return callback(new Error('Failed to update saved searches in NetSuite. Please contact Celigo Support.'))
        }
        return settingObj.setFieldValues(paramObject, callback)
      } else {
       installerUtils.logInSplunk('Method: updateMultipleSavedSearchLocationFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
       return callback(new Error('Error while updating saved searches in NetSuite. Response from NetSuite is not in valid format. Please contact Celigo Support.'))
      }
   })
}

operations.kitInventoryCalculationPerLocationEnabled = function (paramObject, callback) {
  var Settings = new UtilSettings()
  return Settings.setFieldValues(paramObject, callback)
}

/*
 * Aim: For Product sync section, this method updates 'pricing levels' filters in all the saved searches under the section. It helps to choose the NetSuite price level to be used for exporting the price from NS.
 */
operations.updateSearchPricingFilters = function(paramObject, cb) {
  var pricingSettingValue = _.isObject(paramObject.newSettings[paramObject.setting]) && paramObject.newSettings[paramObject.setting].hasOwnProperty('id') ? paramObject.newSettings[paramObject.setting].id : paramObject.newSettings[paramObject.setting]
  , Settings = new UtilSettings()
  operations.updatePricingSavedSearchWithProvidedFilters(paramObject, pricingSettingValue, function (err) {
    if(err) return cb(err)
    return Settings.setFieldValues(paramObject, cb)
  })
}

operations.updatePricingSavedSearchWithProvidedFilters = function(paramObject, filters, callback) {
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

  var settings = new UtilSettings()
  , savedSearchesToModify = settings.getAllSavedSearchesInSection(paramObject)
  , opts =
    { bearerToken : paramObject.options.bearerToken
    , connectionId : paramObject.nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
      { requests :[]
      }
    }

  if(savedSearchesToModify.error) {
    if(savedSearchesToModify.splunkLog) {
      installerUtils.logInSplunk(savedSearchesToModify.splunkLog)
    }
    return callback(new Error(savedSearchesToModify.error))
  }

   _.each(savedSearchesToModify.results,function(value) {
     if(value) {
       var requestData = { type : 'method'
       , operation : 'updateSearchFilters'
       , config : {
            "searchId": value,
            "filterParam" : filters,
            "filterKey" : "pricing.pricelevel"
          }
       }
       opts.data.requests.push(requestData)
     }
   })

   installerUtils.integratorProxyCall(opts, function(e, r, b) {
     if(e) return callback(new Error('Failed to updated the saved search in NetSuite. Error: '+ e.message))

     if(b && _.isArray(b) && b.length > 0) {
       b = b[0]
       if(b && b.error) {
         // observed in some cases, NS sends error in this format.
         return callback(new Error('Failed to save setting.' + b.error.message))
       }
     } else if(b && b.statusCode && b.statusCode !== 200) {
       installerUtils.logInSplunk('Method: updateSearchPricingFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
       if(b.error && b.error.message) {
         return callback(new Error('Could not update saved search in NetSuite. Error: '+ JSON.stringify(b.error.message)))
       } else {
         return callback(new Error('Could not update saved search in NetSuite.'))
       }
     } else {
       installerUtils.logInSplunk('Method: updateSearchPricingFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
       return callback(new Error('Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.'))
     }
     return callback()
   })
}

/*
 * Aim: For Product sync section, this method updates 'currency' filters in all the saved searches under the section. It helps to choose the NetSuite currency to be used for exporting the price from NS.
 */
operations.updateSearchCurrencyFilters = function(paramObject, cb) {

  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }

  var setting = new UtilSettings()
    , currencySettingValue = _.isObject(paramObject.newSettings[paramObject.setting]) && paramObject.newSettings[paramObject.setting].hasOwnProperty('id') ? paramObject.newSettings[paramObject.setting].id : paramObject.newSettings[paramObject.setting]
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
    , opts = null
    , savedSearchesToModify = setting.getAllSavedSearchesInSection(paramObject)

  if(savedSearchesToModify.error){
    if(savedSearchesToModify.splunkLog){
      installerUtils.logInSplunk(savedSearchesToModify.splunkLog)
    }
    return cb(new Error(savedSearchesToModify.error))
  }

  var opts = { bearerToken : options.bearerToken
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
   _.each(savedSearchesToModify.results,function(value){
     if(value){
       var requestData = { type : 'method'
       , operation : 'updateSearchFilters'
       , config : {
            "searchId": value,
            "filterParam" : currencySettingValue,
            "filterKey" : "pricing.currency"
          }
       }
       opts.data.requests.push(requestData)
     }
   })
   installerUtils.integratorProxyCall(opts, function(e, r, b) {
   if(e) return cb(new Error('Failed to updated the saved search in NetSuite. Error: '+ e.message))

   if(b && _.isArray(b) && b.length > 0){
     b = b[0]
   }else if(b && b.statusCode && b.statusCode !== 200){
     installerUtils.logInSplunk('Method: updateSearchCurrencyFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
     if(b.error && b.error.message){
       return cb(new Error('Could not update saved search in NetSuite. Error: '+ JSON.stringify(b.error.message)))
     }else{
       return cb(new Error('Could not update saved search in NetSuite.'))
     }
   }else{
     installerUtils.logInSplunk('Method: updateSearchCurrencyFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
     return cb(new Error('Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.'))
   }

   return setting.setFieldValues(paramObject, cb)
  })
}

/*
 * Aim: Modify Item export searches (both normal and matrix) to consider parent-sub item setup along with normal and matrix item export.
 *    It is used for both checkbox toggle and updating parentIdentifier. For the case of checkbox toggle, both the searches should be updated.
 *    for the case of variation parent identifier update, only update the matrix search.
 *	Settings Enable:
 *              Item Export Search: Include virtualVariation checkbox filter to be false.
 *              Matrix: the criteria should be Matrix is true OR (virtualVariation is true and should have no parent.
 *	Settings Disable:
 *							Item: remove the virtualVariation filter.
 *							Matirx: the criteria should be only Matrix.
 *  TODO: For the case when both the settings are changed. the call to modify matrix item search is triggered twice. We should restrict it to once. One way is
 *        is to check if both the settings are changed them for text box one (parentIdentifier) return the call without doing anything.
 */
operations.updateItemSearchesTypeFilters = function(paramObject, cb) {
  if(!paramObject){
    return cb (new Error('updateItemSearchesTypeFilters method does not contain proper arguments. Please rety, if issue persists kindly contact Celigo support.'))
  }

  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources && commonresources.netsuiteConnectionId) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly contact Celigo Support.'))
    }
  }

  var setting = new UtilSettings()
    , virtualVariationCheckboxSettingsValue = setting.getSettingsValue(paramObject, 'updateItemSearchesTypeFilters')
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
    , opts
    , savedSearchesToModify = setting.getItemSearches(paramObject)
    , errorMsg
    , requestData
    , virtualVariationIdentifier = setting.getSettingsValue(paramObject, 'variationParentIdentifier')
    , isCheckboxToggle = paramObject.setting.indexOf('updateItemSearchesTypeFilters') >= 0

  if( !savedSearchesToModify){
    return cb(new Error('Something went wrong. Please re-try, if issue persists, kindly contact Celigo Support.'))
  }

  if(savedSearchesToModify.error){
    return cb(new Error(savedSearchesToModify.error))
  }
  savedSearchesToModify = savedSearchesToModify.results

  if (!virtualVariationIdentifier || virtualVariationIdentifier.error || !_.isBoolean(virtualVariationCheckboxSettingsValue) || virtualVariationCheckboxSettingsValue.error){
    if(!virtualVariationIdentifier){
      errorMsg = "Please make sure that the setting 'NetSuite field identifier for variation parent item' has a valid value before you save setting."
    } else if (virtualVariationIdentifier.error){
      errorMsg = virtualVariationIdentifier.error
    } else if(!_.isBoolean(virtualVariationCheckboxSettingsValue)){
      errorMsg = "Please make sure that the setting 'NS has parent sub item relation' has a valid value before you save setting."
    } else if (virtualVariationCheckboxSettingsValue.error){
      errorMsg = virtualVariationCheckboxSettingsValue.error
    }
    return cb(new Error(errorMsg))
  }

  opts = { bearerToken : options.bearerToken
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


   if (isCheckboxToggle || paramObject.modifySingleItemSearch) {
       // on check box toggle, both the saved searches to be modified.
       // for Magento2, we need to update item search always.This function will be called from magento2 settings where we will attach required config in paramObject
       // for this settings, matrix adaptor is provided so otherAdaptorSearch is item Search
     if (savedSearchesToModify.otherAdaptorSearch) {
        // If no search found, throw error
       if (paramObject.modifySingleItemSearch) {
          // Magento 2 handling
          // If checkbox got unchecked, No need to delete columns
         if (virtualVariationCheckboxSettingsValue) {
           if (!paramObject.modifySingleItemSearch.requestData || !paramObject.modifySingleItemSearch.requestData.type || !paramObject.modifySingleItemSearch.requestData.operation || !paramObject.modifySingleItemSearch.requestData.config) {
              // throw error if method/config is missing
             return cb(new Error('Unable to save virtual variation settngs due to invalid options. Please do retry. If the issue persists, kindly contact Celigo support.'))
           }
           requestData = paramObject.modifySingleItemSearch.requestData
           requestData.config.searchId = savedSearchesToModify.otherAdaptorSearch

            // replace hardcoded variationIdentifier label with actual
           if (paramObject.modifySingleItemSearch.variationIdentifierLabelToReplace) {
             requestData.config = JSON.parse(JSON.stringify(requestData.config).replace(paramObject.modifySingleItemSearch.variationIdentifierLabelToReplace, virtualVariationIdentifier))
           }

           opts.data.requests.push(requestData)
         }
       } else {
           // item export search.
         requestData = { type: 'method',
           operation: 'updateSearchFilters',
           config: {
             'searchId': savedSearchesToModify.otherAdaptorSearch,
             'filterParam': virtualVariationCheckboxSettingsValue ? ['F'] : undefined,
             'filterKey': 'custitem_celigo_virtualvariation',
             'comparator': 'is'
           }
         }
         opts.data.requests.push(requestData)
       }
     } else {
       return cb(new Error('NetSuite Search(Item Export Search) is not a valid saved search. Please select a valid value and retry. If the issue persists, kindly contact Celigo support.'))
     }
   }

   if(savedSearchesToModify.sameAdaptorSearch){
     // matrix item export search.
     requestData = { type : 'method'
      , operation : 'updateMatrixSearchWithVirtualVariationFilter'
      , config : {
           "searchId": savedSearchesToModify.sameAdaptorSearch,
           "filterParam" : virtualVariationCheckboxSettingsValue,
           "filterKey" : "custitem_celigo_virtualvariation",
           "virtualVariationIdentifier" : virtualVariationIdentifier
         }
      }
      opts.data.requests.push(requestData)
   } else {
     return cb (new Error( 'NetSuite Search(Matrix Item Export Search) is not a valid saved search. Please select a valid value and retry. If the issue persists, kindly contact Celigo support.'))
   }

   installerUtils.integratorProxyCall(opts, function(err, res, body) {
     var hasError
       , errMsg
     if(err) return cb(new Error('Failed to updated the saved search in NetSuite. Error: '+ err.message))

     if(body && _.isArray(body) && body.length > 0){
       _.each(body, function(bodyObj, bodyIndex){
         hasError = false
         if(bodyObj && bodyObj.statusCode && bodyObj.statusCode !== 200){
           installerUtils.logInSplunk('Method: updateItemSearchesTypeFilters: response body from NS is not in correct format: '+ JSON.stringify(body), 'info')
           hasError = true
           if(bodyObj.error && bodyObj.error.message){
             errMsg = 'Could not update saved search in NetSuite. Error: '+ JSON.stringify(bodyObj.error.message) + '. Please retry, if issue persists, kindly contact Celigo support.'
           }else{
             errMsg = 'Could not update saved search in NetSuite. Please retry, if issue persists, kindly contact Celigo support.'
           }
           return false
         }
       })
       if(hasError){
         return cb (new Error(errMsg))
       }
     }else if(body && body.statusCode && body.statusCode !== 200){
       installerUtils.logInSplunk('Method: updateItemSearchesTypeFilters: response body from NS is not in correct format: '+ JSON.stringify(body), 'info')
       if(body.error && body.error.message){
         return cb(new Error('Could not update saved search in NetSuite. Error: '+ JSON.stringify(body.error.message)))
       }else{
         return cb(new Error('Could not update saved search in NetSuite.'))
       }
     }else{
       installerUtils.logInSplunk('Method: updateItemSearchesTypeFilters: response body from NS is not in correct format: '+ JSON.stringify(body), 'info')
       return cb(new Error('Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.'))
     }

     return setting.setFieldValues(paramObject, cb)
  })
}

operations.actionSlider = function (paramObject, callback) {
  var newSettings = paramObject,
    options = paramObject.options,
    that = this

  if(!paramObject.sliderInput){
    return callback('Unable to identify the flowid for enabling')
  }
  installerUtils.logInSplunk('inside actionSlider marking enable of flow ' + newSettings.flowId)
  //make a call to IO server
  installerUtils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: 'flows'
    , id: newSettings.flowId
  }, function(err, response, body) {
    if (err) {
      //we do not want to stop other setting to save in this case
      //SCIN: 678
      return callback(new Error(`Unable to save the flow. Error: ${err.message || err}. If error persists please contact Celigo support`))
    }
    options.flowBody = body
    that.flowSpecificSliderAction(paramObject, function (err, response, _body) {
      if (err) return callback(err)
      body.disabled = newSettings.disabled
      installerUtils.integratorRestClient({
          bearerToken: options.bearerToken
          , resourcetype: 'flows'
          , id: newSettings.flowId
          , data: body
        }
        , function(err, response, body) {
          if (err) {
            //we do not want to stop other setting to save in this case
            //SCIN: 678
            return callback(new Error(`Unable to save the flow. Error: ${err.message || err}. If error persists please contact Celigo support`))
          }
          //
          return callback()
      })
    })
  })
}

/*
 * While toggling flow ON/OFF switch, if there is any flow specific action, that can be performed here.
 */
operations.flowSpecificSliderAction = function(paramObject, callback) {
  operations.customerDepositFlowsActions(paramObject, function(err){
    if(err) return callback(err)
    return callback()
  })
}

/*
 * While toggling customer deposit flows (Transaction flow and customer deposit flow) ON/OFF switch, handling the registration/de-registration of post submit hooks.
 */
operations.customerDepositFlowsActions = function(paramObject, callback) {
  if( !paramObject || !paramObject.options){
    installerUtils.logInSplunk('Inside customerDepositFlowsActions, invalid arguments: '+ JSON.stringify(options), 'info')
    return callback( new Error('Something went wrong with the data!! customerDepositFlowsActions method has invalid arguments. Kindly retry, if issue persists please contact Celigo Support.'))
  }
  var options = paramObject.options
  if(!options || !options.flowBody || !options.flowBody.name){
    installerUtils.logInSplunk('Inside customerDepositFlowsActions, invalid options: '+ JSON.stringify(options), 'info')
    return callback(new Error('Something went wrong with the data!! customerDepositFlowsActions method has invalid options. Kindly retry, if issue persists please contact Celigo Support.'))
  }

  var isThisTransactionFlow = operations.isTransactionFlow(options.flowBody.name)
  var isThisCustomerDepositFlow = operations.isCustomerDepositFlow(options.flowBody.name)
  var otherFlowId
  var updateImportAdaptorOpts
  var orderFlowsImportIds
  var opts
  //otherFlowId : if current flow is customer deposit, then var holds transction flow id. vice versa.

  if( isThisTransactionFlow || isThisCustomerDepositFlow){
    if ( isThisTransactionFlow ){
      otherFlowId = operations.getCustomerDepositFlowId(options)
    } else {
      otherFlowId = operations.getTransactionFlowId(options)
    }

    //TODO: current logic does not consider if connector has only one of the flows, should be enhanced soon to support that.
    if( !otherFlowId ){
      return callback(new Error('Oops!! something went wrong. Integration does not contain required flow ids. Please contact Celigo Support.'))
    }

    orderFlowsImportIds = operations.getSalesOrderImportId(options)
    if( !orderFlowsImportIds ){
      return callback(new Error('Oops!! something went wrong. Integration does not contain sales order/cash sales order import adaptor ids. Please contact Celigo Support.'))
    }

    if (!_.isArray(orderFlowsImportIds)) {
      orderFlowsImportIds = [orderFlowsImportIds]
    }

    // load the other flow
    installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: 'flows'
      , id: otherFlowId
    }, function(err, response, otherFlowBody) {

      if (err) {
        return callback(err)
      }
      // create the common opts to update import adaptor.
      updateImportAdaptorOpts = {
        'bearerToken': options.bearerToken,
        'resourceType': 'imports',
        'hookName': 'postSubmit'
      }

      // check the status of flow (under settings action) and otherFlow and decide the action.
      if( isThisTransactionFlow ){
        opts = _.cloneDeep(options)
        opts.IsPaymentTransactionCustomRecordRequired = !paramObject.disabled
        operations.setIsPaymentTransactionCustomRecordRequired(opts, function(err){
          if(err) return callback(err)

          if( paramObject.disabled ){
            // Transaction Flow  is turned OFF
            if(otherFlowBody.disabled){
              // if customer deposit flow is OFF, de register Order postSubmit hook
              async.eachOf(orderFlowsImportIds, function (importId, index, cb) {
                updateImportAdaptorOpts.resourceId = importId
                resourceUtils.deRegisterHookFromAdaptor(updateImportAdaptorOpts, function(err){
                  if(err) return cb(err)
                  return cb()
                })
              }, function (err) {
                if(err) return callback(err)
                return callback()
              })
            } else {
              // if customer deposit flow is ON, no action required. IsPaymentTransactionCustomRecordRequired is already set.
              return callback()
            }
          } else {
            if(otherFlowBody.disabled){
              // if customer deposit flow is OFF, register Order postSubmit hook
              async.eachOf(orderFlowsImportIds, function (importId, index, cb) {
                updateImportAdaptorOpts.resourceId = importId
                updateImportAdaptorOpts.hookFunctionName = 'orderImportPostSubmitHook'
                resourceUtils.registerHookToAdaptor(updateImportAdaptorOpts, function(err){
                  if(err) return cb(err)
                  return cb()
                })
              }, function (err) {
                  if(err) return callback(err)
                  return callback()
              })
            } else {
              // if customer deposit flow is ON, register transaction postSubmit hook
              updateImportAdaptorOpts.resourceId = options.flowBody._importId
              updateImportAdaptorOpts.hookFunctionName = 'transactionImportPostSubmitHook'
              resourceUtils.registerHookToAdaptor(updateImportAdaptorOpts, function(err){
                if(err) return callback(err)
                return callback()
              })
            }
          }
        })
      } else {
        opts = _.cloneDeep(options)
        opts.IsPaymentCustomerDepositRequired = !paramObject.disabled
        operations.setIsPaymentCustomerDepositRequired(opts, function(err){
          if(err) return callback(err)
          if( paramObject.disabled ){
            // Customer Deposit Flow  is turned OFF
            if( otherFlowBody.disabled ){
              // if transaction flow is  OFF, then deregister Order postSubmit
              async.eachOf(orderFlowsImportIds, function (importId, index, cb) {
                updateImportAdaptorOpts.resourceId = importId
                resourceUtils.deRegisterHookFromAdaptor(updateImportAdaptorOpts, function(err){
                  if(err) return cb(err)
                  return cb()
                })
              }, function (err) {
                if(err) return callback(err)
                return callback()
              })
            } else {
              // if transaction flow is  ON deregister transaction post submit.
              updateImportAdaptorOpts.resourceId = otherFlowBody._importId
              resourceUtils.deRegisterHookFromAdaptor(updateImportAdaptorOpts, function(err){
                if(err) return callback(err)
                return callback()
              })
            }
          } else {
            if( otherFlowBody.disabled ){
              // if transaction flow is  OFF, then register Order postSubmit
              async.eachOf(orderFlowsImportIds, function (importId, index, cb) {
                updateImportAdaptorOpts.resourceId = importId
                updateImportAdaptorOpts.hookFunctionName = 'orderImportPostSubmitHook'
                resourceUtils.registerHookToAdaptor(updateImportAdaptorOpts, function(err){
                  if(err) return cb(err)
                  return cb()
                })
              }, function (err) {
                  if(err) return callback(err)
                  return callback()
              })
            } else {
              //if transaction flow is  On, register transaction post submit.
              updateImportAdaptorOpts.resourceId = otherFlowBody._importId
              updateImportAdaptorOpts.hookFunctionName = 'transactionImportPostSubmitHook'
              resourceUtils.registerHookToAdaptor(updateImportAdaptorOpts, function(err){
                if(err) return callback(err)
                return callback()
              })
            }
          }
        })
      }
    })
  }else {
    return callback()
  }
}

/*
 * To return customer deposit flow id from storeMap
 */
operations.getCustomerDepositFlowId = function(options) {
  var UtilSettingsObj
  var storeMap
  var flowId = this.getFlowIdFromOptions(options)

  if (options && options.integrationRecord && options.integrationRecord.settings && flowId) {
    UtilSettingsObj = new UtilSettings()
    storeMap = UtilSettingsObj.getStoreMap({
      settings : options.integrationRecord.settings,
      _flowId : flowId
    })
    return storeMap.customerDepositFlowId
  } else {
    installerUtils.logInSplunk('Inside getCustomerDepositFlowId, invalid options: '+ JSON.stringify(options), 'info')
  }
}

/*
 * To return Transaction flow id from storeMap
 */
operations.getTransactionFlowId = function(options) {
  var UtilSettingsObj
  var storeMap
  var flowId = this.getFlowIdFromOptions(options)

  if (options && options.integrationRecord && options.integrationRecord.settings && flowId) {
    UtilSettingsObj = new UtilSettings()
    storeMap = UtilSettingsObj.getStoreMap({
      settings : options.integrationRecord.settings,
      _flowId : flowId
    })
    return storeMap.transactionFlowId
  } else {
    installerUtils.logInSplunk('Inside getTransactionFlowId, invalid options: '+ JSON.stringify(options), 'info')
  }
}

/*
 * To return salesOrder Import adaptor Id  from storeMap
 */
operations.getSalesOrderImportId = function(options) {
  var UtilSettingsObj
  var storeMap
  var flowId = this.getFlowIdFromOptions(options)

  if (options && options.integrationRecord && options.integrationRecord.settings && flowId) {
    UtilSettingsObj = new UtilSettings()
    storeMap = UtilSettingsObj.getStoreMap({
      settings : options.integrationRecord.settings,
      _flowId : flowId
    })
    return storeMap.salesOrderImportId
  } else {
    installerUtils.logInSplunk('Inside getSalesOrderImportId, invalid options: '+ JSON.stringify(options), 'info')
  }
}

/*
 * To get flow id from options
 */
operations.getFlowIdFromOptions = function(options) {
  if (options && options.pending && options.pending.flowId) {
    return options.pending.flowId
  } else if (options && options.pending && options.shopId && options.pending[options.shopId].flowId) {
    return options.pending[options.shopId].flowId
  } else {
    return null
  }
}

/*
 * To set IsPaymentCustomerDepositRequired flag located in storeMap.
 */

operations.setIsPaymentCustomerDepositRequired = function(options, callback){
  var flowId = this.getFlowIdFromOptions(options)

  if( !options || !options.integrationRecord || !options.integrationRecord.settings || !flowId || !options.bearerToken || !options.integrationRecord._id){
    installerUtils.logInSplunk('Inside setIsPaymentCustomerDepositRequired, invalid options: '+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong. setIsPaymentCustomerDepositRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.'))
  }

  var UtilSettingsObj = new UtilSettings()
  var storeMap = UtilSettingsObj.getStoreMap({
    settings : options.integrationRecord.settings,
    _flowId : flowId
  })
  storeMap.isPaymentCustomerDepositRequired = options.IsPaymentCustomerDepositRequired

  // save the integrationRecord
  installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: 'integrations'
      , id: options.integrationRecord._id
      , data: options.integrationRecord
    }, function(err, response, body) {
      if (err) {
        return callback(err)
      }
      return callback()
  })
}

/*
 * To IsPaymentTransactionCustomRecordRequired flag located in storeMap.
 */

operations.setIsPaymentTransactionCustomRecordRequired = function(options, callback){
  var flowId = this.getFlowIdFromOptions(options)

  if( !options || !options.integrationRecord || !options.integrationRecord.settings || !flowId || !options.bearerToken || !options.integrationRecord._id){
    installerUtils.logInSplunk('Inside setIsPaymentTransactionCustomRecordRequired, invalid options: '+ JSON.stringify(options), 'info')
    return callback(new Error('Oops!! something went wrong. setIsPaymentTransactionCustomRecordRequired method contains invalid options. Kinldy retry, if issue persists, please contact Celigo Support.'))
  }

  var UtilSettingsObj = new UtilSettings()
  var storeMap = UtilSettingsObj.getStoreMap({
    settings : options.integrationRecord.settings,
    _flowId : flowId
  })
  storeMap.isPaymentTransactionCustomRecordRequired = options.IsPaymentTransactionCustomRecordRequired

  // save the integrationRecord
  installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: 'integrations'
      , id: options.integrationRecord._id
      , data: options.integrationRecord
    }, function(err, response, body) {
      if (err) {
        return callback(err)
      }
      return callback()
  })
}

/*
 * Purpose: To check if the flow is Transaction Flow. It checks by name of the flow.
 */
operations.isTransactionFlow = function(flowName){
  var TRANSACTION_FLOW_NAME = 'Order Transaction to NetSuite Add'
  var NEW_TRANSACTION_FLOW_NAME = 'order transaction to NetSuite custom transaction record (add)'

  if(flowName) {
    return (flowName.indexOf(TRANSACTION_FLOW_NAME) >= 0 || flowName.indexOf(NEW_TRANSACTION_FLOW_NAME) >= 0)
  }
}

/*
 * Purpose: To check if the flow is Customer Deposit Flow. It checks by name of the flow.
 */
operations.isCustomerDepositFlow = function(flowName){
  var CUSTOMER_DEPOSIT_FLOW_NAME = 'Transaction to NetSuite Customer Deposit Add'
  var NEW_CUSTOMER_DEPOSIT_FLOW_NAME = 'transaction to NetSuite customer deposit (add)'

  if(flowName) {
    return (flowName.indexOf(CUSTOMER_DEPOSIT_FLOW_NAME) >= 0 || flowName.indexOf(NEW_CUSTOMER_DEPOSIT_FLOW_NAME) >= 0)
  }
}

operations.updateAdaptorLookupFilter = function (paramObjects, cb) {
  // update import adaptor and update the lookup field
  var newSettings = paramObjects.newSettings
  var oldSetting = paramObjects.oldSettings
  var settingParams = paramObjects.settingParams
  var setting = paramObjects.setting
  var options = paramObjects.options

  if(!settingParams || !_.isArray(settingParams) || settingParams.length < 3) {
      installerUtils.logInSplunk('Unable to process the request. Missing vital information')
      return cb(new Error('Integration is corrupted. Please contact Celigo for more information'))
  }

  // load distributed adaptor (assuming it to be NS side)
  var requestParam = {
    bearerToken: options.bearerToken,
    resourcetype : 'imports',
    id: settingParams[1],
    distributed : true
  } //TODO remove distributed by checking netsuite_da property

  if (!newSettings[setting] || (typeof newSettings[setting] == 'string' && newSettings[setting].replace(/\s/g, '').indexOf('[]') != -1)) {
    return cb(new Error('Lookup criteria cannot be empty. Please add proper criteria and save it.'))
  }
  installerUtils.integratorRestClient(requestParam, function (err, response, body) {
    if (err) {
      installerUtils.logInSplunk('Failed to load adaptor due to err '+ err.message)
      return cb(new Error('Error connecting to ' + CONSTS.IODOMAIN + ' ' + err.message))
    }

    if(response && response.statusCode !== 200) {
      installerUtils.logInSplunk('Error connecting to ' + CONSTS.IODOMAIN + ' ' + response.statusCode)
      return cb(new Error('Error connecting to ' + CONSTS.IODOMAIN + ' ' + response.statusCode))
    }

    var data = body
    if(data.netsuite_da) {
      data.netsuite_da.internalIdLookup = {
        expression : newSettings[setting]
      }
      delete requestParam.distributed
    } else {
      data.internalIdLookup = {
        expression : JSON.parse(newSettings[setting])
      }
    }
    requestParam.data = data
    installerUtils.integratorRestClient(requestParam, function (err, response, body) {
      if (err) {
      installerUtils.logInSplunk('Failed to save adaptor due to err '+ err.message)
      return cb(new Error('Error connecting to ' + CONSTS.IODOMAIN + ' ' + err.message))
    }

    if(response && response.statusCode !== 200) {
      installerUtils.logInSplunk('Error connecting to ' + CONSTS.IODOMAIN + ' ' + response.statusCode)
      return cb(new Error('Error connecting to ' + CONSTS.IODOMAIN + ' ' + response.statusCode))
    }
    var settingObj = new UtilSettings()
    settingObj.setFieldValues(paramObjects, cb)
    })
  })

  // return cb()
}

operations.toggleNetsuiteExportType = function(paramObject, cb) {
  var oldSettings = paramObject.oldSettings
    , newSettings = paramObject.newSettings
    , settingParams = paramObject.settingParams
    , setting = paramObject.setting
    , options = paramObject.options
    , dateField = settingParams[3] || 'lastmodifieddate'
    //make a call to IO server
  installerUtils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: settingParams[0]
    , id: settingParams[1]
  }, function(err, response, body) {
      if (err) {
        //we do not want to stop other setting to save in this case
        return cb(null)
      }
      if(newSettings[setting]) {
        //delete "type" and "delta" from the export adaptor
        delete body.type
        delete body.delta
      } else {
        //enable delta flow again
        body.type = 'delta'
        body.delta = {
          dateField: dateField
        }
      }
      installerUtils.logInSplunk('setting body ' + JSON.stringify(body))
      installerUtils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
        , id: settingParams[1]
        , data: body
      } , function(err, response, body) {
          if (err) {
            //we do not want to stop other setting to save in this case
            return cb(null)
          }
          oldSettings[setting].value = newSettings[setting]
          return cb(null)
        })
    })
  }

operations.savedSearch = function(paramObject, callback) {
  var newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , options = paramObject.options
  , setting = paramObject.setting
  , settingObj = new UtilSettings()
  , searchId = _.isObject(newSettings[setting]) && newSettings[setting].hasOwnProperty('id') ? newSettings[setting].id : newSettings[setting]
  //Need to use "isRefreshPage" property true, To fetch latest metadata from Mapping after saving the saved search.
  paramObject.options.isRefreshPage = true
  operations.validateLockedSavedSearch(paramObject, searchId, function(err, res) {
    if(err) return callback(err)
    //make a call to IO server
    installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: settingParams[0]
      , id: settingParams[1]
    }, function(err, response, body) {
    if (err) {
      //we do not want to stop other setting to save in this case
      return callback(null)
    }

    if (body && body.netsuite && body.netsuite && body.netsuite.restlet) {
      body.netsuite.restlet.searchId = searchId
    }
    installerUtils.logInSplunk('setting body ' + JSON.stringify(body))
    installerUtils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
        , id: settingParams[1]
        , data: body
      }
      , function(err, response, body) {
        if (err) {
          //we do not want to stop other setting to save in this case
          return callback(null)
        }
        return settingObj.setFieldValues(paramObject, callback)
      })
    })
  })
}

/*
   For SuiteApps, if we modify locked search then we can't push Suite App to respective account. 
   here we are checking before we update the locked search will check search is locked one or not. if yes will throw an error 
*/
operations.validateLockedSavedSearch = function(paramObject, searchId, callback) {
  if(!paramObject.lockedScriptIds || !paramObject.lockedScriptIds.length) return callback()
  var options = paramObject.options
  var commonresources = settingsUtil.getCommonResources(paramObject)
  var filters = JSON.parse(`["internalid","is","${searchId}"]`)
  var searchParams = {
    bearerToken: options.bearerToken,
    methodType: "savedsearch",
    methodName: "run",
    searchConfig: {
      recordType: 'savedsearch',
      filters: filters,
      columns: [{
          "name": "id",
          "label": "scriptId",
          "sort": true
      }]
    }
  }
  refreshNSMetaDataUtil.executeNsOperation({
    options: searchParams,
    nsConnectionId: commonresources.netsuiteConnectionId
  }, function(err, response) {
    if(err) return callback(null)
    var err = null
    if(response && response.length && response[0].scriptId && paramObject.lockedScriptIds.indexOf(response[0].scriptId) > -1) {
      err = 'You’ve selected a locked saved search. Please select another saved search and try again.'
    }
    return callback(err ? new Error(err): null)
  })
}

operations.setStartDateOnDeltaBasedExports = function (paramObject, callback) {
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , oldDate = oldSettings[setting].value
  , newDate = newSettings[setting]
  // TODO validate all settings
  var opts =
    { bearerToken : options.bearerToken
    , resourcetype : settingParams[0]  //'exports'
    , id : settingParams[1] //_exportId
    }
  installerUtils.integratorRestClient(opts, function(err, response, body) {
      if (err || !body) return callback(null)
      if(!body.delta) {
        body.delta = {}
        body.delta['startDate'] = newDate
      }
      else {
        body.delta['startDate'] = newDate
      }
      opts.data = body
      installerUtils.logInSplunk('setting body ' + JSON.stringify(body))
      installerUtils.integratorRestClient(opts, function(err, response, body) {
        if (err) return callback(null)
        oldSettings[setting].value = newSettings[setting]
        return callback(null)
      })
    })
}

operations.savedSearchAllExports = function(paramObject, callback) {
  var oldSettings = paramObject.oldSettings
    , newSettings = paramObject.newSettings
    , settingParams = paramObject.settingParams
    , options = paramObject.options
    , setting = paramObject.setting
    , settingObj = new UtilSettings()

  var exportAdaptors = []

  exportAdaptors.push(settingParams[1])

  for (var i = 4; i < settingParams.length; i++) {
    exportAdaptors.push(settingParams[i])
  }

   var requestheaders = {
    bearerToken: options.bearerToken
    , resourcetype: settingParams[0]
  }
  installerUtils.integratorRestClient(requestheaders, function(err, response, body) {
    if (err) {
      //we do not want to stop other setting to save in this case
      return callback(null)
    }
    //log response
    var eAdaptors =[];
    for(var i =0; i<body.length; i++){
      var eInd = exportAdaptors.indexOf(body[i]._id)
      if(eInd === -1){
        continue;
      }
      eAdaptors.push(body[i])
      exportAdaptors.splice(eInd,1)

      if(exportAdaptors.length < 1){
        break;
      }
    }

    async.each(eAdaptors, function(adaptor, cb){
      var requestheaders = {
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
      }

      if (adaptor && adaptor.netsuite && adaptor.netsuite && adaptor.netsuite.restlet) {
         adaptor.netsuite.restlet.searchId = _.isObject(newSettings[setting]) && newSettings[setting].hasOwnProperty('id') ? newSettings[setting].id : newSettings[setting]
        }

        installerUtils.logInSplunk('setting a body ' + JSON.stringify(adaptor))
        requestheaders.data = adaptor
        installerUtils.integratorRestClient(requestheaders,cb)

    },function(err, response, body){
      if(err){
        return callback(null)
      }
      return settingObj.setFieldValues(paramObject, callback)
    })
  })
}
/**
* @param paramObject
* @param cb is the callback function
*/
operations.updateSearchSalesOrderStatusFilters = function(paramObject, cb) {
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }
  var setting = new UtilSettings()
    , orderStatus = []
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId

  //fetching saved auto-billing saved search id
  if(paramObject.settingParams && paramObject.settingParams.length < 4)
    setting.getSavedSearchId(paramObject, cb)
  else{
      paramObject.settingsMethodName = "savedSearchAllExports"
      setting.getMultiExportSavedSearchId(paramObject, cb)
  }
  orderStatus.push(paramObject.newSettings[paramObject.setting])
  var autoBillingSavedSearchId = paramObject.savedSearchId
    , opts = { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
    { requests :
      [
        { type : 'method'
        , operation : 'updateSearchSalesOrderStatusFilters'
        , config : {
             "searchId": autoBillingSavedSearchId,
             "status" : orderStatus
           }
        }
      ]
    }
   }
   installerUtils.integratorProxyCall(opts, function(e, r, b) {
   if(e) return cb(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
   b = b[0]||null
   if(!b || !b.statusCode || b.statusCode !== 200) return cb(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
   //saving changed setting value in integration
   return setting.setFieldValues(paramObject, cb)
  })
}

operations.setDefaultCustomerIdForAllOrders = function(paramObject, callback) {

  installerUtils.logInSplunk('setDefaultCustomerIdForAllOrders, paramObject is', JSON.stringify(paramObject))
  var defaultCustomerInternalId = Number(paramObject.newSettings[paramObject.setting])
  , settingParams = paramObject.settingParams
  , commonResources = settingsUtil.getCommonResources(paramObject)

  if(!commonResources) return callback(new Error('common resources are missing in Connector integration.'))
  if(!commonResources.netsuiteConnectionId) return callback(new Error('netsuiteConnectionId is missing in settings data.'))

  validateCustomerInternalId(defaultCustomerInternalId, paramObject, commonResources, function(err) {
    if(err) return callback(err)

    //fetching order import adaptor
    var options = paramObject.options
    , optsData =
      { bearerToken : options.bearerToken
      , resourcetype : 'imports'
      , id : settingParams[1] //orderImportAdaptorId
      , distributed : true
      }

    installerUtils.integratorRestClient(optsData, function(err, res, body) {
      if(err) return callback(new Error('Failed to load Order Import Adaptor, ' + err.message + '. Please contact Celigo support.'))
      //updating order import adaptor mapping
      updateImportAdaptorMapping(body, 'entity', 'netSuiteCustomerId', defaultCustomerInternalId)
      installerUtils.logInSplunk('setDefaultCustomerIdForAllOrders | updated order import adaptor is : ', JSON.stringify(body))
      //saving updated order import adaptor to Integrator.io
      var requestData =
        { bearerToken : options.bearerToken
        , resourcetype : 'imports'
        , _id : options.orderImportAdaptorId
        , data : body
        , distributed : body.netsuite_da ? false : true
        }
        , setting = new UtilSettings()

      installerUtils.integratorRestClient(requestData, function(err, res, body) {
        if(err) return callback(new Error('Failed to update the Order mapping for Customer# ' +  defaultCustomerInternalId + ', ' + err.message + '. Please contact Celigo support.'))
        if(res.statusCode !== 200) return callback(new Error('Failed to update the Order mapping for Customer# ' +  defaultCustomerInternalId + ', status code while trying to update mappings : ' + res.statusCode + '. Please contact Celigo support.'))
        paramObject.options.isRefreshPage = true
        return setting.setFieldValues(paramObject, callback)
      })
    })
  })
}

operations.setDefaultCustomerId = function(paramObject, callback) {

  installerUtils.logInSplunk('setDefaultCustomerId, paramObject is', JSON.stringify(paramObject))
  var defaultCustomerInternalId
  if (paramObject.handleMultipleCustomers === true) {
    defaultCustomerInternalId = paramObject.newSettings[paramObject.setting]
  }
  else {
    defaultCustomerInternalId = Number(paramObject.newSettings[paramObject.setting])
  }
  var commonResources = settingsUtil.getCommonResources(paramObject)

  if(!commonResources) return callback(new Error('common resources are missing in Connector integration.'))
  if(!commonResources.netsuiteConnectionId) return callback(new Error('netsuiteConnectionId is missing in settings data.'))

  validateCustomerInternalId(defaultCustomerInternalId, paramObject, commonResources, function(err) {
    if(err) return callback(err)

    var setting = new UtilSettings()
    return setting.setFieldValues(paramObject, callback)
  })
}

operations.invokeOnDemandOrderImport = function(paramObject, callback) {
  logger.debug('invokeOnDemandOrderImport, paramObject : ' + JSON.stringify(paramObject))
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , orderAckFlowIdString = settingParams[3] || 'orderAckFlowId'
  , onDemandOrderImportFlowIdString = settingParams[4] || 'onDemandOrderImportFlowId'

  var settingObj = new UtilSettings()

  if(!newSettings[setting] && !!oldSettings[setting].value) return settingObj.setFieldValues(paramObject, callback)

  var autoAcknowledgeOnDemandOrdersField = 'exports_' + exportId + '_autoAcknowledgeOnDemandOrders'
  , autoAcknowledgeOnDemandOrders = false

  logger.info('invokeOnDemandOrderImport, autoAcknowledgeOnDemandOrdersField', autoAcknowledgeOnDemandOrdersField)

  if(newSettings.hasOwnProperty(autoAcknowledgeOnDemandOrdersField)) {
    logger.info('invokeOnDemandOrderImport, reading autoAcknowledgeOnDemandOrdersField value from newSettings')
    autoAcknowledgeOnDemandOrders = newSettings[autoAcknowledgeOnDemandOrdersField]
  } else if(oldSettings.hasOwnProperty(autoAcknowledgeOnDemandOrdersField)) {
    logger.info('invokeOnDemandOrderImport, reading autoAcknowledgeOnDemandOrdersField value from oldSettings')
    autoAcknowledgeOnDemandOrders = oldSettings[autoAcknowledgeOnDemandOrdersField].value
  }

  checkAutoAckValueAndCheckFlowEnabled(autoAcknowledgeOnDemandOrders, exportId, options, orderAckFlowIdString, function(err) {
    if(err) return callback(err)

    var onDemandOrderIds = newSettings[setting].split(',')
    // To process inputs in the form of "123, 124, 11,12,, 142-111-ABC"
    _.each(onDemandOrderIds, function (orderId, index) {
      onDemandOrderIds[index] = orderId.trim()
      if(!orderId) {
        delete onDemandOrderIds[index]
        return
      }
    })

    onDemandOrderIds = _.compact(onDemandOrderIds) //To remove the deleted entries
    onDemandOrderIds = _.uniq(onDemandOrderIds) //To remove duplicates

    if(onDemandOrderIds.length < 1) {
      oldSettings[setting].value = newSettings[setting]
      return callback()
    }

    var values = [autoAcknowledgeOnDemandOrders , onDemandOrderIds]
    var paths = ['$.wrapper.configuration.autoAcknowledgeOnDemandOrders', '$.wrapper.configuration.onDemandOrderIds']
    logger.info('invokeOnDemandOrderImport, values : ' + values)
    settingObj.updateResource('exports', exportId, paths, values, options.bearerToken, function (err) {
      if(err) return callback(err)
      var commonResources = settingObj.getStoreMap({
        settings : options.integrationRecord.settings,
        _exportId : exportId
      })
      var onDemandOrderImportFlowId = commonResources[onDemandOrderImportFlowIdString]
      var requestOptions =
        { uri : CONSTS.HERCULES_BASE_URL + '/v1/flows/' + onDemandOrderImportFlowId + '/run'
        , method : 'POST'
        , auth : { bearer : options.bearerToken }
        , json : true
        }
      logger.debug('invokeOnDemandOrderImport, flow invocation requestOptions : ' + JSON.stringify(requestOptions))
      request(requestOptions, function (e, r, b) {
        if(e) return callback(e)
        logger.debug('invokeOnDemandOrderImport, flow invocation response' + JSON.stringify(r))
        var message = null
        try {
          message = b.errors[0].message
        } catch(ex) {
          message = ''
        }

        if(r.statusCode !== 200) return callback(new Error('Cannot invoke the on demand order flow because : ' + message))

        if(!!paramObject.options && !!paramObject.options.pending) {
          if(paramObject.options.hasOwnProperty('shopId')) paramObject.options.pending[options.shopId][setting] = null
          else paramObject.options.pending[setting] = null
        }
        logger.debug('invokeOnDemandOrderImport, paramObject.options before returning callback', JSON.stringify(paramObject.options))
        return callback()
      })
    })
  })
}

operations.selectDateFilterForOrders = function(paramObject, callback) {
  logger.debug('selectDateFilterForOrders, paramObject: ' + JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , deltaDays = 'exports_' + exportId + '_setDeltaDays'
  , settingObj = new UtilSettings()
  , dateFilterObject = {
      OrderCreatedDate: 'dateCreated'
    , OrderLastModifiedDate: 'lastModified'
  }

  if(newSettings[setting] === dateFilterObject.OrderCreatedDate && !options.pending[options.shopId][deltaDays] && !newSettings.hasOwnProperty(deltaDays)) {
    return callback(new Error('Please enter duration in days to use Creation Time filter.'))
  }
  else if(!newSettings.hasOwnProperty(deltaDays)) {
    var lagOffset = options.pending[options.shopId][deltaDays] * 24 * 60 * 60 * 1000 * -1
    //Update relative uri to change date filter from lastmodified to createddate and viceversa
    updateRelativeURIForDeltaExportOrders({
      resourceType: 'exports'
    , resourceId: exportId
    , bearerToken: options.bearerToken
    , dateFilter: newSettings[setting]
    , createdDateFilterLabel: settingParams[3]
    , lastmodifiedDateFilterLabel: settingParams[4]
    , lagOffset: lagOffset
   }, function (err) {
      if(err) return callback(err)
      else return settingObj.setFieldValues(paramObject, callback)
    })
  } else {
    return settingObj.setFieldValues(paramObject, callback)
  }
}

//Updates lagoffset on the date filter for orders
operations.setDeltaDays = function(paramObject, callback) {
  logger.debug('setDeltaDays, paramObject: ' + JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , deltaDays = newSettings[setting]
  , dateFilter = getDatefilterLabel(options.pending[options.shopId])
  , settingObj = new UtilSettings()
  , dateFilterObject = {
      OrderCreatedDate: 'dateCreated'
    , OrderLastModifiedDate: 'lastModified'
  }
  , dateFilterSettingParams = dateFilter.split('_')

  if(!newSettings[setting] && options.pending[options.shopId][dateFilter] === dateFilterObject.OrderCreatedDate) {
    return callback(new Error('Please enter duration in days to use Creation Time filter.'))
  }
  else if(!newSettings[setting] && options.pending[options.shopId][dateFilter] === dateFilterObject.OrderLastModifiedDate) {
    //Update relative uri with lagOffset 0
    updateRelativeURIForDeltaExportOrders({
       resourceType: 'exports'
     , resourceId: exportId
     , lagOffset: 0
     , dateFilter: options.pending[options.shopId][dateFilter]
     , createdDateFilterLabel: dateFilterSettingParams[3]
     , lastmodifiedDateFilterLabel: dateFilterSettingParams[4]
     , bearerToken: options.bearerToken
    }, function (err) {
      if(err) return callback(err)
      return settingObj.setFieldValues(paramObject, callback)
    })
  }
  else {
    validateDeltaDays(deltaDays, function(err) {
      if(err) return callback(err)
      var lagOffset = Number(deltaDays) * 24 * 60 * 60 * 1000 * -1 //milliseconds
      //Update relative uri with lagOffset value
      updateRelativeURIForDeltaExportOrders({
         resourceType: 'exports'
       , resourceId: exportId
       , lagOffset: lagOffset
       , dateFilter: options.pending[options.shopId][dateFilter]
       , createdDateFilterLabel: dateFilterSettingParams[3]
       , lastmodifiedDateFilterLabel: dateFilterSettingParams[4]
       , bearerToken: options.bearerToken
      }, function (err) {
        if(err) return callback(err)
        return settingObj.setFieldValues(paramObject, callback)
      })
    })
  }
}

//Checkbox to add internalIdLookups in Import adaptors. Dependent on orderImportLookupFilter
operations.orderAdvancedLookupEnabled = function(paramObject, callback) {
  logger.debug('orderAdvancedLookupEnabled, paramObject: ' + JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , importId = settingParams[1]
  , settingObj = new UtilSettings()
  , orderImportLookupFilter = 'imports_' + importId + '_orderImportLookupFilter'

  if (!newSettings[orderImportLookupFilter]) {
    updateImportLookups({
       resourceType: 'imports'
     , resourceId: importId
     , orderAdvancedLookupEnabled: newSettings[setting]
     , orderImportLookupFilter: options.hasOwnProperty('shopId') ? options.pending[options.shopId][orderImportLookupFilter] : options.pending[orderImportLookupFilter]
     , bearerToken: options.bearerToken
    }, function (err) {
      if(err) return callback(err)
      paramObject.options.isRefreshPage = true
      return settingObj.setFieldValues(paramObject, callback)
    })
  } else {
    return settingObj.setFieldValues(paramObject, callback)
  }
}

//Updates internalIdLookup for Import adaptors. Dependent on orderAdvancedLookupEnabled.
operations.orderImportLookupFilter = function (paramObject, callback) {
  logger.debug('orderImportLookupFilter, paramObject: ' + JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , importId = settingParams[1]
  , settingObj = new UtilSettings()
  , orderAdvancedLookupEnabled = 'imports_' + importId + '_orderAdvancedLookupEnabled'

  updateImportLookups({
     resourceType: 'imports'
   , resourceId: importId
   , orderAdvancedLookupEnabled: options.hasOwnProperty('shopId') ? options.pending[options.shopId][orderAdvancedLookupEnabled] : options.pending[orderAdvancedLookupEnabled]
   , orderImportLookupFilter: newSettings[setting]
   , bearerToken: options.bearerToken
  }, function (err) {
    if(err) return callback(err)
    paramObject.options.isRefreshPage = true
    return settingObj.setFieldValues(paramObject, callback)
  })
}

operations.updateDistributedRecord = function(fieldsToValuesMap, paramObject, callback){
  logger.info('logName=updateDistributedRecord, updating the distributed record with field values :  ', fieldsToValuesMap)
  var options = paramObject.options
  var settingParams = paramObject.settingParams
  var resourceType = settingParams[0]
  var exportId = settingParams[1]
  var settingsObj = new UtilSettings()

  var reqParams = {
    'bearerToken': options.bearerToken,
    'resourcetype': resourceType,
    'id': exportId,
    'distributed': true
  }

  installerUtils.integratorRestClient(reqParams, function(error, response, body){

    if(error){
      installerUtils.logInSplunk('Error in fetching distributed record with Id: ' + exportId + ', Error Message: ', error.message)
      return callback(new Error('Error in fetching distributed record. Please contact Celigo support.'))
    }
    var distributedRecord = body

    if(!distributedRecord){
      installerUtils.logInSplunk('Invalid distributed record with Id: ' + exportId)
      return callback(new Error('Invalid distributed record. Please contact Celigo support.'))
    }

    _.each(fieldsToValuesMap, function(value, settingKey){
      distributedRecord[settingKey] = value
    })
    reqParams['data'] = distributedRecord

    installerUtils.integratorRestClient(reqParams, function(err, res, resBody){

      if(err){
        installerUtils.logInSplunk('Error in updating distributed record with Id: ' + exportId + ', Error Message: ' + err.message)
        return callback(new Error('Error in updating distributed record. Please contact Celigo support.'))
      }
      return settingsObj.setFieldValues(paramObject, callback)
    })
  })
}

 // Save advanced settings in distributed record's settings
operations.saveAdvancedSettingsToNSDistributed = function(paramObject, callback){
   logger.info('logName=saveAdvancedSettingsToNSDistributed, Saving advanced settings')
   var skipSettings = ["executionContext", "executionType", "qualifier"]
   var options = paramObject.options
   var settingParams = paramObject.settingParams
   var resourceType = settingParams[0]
   var exportId = settingParams[1]
   var settingsObj = new UtilSettings()

   var reqParams = {
     'bearerToken': options.bearerToken,
     'resourcetype': resourceType,
     'id': exportId,
     'distributed': true
   }
   installerUtils.integratorRestClient(reqParams, function(error, response, body){
     if (error) {
       installerUtils.logInSplunk('Error in fetching distributed record with Id: ' + exportId + ', Error Message: ', error.message)
       return callback(new Error('Error in fetching distributed record. Please contact Celigo support.'))
     }
     var distributedRecord = body
     if (!distributedRecord) {
       installerUtils.logInSplunk('Invalid distributed record with Id: ' + exportId)
       return callback(new Error('Invalid distributed record. Please contact Celigo support.'))
     }
     var fieldsToValuesMap = {}
     fieldsToValuesMap['settings'] = distributedRecord['settings'] || {}
     logger.info('logName=saveAdvancedSettingsToNSDistributed, newSettings ' + JSON.stringify(paramObject.newSettings))
     _.each(paramObject.newSettings, function(value, settingKey){
       var settingName = settingKey.split('_')[2]
       if (skipSettings.indexOf(settingName) === -1) {
         fieldsToValuesMap['settings'][settingName] = value
       }
     })
     operations.updateDistributedRecord(fieldsToValuesMap, paramObject, callback)
   })
  }

operations.saveFlowSettingsToNSDistributed = function(paramObject, callback){
   logger.info('logName=saveFlowSettingsToNSDistributed, Saving flow level settings')
   var skipSettings = ["nsCreate", "nsUpdate"]
   var options = paramObject.options
   var fieldsToValuesMap = {}
   _.each(paramObject.newSettings, function(value, settingKey){
     var settingName = settingKey.split('_')[2]
     if (settingName === 'qualifier' && value && value.trim()) {
       try {
         value = JSON.parse(value)
       } catch (ex) {
         return callback(new Error('Failed to parse qualifier value. ErrorCode# ' + ex.code + ' | ErrorMessage# ' + ex.message))
       }
     }
     if (skipSettings.indexOf(settingName) === -1) {
       fieldsToValuesMap[settingName] = value
     }
   })
   operations.updateDistributedRecord(fieldsToValuesMap, paramObject, callback)

  }

operations.setAccountName = function(paramObject, callback) {
  logger.debug('setAccountName, paramObject: ' + JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  var settingParams = paramObject.settingParams
  var setting = paramObject.setting
  var options = paramObject.options
  var accountId = settingParams[1]
  var settingObj = new UtilSettings()
  var storeMap = options.integrationRecord.settings.storemap
  var addOnMap = options.integrationRecord.settings.addOnMap
  var sections = options.integrationRecord.settings.sections
  //Add connection name to this array, if connector can support updating connections.
  //We'll update connections, if integration name contains elements of this array
  , editableConnections = ['amazon']

  try{
    validateAccountName(paramObject, function(err, res) {
      if(err) return callback(err)

      var store = _.find(storeMap, function(eachStore, index) {
        return eachStore.accountid === accountId || eachStore.shopid === accountId //shopid for shopify connector
      }) || null

      , section = _.find(sections, function(eachSection, index) {
        return eachSection.id === accountId
      }) || null

      if(!store || !section) return callback(new Error('Cannot find store or section with the account id# ' + accountId))
      var flowsToUpdate = store.flows
      var savedSearchesToUpdate = store.savedSearches ? store.savedSearches : store.savedSeaches
      var addOnforStoreAvailable = addOnMap && addOnMap[accountId]
      
      if (addOnforStoreAvailable) {
        _.each(addOnforStoreAvailable, function (addOnResources, addOnId) {
           flowsToUpdate = _.compact(_.uniq(flowsToUpdate.concat(addOnResources.flows)))
           savedSearchesToUpdate = _.compact(_.uniq(savedSearchesToUpdate.concat(addOnResources.savedSearches)))       
        })
      }
      var oldAccountName = store.accountname ? store.accountname : store.shopname //shopname for shopify connector
      , newAccountName = newSettings[setting]
      operations.updateWithAccountName({
        flowsToUpdate: flowsToUpdate,
        savedSearchesToUpdate: savedSearchesToUpdate,
        store: store,
        oldAccountName: oldAccountName,
        newAccountName: newAccountName,
        bearerToken: options.bearerToken,
        section: section,
        integrationRecord: options.integrationRecord,
        editableConnections: editableConnections
      }, function (err) {
        if(err) {
          logger.info('updateWithAccountName | err message: ' + err.message)
        }
        paramObject.options.isRefreshPage = true
        return settingObj.setFieldValues(paramObject, callback)
      })
    })
  } catch(ex) {
    return callback(new Error('Failed to update Account Name. ErrorCode# ' + ex.code + ' | ErrorMessage# ' + ex.message))
  }
}

operations.updateWithAccountName = function (options, callback) {
  var errorMessage = ''
  updateFlowName({
    flows: options.flowsToUpdate,
    oldAccountName: options.oldAccountName,
    newAccountName: options.newAccountName,
    bearerToken: options.bearerToken
  }, function(err, resp) {
    if(err) {
      errorMessage = err.message + '\n'
    }
    updateIntegration(options.store, options.section, {
      newAccountName: options.newAccountName,
      bearerToken: options.bearerToken,
      integrationRecord: options.integrationRecord
    }, function(err, resp) {
      if(err) {
        errorMessage += err.message + '\n'
      }

      updateSavedSearchTitle({
        //TODO: savedSearches Array not present for Shopify connector
        savedSearches: options.savedSearchesToUpdate, //savedSeaches is for Amazon, eBay
        oldAccountName: options.oldAccountName,
        newAccountName: options.newAccountName,
        netsuiteConnectionId: options.integrationRecord.settings.commonresources.netsuiteConnectionId,
        bearerToken: options.bearerToken
      }, function(err, resp) {
        if(err) {
          errorMessage += err.message + '\n'
        }

        updateNetSuiteRecord({
          accountId: options.store.accountid ? options.store.accountid : options.store.shopid,
          newAccountName: options.newAccountName,
          netsuiteConnectionId: options.integrationRecord.settings.commonresources.netsuiteConnectionId,
          bearerToken: options.bearerToken,
          connectorName: options.integrationRecord.name
        },
          function(err, resp) {
          if(err) {
            errorMessage += err.message + '\n'
          }

          var shouldUpdateConnection = _.find(options.editableConnections, function(connection) {
            if(options.integrationRecord.name.toLowerCase().indexOf(connection) > -1) {
              return true
            }
          }) || false

          if(!shouldUpdateConnection) {
            if(errorMessage) {
              logger.info('Error | updateWithAccountName, errorMessage: ', errorMessage)
              return callback(new Error('Error while updating account name. ErrorMessage# ' + errorMessage))
            }
            return callback()
          }
          updateConnectionName({
            store: options.store,
            bearerToken: options.bearerToken,
            oldAccountName: options.oldAccountName,
            newAccountName: options.newAccountName
          }, function(err, resp) {
            if(err) {
              errorMessage += err.message + '\n'
            }

            if(errorMessage) {
              logger.info('Error | updateWithAccountName, errorMessage: ', errorMessage)
              return callback(new Error('Error while updating account name. ErrorMessage# ' + errorMessage))
            }

            return callback()
          })
        })
      })
    })
  })
}

/*
 * Purpose: To validate the item's internal id provided by user. If it is required to use some property of item (like name internal, sku, upc etc)
 *          then, pass "updateSettingValue" true as paramObject.options.updateSettingValue. It loads the item from NS and then replaces that value
 *          in the newSettings. so setting is saved as the desired property.
 *          paramObject.options.updateSettingValue : boolean field
            paramObject.options.skuExtractKey = 'sku'
 */
operations.validateItemInternalId = function(paramObject, callback) {

  installerUtils.logInSplunk('validateItemInternalId, paramObject is', JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , setting = paramObject.setting
  , settingObj = new UtilSettings()
  , importAdaptorId

  if(newSettings[setting] === "") {
    return settingObj.setFieldValues(paramObject, callback)
  }

  var itemInternalId = Number(newSettings[setting])
  if(_.isNaN(itemInternalId)) return callback(new Error('Please enter a valid item Internal Id.'))

  var options = paramObject.options
  if(options.updateSettingValue){
    // We ask customer to input internal id of item but based on item id lookup, we will update the item property(ex: item id) on setting. So that
    // it can be directly used to add the extra line item.
    importAdaptorId = paramObject.settingParams[1]
    if(!importAdaptorId) {
      return callback(new Error('Could not find required resource to update the settings value. Please contact Celigo support.'))
    }
    installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: paramObject.settingParams[0]
      , id: importAdaptorId
    }, function(err, res, body){
      if(err || !body){
        return callback(new Error('Failed to load required resource to update the settings value.' + err && err.message+ '. Please retry, if issue persists, kindly contact Celigo support.'))
      }
      // read the lookup name for item lookup.
      var lookupName = body.netsuite_da ? body.netsuite_da.mapping : body.mapping
      lookupName = lookupName && lookupName.lists
      lookupName = lookupName && _.isArray(lookupName) && _.find(lookupName, {'generate': 'item'})
      lookupName = lookupName && _.isArray(lookupName.fields) && _.find(lookupName.fields, {'generate': 'item'})
      lookupName = lookupName && lookupName.lookupName
      if(!lookupName) {
        installerUtils.logInSplunk('Import #' + importAdaptorId + ', missing lookupname in '+ JSON.stringify(body), 'info')
        return callback(new Error('Could not find required lookupname to update the settings value. Please contact Celigo support.'))
      }
      // load the item lookup to find the sku matched property of item
      var requiredLookup = body.netsuite_da ? body.netsuite_da.lookups : body.lookups
      requiredLookup = requiredLookup && _.find(requiredLookup, {'name' : lookupName})
      if(!requiredLookup || !requiredLookup.expression) {
        installerUtils.logInSplunk('Import #' + importAdaptorId + ', missing lookup #' + lookupName + ' in '+ JSON.stringify(body), 'info')
        return callback(new Error('Could not find required lookup to update the settings value. Please contact Celigo support.'))
      }
      try{
        requiredLookup = JSON.parse(requiredLookup.expression)
        if(_.isArray(requiredLookup[0])){
          //TODO: there could be cases of further nested arrays.
          // expression is array of array
          // IO uses both 2 and 3 curly braces, so just taking the string (sku) and checking if it is present in any of the expression.
          requiredLookup = _.find(requiredLookup, function(expression){
            if(_.isArray(expression) && _.find(expression, function(str){
              if(str.indexOf(options.skuExtractKey) >= 0){
                return true
              }
            })){
              return true
            }
          })
          requiredLookup = requiredLookup[0]
        } else {
          // single expression
          // discuss if we need to check the expression with sku. reason to have this: as there is just single expression, then frist element is desired property key.
          requiredLookup = requiredLookup[0]
        }
      } catch(ex){
        installerUtils.logInSplunk('Import #' + importAdaptorId + ', missing lookup #' + lookupName + ' in '+ JSON.stringify(body) + '. exception '+ ex.message, 'info')
        return callback(new Error('Failed to find the required lookup to update the settings value. Please contact Celigo support.'))
      }

      var searchOpts = {
        lookupKey : requiredLookup,
        itemInternalId: itemInternalId
      }
      return operations.searchRecordInNSandSaveSetting(paramObject,searchOpts, callback )
    })
  } else {
    return operations.searchRecordInNSandSaveSetting(paramObject,{itemInternalId:itemInternalId}, callback )
  }
}

/*
 * Helper function to validateItemInternalId
 * Purpose: Searches item record from NS based on internal id. DO basic validation, if required replace the newSettings with desired property
 */
operations.searchRecordInNSandSaveSetting = function(paramObject, searchOpts, callback){
  var itemInternalId = searchOpts.itemInternalId
  var commonResources = settingsUtil.getCommonResources(paramObject)
  if(!commonResources) return callback(new Error('common resources are missing in Connector integration.'))
  if(!commonResources.netsuiteConnectionId) return callback(new Error('netsuiteConnectionId is missing in settings data.'))

  var nsConnectionId = commonResources.netsuiteConnectionId
  var updateSettingValue = 'UPDATE_VALUE'
  var settingObj = new UtilSettings()
  var options = paramObject.options
    , opts =
      { bearerToken : options.bearerToken
      , connectionId : nsConnectionId
      , method : 'POST'
      , scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
      , deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
      , data :
      { requests :
        [
          { type : 'savedsearch'
            , operation : 'run'
            , config : {
                "recordType" : "item",
                "filters" : [["internalid","anyof", itemInternalId]] ,
                "columns" : [{"name":"internalId", "label": "id"}]
              }
            }
          ]
        }
      }
  if(options.updateSettingValue && searchOpts.lookupKey){
    opts.data.requests[0].config.columns.push({"name":searchOpts.lookupKey, "label": updateSettingValue})
  }

  installerUtils.integratorProxyCall(opts, function(e, r, b) {
    if(e) return callback(new Error('Failed to get information from NetSuite for Item# ' + itemInternalId + ', ' + e.message + '. Please contact Celigo support.'))
    if(!r || !(r.statusCode === 200 || r.statusCode === 201)) return callback(new Error('Failed to get information from NetSuite for Item# ' + itemInternalId + ', status Code while connecting to NetSuite : ' + r.statusCode + '. Please contact Celigo support.'))
    b = b && b[0] || null

    //No existing item found on NS with id as itemInternalId
    if(!b || !b.results || !b.results.length || b.results.length < 1) return callback(new Error('Please enter a valid item Internal Id. Item with Internal Id# ' + itemInternalId + ' not found in NetSuite.'))
    if(options.updateSettingValue){
      paramObject.newSettings[paramObject.setting] = b.results[0][updateSettingValue]
      // this will update the value on UI.
      paramObject.options.pending[paramObject.setting] = b.results[0][updateSettingValue]
    }
    return settingObj.setFieldValues(paramObject, callback)
  })
}
/*
 * This function should be called from connector settings file. It needs some connector specific info, that should be passed.
 * Info required from connector:
    paramObject.promocodeExtract = 'discount_codes_1.code' // extract value for promocode
    paramObject.couponExtract = 'discount_codes_1.code' // extract value for coupon code
    paramObject.totalDiscountExtract = total discount node.
 * link to design doc: https://docs.google.com/document/d/1cSd4U-AyXGIbtEcdaE-p0kXrltv5uW0m-zAVBP_lCXo/edit
 * this method is called for both, single select drop down change and dependent cart level setting change.
 * connector specific setting function should be registered in connector settings file.
 */

operations.updateCartLevelDiscountMapping = function (paramObject, callback) {
  var settingParams = paramObject.settingParams
  var setting = paramObject.setting
  var settingObj = new UtilSettings()
  var pendingObject = settingObj.getPendingSettingsObject(paramObject)
  var settingValue = _.isObject(paramObject.newSettings[setting]) && paramObject.newSettings[setting].hasOwnProperty('id') ? paramObject.newSettings[setting].id : paramObject.newSettings[setting]
  var deleteMapping = []
  var defaultDiscountItem
  var defaultDiscountItemSetting
  var cartDiscountsetting
  var opts = {}
  var addMapping = {
    'generate': 'promocode',
    'internalId': false,
    'immutable': false
  }

  opts.resourceId = settingParams[1]
  if (pendingObject.error) {
    return callback(new Error(pendingObject.error))
  }
  pendingObject = pendingObject.results

  if (!paramObject.totalDiscountExtract) {
    return callback(new Error('Please provide total discount extract information.'))
  }
  if (setting.indexOf('orderCartDiscount') > -1) {
    if (settingValue === 'PROMOCODE') {
      if (!paramObject.promocodeExtract) {
        return callback(new Error('Please provide promocode extract information.'))
      }
      addMapping.extract = paramObject.promocodeExtract
      deleteMapping.push('couponcode', 'discountitem', 'discountrate')
    } else if (settingValue === 'COUPON') {
      if (!paramObject.couponExtract) {
        return callback(new Error('Please provide coupon code extract information.'))
      }
      addMapping.extract = paramObject.couponExtract
      addMapping.generate = 'couponcode'
      deleteMapping.push('promocode', 'discountitem', 'discountrate')
    } else if (settingValue === 'DISCOUNT') {
      defaultDiscountItemSetting = _.cloneDeep(settingParams)
      defaultDiscountItemSetting[2] = 'defaultDiscountItem_listDiscountItems'
      defaultDiscountItemSetting = defaultDiscountItemSetting.join('_')
      defaultDiscountItem = _.isObject(pendingObject[defaultDiscountItemSetting]) ? pendingObject[defaultDiscountItemSetting].id : pendingObject[defaultDiscountItemSetting]
      if (!defaultDiscountItem) {
        return callback(new Error('Please select default discount item to track Shopify cart discounts.'))
      }
      addMapping = {
        'generate': 'discountitem',
        'hardCodedValue': defaultDiscountItem,
        'internalId': true,
        'immutable': false
      }
      deleteMapping.push('couponcode', 'promocode')
    } else if (!settingValue) {
      // no setting is selected, remove all the mappings.
      addMapping = undefined
      deleteMapping.push('promocode', 'discountitem', 'discountitem', 'discountrate')
    }
  } else {
    // cart defaultDiscountItem setting change.
    cartDiscountsetting = _.cloneDeep(settingParams)
    cartDiscountsetting[2] = 'orderCartDiscount'
    cartDiscountsetting.splice(3, 1)
    cartDiscountsetting = cartDiscountsetting.join('_')
    if (pendingObject[cartDiscountsetting] !== 'DISCOUNT') {
      return settingObj.setFieldValues(paramObject, callback)
    }
    addMapping = {
      'generate': 'discountitem',
      'hardCodedValue': settingValue,
      'internalId': true,
      'immutable': false
    }
    deleteMapping.push('couponcode', 'promocode')
  }
  // when Overriding promocode and coupon code discount rate. enable below commented if condition. and remove 'discountrate' from "deleteMapping" for promocode and coupon code.
  // in order to keep mininal changes required when switching b/w this and that, keeping the below block here. instead of merging it with above.
  //if (!(setting.indexOf('orderCartDiscount') > -1 && !settingValue)) {
  if(setting.indexOf('orderCartDiscount') > -1 && settingValue === 'DISCOUNT'){
    addMapping = [addMapping]
    addMapping.push({
      'generate': 'discountrate',
      'extract': paramObject.totalDiscountExtract,
      'internalId': false,
      'immutable': false
    })
  }

  opts.addMapping = addMapping
  opts.deleteMapping = deleteMapping
  opts.bearerToken = paramObject.options && paramObject.options.bearerToken
  resourceUtils.modifyMapping(opts, function (err) {
    if (err) return callback(err)
    paramObject.options.isRefreshPage = true
    return settingObj.setFieldValues(paramObject, callback)
  })
}

/*
 * This function should be called from connector settings file. It needs some connector specific info, that should be passed.
 * Info required from connector:
     paramObject.priceGenerateKey = 'rate' // it changes  connector wise. some uses 'rate', 'amount'
     paramObject.discountedExtractExpression = '{{subtract $.line_items[*].price $.line_items[*].total_discount}}'
     paramObject.defaultExtractExpression = 'line_items[*].price'
     paramObject.itemPriceField = '$.line_items[*].price'
     paramObject.discountPriceField = '$.line_items[*].total_discount'
 * link to design doc: https://docs.google.com/document/d/1cSd4U-AyXGIbtEcdaE-p0kXrltv5uW0m-zAVBP_lCXo/edit
 * Either provide the entire discountedExtractExpression or if it add operation then, provide the fields(item price and discounts) string ($.line_items[*].price)
 * connector specific setting function should be registered in connector settings file.
 */

// TODO minimize import adaptor calls when all 3 settings got saved
operations.updateLineLevelDiscountMapping = function (paramObject, callback) {
  var settingParams = paramObject.settingParams
  var setting = paramObject.setting
  var settingObj = new UtilSettings()
  var defaultDiscountItem
  var defaultDiscountItemSetting
  var opts = {}
  var pendingObject = settingObj.getPendingSettingsObject(paramObject)
  var settingValue = paramObject.newSettings[setting]
  var addMapping = {
    'generate': paramObject.priceGenerateKey,
    'internalId': false,
    'immutable': false
  }

  opts.listGenerateId = 'item'
  opts.resourceId = settingParams[1]
  if (pendingObject.error) {
    return callback(new Error(pendingObject.error))
  }
  pendingObject = pendingObject.results

  if (settingValue === 'ADJUSTED_PRICE') {
    if (!paramObject.priceGenerateKey || !(paramObject.discountedExtractExpression || (paramObject.itemPriceField && paramObject.discountPriceField))) {
      // development error.
      return callback(new Error('Please provide additional information required to create mapping.'))
    }
    if (paramObject.discountedExtractExpression) {
      addMapping.extract = paramObject.discountedExtractExpression
    } else {
      addMapping.extract = '{{add ' + paramObject.itemPriceField + ' ' + paramObject.discountPriceField + '}}'
    }
  } else if (settingValue === 'NEW_LINE') {
    defaultDiscountItemSetting = _.cloneDeep(settingParams)
    defaultDiscountItemSetting[2] = 'defaultLineDiscountItem_listDiscountItems'
    defaultDiscountItemSetting = defaultDiscountItemSetting.join('_')
    defaultDiscountItem = _.isObject(pendingObject[defaultDiscountItemSetting]) ? pendingObject[defaultDiscountItemSetting].id : pendingObject[defaultDiscountItemSetting]
    if (!defaultDiscountItem) {
      return callback(new Error('Please select default discount item to track Shopify line discounts.'))
    }
    if (!paramObject.priceGenerateKey || !paramObject.defaultExtractExpression) {
      // development error.
      return callback(new Error('Please provide additional information required to create mapping.'))
    }
    addMapping.extract = paramObject.defaultExtractExpression
  } else if (!settingValue) {
    // no setting is selected or NEW_LINE, make the  price mapping as default.
    if (!paramObject.priceGenerateKey || !paramObject.defaultExtractExpression) {
      // development error.
      return callback(new Error('Please provide additional information required to create mapping.'))
    }
    addMapping.extract = paramObject.defaultExtractExpression
  }
  opts.addMapping = addMapping
  opts.bearerToken = paramObject.options && paramObject.options.bearerToken
  resourceUtils.modifyMapping(opts, function (err) {
    if (err) return callback(err)
    paramObject.options.isRefreshPage = true
    return settingObj.setFieldValues(paramObject, callback)
  })
}

operations.validateTaxPercentage = function(paramObject, callback) {
  logger.debug('validateTaxPercentage, paramObject : ' + JSON.stringify(paramObject))
  var oldSettings = paramObject.oldSettings
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var numberFormat = new RegExp('^[0-9]{1,2}(?:\.[0-9]{1,2})?$|^$')
  var settingObj = new UtilSettings()

  if(!newSettings[setting] && !!oldSettings[setting].value) return settingObj.setFieldValues(paramObject, callback)

    var newSettingsValue = newSettings[setting]

    if(!numberFormat.test(newSettingsValue) || (newSettingsValue <= 0 || newSettingsValue > 100)) {
      return callback(new Error('Please enter positive numeric value within 1-100 having maximum of 2 decimals.'))
    }

    settingObj.setFieldValues(paramObject, callback)
}

/*
  Aim: to handle virtual variations via saved search column approach
  Note: this method should not be called directly. Input paramObject should have virtualVariationIdentifierSettingKey,virtualVariationCheckboxSettingKey in additonal to regular fields.
*/
operations.handleSingleSearchVirtualVariations = function (paramObject, callback) {
  var newSettings = paramObject.newSettings
  var settingParams = paramObject.settingParams
  var options = paramObject.options
  var setting = paramObject.setting
  var exportId = settingParams[1]
  var virtualVariationIdentifierSetting = 'exports_' + exportId + paramObject.virtualVariationIdentifierSettingKey
  var virtualVariationCheckboxSetting = 'exports_' + exportId +  paramObject.virtualVariationCheckboxSettingKey
  var commonResources = options && options.integrationRecord && options.integrationRecord.settings && options.integrationRecord.settings.commonresources
  var pending = options.pending[options.shopId] || options.pending
  var settingObj = new UtilSettings()
  var savedSearches = settingObj.getAllSavedSearchesInSection(paramObject)

  if (!savedSearches || savedSearches.error || !_.isArray(savedSearches.results) || savedSearches.results.length !== 1) {
    return callback(new Error('Unable to get savedSearch value in Integration. Kindly contact Celigo Support.'))
  }

  if (!commonResources || !commonResources.netsuiteConnectionId) {
    return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly contact Celigo Support.'))
  }

  // if checkbox got disabled no need to modify item search
  if (!pending[virtualVariationCheckboxSetting]) {
    return settingObj.setFieldValues(paramObject, callback)
  }

  // if both got modified, No need to update search twice
  if (newSettings.hasOwnProperty(virtualVariationIdentifierSetting) && newSettings.hasOwnProperty(virtualVariationCheckboxSetting) && (setting === virtualVariationCheckboxSetting)) {
    return settingObj.setFieldValues(paramObject, callback)
  }

  var opts = {
    bearerToken : options.bearerToken
    , method : 'POST'
    , connectionId: commonResources.netsuiteConnectionId
    , scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data: {
      requests: [{
        type: 'method',
        operation: 'modifySearch',
        config: {
          searchId: savedSearches.results[0],
          columns: [{name: 'custitem_celigo_virtualvariation', label: 'Virtual Variation'}, {name: pending[virtualVariationIdentifierSetting], label: 'Virtual Variation Parent'}]
        }
      }]
    }
  }

  installerUtils.integratorProxyCall(opts, function (err, r, b) {
    if (err) return callback(err)
    b = (b && b[0]) || null
    if (!b || !b.statusCode || b.statusCode !== 200) {
      if (b && b.error && b.error.message) return callback(new Error(b.error.message))
      return callback(new Error('Failed to update virtual variation settings. Please retry, if error persists, contact Celigo Support'))
    } else if (b && b.statusCode === 200) {
      return settingObj.setFieldValues(paramObject, callback)
    }
    installerUtils.logInSplunk('Inside modifyItemSearchColumns, Unable to save virtual variation settings. Response recieved: ' + JSON.stringify(r), 'info')
    return callback(new Error('Error while performing operation. Please contact Celigo Support.'))
  })
}


/**
 * Aim: To handle order import with default SKU provided by customer if SKU don't present in NS or other system.
 * Thing required from connector side in paramObject.requestOptions:
 * {
 *    importIds: array of import ids of what all import adaptor need to be updated,
 *    implementedSettings: How many settings using this function. In case of Shopify, 2 and for others by default 1.
 *    revert: true/false // this is also for connector with multiple settings when to revert. if 2 settings then revert when both are empty.
 *
 * }
 */
operations.handleDefaultSkuInOrderImport = function (paramObject, callback) {
  var settingObj = new UtilSettings()
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var implementedSettings = paramObject && paramObject.requestOptions && paramObject.requestOptions.implementedSettings || 1
  paramObject.handleOnlyItemValidation = true
  operations.validateItemInternalId(paramObject, function (err){
    if (err) {
      return callback(err)
    }
    var importIds = paramObject && paramObject.requestOptions && paramObject.requestOptions.importIds
    if (_.isEmpty(importIds)) {
      return callback()
    }
    var handleImportUpdate = function (adaptor, cbf) {
      var lookupName = adaptor.netsuite_da ? adaptor.netsuite_da.mapping : adaptor.mapping
      lookupName = lookupName && lookupName.lists
      lookupName = lookupName && _.isArray(lookupName) && _.find(lookupName, {'generate': 'item'})
      lookupName = lookupName && _.isArray(lookupName.fields) && _.find(lookupName.fields, {'generate': 'item'})
      lookupName = lookupName && lookupName.lookupName
      if(!lookupName) {
        installerUtils.logInSplunk('Import #' + adaptor._id + ', missing lookupname in '+ JSON.stringify(adaptor), 'info')
        return cbf(new Error('Can not set default item. Look up not found in item list mappings in order/cashsale order import flow. Please configure lookup for Items: Item field. If this doesn\'t work then please contact Celigo support.'))
      }

      // load the item lookup to find the sku matched property of item
      var requiredLookup = adaptor.netsuite_da ? adaptor.netsuite_da.lookups : adaptor.lookups
      requiredLookup = requiredLookup && _.find(requiredLookup, {'name' : lookupName})
      if(!requiredLookup) {
        installerUtils.logInSplunk('Import #' + adaptor._id + ', missing lookup #' + lookupName + ' in '+ JSON.stringify(adaptor), 'info')
        return cbf(new Error('Can not set default item. Look up not found in item list mappings in order/cashsale order import flow. Please configure lookup for Items: Item field. If this doesn\'t work then please contact Celigo support.'))
      }
      if (newSettings[setting]) {
        requiredLookup.allowFailures = true
        requiredLookup.default = null
      } else {
        if (implementedSettings === 1 || paramObject.requestOptions.revert) {
          requiredLookup.allowFailures = false
          delete requiredLookup.default
        }
      }
      return cbf()
    }
    var options = {
      resourceType: 'imports',
      bearerToken: paramObject.options.bearerToken,
      updateResourceFunction: handleImportUpdate
    }
    async.eachSeries(importIds, function(importId, cb) {
      options.resourceId = importId
      resourceUtils.loadAndUpdateResource(options, function (err) {
        if (err) {
          return cb(err)
        }
        paramObject.options.isRefreshPage=true
        return settingObj.setFieldValues(paramObject, cb)
      })
    }, function(err) {
      if (err) {
        return callback(err)
      }
      return callback()
    })
  })
}

/**
 * Aim: To validate field id is present in NS or not.
 * Input required for this function is only paramObject.recordType to check field id via saved search.
 */
operations.validateFieldId = function(paramObject, callback) {
  installerUtils.logInSplunk('validateItemInternalId, paramObject is', JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  , setting = paramObject.setting
  , settingObj = new UtilSettings()
  if(newSettings[setting] === "") {
    return settingObj.setFieldValues(paramObject, callback)
  }
  var fieldId = newSettings[setting]
  if(_.isNaN(fieldId)) return callback(new Error('Please enter a valid NetSuite field id.'))

  var options = paramObject.options
  var commonResources = settingsUtil.getCommonResources(paramObject)
  if(!commonResources) return callback(new Error('common resources are missing in Connector integration.'))
  if(!commonResources.netsuiteConnectionId) return callback(new Error('netsuiteConnectionId is missing in settings data.'))

  var nsConnectionId = commonResources.netsuiteConnectionId
  var settingObj = new UtilSettings()
  var options = paramObject.options,
    opts = {
      bearerToken: options.bearerToken,
      connectionId: nsConnectionId,
      method: 'POST',
      scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID,
      deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID,
      data: {
        requests: [{
          type: 'savedsearch',
          operation: 'run',
          config: {
            "recordType": paramObject.recordType || 'item',
            "filters": [
              [fieldId, "anyof", '0000']
            ]
          }
        }]
      }
    }

  installerUtils.integratorProxyCall(opts, function(e, r, b) {
    if(e) return callback(new Error('Failed to get information from NetSuite for field id' + fieldId + ', ' + e.message + '. Please contact Celigo support.'))
    if(!r || !(r.statusCode === 200 || r.statusCode === 201)) return callback(new Error('Invalid Field Id. Please enter valid field Id.'))

    b = b && b[0] || null
    if(b && b.error && b.error.code === 'SSS_INVALID_SRCH_FILTER') return callback(new Error('Please enter a valid item field Id. Field with field Id# ' + fieldId + ' not found in NetSuite.'))

    return callback()
  })
}

/**
 * Aim: To validate column id is present in NS or not.
 * Input required for this function is only paramObject.recordType to check field id via saved search.
 */

operations.validateNSColumnName = function (paramObject, callback) {
  installerUtils.logInSplunk('validateNSColumnName, paramObject is', JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var settingObj = new UtilSettings()
  var columnId = newSettings[setting]
  if (columnId === "") {
    return settingObj.setFieldValues(paramObject, callback)
  }
  if (!paramObject.recordType) return callback(new Error('Record type not found.'))

  var options = paramObject.options
  var commonResources = settingsUtil.getCommonResources(paramObject)
  if (!commonResources) return callback(new Error('common resources are missing in Connector integration.'))
  if (!commonResources.netsuiteConnectionId) return callback(new Error('netsuiteConnectionId is missing in settings data.'))

  var nsConnectionId = commonResources.netsuiteConnectionId
  var opts = {
    bearerToken: options.bearerToken,
    connectionId: nsConnectionId,
    method: 'POST',
    scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID,
    deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID,
    data: {
      requests: [{
        type: 'savedsearch',
        operation: 'run',
        config: {
          "recordType": paramObject.recordType,
          "filters": [["internalid", "anyof", '00']],
          "columns": [{"name": columnId, "label": "id"}]
        }
      }]
    }
  }

  installerUtils.integratorProxyCall(opts, function (e, r, b) {
    if (e) return callback(new Error('Failed to get information from NetSuite for column id' + columnId + ', ' + e.message + '. Please contact Celigo support.'))
    if (!r || !(r.statusCode === 200 || r.statusCode === 201)) return callback(new Error('Invalid column Id. Please enter valid column Id.'))
    b = b && b[0] || null
    if (b && b.error && b.error.code === 'SSS_INVALID_SRCH_COL') return callback(new Error('Validation failed, ' + columnId + ' is not a valid search column for record ' + paramObject.recordType + '\nPlease enter a valid search column for ' + paramObject.recordType + ' record. \nRefer to SuiteScript Records Browser in NetSuite help center for more information.'))
    return callback()
  })
}

/**
 * Aim: To update NetSuite field id on multiple places such as imports adaptor lookup/internalidlookup expression and saved searches columns.
 * Input required from connectors in paramObject.requestOptions:
 * {
 *   'import/export adaptor name': [{
 *      “type”: “lookup/internalidlookup/savedsearch”,
 *      “generateList” : ‘item’ //for sub mapping
 *      “generate”: “specify mapping generate part from where we can identify lookup name”, // empty in case of internalid lookup
 *      “extract”: “specify field which we will search in expression to find NS field id // only for internalidlookups or for lookups if mapping does not contain extract part”,
 *      “join”: “specify NS record which will be used as join such as customrecord.nameinternal”,
 *      “columnLabel” : “provide column label if type is saved search”,
 *      “default”: “formulatext in case of nameinternal or itemid we use in saved searches”
 *    }, {}, {}]
 * }
 */
operations.setDefaultSkuFields = function (paramObject, callback) {
  var that = this
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var settingObj = new UtilSettings()
  paramObject.filteredImports = []
  paramObject.filteredExports = []
  paramObject.storeMap = settingObj.getStoreMap(paramObject.options, paramObject.settingParams)
  paramObject.commonResources = settingsUtil.getCommonResources(paramObject)
  if(newSettings[setting] === "") {
    return callback(new Error('Please enter NetSuite SKU field id.'))
  }
  that.validateFieldId(paramObject, function (err) {
    if (err) {
      return callback(err)
    }
    async.series([
      function (cbSeries) { // filter imports
        if (!_.includes(paramObject.resources, 'imports')) {
          return cbSeries()
        }
        paramObject.resource = 'imports'
        filterResourcesForSetting(paramObject, function (err, res) {
          if (err) return cbSeries(err)
          paramObject.filteredImports = res
          return cbSeries()
        })
      },
      function (cbSeries) { // filter exports
        if (!_.includes(paramObject.resources, 'exports')) {
          return cbSeries()
        }

        paramObject.resource = 'exports'
        filterResourcesForSetting(paramObject, function (err, res) {
          if (err) return cbSeries(err)
          paramObject.filteredExports = res
          return cbSeries()
        })
      },
      function (cbSeries) { // processing lookup and internalIdLookups
        updateImportAdaptorDefaultSKU(paramObject, cbSeries)
      },
      function (cbSeries) { // processing savedSearches
        updateSavedSearchesDefaultSKU(paramObject, cbSeries)
      }
    ], function (err) {
      if (err) {
        return callback(err)
      }
      paramObject.options.isRefreshPage = true
      return settingObj.setFieldValues(paramObject, callback)
    })
  })
}

/*
  AMZNS-847
  Aim: to allocate different NS connections to different flows
*/

operations.changeDocumentConnections = function (paramObject, callback) {
  var settingObj = new UtilSettings()
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var oldSettings = paramObject.oldSettings
  var commonResources = settingsUtil.getCommonResources(paramObject)
  var options = paramObject.options
  var offlineConnections = []
  var newValues = newSettings[setting]
  var allValues = []
  var modifiedValues = []
  var requestOpts

  if (!options || !options.bearerToken || !commonResources || !commonResources.netsuiteConnectionId || !commonResources.secondaryNetSuiteConnectionId) {
    return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly contact Celigo Support.'))
  }

  // get all the required documents (exports, imports, connections)
  resourceUtils.getDocuments({bearerToken: options.bearerToken, resourceTypes: ['exports', 'imports', 'connections']}, function (err, response) {
    if (err) return callback(err)

    if (!response || !response.exports || !response.imports || !response.connections) {
      return callback(new Error("Unable to get the documents for the integration. Please retry, if issue persists, kindly contact Celigo support."))
    }

    // check whether connections are offline or not
    offlineConnections = _.filter(response.connections, {offline: true, type: 'netsuite'})

    if (offlineConnections.length > 0) {
      return callback(new Error('Flows can not be updated. One or more NetSuite connections are offline. Please retry after authorizing the NetSuite connection(s).'))
    }

    // check whether both connection contain same NS id.
    var accountIds = _.compact(_.uniq(_.map(response.connections, function(connection){return connection && connection.netsuite && connection.netsuite.account})))

    if (accountIds.length !== 1) {
      return callback(new Error('Flows can not be updated. Both the NetSuite connections(primary and secondary) should be linked to same NetSuite Account. Ensure NetSuite Account is same in both the connections and retry. Contact Celigo support if error persists.'))
    }

    try {
      _.each(newValues, function(value) {
        modifiedValues.push.apply(modifiedValues, JSON.parse(value))
      })

      _.each(oldSettings[setting].options, function (option) {
        if (option && option[0]) allValues.push.apply(allValues, JSON.parse(option && option[0]))
      })
    } catch (ex) {
      logger.info("inside changeDocumentConnections | exception occured while processing the setting values. Exception: " + ex ? ex.message: ex)
      return callback(new Error("Recieved dependent documents in invalid format. Please retry after refershing the setting, if issue persists, kindly contact Celigo support."))
    }

    if (_.isEmpty(allValues)) return callback(new Error('Unable to find the dependent documents. Please retry after refershing the setting, if issue persists, kindly contact Celigo support.'))

    requestOpts = {
      bearerToken: options.bearerToken
    }

    // need to check all values because if there is any error in updating any one of the doc, we can't revert back
    async.each(allValues, function (value, eachCallback) {
      var resource = value.split('_') &&  value.split('_')[0]
      var id = value.split('_') && value.split('_')[1]

      if (!id || !resource) {
        return eachCallback(new Error("Recieved invalid format for the dependents. Please retry after refershing the setting, if issue persists, kindly contact Celigo support."))
      }

      // find the existingDoc to update/discard
      var existingDoc = _.find(response[resource], {_id: id})

      if (!existingDoc) return eachCallback(new Error('Recieved invalid format for the dependents. Please retry after refershing the setting, if issue persists, kindly contact Celigo support.'))

      // check whether newModels are having secondary connection or not. If yes, don't update else update the adaptor with secondaryNetSuiteConnection
      if (_.includes(modifiedValues, value)) {
        if (existingDoc._connectionId === commonResources.secondaryNetSuiteConnectionId) return eachCallback()
        else {
          existingDoc._connectionId = commonResources.secondaryNetSuiteConnectionId
          requestOpts.resourcetype = resource
          requestOpts.data = existingDoc
          installerUtils.integratorRestClient(requestOpts, function (err, res, body) {
            if (err) return eachCallback(err)
            return eachCallback()
          })
        }
      } else if (existingDoc._connectionId === commonResources.netsuiteConnectionId) {
        // check whether existingDoc is holding primary connectionId or not. If yes, ignore else update the doc.
        return eachCallback()
      } else {
        existingDoc._connectionId = commonResources.netsuiteConnectionId
        requestOpts.resourcetype = resource
        requestOpts.data = existingDoc
        installerUtils.integratorRestClient(requestOpts, function (err, res, body) {
          if (err) return eachCallback(err)
          return eachCallback()
        })
      }
    }, function (err) {
      if (err) return callback(err)
      paramObject.options.isRefreshPage = true
      return settingObj.setFieldValues(paramObject, callback)
    })
  })
}
// AMZMCFNS-23: getting the locations available from NetSuite
operations.setTransactionLocationForImport = function (paramObject, callback) {
  var settingObj = new UtilSettings()
  var newSettings = paramObject.newSettings
  var settingParams = paramObject.settingParams
  var setting = paramObject.setting
  var options = paramObject.options
  var value = newSettings[setting].id
  var orderImportFlowId = settingParams[1]
  updateLocation({
    resourceType: 'imports',
    resourceId: orderImportFlowId,
    value: value,
    bearerToken: options.bearerToken
  },function (error) {
    if (error) callback(error)
    return settingObj.setFieldValues(paramObject, callback)
  })
}
/** This function is called from 'getfulfillmentLocation' function, Here we are getting all valid locations from NetSuite Account
 * @param {*} options eg - { resourceType: 'imports', resourceId: orderImportFlowId, value: value, bearerToken: options.bearerToken}
 */
var updateLocation = function (options, callback) {
  installerUtils.getAdaptor({
    resourceType: options.resourceType,
    resourceId: options.resourceId,
    bearerToken: options.bearerToken
  }, function (error ,body) {
    if (error) callback (error)
    try {
      if(!body || !body.netsuite_da || !body.netsuite_da.mapping || !body.netsuite_da.mapping.fields) {
        return callback(new Error('Import adaptor=' + options.resourceId + ' is corrupted. Please contact Celigo Support.'))
      }
      var locationBodyMappingIndex = _.findIndex(body.netsuite_da.mapping.fields, {"generate": "location"})
      var itemMapping = _.find(body.netsuite_da.mapping.lists, {"generate": "item"})
      if(!itemMapping) {
        return callback(new Error('Missing Item mapping. Please correct the mapping or contact Celigo Support.'))
      }

      if(!options.value && locationBodyMappingIndex !== -1) { //delete locationBodyMapping
        body.netsuite_da.mapping.fields.splice(locationBodyMappingIndex, 1)
      } else if(options.value) {
        if(locationBodyMappingIndex === -1) {
          body.netsuite_da.mapping.fields.push({
            "generate": "location",
            "hardCodedValue": options.value,
            "internalId": true,
          })
        } else {
          body.netsuite_da.mapping.fields[locationBodyMappingIndex].hardCodedValue = options.value
          body.netsuite_da.mapping.fields[locationBodyMappingIndex].internalId = true
        }
      }

      var locationLineMappingIndex = _.findIndex(itemMapping.fields, {"generate": "location"})

      if(!options.value && locationLineMappingIndex !== -1) {//delete locationLineMapping
        itemMapping.fields.splice(locationLineMappingIndex, 1)
      } else if(options.value) {
        if(locationLineMappingIndex === -1) {
          itemMapping.fields.push({
            "generate": "location",
            "hardCodedValue": options.value,
            "internalId": true,
          })
        } else {
          itemMapping.fields[locationLineMappingIndex].hardCodedValue = options.value
          itemMapping.fields[locationLineMappingIndex].internalId = true
        }
      }
    } catch(ex) {
      logger.info('updateFbaLocation, unable to update location in FBA mapping ' + options.resourceType + '# ' + options.resourceId + '. Exception : ' + ex.message)
      return callback(new Error('Unable to update location in FBA mapping ' + options.resourceType + '# ' + options.resourceId + '. Exception : ' + ex.message))
    }
    installerUtils.putAdaptor({
      resourceType: options.resourceType
    , resourceId: options.resourceId
    , bearerToken: options.bearerToken
    , body: body
  }, function(e, b) {
      if(e) return callback(e)
      return callback()
    })
  })
}
/**
 * SCIN-306 update batchSize of export adaptor from flow settings.
 * In this, get exportid from name and batch Size from newSettings. After that update NS export adaptor batchSize.
 */
operations.updateNetSuiteExportBatchSize = function (paramObject, callback) {
  var options = paramObject.options
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var settingParams = paramObject.settingParams
  var settingObj = new UtilSettings()
  var newBatchSize = Number(newSettings[setting])

  if (!settingParams || !settingParams[1] || !newBatchSize || !_.isInteger(newBatchSize) || newBatchSize <= 0) {
    return callback(new Error('Oops!! something went wrong. Failed to update flow batch size. Please contact Celigo Support.'))
  }

  var updateBatchSize = function (exportAdaptor, cb) {
    if (exportAdaptor && exportAdaptor.netsuite && exportAdaptor.netsuite.restlet) {
      exportAdaptor.netsuite.restlet.batchSize = newBatchSize

      // TODO: remove this once IO-5306 migrate all existing customers.
      if (exportAdaptor.netsuite.restlet.hooks) {
        exportAdaptor.netsuite.restlet.hooks.batchSize = newBatchSize
      }
    }
    return cb()
  }
  resourceUtils.loadAndUpdateResource({
    resourceType: 'exports',
    resourceId: settingParams[1],
    bearerToken: options.bearerToken,
    updateResourceFunction: updateBatchSize
  }, function (err) {
    if (err) return callback(err)
    return settingObj.setFieldValues(paramObject, callback)
  })
}

// Used to update the Export with the specified page size
operations.updateExportPageSize = function (paramObject, callback) {
  var options = paramObject.options
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var settingParams = paramObject.settingParams
  var settingObj = new UtilSettings()

  if (!settingParams || !settingParams[1] || !newSettings[setting] || !_.isString(newSettings[setting])) {
    return callback(new Error('Oops!! something went wrong. Failed to update flow page size. Please contact Celigo Support.'))
  }

  if (isNaN(newSettings[setting]) || Number(newSettings[setting]) <= 0 || !_.isInteger(Number(newSettings[setting]))) {
    return callback(new Error('Invalid input: "' + newSettings[setting] + '" for Page Size. Please enter a valid number(integer) and try again.'))
  }

  var updatePageSize = function (exportAdaptor, cb) {
    if (exportAdaptor) {
      exportAdaptor.pageSize = newSettings[setting]
    }
    return cb()
  }
  resourceUtils.loadAndUpdateResource({
    resourceType: 'exports',
    resourceId: settingParams[1],
    bearerToken: options.bearerToken,
    updateResourceFunction: updatePageSize
  }, function (err) {
    if (err) return callback(err)
    return settingObj.setFieldValues(paramObject, callback)
  })
}

/**
 * This function called in 'setDefaultSkuFields' function. Here we are updating field id in saved searches with column label using NS connection proxy call. 
 */
var updateSavedSearchesDefaultSKU = function(paramObject, callback) {
  var requestOptions = paramObject.requestOptions
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var oldSettings = paramObject.oldSettings
  if (paramObject.filteredExports.length === 0) {
    return callback()
  }

  var opts = {
    'bearerToken': paramObject.options.bearerToken,
    'data': {
      'requests': []
    },
    'method': 'POST',
    'connectionId': paramObject.commonResources.netsuiteConnectionId,
    'deployId': CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID,
    'scriptId': CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
  }

  _.each(paramObject.filteredExports, function (exportAdaptor) {
    var column = {}
    if (exportAdaptor && exportAdaptor.name && exportAdaptor.netsuite && exportAdaptor.netsuite.restlet && !!exportAdaptor.netsuite.restlet.searchId) {
      var processOptions = requestOptions[exportAdaptor.name] && requestOptions[exportAdaptor.name][0] || null
      if ((newSettings[setting] === 'itemid' || newSettings[setting] === 'nameinternal') && processOptions.default)  {
        column = {
          'label': processOptions.columnLabel,
          'name': 'formulatext',
          'formula': processOptions.default
        }
      } else {
        column = {
          'label': processOptions.columnLabel,
          'name': newSettings[setting]
        }
      }
      opts.data.requests.push({
        'type': 'method',
        'operation': 'modifySearch',
        'config': {
          'searchId': exportAdaptor.netsuite.restlet.searchId,
          'columns': [
            column
          ]
        }
      })
    }
  })

  installerUtils.integratorProxyCall(opts, function (err, response, body) {
    if (err) return callback(err)
    var errorMessage = false
    _.each(body, function(result) {
      if(!result || !result.statusCode || result.statusCode !== 200) {
        if(result && result.error && result.error.code !== 'INVALID_SEARCH') {
          errorMessage = true
        }
      }
    })
    if (errorMessage) return callback(new Error('Please enter valid NetSuite field Id'))
    return callback()
  })
}

/**
 * This function called in 'setDefaultSkuFields' function. Here we are updating field id in lookup/internalidlookup expressions in import adaptors.
 */
var updateImportAdaptorDefaultSKU = function (paramObject, callback) {
  var requestOptions = paramObject.requestOptions
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var oldSettings = paramObject.oldSettings
  if (paramObject.filteredImports.length === 0) {
    return callback()
  }
  async.eachSeries(paramObject.filteredImports, function (importAdaptor, cbEachSeries){
    var processOptions = requestOptions[importAdaptor.name]
    var errMsg = ''

    _.each(processOptions, function (processOption) {
      var extractCount
      var replaceOptions
      if (processOption.type === 'lookup') {
        // read the lookup name for item lookup.
        var lookupName = importAdaptor.netsuite_da ? importAdaptor.netsuite_da.mapping : importAdaptor.mapping
        if (processOption.generateList) {
          lookupName = lookupName && lookupName.lists
          lookupName = lookupName && _.isArray(lookupName) && _.find(lookupName, {'generate': processOption.generateList})
        }
        lookupName = lookupName && _.isArray(lookupName.fields) && _.find(lookupName.fields, {'generate': processOption.generate})
        if (!processOption.extract && lookupName) processOption.extract = lookupName.extract
        lookupName = lookupName && lookupName.lookupName
        if(!lookupName) {
          installerUtils.logInSplunk('Import #' + importAdaptor._id + ', missing lookupname in '+ JSON.stringify(importAdaptor), 'info')
          errMsg = 'Could not find required lookupname to update the settings value. Please contact Celigo support.'
          return false
        }
        // load the item lookup to find the sku matched property of item
        var requiredLookup = importAdaptor.netsuite_da ? importAdaptor.netsuite_da.lookups : importAdaptor.lookups
        requiredLookup = requiredLookup && _.find(requiredLookup, {'name' : lookupName})
        if(!requiredLookup || !requiredLookup.expression) {
          installerUtils.logInSplunk('Import #' + importAdaptor._id + ', missing lookup #' + lookupName + ' in '+ JSON.stringify(importAdaptor), 'info')
          errMsg = 'Could not find required lookup to update the settings value. Please contact Celigo support.'
          return false
        }

        extractCount = ((requiredLookup.expression).match(new RegExp(processOption.extract, "g")) || []).length

        replaceOptions = {
          expression: requiredLookup.expression,
          extract: processOption.extract,
          moreOccurance: extractCount > 1 ? true : false,
          newField: newSettings[setting],
          oldField: oldSettings[setting].value
        }
        requiredLookup.expression = updateExpression(replaceOptions)
      } else if (processOption.type === 'internalidlookup') {
        var internalidlookup = importAdaptor.netsuite_da.internalIdLookup || importAdaptor.internalIdLookup
        extractCount = ((internalidlookup.expression).match(new RegExp(processOption.extract, "g")) || []).length
        replaceOptions = {
          expression: internalidlookup.expression,
          extract: processOption.extract,
          moreOccurance: extractCount > 1 ? true : false,
          newField: newSettings[setting],
          oldField: oldSettings[setting].value,
          join: processOption.join
        }
        internalidlookup.expression = updateExpression(replaceOptions)
      }
    })

    if (errMsg) {
      return cbEachSeries(new Error(errMsg))
    }
    installerUtils.putAdaptor({
      resourceType: 'imports',
      resourceId: importAdaptor._id,
      bearerToken: paramObject.options.bearerToken,
      body: importAdaptor
    }, function (e, b) {
      if (e) return cbEachSeries(e)
      return cbEachSeries()
    })
  }, function (err) {
    if (err) {
      return callback(err)
    }
    return callback()
  })
}

/**
 * This function called in 'updateImportAdaptorDefaultSKU' function. Here we are having logics to update expressions of lookups/internalidlookups.
 * input :
 * {
          expression: [],
          extract: extract field which will be used to identify,
          moreOccurance: occurance of extract part in a single expression which is getting calculated in updateImportAdaptorDefaultSKU function.,
          newField: new value,
          oldField: old value,
          join: if there is any join to record type.
        }
 */
var updateExpression = function (replaceOptions) {
  var expression = JSON.parse(replaceOptions.expression)

  // if case for those single filter array expression such as ['nameinternal', 'is', {{{sku}}}]
  if (_.isArray(expression) && expression.length === 3 && !_.isArray(expression[0]) && !_.isArray(expression[2]) && expression[2].indexOf(replaceOptions.extract) > -1) {
    expression[0] = replaceOptions.join ? replaceOptions.join + '.' + replaceOptions.newField : replaceOptions.newField
  } else { // else case for those multiple filter expression such as [['nameinternal', 'is', {{{sku}}}], 'AND', ['isinactive', 'is', 'F']]
    _.each(expression, function (exp) {
      if (_.isArray(exp) && exp.length === 3 && exp[2].indexOf(replaceOptions.extract) > -1) {
        // if case where we do processing of expression more than one occurance of extract field found such as [['nameinternal', 'is', {{{sku}}}], 'AND',[['UPC', 'is', {{{sku}}}], 'AND', ['isinactive', 'is', 'F']]
        if (replaceOptions.moreOccurance && (exp[0] === replaceOptions.oldField || (replaceOptions.join && exp[0] === replaceOptions.join + '.' + replaceOptions.newField))) {
          exp[0] = replaceOptions.join ? replaceOptions.join + '.' + replaceOptions.newField : replaceOptions.newField
        } else if (!replaceOptions.moreOccurance) { // else case where we do processing of expression with one occurance of extract field found such as [['nameinternal', 'is', {{{sku}}}], 'AND', ['isinactive', 'is', 'F']]
          exp[0] = replaceOptions.join ? replaceOptions.join + '.' + replaceOptions.newField : replaceOptions.newField
        }
      }
    })
  }
  return JSON.stringify(expression)
}

/**
 * Here we are doing filtering of imports/exports adaptors on the basis of name and resource id present in storemap.
 * Inputs required in paramObject.resource: imports/exports
 * paramObject.requestOptions are getting used from 'setDefaultSkuFields' function
 */
var filterResourcesForSetting = function (paramObject, callback) {
  var requestOptions = paramObject.requestOptions
  var filteredAdaptors
  installerUtils.integratorRestClient({
    bearerToken: paramObject.options.bearerToken
    , resourcetype: paramObject.resource
  }, function(err, response, body) {
    if (err) {
      return callback(new Error('Unable to load the ' + paramObject.resource + '# ' + flowId + ', message# ' + err.message))
    }
    if (body && _.isArray(body)) {
      filteredAdaptors = _.filter(body, function (adaptor) {
        if (adaptor && adaptor.name && requestOptions[adaptor.name] && adaptor._id && paramObject.storeMap[paramObject.resource] && _.includes(paramObject.storeMap[paramObject.resource], adaptor._id)) {
          return true
        }
      })
    }
    return callback(null, filteredAdaptors)
  })
}


//TODO make it more generic function, where one mapping array and another updated mapping array will be passed
//TODO and it will auto-merge them
var updateImportAdaptorMapping = function(adaptorJson, generateFieldKey, extractFieldKey, hardCodedVal) {
  var distributedJSON = adaptorJson && adaptorJson.netsuite_da ? adaptorJson.netsuite_da : adaptorJson

  if(!!distributedJSON && !!distributedJSON.mapping) {
    var mappingArray = []
    _.each(distributedJSON.mapping.fields, function(mapObject, index) {
      if(mapObject['generate'] === generateFieldKey ) {

        if(!!hardCodedVal) {
          mapObject = { generate : generateFieldKey
                      , hardCodedValue : hardCodedVal
                      , internalId : true
                      }
        } else {
          mapObject = { generate : generateFieldKey
                      , extract : extractFieldKey
                      }
        }
      }
      mappingArray.push(mapObject)
    })
    distributedJSON.mapping.fields = mappingArray
  }
}

, getDatefilterLabel = function(option) {
  var dateFilterLabel = ''
  _.each(option, function(key, value) {
    if(value.indexOf('selectDateFilterForOrders') > -1) {
      dateFilterLabel = value
    }
  })
  return dateFilterLabel
}

/*Updates relativeURI for date filter label and lagoffset values
* options: {
    resourceType: resourceType,
    resourceId: resourceId,
    lagOffset: lagOffset,
    dateFilter: dateFilter,
    createdDateFilterLabel: createdDateFilterLabel,
    lastmodifiedDateFilterLabel: lastmodifiedDateFilterLabel,
    bearerToken: bearerToken
  }
*/
, updateRelativeURIForDeltaExportOrders = function(options, callback) {
  installerUtils.getAdaptor({
     resourceType: options.resourceType
   , resourceId: options.resourceId
   , bearerToken: options.bearerToken
 }, function(err, body) {
    if(err) return callback(err)
    try {
      var isRestExport = !!(body.rest)
      , isHttpExport = !!(body.http)
      , relativeURIRootPath = ''
      , relativeURIPath = ''

      if(isRestExport) {
        relativeURIRootPath = 'rest'
      } else if(isHttpExport) {
        relativeURIRootPath = 'http'
      }
      relativeURIPath = relativeURIRootPath + '.relativeURI'

      var target = body[relativeURIRootPath]['relativeURI']
      , dateFilterObject = {
          OrderCreatedDate: 'dateCreated'
        , OrderLastModifiedDate: 'lastModified'
      }
      , lastExportDateTimeFilter = 'lastExportDateTime'
      , dateCreatedFilter = '(timeStamp)'

      if(options.dateFilter) {
        //update datefilter label
        if(options.dateFilter === dateFilterObject.OrderCreatedDate) {
          target = target.indexOf(options.lastmodifiedDateFilterLabel) > -1 ? target.replace(options.lastmodifiedDateFilterLabel, options.createdDateFilterLabel) : target
          target = target.indexOf(lastExportDateTimeFilter) > -1 ? target.replace(lastExportDateTimeFilter, dateCreatedFilter) : target
        } else {
          target = target.indexOf(options.createdDateFilterLabel) > -1 ? target.replace(options.createdDateFilterLabel, options.lastmodifiedDateFilterLabel) : target
          if(options.lagOffset) {
            target = target.indexOf(lastExportDateTimeFilter) > -1 ? target.replace(lastExportDateTimeFilter, dateCreatedFilter) : target
          } else {
            target = target.indexOf(dateCreatedFilter) > -1 ? target.replace(dateCreatedFilter, lastExportDateTimeFilter) : target
          }
        }
      }
      if(options.lagOffset || options.lagOffset === 0) {
        //update lagOffset value
        var index = -1
        , regex = new RegExp((options.dateFilter ===  dateFilterObject.OrderCreatedDate ? options.createdDateFilterLabel : options.lastmodifiedDateFilterLabel)+ ".*?\"(-?[0-9]+)\".*?")
        , match = regex.exec(target)
        if(match && match[1] !== options.lagOffset) {
          target = target.replace(match[0], match[0].replace(match[1], options.lagOffset))
        } else if(!match){
          index = target.indexOf(dateCreatedFilter) > -1 ? (target.indexOf(dateCreatedFilter) + (dateCreatedFilter).length) : (target.indexOf(lastExportDateTimeFilter) + (lastExportDateTimeFilter).length)
          target = target.substring(0, index) + ' "' + options.lagOffset + '" ' + target.substring(index)
        }
      }

      jsonpath.apply(body, relativeURIPath, function() { return target})
    } catch (ex) {
      return callback(new Error('Unable to update the resource ' + options.resourceType + '# ' + options.resourceId + '. Exception : ' + ex.message))
    }

    installerUtils.putAdaptor({
       resourceType: options.resourceType
     , resourceId: options.resourceId
     , bearerToken: options.bearerToken
     , body: body
   }, function(e, b) {
      if(e) return callback(e)
      return callback(null, b)
    })
  })
}

, validateDeltaDays = function(deltaDays, callback) {
  var numberFormat = new RegExp('^[0-9]+$')
  if(!numberFormat.test(deltaDays) || deltaDays == 0) {
    return callback(new Error('Please enter non-zero numeric value for duration in days.'))
  }
  else {
    return callback()
  }
}

, validateAccountName = function(paramObject, callback) {
  logger.debug('validateAccountName | paramObject: ', JSON.stringify(paramObject))
  var newSettings = paramObject.newSettings,
  setting = paramObject.setting
  if(!newSettings[setting]) {
    return callback(new Error('Please enter non-empty account name.'))
  } else if(newSettings[setting].length > 20) {
    return callback(new Error('Account name# ' + newSettings[setting] + ' exceeds 20 characters. Please choose a different name.'))
  }

  var account = _.find(paramObject.options.integrationRecord.settings.general, function(generalSettings, index) {
    if(generalSettings.id) {
      return _.find(generalSettings.fields, function(field, index) {
        return field && field.name && field.name.indexOf('setAccountName') > -1 && field.value === newSettings[setting]
      })
    }
  }) || null

  if(account) {
    //TODO: make the error message generic to all connectors, shopify has store name
    return callback(new Error('Account Name# '+ newSettings[setting] + ' is already set in one of the accounts. Please set a different account name.'))
  }
  return callback()
}

, checkAutoAckValueAndCheckFlowEnabled = function(autoAcknowledgeOnDemandOrders, exportId, options, orderAckFlowIdString, callback) {
    logger.info('checkAutoAckValueAndCheckFlowEnabled, autoAcknowledgeOnDemandOrders : ' + autoAcknowledgeOnDemandOrders)
    if(!autoAcknowledgeOnDemandOrders) return callback()
    var settingObj = new UtilSettings()
    var commonResources = settingObj.getStoreMap({
      settings : options.integrationRecord.settings,
      _exportId : exportId
    })
    var orderAckFlowId = commonResources[orderAckFlowIdString]
    var requestOptions =
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/flows/' + orderAckFlowId
      , method : 'GET'
      , auth : { bearer : options.bearerToken }
      , json : true
      }
    logger.debug('checkAutoAckValueAndCheckFlowEnabled, requestOptions' + JSON.stringify(requestOptions))
    request(requestOptions, function (err, res, body) {
      if(err) return callback(err)
      logger.debug('checkAutoAckValueAndCheckFlowEnabled, res' + JSON.stringify(res))
      if(!!body && body.disabled) return callback(new Error('Order Acknowledgement Flow is currently disabled. For setting "Auto Acknowledge On Demand Orders" as checked, this flow needs to be enabled'))
      return callback()
    })
  }

, validateCustomerInternalId = function(customerInternalId, paramObject, commonResources, callback) {
  try {
    if (paramObject.handleMultipleCustomers === true) {
      // Will receive customerInternalId as a string
      if (!customerInternalId) return callback()
      if (typeof(customerInternalId) !== 'string') return callback(new Error('Enter customer internal ID(s) in appropriate format.'))
      if (!customerInternalId.trim()) return callback()
  
      customerInternalId = _.compact(customerInternalId.split(","))
      var isInvalid = false
      _.each(customerInternalId, function(internalid, index) {
        customerInternalId[index] = Number(internalid.trim())
        if(_.isNaN(customerInternalId[index])) isInvalid = true
      })
  
      if (isInvalid) return callback(new Error('Enter a valid customer internal ID(s).'))
    }
    else {
      //checking if user's input is some garbage value
      if(_.isNaN(customerInternalId)) return callback(new Error('Please enter a valid customer Internal Id.'))
    }

    var options = paramObject.options
      , nsConnectionId = commonResources.netsuiteConnectionId
      , opts =
        { bearerToken : options.bearerToken
        , connectionId : nsConnectionId
        , method : 'POST'
        , scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
        , deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
        , data :
        { requests :
          [
            { type : 'savedsearch'
              , operation : 'run'
              , config : {
                  "recordType" : "customer",
                  "filters" : [["internalid","anyof", customerInternalId]] ,
                  "columns" : [{"name":"internalId", "label": "id"}]
                }
              }
            ]
          }
        }

    installerUtils.integratorProxyCall(opts, function(e, r, b) {
      if(e) return callback(new Error('Failed to get information from NetSuite for given Customer IDs, ' + e.message + '. Please contact Celigo support.'))
      if(!(r.statusCode === 200 || r.statusCode === 201)) return callback(new Error('Failed to get information from NetSuite for given Customer IDs, status Code while connecting to NetSuite : ' + r.statusCode + '. Please contact Celigo support.'))
      b = b && b[0] || null

      if (paramObject.handleMultipleCustomers === true) {
        if(!b || !b.results || !b.results.length || (b.results.length !== customerInternalId.length)) return callback(new Error('Enter a valid customer internal ID(s). Customer Internal Id entered is not found in NetSuite.'))
      }
      else {
        //No existing customer found on NS with id as customerInternalId
        if(!!customerInternalId && (!b || !b.results || !b.results.length)) return callback(new Error('Please enter a valid customer Internal Id. Customer with Internal Id# ' + customerInternalId + ' not found in NetSuite.'))
      }

      return callback()
    })
  } catch (error) {
    return callback(error)
  }
}

//  Updates internalIdLookup for import adaptors to ignore Existing records.
// TODO make it more generic for addupdate operation as well
, updateImportLookups = function (options, callback) {
  installerUtils.getAdaptor({
     resourceType: options.resourceType
   , resourceId: options.resourceId + '/distributed'
   , bearerToken: options.bearerToken
 }, function(err, body) {
   if (err) {
     logger.info('Failed to load adaptor due to err '+ err.message)
     return callback(err)
   }
   try {
     var adaptorBody
     if(body.netsuite_da) {
       adaptorBody = body.netsuite_da
     } else {
       adaptorBody = body
     }
     if (!options.orderAdvancedLookupEnabled || !options.orderImportLookupFilter) {
       if(adaptorBody.operation === 'add') {
         body.ignoreExisting = false
       } else if(adaptorBody.operation === 'update') {
         body.ignoreMissing = false
       }
       adaptorBody.internalIdLookup = null
     } else {
       if(adaptorBody.operation === 'add') {
         body.ignoreExisting = true
       } else if(adaptorBody.operation === 'update') {
         body.ignoreMissing = true
       }
       if(body.netsuite_da) {
         adaptorBody.internalIdLookup = {
           expression : options.orderImportLookupFilter
         }
       } else {
         adaptorBody.internalIdLookup = {
           expression : JSON.parse(options.orderImportLookupFilter)
         }
       }
     }
   } catch (ex) {
     return callback(new Error('Unable to update the resource ' + options.resourceType + '# ' + options.resourceId + '. Exception : ' + ex.message))
   }

   installerUtils.putAdaptor({
      resourceType: options.resourceType
    , resourceId: body.netsuite_da ? options.resourceId : options.resourceId + '/distributed'
    , bearerToken: options.bearerToken
    , body: body
  }, function(e, b) {
     if(e) return callback(e)
     return callback(null)
   })
 })
}

//Replace accountName in flow names to the new account name
, updateFlowName = function(options, callback) {
  logger.debug('updateFlowName, options: ', JSON.stringify(options))
  async.eachSeries(options.flows, function(flowId, eachCallback) {
    if(_.isEmpty(flowId)) return eachCallback()

    //make a call to IO server
    installerUtils.integratorRestClient({
      bearerToken: options.bearerToken
      , resourcetype: 'flows'
      , id: flowId
    }, function(err, response, body) {
      if (err) {
        return eachCallback(new Error('Unable to load the flow# ' + flowId + ', message# ' + err.message))
      }

      if(!body || !body.name || body.name.indexOf('[' + options.newAccountName + ']') > -1) return eachCallback()
      body.name = body.name.split('[')[0] + '[' + options.newAccountName + ']'
      installerUtils.integratorRestClient({
          bearerToken: options.bearerToken
          , resourcetype: 'flows'
          , id: flowId
          , data: body
        }, function(err, response, body) {
          if (err) {
            return eachCallback(new Error('Unable to save the flow# ' + flowId + ', message# ' + err.message))
          }
          return eachCallback()
        })
    })
  }, function(err) {
    if(err) {
      logger.info('updateFlowName | err# ', JSON.stringify(err))
      return callback(err)
    }
    return callback()
  })
}

//Update accountname and title of store and sections to new accountName respectively
, updateIntegration = function(store, section, options, callback) {
  logger.debug('updateIntegration, options: ', JSON.stringify(options))
  logger.debug('updateIntegration, store: ', JSON.stringify(store))
  logger.debug('updateIntegration, section: ', JSON.stringify(section))
  if(store.accountname) {
    store.accountname = options.newAccountName
  } else if(store.shopname) {
    store.shopname = options.newAccountName
  }

  section.title = options.newAccountName

  // save the integrationRecord
  installerUtils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: 'integrations'
    , id: options.integrationRecord._id
    , data: options.integrationRecord
  }, function(err, response, body) {
    if (err) {
      return callback(err)
    }
    return callback()
  })
}

//Add or Update saved search title with new accont name
, updateSavedSearchTitle = function(options, callback) {
  logger.debug('updateSavedSearchTitle, options: ', JSON.stringify(options))
  async.eachSeries(options.savedSearches, function(savedSearchId, eachCallback) { //savedSearches
    if(_.isEmpty(savedSearchId)) return eachCallback()

    var params = {}
    params.methodName = 'updateSearchTitle'
    params.metaDataConfig = {
      "searchId": savedSearchId,
      "newAccountName": options.newAccountName,
      "oldAccountName": options.oldAccountName
    }
    params.bearerToken = options.bearerToken
    refreshNSMetaDataUtil.executeNsOperation({
      options: params,
      nsConnectionId: options.netsuiteConnectionId
    }, function(err, response) {
      if(err) return eachCallback(err)
      return eachCallback()
    })
  }, function(err) {
    if(err) return callback(err)
    return callback()
  })
}

//Update record in NetSuite when account name changes
, updateNetSuiteRecord = function(options, callback) {
  logger.debug('updateNetSuiteRecord, options: ', JSON.stringify(options))
  var recordsToBeUpdated = {
  //TODO: Instead of connector name, add integration ids to be updated. Since other connectors also have this name in their integration name.
    amazon : [{
      record: 'customrecord_celigo_amzio_account_info',
      fields: ['name'],
      newValues: [options.newAccountName],
      filters: [["custrecord_celigo_amzio_account_id", "is", options.accountId]],
      replace: false,
      multipleUpdateAllowed: false
    }],
    walmart : [{
      record : 'customrecord_celigo_wlmrt_account_info',
      fields : ['name'],
      newValues : [options.newAccountName],
      filters : ["custrecord_celigo_wlmrt_account_id", "is", options.accountId],
      replace : false,
      multipleUpdateAllowed: false
    }],
    magento : [{
      record: 'customrecord_celigo_mag2_instance',
      fields: ['name'],
      newValues: [options.newAccountName],
      filters: [["custrecord_celigo_mag2_instanceid", "is", options.accountId]],
      replace: false,
      multipleUpdateAllowed: false
    }],
    bigcommerce : [{
      record: 'customrecord_celigo_bgc_store_info',
      fields: ['name'],
      newValues: [options.newAccountName],
      filters: [["custrecord_celigo_bgc_storeid", "is", options.accountId]],
      replace: false,
      multipleUpdateAllowed: false
    }],
    square : [{
      record: 'customrecord_celigo_square_account',
      fields: ['name'],
      newValues: [options.newAccountName],
      filters: [["custrecord_celigo_square_account_id", "is", options.accountId]],
      replace: false,
      multipleUpdateAllowed: false
    }]
  },
  records = _.find(recordsToBeUpdated, function(rec, connector) {
    if(options.connectorName && options.connectorName.toLowerCase().indexOf(connector) > -1) {
      return rec
    }
  }) || []

  if(_.isEmpty(records)) return callback()

  var params = {}
  params.methodName = 'updateRecord'
  params.bearerToken = options.bearerToken

  _.each(records, function(updateRecord, index) {
    params.metaDataConfig = {
      "record": updateRecord.record,
      "fields": updateRecord.fields,
      "newValues": updateRecord.newValues,
      "oldValues": updateRecord.oldValues,
      "replace": updateRecord.replace || false,
      "filters": updateRecord.filters,
      "multipleUpdateAllowed": updateRecord.multipleUpdateAllowed || false
    }

    refreshNSMetaDataUtil.executeNsOperation({
      options: params,
      nsConnectionId: options.netsuiteConnectionId
    }, function(err, response) {
      if(err) return callback(err)
      return callback()
    })
  })
}

//Add or Update connection names with the new account name.
, updateConnectionName = function(options, callback) {
  logger.debug('updateConnectionName, options: ', JSON.stringify(options))
  installerUtils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: 'connections'
  }, function(err, response, body) {
    if (err) {
      return callback(err)
    }

    async.eachSeries(body, function(connection, eachCallback) {
      var  storeConnection = _.find(options.store, function(val, key) {
        return val === connection._id
      }) || false
      if(!storeConnection || !connection.name) return eachCallback()

      if(connection.name.indexOf('[' + options.newAccountName + ']') > -1) return eachCallback()
      if(connection.name.indexOf('[' + options.oldAccountName + ']') === -1) connection.name += ' [' + options.newAccountName + ']'
      else connection.name = connection.name.replace('[' + options.oldAccountName + ']', '[' + options.newAccountName + ']')

      installerUtils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: 'connections'
        , id: connection._id
        , data: connection
      }, function(err, response, body) {
        if (err) {
          return eachCallback(err)
        }
        return eachCallback()
      })
    }, function(err) {
      if(err) return callback(err)
      return callback()
    })
  })
}

/* MAG2NS-632 : Add or Remove current flow Id from "_runNextFlowIds" of given flowId.

1) We get flow ID in params to which the current flow ID should be added.
2) If '_runNextFlowIds' field is present of the given flow ID's flow body :
  a. If the checkbox setting is enabled and current flow ID is not present - add current flow ID to '_runNextFlowIds'.
  b. If the checkbox setting is not enabled and current flow ID is present - remove the current flow ID.
3) If '_runNextFlowIds' field of the given flow ID's adaptor is absent, we add it and push current flow ID into it!
*/ 
operations.updateFlowIdRunNextFlowIds = function (paramObject, flowId, callback) {
  var options = paramObject.options
  if (!paramObject.newSettings || !paramObject.setting) {
    return callback(new Error('Incorrect paramObject. Please contact Celigo support.'))
  }
  var isRunNextFlowIdsSettingEnabled = paramObject.newSettings[paramObject.setting]
  var runNextFlowId
  if (options && options.pending && options.pending.flowId) {
    runNextFlowId = options.pending.flowId
  } else if (options && options.pending && options.shopId && options.pending[options.shopId].flowId) {
    runNextFlowId = options.pending[options.shopId].flowId
  } else {
    runNextFlowId = null
  }
  if (!runNextFlowId) {
    return callback(new Error('Flow Id missing in ParamObject\'s options. Please contact Celigo support.'))
  } else {
    var addOrRemoveRunNextFlowId = function (flowBody, helperCallback) {
      if (flowBody._runNextFlowIds) {
        var runNextFlowIdsArray = flowBody._runNextFlowIds
        var idExists = _.includes(runNextFlowIdsArray, runNextFlowId)
        // case: checked the checkbox
        if (isRunNextFlowIdsSettingEnabled && !idExists) {
          runNextFlowIdsArray.push(runNextFlowId)
        } else if (!isRunNextFlowIdsSettingEnabled && idExists) {// case: unchecked the setting
            _.remove(runNextFlowIdsArray, function (id) {
              return id === runNextFlowId
            })
        }
      } else if (isRunNextFlowIdsSettingEnabled) {
          flowBody._runNextFlowIds = []
          flowBody._runNextFlowIds.push(runNextFlowId)
      }
      return helperCallback()
    }

    var opts = {
      bearerToken: options.bearerToken
      , resourceType: 'flows'
      , resourceId: flowId
      , updateResourceFunction: addOrRemoveRunNextFlowId
    }
    resourceUtils.loadAndUpdateResource(opts, function (err) {
      if (err) {
        return callback('Error occured while trying to save the setting. Please retry, if issue persists contact Celigo Support.')
      }
      return callback()
    })
  }
}

operations.updateSalesforceExport = function (paramObject, dataToUpdate, callback) {
  var options = paramObject.options
  var settingParams = paramObject.settingParams

  var updateReferenceFields = function (resource, cb) {
    if (!resource || !resource['salesforce'] || !resource['salesforce']['distributed']) {
      return cb(new Error('Developer Error resource used in the update, is not a valid one | body: ' + JSON.stringify(resource)))
    }
    _.each(dataToUpdate, function(value, key){
      resource['salesforce']['distributed'][key] = value
    })
    return cb(null)
  }

  var exportOptions = {
    bearerToken: options.bearerToken,
    resourceType: settingParams[0],
    resourceId: settingParams[1],
    updateResourceFunction: updateReferenceFields
  }

  return resourceUtils.loadAndUpdateResource(exportOptions, callback)
}

operations.setTransactionDefaultTaxableCode = function (paramObject, callback) {
  var oldSettings = paramObject.oldSettings
  var newSettings = paramObject.newSettings
  var setting = paramObject.setting
  var settingObj = new UtilSettings()

  if (!newSettings[setting] && !!oldSettings[setting].value) {
    return settingObj.setFieldValues(paramObject, callback)
  }

  var newSettingsValue = newSettings[setting]

  if (!newSettingsValue || newSettingsValue === '') {
    return settingObj.setFieldValues(paramObject, callback)
  }

  if (isNaN(newSettingsValue)) {
    return callback(new Error('Enter a tax code or tax group in a valid format. The tax code or tax group must either be a positive or negative numeric value.'))
  }

  if (newSettingsValue === '-7' || newSettingsValue === '-8') {
    return callback(new Error('Enter a tax code or tax group that is taxable. Any positive or negative numeric, other than “-7“ or “-8“, as these codes are not taxable.'))
  }
  checkIfTaxCodeOrGroupPresentInNS(paramObject, newSettingsValue, callback)
}

var checkIfTaxCodeOrGroupPresentInNS = function (paramObject, enteredTaxInternalID, callback) {
  var options, commonresources
  var settingObj = new UtilSettings()
  if (paramObject.options) {
    options = paramObject.options
    if (options && options.integrationRecord && options.integrationRecord.settings && options.integrationRecord.settings.commonresources) {
      commonresources = options.integrationRecord.settings.commonresources
    }
  }

  var nsConnectionId = commonresources.netsuiteConnectionId
  var opts = {
    bearerToken: options.bearerToken,
    connectionId: nsConnectionId,
    method: 'POST',
    scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID,
    deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID,
    data:
    {
      requests: [
        {
          type: 'savedsearch',
          operation: 'run',
          config: {
            recordType: 'taxgroup',
            filters: [['internalid', 'is', enteredTaxInternalID]],
            columns: [{ 'name': 'internalId', 'label': 'id' }]
          }
        },
        {
          type: 'savedsearch',
          operation: 'run',
          config: {
            recordType: 'salestaxitem',
            filters: [['internalid', 'is', enteredTaxInternalID]],
            columns: [{ 'name': 'internalId', 'label': 'id' }]
          }
        }
      ]
    }
  }

  installerUtils.integratorProxyCall(opts, function (err, resp, body) {
    if (err) {
      return callback(new Error('Failed to get Tax Codes or Tax Groups ' + ', ' + err.message + '. Please contact Celigo support.'))
    }
    if (!resp || resp.statusCode !== 200) {
      return callback(new Error('Failed to get information from NetSuite : status Code while connecting to NetSuite : ' + (resp && resp.statusCode) + '. Please contact Celigo support.'))
    }
    body = body || null
    if (!body || !_.isArray(body) || body.length === 0) {
      return callback(new Error('Enter a tax code or tax group that is valid. The tax code or tax group is not available in your NetSuite account.'))
    }
    var isValid = _.find(body, function (eachRes) {
      return eachRes && _.isArray(eachRes.results) && (eachRes.results.length > 0)
    })
    if (isValid) {
      return settingObj.setFieldValues(paramObject, callback)
    } else {
      return callback(new Error('Enter a tax code or tax group that is valid. The tax code or tax group is not available in your NetSuite account.'))
    }
  })
}

module.exports = operations
