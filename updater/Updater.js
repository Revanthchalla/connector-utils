'use strict'

//modules loading
var
  _ = require('lodash')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , installerUtils = require('../installer/installerHelper')
  , fs = require('fs')
  , semver = require('semver-compare')
  , async = require('async')
  , path = require('path')
  , AbstractVersionUpdate = require('./AbstractVersionUpdate')
  , _ = require('lodash')


//class
/**
* options:
*         bearerToken
*         integrationId
*         updateCodeRepo
*/
function Updater (options) {
  if(!options){
    options = {}
  }

  this._integrationId = options._integrationId
  this._integration = options.integration
  this._bearerToken = options.bearerToken
  this._licenseOpts = options.licenseOpts
  this._connectionsToVerify = options.connections

  this._updateCodeRepo = options.updateCodeRepo || '../../../updateCodeRepo'
  //perform validation later
  this._validated = false;
}

util.inherits(Updater, EventEmitter)

Updater.prototype.applyUpdates = function (callback) {
  var that = this

  that.validateUpdater(function( error, success ){
    if(error){
      return callback(error)
    }
    if(!success){
      return callback(new Error('update has failed in validations for installer.'))
    }
    else that._validated = true
    //basic validation is completed
    //load update files from updateFileLocation, remo
    var arrUpdateFileNames
    try {
      that._updateCodeRepo = path.resolve(__dirname, that._updateCodeRepo)
      arrUpdateFileNames = fs.readdirSync(that._updateCodeRepo)
    } catch (e) {
      return callback(e)
    }

    //filter file names
    for(var index = 0; index<arrUpdateFileNames.length; ) {
      var regex = /^(\d+\.)(\d+\.)(\d+)(.js)$/ //regex format digits.digits.digits.js
      if(!regex.test(arrUpdateFileNames[index])) arrUpdateFileNames.splice(index, 1)
      else index++
    }
    //sort update file names based on semantic versioning
    arrUpdateFileNames.sort(function(a, b) {
      a=a.replace('.js','')
      b=b.replace('.js', '')
      return semver(a, b)
    })
    installerUtils.logInSplunk('File to be updated: ' + JSON.stringify(arrUpdateFileNames), 'info')
    //check if all required updates are instace of AbstractVersionUpdate class
    //if no abort the update process
    //else start the process
    //for each update
    var waitForPrevVersionUpdateToComplete = false
    , prevVersionUpdateFailed = false
    , currentVersion = that._integration.version
    if(!currentVersion) {
      installerUtils.logInSplunk('Error While Getting Integration version _integrationId:' + that._integration.id, 'info')
      return callback(new Error(`Error while getting intergration version Integrationid: ${that._integration.id}`))
    }

    /**
     * Introducing migration state to keep skippable migration versions.
     * We will be maintaining skippable versions in migration state.
     * {"skippable": ["x.x.x", "x.x.x"]}
     * Using this skippable state we will not escaping file which present in skippable and execute until it get executed properly and it will get removed from migration state.
     * Usage:
     * Mark this._skippable = true in constructor for which migration you want to skip.
     * Added two functions
     * 1. getMigrationState : to get migration state /v1/integrations/:id/state/migrationState
     * 2. updateMigrationState: here we will save migration to add/remove skippable versions into state.
     */
    that.getMigrationState(that._integrationId, function (err, migrationState) {
      var skippableVersions = []
      if (err) return callback(err)

      // checking if migrationState skippable array exists then use that array.
      if (migrationState && migrationState.skippable) skippableVersions = migrationState.skippable
      async.eachSeries(arrUpdateFileNames, function(fileName, cbEachSeries) {

        var fileVersion = fileName.replace('.js', '')
        var fileversionDiff = semver(currentVersion, fileVersion)
        // checking filename version in skippable array. if exists then do not skip.
        if (currentVersion && fileversionDiff >= 0 && !_.includes(skippableVersions, fileVersion)) {
          installerUtils.logInSplunk('escaping update for version: ' + fileVersion, 'info')
          return cbEachSeries()
        }

        installerUtils.logInSplunk('Waiting for version update to complete', 'info')
        while(waitForPrevVersionUpdateToComplete) {}
        waitForPrevVersionUpdateToComplete = true

        if(prevVersionUpdateFailed) {
          installerUtils.logInSplunk('prev version update failed returning', 'info')
          return cbEachSeries()
        }
        try {
          //if target version is less than current version then escape the target version
          // checking filename version in skippable array. if exists then do not skip.
          if (fileversionDiff >= 0 && !_.includes(skippableVersions, fileVersion)) {
            installerUtils.logInSplunk('escaping update for version: ' + fileVersion, 'info')
            waitForPrevVersionUpdateToComplete = false
            return cbEachSeries()
          }

          // to check if skippable version is less than current version then do not update integration version.
          var integrationVersionToBeUpdated = fileversionDiff >= 0 ? currentVersion : fileVersion

          , integrationBodyBeforeUpdate = _.cloneDeep(that._integration)
          , versionUpdaterOptions = {
            integrationId : that._integrationId
            , bearerToken : that._bearerToken
            , version : integrationVersionToBeUpdated
            , integration: that._integration
            , skippable: false
          }

          //call abstract method for applyUpdate with required arguments
          var VersionUpdater = require(path.resolve(that._updateCodeRepo,fileName)).VersionUpdater
          , objVersionUpdater = new VersionUpdater(versionUpdaterOptions)

          //Earlier, the following assertion was checking if the objVersionUpdater is an instance of ./AbstractVersionUpdate
          //This was failing in case of Marketplace Connectors.This is because although
          // they(1.1.1.js) were extending AbstractVersionUpdate only, still it was not the same class located at ./AbstractVersionUpdate
          //TODO : Figure out above root cause.
          if(typeof objVersionUpdater.applyUpdate !== 'function') {
            return cbEachSeries(new Error('VersionUpdater of file '+ fileName +' does not inherit AbstractVersionUpdate. applyUpdate function not found in the file.'))
          }

          objVersionUpdater.applyUpdate(function(error, response){
            //if call is not successful, revert the state of integration back to the previous one(make sure to check updateInProgress)

            // checking if error occur and skippable false then throw error.
            if(error) {
              //saving the failed version
              that.failedVersion = fileVersion
              that._integration = integrationBodyBeforeUpdate
              // if skippable true then add file version in skippable array.
              if (objVersionUpdater.getSkippable()) {
                installerUtils.logInSplunk('Migration, After applyUpdates, adding skippable version: ' + fileName.replace('.js', '') + ' for the integration #' + that._integrationId, 'info')
                  if (!_.includes(skippableVersions, fileVersion)) {
                    skippableVersions.push(fileVersion)
                  }
                // call update migration state to add/remove file version from skippable array.
                that.updateMigrationState({
                  skippableVersions: {skippable: skippableVersions},
                  integrationId: that._integrationId
                }, function (err, body) {
                  if (err) return cbEachSeries(err)
                  waitForPrevVersionUpdateToComplete = false
                  return cbEachSeries()
                })
              } else {
                integrationBodyBeforeUpdate.updateInProgress = false
                var integrationsOptions = {
                  'bearerToken': that._bearerToken
                  , 'resourcetype': 'integrations'
                  , 'id': that._integrationId
                  , 'data': integrationBodyBeforeUpdate
                }

                installerUtils.integratorRestClient(integrationsOptions, function(err, res, body) {
                  prevVersionUpdateFailed =true
                  waitForPrevVersionUpdateToComplete = false
                  if(err) return cbEachSeries(err)
                  that._integration = integrationBodyBeforeUpdate
                  return cbEachSeries(error)
                })
              }
            }
            //if success, advance the version to current filename
            //commit the update to IO : Done via applyUpdate function
            else { // else if no error.
                that._integration = response
                // if skippable true(it means skippable migration executed properly) then remove file version from skippable array.
                if (objVersionUpdater.getSkippable() && _.includes(skippableVersions, fileVersion)) {
                  installerUtils.logInSplunk('Migration, After applyUpdates, Removing skippable version: ' + fileVersion + ' for the integration #' + that._integrationId, 'info')
                  _.remove(skippableVersions, function (version) {
                    if (version === fileVersion) {
                      return true
                    }
                  })

                  // call update migration state to add/remove file version from skippable array.
                  that.updateMigrationState({
                    skippableVersions: {skippable: skippableVersions},
                    integrationId: that._integrationId
                  }, function (err) {
                    if (err) return cbEachSeries(err)
                    waitForPrevVersionUpdateToComplete = false
                    return cbEachSeries()
                  })
                } else {
                  waitForPrevVersionUpdateToComplete = false
                  return cbEachSeries()
                }
            }
          })
        } catch(e) {
          return cbEachSeries(e)
        }
      }, function(err) {
        //reset updateInProgress
        that.getIntegrationAndResetUpdateInProgress(function(errResetUpdateInProgress) {
          if(err) {
            return callback(err, that)
          }
          else if(errResetUpdateInProgress) return callback(errResetUpdateInProgress, that)

          return callback(null, that)
        })
      })
    })
  })
}

