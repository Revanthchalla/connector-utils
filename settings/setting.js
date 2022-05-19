'use strict'

var _ = require('lodash')
  , request = require('request')
  , async = require('async')
  , jsonpath = require('jsonpath')
  , logger = require('winston')
  , CONSTS = require('../constants')

var HERCULES_BASE_URL = 'https://api.' + CONSTS.IODOMAIN
if (process.env.NODE_ENV === 'staging') {
  if (!CONSTS.IODOMAIN) HERCULES_BASE_URL = 'https://api.staging.integrator.io'
} else if (process.env.NODE_ENV === 'development') {
  //local testing of code
  HERCULES_BASE_URL = 'http://api.localhost.io:5000'
}

//constructor
function Settings(isSettingsGroupingEnabled) {

  //isSettingsGroupingEnabled is a boolean parameter of the constructor, which needs to be set to true when settings are divided into logical groupings.
  this.isSettingsGroupingEnabled = isSettingsGroupingEnabled ? isSettingsGroupingEnabled : false
  //Register predefined functions here
  var self = this
  self.predefinedOps = require('./operations.js')
  this.registerFunction({name: 'toggleNetsuiteExportType', method: self.predefinedOps.toggleNetsuiteExportType})
  this.registerFunction({name: 'actionSlider', method: self.predefinedOps.actionSlider})
  this.registerFunction({name: 'flowSpecificSliderAction', method: self.predefinedOps.flowSpecificSliderAction})
  this.registerFunction({name: 'secondaryCustomerLookupFilter', method: this.setFieldValues})
  this.registerFunction({name: 'defaultLineDiscountItem', method: this.setFieldValues})
  this.registerFunction({name: 'primaryCustomerLookupFilter', method: self.predefinedOps.updateAdaptorLookupFilter})
  this.registerFunction({name: 'savedSearch', method: self.predefinedOps.savedSearch})
  this.registerFunction({name: 'updateSearchLocationFilters', method: self.predefinedOps.updateSearchLocationFilters})
  this.registerFunction({name: 'kitInventoryCalculationPerLocationEnabled', method: self.predefinedOps.kitInventoryCalculationPerLocationEnabled})
  this.registerFunction({name: 'updateMultipleSavedSearchLocationFilters', method: self.predefinedOps.updateMultipleSavedSearchLocationFilters})
  this.registerFunction({name: 'updateSearchPricingFilters', method: self.predefinedOps.updateSearchPricingFilters})
  this.registerFunction({name: 'updateSearchCurrencyFilters', method: self.predefinedOps.updateSearchCurrencyFilters})
  this.registerFunction({name: 'setStartDateOnDeltaBasedExports', method: self.predefinedOps.setStartDateOnDeltaBasedExports})
  this.registerFunction({name: 'updateSearchSalesOrderStatusFilters', method: self.predefinedOps.updateSearchSalesOrderStatusFilters})
  this.registerFunction({name: 'savedSearchAllExports', method: self.predefinedOps.savedSearchAllExports})
  this.registerFunction({name: 'setDefaultCustomerIdForAllOrders', method: self.predefinedOps.setDefaultCustomerIdForAllOrders})
  this.registerFunction({name: 'setDefaultCustomerId', method: self.predefinedOps.setDefaultCustomerId})
  this.registerFunction({name: 'updatePricingSavedSearchWithProvidedFilters', method: self.predefinedOps.updatePricingSavedSearchWithProvidedFilters})
  this.registerFunction({name: 'invokeOnDemandOrderImport', method: self.predefinedOps.invokeOnDemandOrderImport})
  this.registerFunction({name: 'selectDateFilterForOrders', method: self.predefinedOps.selectDateFilterForOrders})
  this.registerFunction({name: 'setDeltaDays', method: self.predefinedOps.setDeltaDays})
  this.registerFunction({name: 'orderAdvancedLookupEnabled', method: self.predefinedOps.orderAdvancedLookupEnabled})
  this.registerFunction({name: 'orderImportLookupFilter', method: self.predefinedOps.orderImportLookupFilter})
  this.registerFunction({name: 'saveAdvancedSettingsToNSDistributed', method: self.predefinedOps.saveAdvancedSettingsToNSDistributed})
  this.registerFunction({name: 'saveFlowSettingsToNSDistributed', method: self.predefinedOps.saveFlowSettingsToNSDistributed})
  this.registerFunction({name: 'updateItemSearchesTypeFilters', method: self.predefinedOps.updateItemSearchesTypeFilters})
  this.registerFunction({name: 'variationParentIdentifier', method: self.predefinedOps.updateItemSearchesTypeFilters})
  this.registerFunction({name: 'setAccountName', method: self.predefinedOps.setAccountName})
  this.registerFunction({name: 'substituteItemIdForSerialLotBin', method: self.predefinedOps.validateItemInternalId})
  this.registerFunction({name: 'listingIdLookupFilter', method: self.predefinedOps.updateAdaptorLookupFilter})
  this.registerFunction({name: 'itemAsinLookupFilter', method: self.predefinedOps.updateAdaptorLookupFilter})
  this.registerFunction({name: 'endedlistingIdLookupFilter', method: self.predefinedOps.updateAdaptorLookupFilter})
  this.registerFunction({name: 'gstVatTaxPercentage', method: self.predefinedOps.validateTaxPercentage})
  this.registerFunction({name: 'handleSingleSearchVirtualVariations', method: self.predefinedOps.handleSingleSearchVirtualVariations})
  this.registerFunction({name: 'changeDocumentConnections', method: self.predefinedOps.changeDocumentConnections})
  this.registerFunction({name: 'setTransactionLocationForImport', method: self.predefinedOps.setTransactionLocationForImport})
  this.registerFunction({name: 'updateNetSuiteExportBatchSize', method: self.predefinedOps.updateNetSuiteExportBatchSize})
  this.registerFunction({ name: 'updateFlowIdRunNextFlowIds', method: self.predefinedOps.updateFlowIdRunNextFlowIds })
  this.registerFunction({name: 'validateNSColumnName', method: self.predefinedOps.validateNSColumnName})
  this.registerFunction({ name: 'updateExportPageSize', method: self.predefinedOps.updateExportPageSize })
  this.registerFunction({ name: 'setTransactionDefaultTaxableCode', method: self.predefinedOps.setTransactionDefaultTaxableCode })
  this.registerFunction({name: 'validateLockedSavedSearch', method: self.predefinedOps.validateLockedSavedSearch})
  //TODO: Set options if they are given here
}

