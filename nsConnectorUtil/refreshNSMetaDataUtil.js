'use strict'

var _ = require('lodash')
  , utils = require('../installer/installerHelper')
  , CONSTS = require('../constants')

exports.executeNsOperation = function(paramObject, callback) {
  var options = paramObject.options
  , nsConnectionId = paramObject.nsConnectionId
  , opts =
    { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
        { requests :
            [
              { type : options.methodType || 'method' 
              , operation : options.methodName
              , config : options.searchConfig || options.metaDataConfig || {}
              }
            ]
        }
    }

   utils.integratorProxyCall(opts, function(e, r, b) {
     var errorMessage = 'Error while performing operation. Please contact Celigo Support. '
     if(e) return callback(new Error(errorMessage))
     b = b && b[0] || null
     if(!b || !b.statusCode || b.statusCode !== 200) {
       if(b && b.error && b.error.message) return callback(new Error(errorMessage + b.error && b.error.message))
       return callback(new Error(errorMessage))
     }
     return callback(null, b.results)
   })
}