/**
 *
 * @param integrationId
 * @param callback
 * This function is used to get migration state.
 */
Updater.prototype.getMigrationState = function (integrationId, callback) {
  var stateRequest = {
    'bearerToken': this._bearerToken,
    'resourcetype': 'integrations/' + integrationId + '/state/migrationState',
    'method': 'GET'
  }

  installerUtils.integratorStateClient(stateRequest, function (err, response, body) {
    if (err && response && response.statusCode !== 404) {
      return callback(err)
    }

    return callback(null, body)
  })
}

/**
 *
 * @param options
 * @param callback
 * This function is used to update migration state.
 */
Updater.prototype.updateMigrationState = function (options, callback) {
  var stateRequest = {
    'bearerToken': this._bearerToken,
    'resourcetype': 'integrations/' + options.integrationId + '/state/migrationState',
    'method': 'PUT',
    'data': options.skippableVersions
  }

  installerUtils.integratorStateClient(stateRequest, function (err, response, body) {
    if (err) return callback(err)
    return callback()
  })
}

Updater.prototype._validateUpdaterArguments = function () {
  //load connections and see if offline field is true
  //
}

Updater.prototype.validateUpdater = function(callback){
  var that = this
  installerUtils.logInSplunk('starting the validateUpdater function', 'info')

  if(this._validated){
    installerUtils.logInSplunk('_validated' + this._validated, 'info')
    return callback(null, this._validated)
  }
  //
  var requestOptions = {
     bearerToken: this._bearerToken
     ,resourcetype: 'connections'
  }
  installerUtils.logInSplunk('requestOptions' + JSON.stringify(requestOptions), 'info')
  installerUtils.integratorRestClient(requestOptions, function(error, res, body){
    var offlineConnections = []
    if(error) {
      return that.getIntegrationAndResetUpdateInProgress(function(err) {
        if(err) return callback(err)

        return callback(error)
      })
    }

    if(!body || !_.isArray(body)) {
      //get Integration and set update in progress false
      return that.getIntegrationAndResetUpdateInProgress(function(err) {
        if(err) return callback(err)
        return callback(new Error("Body of response is not in proper format"))
      })
    }

    //all connections are loaded
    //go through all connections and see if anyone is offline
    // should not check default secondary ns connection
    //TODO: use ping to check for offline
    _.each(body, function(connection){
        if(connection && connection.offline && connection.offline && (connection.externalId ? (connection.externalId.indexOf('secondary_netsuite_connection') > -1 ? false: true) : true) && connection._integrationId && connection._integrationId === that._integrationId){
          offlineConnections.push(connection)
        }
    })

    if(offlineConnections.length>0){
      //get Integration and set update in progress false
      return that.getIntegrationAndResetUpdateInProgress(function(err) {
        if(err) return callback(err)
        return callback(new Error('some connections are offline for this user, connections'
        + JSON.stringify(offlineConnections)))
      })
    }

    return callback(null, true)
  })
}

Updater.prototype.fileLoader = function(){
  //check if the folder exists

}

Updater.prototype.getIntegrationAndResetUpdateInProgress = function (callback) {
  var that = this
  that._integration.updateInProgress = false
  var integrationsOptions = {
    'bearerToken': that._bearerToken
    , 'resourcetype': 'integrations'
    , 'id': that._integrationId
    , 'data': that._integration
  }
  installerUtils.integratorRestClient(integrationsOptions, function (err, res, body) {
    if (err) return callback(err)
    that._integration = body
    return callback(null)
  })
}

module.exports = Updater