/**
* Register connector specific schema so that utils can extract recordType, recordId, Opeartion
*/
Settings.prototype.registerSchema = function() {
  //TODO : design part to register options schema coming from IO
  return true
}

/**
* Register functions implementation
* @param funcObj JSON containing function name and implementation object
* @param callback Callback
* @return Callback with error if any otherwise null
*/
Settings.prototype.registerFunction = function(funcObj) {
  var self = this
  if(funcObj.hasOwnProperty('name') && funcObj.hasOwnProperty('method')) {
    if(typeof funcObj.method === 'function') {
      self[funcObj.name] = funcObj.method
      return true
    }
    else {
        throw new Error('Function implementation is missing while registering this function | '+funcObj.name)
    }
  }
  throw new Error('Either name or method property is missing while registering this function')
}

/**
* Main function will execute in sequence to save changed settings
* @param options contains pending section of changed settings from IO
* @return response to IO after saving settings
*/
Settings.prototype.persistSettings = function(options, callback) {
  // TODO return structured error
  //TODO optimize multiple call of if(error) return callback(error)
  // TODO common function for request call
  var that = this
  var opts =
    { uri: HERCULES_BASE_URL + '/v1/' + 'integrations/' + options._integrationId
    , method: 'GET'
    , headers:
      { Authorization: 'Bearer ' + options.bearerToken
      , 'Content-Type': 'application/json'
      }
    , json: true
    }
  var paramObject =
    { oldSettings : null // before saving settings including setting and its json
    , newSettings : null // contains changed setting and value
    , setting : null // new setting key
    , options : null // contains integration records with shopId
    , settingParams: null // array of setting parameter, assuming ['recordType','recordId','method'] for now
    }
  request(opts, function(error, res, body) {
    if(error) return callback(error)
    paramObject.options = options
    paramObject.options.integrationRecord = body
    that.consumeInput(paramObject, function(error) {
      if(error) return callback(error)
      if(paramObject.sliderInput){
        return that.handleSliderInput(paramObject, function(error) {
          if(error) return callback(error)
          return callback()
        })
      }
      that.loadSettings(paramObject, function(error) {
        if(error) return callback(error)
        that.verifyIfChanged(paramObject, function(error) {
          if(error) return callback(error)
          var errArray = []
          async.forEachOfSeries(paramObject.newSettings, function(value, setting, cb) {
            that.performSettingAction(paramObject, setting, function(error) {
              if(error) {
                errArray.push(error)
                return cb() // ignore error and continue
              }
              return cb()
            })
          }, function(err) {
              var combinedErrorMessage = ''
              _.each(errArray, function(error, index) {
                combinedErrorMessage = combinedErrorMessage ? combinedErrorMessage + '\n' + error.message : error.message
              })
              if (errArray.length > 0 ) {
                return callback(new Error(combinedErrorMessage))
              }
              //save oldSettings in Integrator now
              var opts =
                { uri: HERCULES_BASE_URL + '/v1/' + 'integrations/' + options._integrationId
                , method: 'PUT'
                , headers:
                  { Authorization: 'Bearer ' + options.bearerToken
                  , 'Content-Type': 'application/json'
                  }
                , json: body
                }
              request(opts, function(error, res, body) {
                if(error) {
                  return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
                }
                return callback()
              })
          })
        })
      })
    })
  })
}

