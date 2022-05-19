'use strict'

var _ = require('lodash')
  , util = require('util')
  , installerUtils = require('../installer/installerHelper')
  , CONSTS = require('../constants')
  , logger = require('winston')
  , refreshNSMetaDataUtil = require('../nsConnectorUtil/refreshNSMetaDataUtil')


//constructor
function RefreshMetaData(isSettingsGroupingEnabled) {
  //isSettingsGroupingEnabled is a boolean parameter of the constructor, which needs to be set to true when settings are divided into logical groupings.
  this.isSettingsGroupingEnabled = isSettingsGroupingEnabled ? isSettingsGroupingEnabled : false
  var predefinedOps = require('./refreshMetaDataOperations')
  this.registerFunction({name : 'dummyGeneratesMethod', method : predefinedOps.dummyGeneratesMethod})
  this.registerFunction({name : 'dummyExtractsMethod', method : predefinedOps.dummyExtractsMethod})
  this.registerFunction({name : 'listLocations', method : predefinedOps.listLocations})
  this.registerFunction({name : 'listPriceLevels', method : predefinedOps.listPriceLevels})
  this.registerFunction({name : 'listCurrency', method : predefinedOps.listCurrency})
  this.registerFunction({name : 'listShipMethods', method : predefinedOps.listShipMethods})
  this.registerFunction({name : 'listPaymentMethods', method : predefinedOps.listPaymentMethods})
  this.registerFunction({name : 'listShipMethodsWithoutIds', method : predefinedOps.listShipMethodsWithoutIds})
  this.registerFunction({name : 'listNSItemRecordMetaData', method : predefinedOps.listNSItemRecordMetaData})
  this.registerFunction({name : 'listSelectOptions', method : predefinedOps.listSelectOptions})
  this.registerFunction({name : 'listItemFieldSelectOptions', method : predefinedOps.listItemFieldSelectOptions})
  this.registerFunction({name : 'listRecordSearchColumnMetadata', method : predefinedOps.listRecordSearchColumnMetadata})
  this.registerFunction({name : 'getConfigurableFlows', method: predefinedOps.getConfigurableFlows})
  this.registerFunction({name : 'listAccount', method: predefinedOps.listAccount})
  this.registerFunction({name : 'listSalesRoles', method : predefinedOps.listSalesRoles})
}

RefreshMetaData.prototype.registerFunction = function(funcObj) {
  if(funcObj.hasOwnProperty('name') && funcObj.hasOwnProperty('method')) {
    if(typeof funcObj.method === 'function') {
      RefreshMetaData.prototype[funcObj.name] = funcObj.method
      return true
    }
    else {
        throw new Error('Function implementation is missing while registering this function | '+funcObj.name)
    }
  }
  throw new Error('Either name or method property is missing while registering this function')
}

