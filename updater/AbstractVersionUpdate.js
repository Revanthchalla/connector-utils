'use strict'
//module loading
var installerUtils = require('../installer/installerHelper')

//class
/**
* options:
*         bearerToken
*         integrationId
*         integration
*         version
*/

function AbstractVersionUpdate(options){
  installerUtils.logInSplunk('requestOptions' + JSON.stringify(options), 'info')
  if(!options || !options.integrationId){
    throw new Error({
      code: 'missing_variable'
      , message: 'Missing integrationId in constructor'
    })
  }

  if(!options || !options.bearerToken){
    throw new Error({
      code: 'missing_variable'
      , message: 'Missing bearerToken in constructor'
    })
  }

  if(!options || !options.version){
    throw new Error({
      code: 'missing_variable'
      , message: 'Missing version in constructor'
    })
  }

  if(!options || !options.integration){
    throw new Error({
      code: 'missing_variable'
      , message: 'Missing integration in constructor'
    })
  }

  this._version = options.version
  this._integrationId = options.integrationId
  this._integration = options.integration
  this._bearerToken = options.bearerToken
  this._skippable = options.skippable || false
}

/*
updateLogic must be overriden. Overriden method must not make call to integration resource and must use
getIntegration method to load the integration data and update this reference object for any changes to integration data.
*/
AbstractVersionUpdate.prototype.updateLogic = function(callback){
  return callback(new Error({
    code: 'implement_abstract_function'
    , message: 'Implement updateLogic for version: ' + this.getVersion()
  }))
}

AbstractVersionUpdate.prototype.applyUpdate = function(callback){
  try{
    var that = this
    installerUtils.logInSplunk('starting updateLogic for version: ' + that.getVersion(), 'info')

    that.updateLogic(function(error, response){
      if(error){
        installerUtils.logInSplunk('finished updateLogic for version: ' + that.getVersion() + ' with error', error)
        return callback(error)
      }
      //if updateLogic is success
      //set version in integration JSON
      var integration = that.getIntegration()
      integration.version = that.getVersion()
      integration.updateInProgress =false
      that.setIntegration(integration)

      installerUtils.logInSplunk('finished updateLogic for version: ' + that.getVersion() + ' with success', 'info')
      var requestOptions = {
        bearerToken: that.getBearerToken()
        , resourcetype: 'integrations'
        , data: that.getIntegration()
        , id: that.getIntegrationId()
      }
      //save the integration record with given version
      installerUtils.integratorRestClient(requestOptions, function(error, response, body){
        installerUtils.logInSplunk('saving integration for version: ' + that.getVersion(), 'info')
        if(error){
          return callback(error)
        }
        return callback(null, body)
      })
    })
  }catch(error){
    return callback(error)
  }
}

AbstractVersionUpdate.prototype.getBearerToken = function(){
  return this._bearerToken
}

AbstractVersionUpdate.prototype.setVersion = function(version){
  this._version = version
}

AbstractVersionUpdate.prototype.getVersion = function(){
  return this._version
}

AbstractVersionUpdate.prototype.setIntegration = function(integration){
  this._integration = integration
}

AbstractVersionUpdate.prototype.getIntegration = function(){
  return this._integration
}

AbstractVersionUpdate.prototype.getIntegrationId = function(version){
  return this._integrationId
}

AbstractVersionUpdate.prototype.getSkippable = function(){
  return this._skippable
}

AbstractVersionUpdate.prototype.setSkippable = function(skippable){
  this._skippable = skippable
}

module.exports = AbstractVersionUpdate