/**
* This function must override if IO does not gives default options
* @param options IO options while saving the settings
* @param callback Callback
* @newSettings include new seeting in paramObject
*/
Settings.prototype.consumeInput = function(paramObject, callback) {
  var options = paramObject.options
    , pending = paramObject.options.pending
    , integrationRecord = paramObject.options.integrationRecord
    , newPending
  if(!options.hasOwnProperty('pending'))
    return callback(new Error('pending property is missing from options'))

  if (integrationRecord && integrationRecord.settings && integrationRecord.settings.supportsMultiStore) {
    if (Object.keys(pending).length !== 1) {
      return callback(new Error('pending property has more than one shopId'))
    }

    /* Since shopId not known, iterating only once to return newSettings and shopId,
    assuming there is only one shop id in options */
    _.each(pending, function (value, key) {
      paramObject.options.shopId = key
      newPending = value
    })
  } else {
    newPending = pending
  }

  if (newPending && newPending.flowId && _.isBoolean(newPending.disabled)){
    paramObject.sliderInput = true
    paramObject.flowId = newPending.flowId
    paramObject.disabled = newPending.disabled
  }
  paramObject.newSettings = newPending
  return callback()
}

/**
* Loads the integrator record from IO
* @param bearerToken
* @param integrationId
* @param shopId
* @return old settings before saving settings
*/
Settings.prototype.loadSettings = function(paramObject, callback) {
  var integrationRecord = paramObject.options.integrationRecord
    , oldSettings = {}
    , sections = []
    , that = this
    , oldfields = {}
  try {
    sections = integrationRecord.settings.sections
    if (!sections || !_.isArray(sections) || sections.length < 1)
      return callback(new Error('sections under settings is missing'))
    _.each(sections, function (section) {
      that.loadSectionSettings(section, oldfields)
    })
    that.loadGeneralSectionSettings(integrationRecord.settings.general, oldfields)
    logger.debug('oldfields', JSON.stringify(oldfields)) //sam
    oldSettings = oldfields
    paramObject.oldSettings = oldSettings
    return callback()
  } catch(exception) {
    return callback(exception)
  }
}

Settings.prototype.loadSectionSettings = function (section, oldfields) {
  var that = this

  if (section.hasOwnProperty('sections') && _.isArray(section.sections)) {
    if (section.flows && !section.fields) {
      that.getFlowSettings(section, oldfields)
    }
    _.each(section.sections, function (subSection) {
      that.loadSectionSettings(subSection, oldfields)
    })
  } else {
    _.each(section.fields, function (field) {
      oldfields[field.name] = field
    })
    if (section.flows) {
      that.getFlowSettings(section, oldfields)
    }
  }
}

Settings.prototype.getFlowSettings = function (section, oldfields) {
  _.each(section.flows, function (flow) {
    var settings = flow.settings
    if (!settings) {
      return
    }
    _.each(settings, function (field) {
      oldfields[field.name] = field
    })
  })
}

Settings.prototype.loadGeneralSectionSettings = function(section, oldfields) {
  var that = this
  if(section) {
    if(_.isArray(section)) {
      _.each(section, function(generalSection) {
        that.loadSectionSettings(generalSection, oldfields)
      })
    } else that.loadSectionSettings(section, oldfields)
  }
}

/**
* This function must be implemented to validate settings if any
* @param oldSettings old IO settings
* @param newSettings new IO settings
* @param integrationRecord IO records
*/
Settings.prototype.validateSettings = function(oldSettings, newSettings, integrationRecord) {
  // TODO  Throw error if this function is not overriden by connector
  return true
}

/**
* This function must be used to handle slider Input sent from Integrator UI
* @param oldSettings old IO settings
* @param newSettings new IO settings
* @param integrationRecord IO records
*/
Settings.prototype.handleSliderInput = function(paramObject, callback) {
  // TODO  Throw error if this function is not overriden by connector
  return this.actionSlider(paramObject, callback)
}
/**
* Verify changed settings and return object containing changed one only
* @param oldSettings contains sections object for old settings
* @param newSettings contains pending records coming from IO
* @return newSetings contains changed fields of settings only
*/
Settings.prototype.verifyIfChanged = function(paramObject, callback ) {
  var oldSettings = paramObject.oldSettings
    , newSettings = paramObject.newSettings
  // TODO validate oldSettings and newSettings format
  var changedFields = {}
  _.each(newSettings, function(value, field){
    //when yieldValueAndLabel is set for select field, pending object from IO will be a json object having id & label 
    if(oldSettings.hasOwnProperty(field) && ((oldSettings[field].hasOwnProperty('value') && ((oldSettings[field].type === 'select' && oldSettings[field].properties && oldSettings[field].properties.yieldValueAndLabel) ? !_.isEqual(oldSettings[field].value, (value && value.id)) : !_.isEqual(oldSettings[field].value, value)) && !oldSettings[field].optionsMap) || (!oldSettings[field].value && oldSettings[field].type !== 'staticMapWidget' && !!value ))) {
      changedFields[field] = value
    }
    else if(oldSettings.hasOwnProperty(field) && oldSettings[field].type === 'staticMapWidget' && !oldSettings[field].optionsMap && (oldSettings[field].map = !!oldSettings[field].map ? oldSettings[field].map : {} )
      && (oldSettings[field].default !== value.default || oldSettings[field].allowFailures !== value.allowFailures
        || JSON.stringify(oldSettings[field].map) !== JSON.stringify(value.map))) {
        changedFields[field] = value
    } else if(oldSettings.hasOwnProperty(field) && oldSettings[field].type === 'staticMapWidget' && oldSettings[field].optionsMap && value && value.value && (oldSettings[field].default !== value.default || oldSettings[field].allowFailures !== value.allowFailures
      || JSON.stringify(oldSettings[field].value) !== JSON.stringify(value.value))) {
      changedFields[field] = value.value
    }
  })
  newSettings = changedFields
  paramObject.newSettings = newSettings
  return callback()
}