/**
* Performs the execution of refreshMetaData by calling appropriate method based on operation
* @param options coming from IO eg.:{"fieldName":"exports_56539cb1482d2fbd0b75af7f_savedSearch_listSavedSearches","_integrationId":"XX","bearerToken":"XX"}
* @param callback
*/
RefreshMetaData.prototype.execute = function(options, callback) {
  logger.info('RefreshMetaData, execute , options : ', JSON.stringify(options))
  var operation = options.fieldName.split('_')
    , self = this
    , storemap

  if (operation && _.isArray(operation) && operation.length < 4) {
    installerUtils.logInSplunk('No function found named : ')
    return callback(null, [])
  }

  options.methodName = operation[3]
  options.operationArray = operation

  // to support refreshMetaData from Etail stores on dropdown settings.
  if (!options.type && operation[4] === 'refreshEtailStoreMetaData') {
    options.type = 'refreshEtailStoreMetaData'
  }

  var setupdata = {}
  self.loadIntegration(options, setupdata, function(err, connectionId) {
    if(err) return callback(err)

    var paramObject =
      { options : options
      , nsConnectionId : connectionId
      }

    // for etail store side refreshMetaData we should require storeMap/commonresources
    if (setupdata && setupdata.integration && setupdata.integration.settings) {
      paramObject.options.integrationRecord = setupdata.integration

      // adding storemap json and general json in paramObject options.
      if (setupdata.integration.settings.general) paramObject.options.general = setupdata.integration.settings.general
      if (setupdata.integration.settings.storemap) {
        paramObject.options.storemap = setupdata.integration.settings.storemap
        

        // to add store id /account id so that user can find our connection id to do operations.
        storemap = _.find(paramObject.options.storemap, function (storemap) {
          if (storemap && operation[0] && operation[1] && storemap[operation[0]] && _.includes(storemap[operation[0]], operation[1])) {
            return true
          }
        })

        if (storemap && (storemap.accountid || storemap.shopid)) {
          paramObject.options.storeId = storemap.accountid || storemap.shopid
        }
      }
      paramObject.options.commonresources = setupdata.integration.settings.commonresources
    }

    self.executeOperation(paramObject, function(err, results) {
      if(err) return callback(err)
      logger.info('RefreshMetaData, execute, executeOperation callback, results : ', JSON.stringify(results))
      options.NSresults = results

      self.findFieldToBeUpdated(setupdata, options, function(err, fieldfound) {
        var optionMap
        if(err || !fieldfound) return callback(new Error('Unable to find field in Integration settings : ' + options.fieldName))

        //convert results to UI format
        var fieldoptions = []
        if(!!options.type && (options.type === 'extracts' || options.type === 'generates' || options.type.indexOf('_') !== -1)) {
          _.each(results, function(result) {
            var entry =
              { id : result['id']
              , text : result['text']
              }
            fieldoptions.push(entry)
          })
          if (options.type.indexOf('_') !== -1 && fieldfound && fieldfound.optionsMap) {
            optionMap = _.find(fieldfound.optionsMap, function (optionMap) {
              if (optionMap && optionMap.id === options.type) {
                return true
              }
            })

            if (optionMap) {
              optionMap.options = fieldoptions
            }
          } else {
            fieldfound[options.type] = fieldoptions
          }
        } else {
          _.each(results, function(result) {
            var entry = []
            entry.push(result['id'])
            entry.push(result['text'])
            fieldoptions.push(entry)
          })
          fieldfound.options = fieldoptions
        }

        // if options.updateSettings value found then update setting along with refresh
        if (options.updateSettings) {
          fieldfound.value = options.updateSettings
        }
        if (fieldfound.properties && fieldfound.properties.yieldValueAndLabel) return callback(null, fieldfound)
        self.saveIntegration(options, setupdata, fieldfound, function(err) {
          if(err) return callback(err)
          return callback(null, fieldfound)
        })
      })
    })
  })
}

RefreshMetaData.prototype.performOperationAction = function (paramObject, op, callback) {
  if(typeof RefreshMetaData.prototype[op] !== 'function')
    return callback(new Error(op + ' method not registered in connector-utils'))
  RefreshMetaData.prototype[op](paramObject, function(error, results) {
    if(error) return callback(error)
    logger.info('RefreshMetaData, performOperationAction, results : ', JSON.stringify(results))
    return callback(null, results)
  })
}


