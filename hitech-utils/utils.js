'use strict'

var request = require('request')
  , _ = require('lodash')
  , async = require('async')
  , findWhere = require('lodash.findwhere')
  , flat = require('flat')
  , HERCULES_BASE_URL
  , CONSTS = require('../constants')

if (['production', 'travis'].indexOf(process.env.NODE_ENV) !== -1) {
  HERCULES_BASE_URL = 'https://api.' + CONSTS.IODOMAIN
} else if (process.env.NODE_ENV === 'staging') {
  HERCULES_BASE_URL = CONSTS.IODOMAIN ? ('https://api.' + CONSTS.IODOMAIN) : 'https://api.staging.integrator.io'
} else {
  HERCULES_BASE_URL = 'http://api.localhost.io:5000'
}

var utils = {

  resolveIds: function(resourceConfigArray, globalState) {
    _.each(resourceConfigArray, function(resourceConfig) {
      _.forEach(resourceConfig, function(value, key) {
        //as per the naming pattern, reference fields will always start from underscore '_'
        if (key.indexOf('_') !== 0)
          return
        var searchObj = {}
        searchObj.name = resourceConfig[key]
        var objFromState = findWhere(globalState.configs, searchObj)
        if (objFromState && _.has(objFromState, '_id')) {
          resourceConfig[key] = objFromState._id
          if (_.has(resourceConfig, '_connectorId') && _.has(objFromState, '_connectorId')) {
            resourceConfig._connectorId = objFromState._connectorId
          }
        }
      })
    })
    return resourceConfigArray
  },

  createIOResource: function(resourceConfigArray, globalState, callback) {
    resourceConfigArray = utils.resolveIds(resourceConfigArray, globalState)
    var asyncLimit = 10
    if (!_.isEmpty(resourceConfigArray) && resourceConfigArray[0].isDistributed == true)
      asyncLimit = 1 // Assumption here is that all the records in the resourceConfigArray are of same resourceType
    async.eachLimit(resourceConfigArray, asyncLimit
      , function(resource, cb) {
        var relUri = '/v1/' + resource.resourceType
          , reqMethod = 'POST'

        if (resource.isDistributed == true) {
          relUri = relUri + '/' + resource._id + '/distributed'
          reqMethod = 'PUT'
        }
        utils.requestIntegrator(relUri, reqMethod, resource, null, globalState.bearerToken, null, function(err, res, body) {
          if (err) return cb(err)
          resource._id = body._id
          globalState.configs.push(resource)
          cb(null)
        })
      }
      , function(err) {
        if (err) return callback(err)
        return callback(null)
      })
  },

  buildNameMap: function(records) {
    var map = {}
    _.forEach(records, function(record) {
      map[record.name] = record
    })
    return map
  },

  concatDedup: function(hiPrecedenceArr, loPrecedenceArr, prop) {
    var concatArray = _.union(hiPrecedenceArr, loPrecedenceArr)
      , uniqArray = _.uniqBy(concatArray, prop)
    return uniqArray
  },

  requestNSConnection: function(_connectionId, scriptId, deployId, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + '/v1/connections/' + _connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
        , 'Integrator-Netsuite-ScriptId': scriptId
        , 'Integrator-Netsuite-DeployId': deployId
        , 'Integrator-Method': reqMethod
      }
      , json: data
    }

    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          if (errorMsg)
            return cb(new Error(errorMsg))
          else
            return cb(new Error('statuscode not in (200, 201, 204) for scriptId=' + scriptId))
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },

  requestRestConnection: function(_connectionId, relativeURI, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + '/v1/connections/' + _connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
        , 'Integrator-Relative-URI': relativeURI
        , 'Integrator-Method': reqMethod
      }
      , json: data
    }

    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          if (errorMsg)
            return cb(new Error(errorMsg))
          else
            return cb(new Error('statuscode not in (200, 201, 204) for relative-uri=' + relativeURI))
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },

  requestIntegrator: function(relativeURI, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + relativeURI
      , method: reqMethod
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: data
    }

    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          if (errorMsg)
            return cb(new Error(errorMsg))
          else
            return cb(new Error('statuscode not in (200, 201, 204) for relative-uri=' + relativeURI))
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },

  preProcessMapping: function(rec, version) {
    var fields
      , lists

    if (rec && rec.mapping && rec.mapping.mappings) {
      fields = []
      lists = []
      if (!!version) {
        // Update functionality case
        _.forEach(rec.mapping.mappings, function(mapRec) {
          if (mapRec.version > version) {
            _.forEach(mapRec.fields, function(fieldRec) {
              fields.push(fieldRec)
            })
            _.forEach(mapRec.lists, function(listRec) {
              lists.push(listRec)
            })
          }
        })
      } else {
        // Install functionality case
        _.forEach(rec.mapping.mappings, function(mapRec) {
          _.forEach(mapRec.fields, function(fieldRec) {
            fields.push(fieldRec)
          })
          _.forEach(mapRec.lists, function(listRec) {
            lists.push(listRec)
          })
        })
      }
      rec.mapping = {
        fields: fields
        , lists: lists
      }
    }
    return rec
  },

  isTestModeOn: function(options, propertyName) {
    var result = false
    if (options &&
      options.settings &&
      options.settings.general &&
      options.settings.general.fields &&
      _.isArray(options.settings.general.fields)) {
      result = _.find(options.settings.general.fields, function(field) {
        return field.name == propertyName
      }).value
    }
    return result
  },

  isTestTextPresent: function(inputField, testText) {
    var inputFieldFlattened = flat(inputField)
      , result = false
    _.forEach(inputFieldFlattened, function(value) {
      if (typeof value === 'string' && value.indexOf(testText) === 0) {
        result = true
      }
    })
    return result
  },

  responseDataAfterValidation: function(options, propertyName) {
    var testText, i
    if (!!options &&
      !!options.settings &&
      !!options.settings.general &&
      !!options.settings.general.fields) {
      testText = _.find(options.settings.general.fields, function(field) {
        return field.name == propertyName
      }).value
    }

    if (!testText)
      return

    for (i = 0; i < options.data.length; i++) {
      if (!utils.isTestTextPresent(options.data[i], testText)) {
        options.data[i] = null
      }
    }
  },

  enableDisableFlow: function(flow, disabled, configToSend, toReturn, bearerToken, callback) {
    flow.disabled = disabled
    utils.requestIntegrator('/v1/flows/' + flow._id, 'PUT', flow, 'Could not save the flow setting', bearerToken, callback, function() {
      if (configToSend) {
        configToSend.disabled = disabled
        utils.requestIntegrator('/v1/exports/' + flow._exportId + '/distributed', 'PUT', configToSend, 'Could not save the flow setting in NetSuite', bearerToken, callback, function() {
          return callback(null, toReturn)
        })
      } else return callback(null, toReturn)
    })
  },

  getSettingsMap: function(settings) {
    var settingsMap = {}

    _.forEach(settings.sections, function(section) {
      _.forEach(section.fields, function(field) {
        settingsMap[field.name] = field.value
      })

      _.forEach(section.flows, function(flow) {
        if (flow.settings) {
          _.forEach(flow.settings, function(setting) {
            settingsMap[setting.name] = setting.value
          })
        }
      })
    })

    if (settings.general) {
      _.forEach(settings.general.fields, function(field) {
        settingsMap[field.name] = field.value
      })
    }
    return settingsMap
  }
}

module.exports.utils = utils