/**
* Performs saving the settings based on record type, id and operation
* @param oldSettings settings contain fields information
* @param settingName of pending section coming from IO
* @param settingValue of pending section coming from IO
* @param integrationRecord contains old integrations record
*/
Settings.prototype.performSettingAction = function(paramObject, setting, callback) {
  var self = this
  var settingParams = setting.split('_')
  paramObject.settingParams = settingParams
  paramObject.setting = setting
  // TODO design to know parameters at run time
  // assuming settingParams[0] as record_type, settingParams[1] as record_id, settingParams[2] as method
  var op = settingParams[2]
  if(typeof self[op] !== 'function')
    return callback(new Error(op + ' method not registered in connector-utils'))
    self[op](paramObject, function(error) {
    if(error) return callback(error)
    return callback()
  })
}

Settings.prototype.setFieldValues = function(paramObject, cb) {
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , setting = paramObject.setting

  if (oldSettings[setting].properties && oldSettings[setting].properties.yieldValueAndLabel && _.isObject(newSettings[setting]) && newSettings[setting].hasOwnProperty('id')) {
    oldSettings[setting].value = newSettings[setting].id
    oldSettings[setting].options = newSettings[setting].id ? [[newSettings[setting].id, newSettings[setting].label]] : []
  } else {
    oldSettings[setting].value = newSettings[setting]
  }
  return cb(null)
}

Settings.prototype.getSettingsFromHerculesForSingleSection = function(herculesFlowData, sectionName) {
  var resourceId = null,
  resourceType = null,
  settings = herculesFlowData.settings,
  returnSettings = {};
  if(herculesFlowData._importId){
    resourceId = herculesFlowData._importId;
    resourceType = 'imports';
  }
  else if(herculesFlowData._exportId){
    resourceId = herculesFlowData._exportId;
    resourceType = 'exports';
  }
  else {
    //invalid resource type
    return
  }

  //iterate through settings
  //check if the settings are in older format
  if(settings && settings.sections && _.isArray(settings.sections) && settings.sections.length > 0 && settings.sections.fields){
    //nothing to return for old settings
    return {}
  }

  var that = this
  //iterate through these settings and add those
  _.each(settings.sections, function(subSection) {
    if(sectionName && sectionName === subSection.title){
      that.getSettingFromSection(returnSettings, subSection, null)
    }else if(!sectionName){
      that.getSettingFromSection(returnSettings, subSection, resourceId)
    }
  })

  return returnSettings
}

Settings.prototype.getSettingsFromHerculesForSingleSectionWithGrouping = function(herculesFlowData, sectionName) {
  var resourceId = null
  , settings = herculesFlowData.settings
  , returnSettings = {}
  , that = this
  if(herculesFlowData._importId) {
    resourceId = herculesFlowData._importId
  } else if(herculesFlowData._exportId) {
    resourceId = herculesFlowData._exportId
  } else {
    //invalid resource type
    return
  }
  //iterate through these settings and add those
  try {
    _.each(settings.sections, function(subSection) {
      if(sectionName && sectionName === subSection.title) {
        if(subSection.hasOwnProperty('sections') && _.isArray(subSection.sections)) {
          _.each(subSection.sections, function (settingGroupSection) {
            that.getSettingFromSection(returnSettings, settingGroupSection, null)
          })
        } else {
            that.getSettingFromSection(returnSettings, subSection, null)
        }
      } else if(!sectionName) {
        if(subSection.hasOwnProperty('sections') && _.isArray(subSection.sections)) {
          _.each(subSection.sections, function (settingGroupSection) {
            that.getSettingFromSection(returnSettings, settingGroupSection, resourceId)
          })
        } else {
            that.getSettingFromSection(returnSettings, subSection, null)
        }
      }
    })
    return returnSettings
  } catch (ex) {
    logger.info('Settings.getSettingsFromHerculesForSingleSectionWithGrouping, exception ', JSON.stringify(ex))
    return {}
  }
}

