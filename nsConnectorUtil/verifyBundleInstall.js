'use strict'

var _ = require('lodash')
  , request = require('request')
  , async = require('async')
  , utils = require('../installer/installerHelper')
  , CONSTS = require('../constants')

//constructor
function VerifyBundleInstall() {

}

/**
* Performs the execution of verifying a bundle on NetSuite account
* @param paramObject eg.:{"bearerToken":"XX","integrationId":"XX","nsConnectionId":"XX"}
* bearerToken is mandatory.
* If nsConnectionId is provided, the method will directly use that to make proxy call to IO,
* else,
* method will load the integration using integrationId, read nsConnectionId from location "settings.commonresources.netsuiteConnectionId"
* @param scriptId : scriptId of the Bundle Installation script.
* @param callback
* @return err
* @return isBundlePresent : Boolean value
* @return results : results of the search performed in NetSuite
*/
VerifyBundleInstall.prototype.execute = function (paramObject, callback) {
  var that = this
  , scriptId = paramObject.scriptId || null
  , isPresent = false

  if(!paramObject || !paramObject.bearerToken || (!paramObject.nsConnectionId && !paramObject.integrationId)) {
    utils.logInSplunk('No bearerToken or nsConnectionId/integrationId provided.')
    return callback(null, isPresent)
  }

  if (!scriptId) {
    utils.logInSplunk('No scriptId provided in verifying bundle install ')
    return callback(null, isPresent)
  }

  var opts =
    { bearerToken : paramObject.bearerToken
    , connectionId : paramObject.nsConnectionId || null
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
        { requests :
            [
              { type : 'method'
              , operation : 'verifyBundleInstall'
              , config :
                {  parameters : { scriptId : scriptId }  }
              }
            ]
        }
    }

  that.getConnectionIdFromIntegrationIfRequired(opts, paramObject, function(error) {
    if(error) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
    utils.integratorProxyCall(opts, function(e, r, b) {
      if(e) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
      b = b[0] || {}
      if(b && b.statusCode === 200 && b.results.length >=1 ) {
        isPresent = true
      }
      return callback(null, isPresent, b.results || [])
    })
  })
}

VerifyBundleInstall.prototype.getConnectionIdFromIntegrationIfRequired = function (opts, paramObject, callback) {
  if (opts.connectionId) return callback()
  utils.integratorRestClient({ bearerToken: paramObject.bearerToken, resourcetype: 'integrations', id: paramObject.integrationId }, function (err, response, body) {
    if (err) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))

    var installSteps = body && body.install
    var netsuiteConnectionStep = _.find(installSteps, function (step) {
      return (step.installerFunction === 'verifyNetSuiteConnection' || (step.sourceConnection && step.sourceConnection.type == "netsuite"))
    })

    try {
      var nsConnectionId = (netsuiteConnectionStep && netsuiteConnectionStep._connectionId) || body.settings.commonresources.netsuiteConnectionId || null
    } catch (ex) {
      return callback(new Error('Integration does not contain netsuiteConnectionId at location settings.commonresources.netsuiteConnectionId '))
    }

    if (!nsConnectionId) return callback(new Error('Error while connecting to ' + CONSTS.IODOMAIN))
    opts.connectionId = nsConnectionId
    return callback()
  })
}

module.exports = VerifyBundleInstall
