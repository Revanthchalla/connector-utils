'use strict'

/**
  common Operations
*/

var settingsUtil ={}

settingsUtil.getCommonResources = function(paramObject) {

  if(!!paramObject && !!paramObject.options && !!paramObject.options.integrationRecord && !!paramObject.options.integrationRecord.settings && !!paramObject.options.integrationRecord.settings.commonresources)
    return paramObject.options.integrationRecord.settings.commonresources
  else return null

}

module.exports = settingsUtil