// TODO: remove getSettingsFromHerculesForSingleSectionWithGrouping and getSettingsFromHerculesForSingleSection once this function being used in other connectors.
Settings.prototype.getSettingsFromHercules = function (herculesFlowData, accountid, additionalFields) {
  var resourceId = null
  , resourceType = null
  , settings = herculesFlowData.settings
  , returnSettings = {}
  , that = this
  , storeMap
  if(herculesFlowData._importId) {
    resourceId = herculesFlowData._importId
    resourceType = 'imports'
  } else if(herculesFlowData._exportId) {
    resourceId = herculesFlowData._exportId
    resourceType = 'exports'
  } else {
    //invalid resource type
    return
  }

  // copy storeMap keys to returndata
  var copyFields = function (map) {
    _.each(map, function (value, key) {
      if (typeof (value) === 'string') {
        returnSettings[key] = value
      }
    })
  }

  storeMap = _.find(settings.storemap, function (map) {
    // if accountid is present
    // 1. Find store map with accountid and copy fields.
    // 2. Copy fields into return settings and stop as soon as you find a store with same accountid
    if (accountid && map.accountid == accountid) {
      copyFields(map)
      return true
    }
    // if accountid is not present
    // 1. Find store map which has given resourceId in resourceType list of the store
    // 2. Copy fields into return settings and stop as soon as you find a store
    if (!accountid && _.includes(map[resourceType], resourceId)) {
      copyFields(map)
      return true
    }
  }) || null

  // For Multistore, iterate over only corresponding section instead of all sections
  if (!accountid && storeMap) accountid = storeMap.shopid || storeMap.accountid

  // iterate through these settings and add those
  try {
    _.find(settings.sections, function (subSection) {
      if (accountid && subSection.id == accountid) {
        that.iterateSectionsToGetSettings(returnSettings, subSection, resourceId, additionalFields)
        return true
      }
      if (!accountid) {
        that.iterateSectionsToGetSettings(returnSettings, subSection, resourceId, additionalFields)
      }
    })
    that.getGeneralSectionSettings(returnSettings, settings, resourceType, resourceId, accountid)
    return returnSettings
  } catch (ex) {
    logger.info('Etail_Error | Settings.getSettingsFromHercules, exception ', JSON.stringify(ex))
    return {}
  }
}

Settings.prototype.iterateSectionsToGetSettings = function (returnSettings, subSection, resourceId, additionalFields){
  var that = this
  if (subSection.hasOwnProperty('sections') && _.isArray(subSection.sections)) {
    _.each(subSection.sections, function (innerSec) {
      that.iterateSectionsToGetSettings(returnSettings, innerSec, resourceId, additionalFields)
    })
  } else {
    that.getSettingFromSection(returnSettings, subSection, resourceId, additionalFields)
  }
}

Settings.prototype.getSettingFromSection = function (returnSettings, subSection, resourceId, additionalFields){

  _.each(subSection.fields, function(field) {
      //if the setting name matches with resourceId
      if(!resourceId || ~(field.name.indexOf(resourceId))) {
        if(field.hasOwnProperty('value'))
          returnSettings[field.name] = field.value
        else if(field.hasOwnProperty('map'))
          returnSettings[field.name] = {
            map : field.map,
            allowFailures : field.allowFailures
          }
        else
          returnSettings[field.name] = null
      }

      _.find(additionalFields, function (fieldName, index) {
        if (~(field.name.indexOf(fieldName))) {
          if (field.hasOwnProperty('value'))
            returnSettings[fieldName] = field.value
          else if(field.hasOwnProperty('map'))
            returnSettings[fieldName] = {
              map : field.map,
              allowFailures : field.allowFailures
            }
          else
            returnSettings[fieldName] = null
          additionalFields.splice(index, 1)
        }
      })

      if(!returnSettings.hasOwnProperty('defaultGuestCustomer') && ~(field.name.indexOf('defaultGuestCustomer')))
          returnSettings['defaultGuestCustomer'] = field.value
   })
}

Settings.prototype.getGeneralSectionSettings = function(returnSettings, settings, resourceType, resourceId, accountid) {
  var that = this
    , general = null

  if(settings.general && resourceType && resourceId) {
    if(!_.isArray(settings.general)) {
      that.iterateSectionsToGetSettings(returnSettings, settings.general)
    } else {
      if(accountid) {
        general = _.find(settings.general, function (generalSection) {
          return generalSection.id === accountid
        }) || null
      }
      if(general) that.iterateSectionsToGetSettings(returnSettings, general)
    }
  }
}

Settings.prototype.getSavedSearchId = function (paramObject, callback) {
  var integrationRecord = paramObject.options.integrationRecord
  if (paramObject && paramObject.searchId) {
    paramObject.savedSearchId = paramObject.options.pending.searchId
    return
  }
  if (paramObject.options && paramObject.options.pending && paramObject.settingParams && paramObject.settingParams.length > 2) {
    var savedSearchIdKey = paramObject.settingParams[0] + '_' + paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName

    // to check if multi-store is enabled then work according to multi-store paramObject json
    if (integrationRecord && integrationRecord.settings && integrationRecord.settings.supportsMultiStore) {
      _.each(paramObject.options.pending, function (value, key) {
        _.each(value, function (inValue, inKey) {
          if (savedSearchIdKey === inKey) {
            paramObject.savedSearchId = _.isObject(inValue) && inValue.hasOwnProperty('id') ? inValue.id : inValue
            return false
          }
        })
      })
    } else {
      paramObject.savedSearchId = _.isObject(paramObject.options.pending[savedSearchIdKey]) && paramObject.options.pending[savedSearchIdKey].hasOwnProperty('id') ? paramObject.options.pending[savedSearchIdKey].id : paramObject.options.pending[savedSearchIdKey]
    }
    return
  }
  return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))
}

