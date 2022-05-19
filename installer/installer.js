'use strict'

var installerHelper = require('./installerHelper.js')
, _ = require('lodash')
, CONSTS = require('../constants.js')

function Installer() {

}

Installer.prototype.createRecordsInOrder= function (recordarray, key, options, callback) {
  if(!installerHelper.validateOptions(options)) {
    var err = new Error('Either bearerToken or integration id missing from option')
    return callback(err.message)
  }

  if(installerHelper.isCyclic(recordarray)) {
    var err = new Error('The recordsArray has cyclic refreneces')
    return callback(err.message);
  }

  if(!key) {
    var err = new Error('key is missing, Please provide key to proceed')
    return callback(err.message) // TODO need to validate if key exists
  }

  var opts =
  { bearerToken: options.bearerToken
  , resourcetype: 'integrations/' + options._integrationId + '/state/' + (options.state || CONSTS.STATE)
  , method: 'GET'
  }

  installerHelper.integratorStateClient(opts, function(error, res, body) {
    var serializedState = body
    if(error)  return callback(error) // fatal error
    if (!res) return callback(new Error("Unexpected response while fetching state. Please retry, if the issue persists, please contact Celigo Support."))
    if (res.statusCode === 401) return callback(new Error('401 Unauthorized. Please retry, if the issue persists, please contact Celigo Support.'))
    if(serializedState && serializedState[key]) {
      if(installerHelper.verifyAllResolved(serializedState[key])) {
        if(!serializedState['old_' + key]) {
          serializedState['old_' + key] = []
        }
        serializedState['old_' + key].push(serializedState[key])
        delete serializedState[key]
      } else {
        installerHelper.logInSplunk('Going to resume the installer from previous state')
        recordarray = serializedState[key] // resume for current state
      }
    }
    else if(!serializedState) {
      serializedState = {}
    }
    if (typeof(serializedState) !== "object") {
      return callback(new Error('Received unexpected format for state. Please retry, if the issue persists, please contact Celigo Support.'))
    }
    installerHelper.createRecordsInOrderHelper(recordarray, options, function(error) {
      // TODO Minimize the recordarray data with requited fields only before saving current state
      installerHelper.saveState(recordarray, serializedState, key, options, function(err) {
        // save the state to resume even if getting error
        if(err) {
          installerHelper.logInSplunk('Could not save the current state for key for: ' + key)
        }
        if(error) {
          return callback(new Error(error.message ? error.message : JSON.stringify(error)))
        }
        return callback(null, recordarray)
      })
    })
  })
}

module.exports = Installer