/**
* Performs the execution operation of refreshMetaData
* @param options coming from IO eg.:{"fieldName":"exports_56539cb1482d2fbd0b75af7f_savedSearch_listSavedSearches","_integrationId":"XX","bearerToken":"XX", operationArray : ['exports', '_id', 'extractsMethod', 'generatesMethod']}
* @param callback
* NOTE : For Static Maps, Please provide field name in the following format :
*         <resourcetype>_<resourceId>_<saveMethod>_<extractsMethod>_<generatesMethod>
*       1) If you do not want refresh support on extracts, use : <resourcetype>_<resourceId>_<saveMethod>_dummyExtractsMethod_<generatesMethod>
*       2) If you do not want refresh support on generates, use : <resourcetype>_<resourceId>_<saveMethod>_<extractsMethod>
* Including N - column mapping refreshmeta handling. In this, option type will be column id. So we have decided column name should be like this if we want to implement refresh metadata. <col_id>_<refreshMetaDataFunction>
eg: website_listWebsites. Using _ we can identify what function will get triggered when refreshmeta data called.
*/
RefreshMetaData.prototype.executeOperation = function (paramObject, callback) {
  logger.debug('RefreshMetaData, executeOperation, paramObject : ', JSON.stringify(paramObject))
  var options = paramObject.options
  , op = null
  , optionTypeArr
  if(!!options.type && ( options.type === 'extracts' || options.type === 'generates' || options.type === 'refreshEtailStoreMetaData' || options.type.indexOf('_') !== -1)) {
    if(options.type === 'extracts' || options.type === 'refreshEtailStoreMetaData') {
      op = options.operationArray[3]
    } else if (options.type.indexOf('_') !== -1) { // handling for n - column static map widget.
      optionTypeArr = options.type.split('_')
      if (_.isArray(optionTypeArr) && optionTypeArr.length > 1) {
        op = optionTypeArr[1]
      } else {
        return callback(new Error(options.type + ' type do not have function registered in connector-utils'))
      }
    } else {
      op = options.operationArray[4] || 'dummyGeneratesMethod'
    }
    logger.info('RefreshMetaData, executeOperation, type exists, op : ', op)
    paramObject.options.methodName = op
    RefreshMetaData.prototype.performOperationAction(paramObject, op, function (err, results) {
      return callback(err, results)
    })
  } else {
    op = (options.operationArray && options.operationArray[3]) || null
    // check whether operation is registered or not. If yes, call the function or assume it to be default NS function
    if(op && typeof RefreshMetaData.prototype[op] === 'function') {
      paramObject.options.methodName = op
      RefreshMetaData.prototype.performOperationAction(paramObject, op, function (err, results) {
        return callback(err, results)
      })
    } else {
      refreshNSMetaDataUtil.executeNsOperation(paramObject, function(err, results) {
        if(err) return callback(err)
        return callback(null, results)
      })
    }
  }
}

RefreshMetaData.prototype.loadIntegration = function(options, setupdata, callback) {
  //load integration record and get the settings->sections->fields[*]['name']
  installerUtils.integratorRestClient({bearerToken: options.bearerToken, resourcetype: 'integrations', id: options._integrationId}, function(err, response, body) {
    if (err) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
    setupdata.integration = body

    try {
      var nsConnectionId = body.settings.commonresources.netsuiteConnectionId || null
    } catch (ex) {
      return callback(new Error('Integration does not contain netsuiteConnectionId at location settings.commonresources.netsuiteConnectionId '))
    }

    if(!nsConnectionId) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
    return callback(null, nsConnectionId)

  })
}

RefreshMetaData.prototype.saveIntegration = function(options, setupdata, fieldfound, callback) {
  var opts =
    { bearerToken: options.bearerToken
    , resourcetype: 'integrations'
    , id: options._integrationId
    , data: setupdata.integration
    }
  installerUtils.integratorRestClient(opts, function(err, response, body) {
    if (err) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
    return callback()
  })
}

RefreshMetaData.prototype.findFieldToBeUpdated = function (setupdata, options, callback) {
  var fieldFound = {}

  _.find(setupdata.integration.settings.sections, function (section) {
    findFieldFromSection(section, options, fieldFound)
    if (fieldFound.field) {
      return true
    }
  }) || _.find(setupdata.integration.settings.general, function (section) {
    findFieldFromSection(section, options, fieldFound)
    if (fieldFound.field) {
      return true
    }
  })

  logger.debug('RefreshMetaData, findFieldToBeUpdated, fieldfound : ', JSON.stringify(fieldFound.field))

  return callback(null, fieldFound.field)
}

var findFieldFromSection = function (section, options, fieldFound) {
  if (section.hasOwnProperty('sections') && _.isArray(section.sections)) {
    return _.find(section.sections, function (subSection) {
      findFieldFromSection(subSection, options, fieldFound)
    })
  } else {
    return _.find(section.fields, function (field) {
      if (field['name'] === options.fieldName) {
        fieldFound.field = field
        return true
      }
    })
  }
}

module.exports = RefreshMetaData