Settings.prototype.getSavedSearchIdAsync = function (paramObject, callback) {
  if(paramObject.savedSearchId) return callback(null, paramObject)
  if(paramObject && paramObject.options.pending.searchId) {
    paramObject.savedSearchId = paramObject.options.pending.searchId
    return callback(null, paramObject)
  } else if(paramObject.options && paramObject.options.pending && paramObject.settingParams && paramObject.settingParams.length > 2) {
    var savedSearchIdKey = paramObject.settingParams[0] + '_' +  paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName
    paramObject.savedSearchId =  _.isObject(paramObject.options.pending[savedSearchIdKey]) && paramObject.options.pending[savedSearchIdKey].hasOwnProperty('id') ? paramObject.options.pending[savedSearchIdKey].id : paramObject.options.pending[savedSearchIdKey]
    return callback(null, paramObject)
  } else {
    return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))
  }
}

/*
 * Aim: To retrieve all the saved searches in the section for which setting's save action is perfomed. It uses our naming convention that saved searches end with 'listSavedSearches'
 * Returns: Array containing searches
 */

Settings.prototype.getAllSavedSearchesInSection = function (paramObject) {
  var savedSearches = []
  , pendingSettings = this.getPendingSettingsObject(paramObject)
  if(pendingSettings.error){
    return pendingSettings
  }

  _.each(pendingSettings.results,function(settingValue, field){
    if(field.indexOf('listSavedSearches') >= 0){
      savedSearches.push(_.isObject(settingValue) && settingValue.hasOwnProperty('id') ? settingValue.id : settingValue)
    }
  })

  return {
    results : savedSearches
    , error : null
  }
}

/*
 * Aim: To retrieve item and matrix item searches in a map.
 */

Settings.prototype.getItemSearches = function (paramObject) {
  var savedSearches = {}
  , pendingSettings = this.getPendingSettingsObject(paramObject)
  , currentSetting = paramObject.setting.split('_')
  , adaptorId

  if(currentSetting.length < 2){
    return {
      error : 'Inside getItemSearches, Settings name does not contain adaptor id.'
    }
  }
  adaptorId = currentSetting[1]

  if(pendingSettings.error){
    return pendingSettings
  }

  _.each(pendingSettings.results,function(settingValue, field){
    if(field.indexOf('listSavedSearches') >= 0 && field.indexOf(adaptorId) >= 0){
      savedSearches.sameAdaptorSearch = _.isObject(settingValue) && settingValue.hasOwnProperty('id') ? settingValue.id : settingValue
    }

    if(field.indexOf('listSavedSearches') >= 0 && field.indexOf(adaptorId) < 0){
      savedSearches.otherAdaptorSearch = _.isObject(settingValue) && settingValue.hasOwnProperty('id') ? settingValue.id : settingValue
    }
  })

  return {
    results : savedSearches
    , error : null
  }
}

/*
 * Aim: To retrieve IO setting value of field. It reads from pending object. so gives the updated value of the settings.
 */
Settings.prototype.getSettingsValue = function (paramObject, fieldIdentifier) {
  var pendingSettings = this.getPendingSettingsObject(paramObject)

  if(!pendingSettings){
    return {
      error : 'Inside getSettingsValue, could not retrieve pendingSettings. Please retry, if issue persists, kindly contact Celigo support.'
    }
  }
  if(pendingSettings.error){
    return pendingSettings
  }

  return _.find(pendingSettings.results, function(value,key){
    return key.indexOf(fieldIdentifier) >= 0
  })
}

Settings.prototype.getAllInventorySavedSearchIdsInSection = function (paramObject) {
  var savedSearches = []
  , pendingSettings = this.getPendingSettingsObject(paramObject)
  if(pendingSettings.error) {
    return pendingSettings
  }

  _.each(pendingSettings.results, function(settingValue, field) {
    if(field.indexOf('listSavedSearches_inv') >= 0){
      savedSearches.push(_.isObject(settingValue) && settingValue.hasOwnProperty('id') ? settingValue.id : settingValue)
    }
  })

  return {
    results : savedSearches
    , error : null
  }
}

Settings.prototype.getKitInventorySavedSearchIdsInSection = function (paramObject) {
  var savedSearches = []
  , pendingSettings = this.getPendingSettingsObject(paramObject)
  if(pendingSettings.error) {
    return pendingSettings
  }

  _.each(pendingSettings.results, function(settingValue, field) {
    if(field.indexOf('listSavedSearches_kit') >= 0){
      savedSearches.push(_.isObject(settingValue) && settingValue.hasOwnProperty('id') ? settingValue.id : settingValue)
    }
  })

  return {
    results : savedSearches
    , error : null
  }
}

/*
 * Aim: To retrieve valid pending object. It returns considering some connector has multi store json where pending object is nested inside the store id property.
 */
Settings.prototype.getPendingSettingsObject = function (paramObject) {

  if(paramObject && paramObject.options && paramObject.options.pending){
    var pendingSettings = {}
    _.each(paramObject.options.pending, function(value, key){
      if(typeof value === 'object'){
        pendingSettings = value
      }else{
        pendingSettings = paramObject.options.pending
      }
      return false
    })

    return {
      results : pendingSettings
      , error : null
    }
  }

  return {
    results : null
    , error : 'Update params does not have valid values. Please update integration data or contact Celigo Support'
    , splunkLog : 'Method: getPendingSettingsObject: Invalid integration json : ' + JSON.stringify(paramObject)
  }
}

Settings.prototype.getMultiExportSavedSearchId = function (paramObject, callback) {
  var integrationRecord = paramObject.options.integrationRecord
  if(paramObject && paramObject.searchId && paramObject.options && paramObject.options.pending && paramObject.options.pending.searchId) {
    paramObject.savedSearchId = paramObject.options.pending.searchId
    return
  }
  if(paramObject.options && paramObject.options.pending && paramObject.settingParams && paramObject.settingParams.length > 2) {
    var savedSearchIdKey = paramObject.settingParams[0] + '_' +  paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName
    , i =3

    while(i<paramObject.settingParams.length){
        savedSearchIdKey += '_'+paramObject.settingParams[i++]
    }
    // to check if multi-store is enabled then work according to multi-store paramObject json
    if (integrationRecord && integrationRecord.settings && integrationRecord.settings.supportsMultiStore) {
      _.each(paramObject.options.pending, function (value, key) {
        _.each(value, function (inValue, inKey) {
          if (savedSearchIdKey === inKey) {
            paramObject.savedSearchId = _.isObject(inValue) && inValue.hasOwnProperty('id') ? inValue.id : inValue
            return false
          }
        })
      })
    } else {
      paramObject.savedSearchId = _.isObject(paramObject.options.pending[savedSearchIdKey]) && paramObject.options.pending[savedSearchIdKey].hasOwnProperty('id') ? paramObject.options.pending[savedSearchIdKey].id : paramObject.options.pending[savedSearchIdKey]
    }
    return
  }
  return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))
}

/**
  staticMapConfig: { // properties to this config may grow based on needs
    distributed: { // add this object to config only if distributed adaptor needs to be updated.
      staticFielddMap: {} //holds the static field mapping
    }
  }
  *Naming convention for static map widget field:
    <adaptorName>_<adaptorId>_<uniqueMethodName>_<NSExecMethodForRefreshMetaData>__<ECPlatformMethodForRefreshMetadata>
*/
Settings.prototype.staticMapFunctionFactory = function(staticMapConfig) {
  var genericOperations = require('./genericOperations.js')
  , that = this

  return function(paramObject, callback) {
    paramObject.staticMapConfig = staticMapConfig
    // Each depedent operation for static map will hold a method in async series call and should be listed after validate method operation.
    async.series([
      //validate eligibility of "paramObject" data for static Map Update
      function(cbSeries) {
        return genericOperations.validateParamObjectDataForStaticMap(paramObject, cbSeries)
      }
      /*Override the called method to extended connector specific operations for static map.
        Do read comment section before defination of the method CAREFULLY before using it.
      */
      , function(cbSeries) {
        return that.extendConnectorSpecificImplementionForStaticMap(paramObject, cbSeries)
      }
      //Updation of saved searches
      , function(cbSeries) {
        if(!paramObject.staticFieldMapUpdateIgnore) {
        if(paramObject.staticMapConfig && paramObject.staticMapConfig.updateSavedSearch) {
          if(paramObject.staticMapConfig.updateFiltersType === 'location')
            return genericOperations.updateSearchLocationFiltersFromMap(paramObject, cbSeries)
          else if(paramObject.staticMapConfig.updateFiltersType === 'locationForMultipleSearch')
            return genericOperations.updateMultipleSearchLocationFiltersFromMap(paramObject, cbSeries)
          else if (paramObject.staticMapConfig.updateFiltersType === 'pricelevel')
            return genericOperations.updateSearchPricingFiltersFromMap(paramObject, cbSeries)
        }
      }
        return cbSeries()
      }

      // Update NS distributed adaptor based on 'distributed' property of staticMapConfig
      , function(cbSeries) {
        if(paramObject.staticMapConfig && paramObject.staticMapConfig.distributed && !paramObject.staticFieldMapUpdateIgnore) return genericOperations.updateDistributedAdaptor(paramObject, cbSeries)
        return cbSeries()
      }

      //validate Search Columns
      , function(cbSeries) {
        if(paramObject.staticMapConfig && paramObject.staticMapConfig.validateSearch === true && !paramObject.staticFieldMapUpdateIgnore) return genericOperations.validateSearchFromMap(paramObject, cbSeries)
        return cbSeries()
      }

      //update Adaptos With Connections
      , function(cbSeries) {
        if(paramObject.staticMapConfig && paramObject.staticMapConfig.updateAdaptorsWithConnections && !paramObject.staticFieldMapUpdateIgnore) return genericOperations.updateAdaptorsWithConnections(paramObject, cbSeries)
        return cbSeries()
      }

      // Update import adaptor lookup based on 'type' property of staticMapConfig
      , function(cbSeries) {
        if(paramObject.staticMapConfig && !paramObject.staticMapConfig.distributed && paramObject.staticMapConfig.importType && !paramObject.staticFieldMapUpdateIgnore) return genericOperations.updateImportAdaptorLookup(paramObject, cbSeries)
        return cbSeries()
      }

    ], function(err) {
      if(err) return callback(err)
      //if all the mappings dependent opeartions are successful, update the setting's map
      genericOperations.updateStaticMap(paramObject, callback)
    })
  }
}

/**
  Use this function to extend operations specific to a connetor for static map widget.
  This function need to be registered befor being used by a connector's setting module.
  *Note that once this function is overriden, it will be executed for every static map widget's save operation
  and functionality for each widget needs to be handled using some condition that identifies the operation respective
  to the widget.
  ex: Below is the pseudo code to handle operations for two different static map widget mappings (shipmethod and paymentmethod)
    if name of widget identifies shipmethod
      perform operation specific to shipmethod
    else if name of widget identifies paymentmethod
      perform operation specific to paymentmethod
    ...
    else callback()
*/

Settings.prototype.extendConnectorSpecificImplementionForStaticMap = function(paramObject, callback) {
  return callback()
}

Settings.prototype.updateResource = function(resourceType, resourceId, paths, values, bearerToken, callback) {
    if(!_.isArray(paths)) paths = [paths]
    if(!_.isArray(values)) values = [values]
    if(paths.length !== values.length)  return callback('Paths and Values arrays should have equal number of entries')

    var requestOptions =
      { uri : HERCULES_BASE_URL + '/v1/' + resourceType + '/' + resourceId
      , method : 'GET'
      , auth : { bearer : bearerToken}
      , json : true
      }
    logger.info('updateResource, requestOptions for GET : ' + JSON.stringify(requestOptions))

    request(requestOptions, function (err, res, body) {
      if(err) return callback(err)
      logger.info('updateResource, GET call res : ' + JSON.stringify(res))
      if(res.statusCode !== 200) return callback('GET call failed for the resource : ' + resourceType + ': ' + resourceId + ', statusCode :' + res.statusCode)
      if(!body) return callback('Empty body returned for the resource : ' + resourceType + ': ' + resourceId)

      try {
        _.each(paths, function (path, index) {
          jsonpath.apply(body, path, function() { return values[index] })
        })
      } catch (ex) {
        return callback(new Error('Unable to assign values of the order ids provided to flow. Exception : ' + ex.message))
      }

      requestOptions.method = 'PUT'
      requestOptions.json = body
      logger.info('updateResource, requestOptions for PUT : ' + JSON.stringify(requestOptions))
      request(requestOptions, function (err, res, body) {
        if(err) return callback(err)
        logger.info('updateResource, res : ' + JSON.stringify(res))
        if(!(res.statusCode == 200 || res.statusCode == 201)) return callback('PUT call failed for the resource : ' + resourceType + ': ' + resourceId + ', statusCode :' + res.statusCode)
        return callback()
      })
    })
  }

/**
 * Used for getting store/account specific storemap values.
 *
 * @param {Object} options - Object containing setting id, bearerToken and integratorId
 * eg.:{"fieldName":"field_name_Id","_integrationId":"XX","bearerToken":"XX", _exportId/_importId: "XX", "integrationRecord": "Object"}
 * @param {Object} settingParams(optional) - Not needed in case of hooks. - Object containing settings resourcetype, resourceId and their functions.
 */
 Settings.prototype.getStoreMap = function (options, settingParams) {
  if (options && options.configuration && options.configuration.sectionId && options.settings && options.settings.storemap && !_.isEmpty(options.settings.storemap)) {
    var storeMap = _.find(options.settings.storemap, { shopid: options.configuration.sectionId })
    if (storeMap) return storeMap
  }
  var settings
  if (settingParams) {
    settings = options.integrationRecord.settings || null
    if (settingParams[0] === 'exports') {
      options._exportId = settingParams[1]
    } else if (settingParams[0] === 'imports') {
      options._importId = settingParams[1]
    } else if (settingParams[0] === 'flows') {
      options._flowId = settingParams[1]
    } else {
      return undefined
    }
  } else {
    settings = options.settings || null
  }

  // added for backward compatibility if etail-stack is updated but connector's integration is not updated for multi-store.
  if (!settings || !settings.storemap) {
    if (settings && settings.commonresources) {
      return settings.commonresources
    } else {
      return undefined
    }
  }

  var adaptorId = options._exportId
  var adaptor = 'exports'
  if (!adaptorId) {
    adaptorId = options._importId
    adaptor = 'imports'
  }
  if (!adaptorId && options._flowId) {
    adaptorId = options._flowId
    adaptor = 'flows'
  }
  if (!!settings && !!settings.storemap) {
    var storeMap = _.find(settings.storemap, function (storemap) {
      if (_.isArray(storemap[adaptor]) && _.includes(storemap[adaptor], adaptorId)) {
        return true
      }
    })
    return storeMap
  } else {
    return undefined
  }
}

module.exports = Settings
