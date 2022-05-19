'use strict'

var _ = require('lodash')
  , async = require('async')
  , jsonPath = require('jsonpath')
  , request = require('request')
  , logger = require('winston')
  , moment = require('moment')
  , handlebars = require('handlebars')
  , CONSTS = require('../constants.js')
  , path = require('path')
  , fs = require('fs')
  , semver = require('semver-compare')

var saveState = function(recordarray,serializedState, key, options, callback) {
  var opts =
  { bearerToken: options.bearerToken
  , resourcetype: 'integrations/' + options._integrationId + '/state/' + (options.state || CONSTS.STATE)
  , method: 'PUT'
  }
    if(serializedState && serializedState.errors && _.isArray(serializedState.errors)) {
      delete serializedState.errors
    }
    if(typeof(serializedState) === "object") serializedState[key] = recordarray
    opts.data = serializedState
    integratorStateClient(opts, function(error, res, body) {
      if(error) return callback(error)
      return callback()
    })
}
, createRecordsInOrderHelper = function(recordarray, options, callback) {
    //the record should Directed Acyclic Graph
    if(!!options && (!!options.upgradeMode || !!options.connectorEdition)) {
      //TODO: add a function to validate edition of nodes to be compatible with editions of dependent nodes

      // Assigned the response of trimNodesBasedOnEdition in a variable to check if any error occur in function.
      var trimNodeResponse =  trimNodesBasedOnEdition(recordarray, options)
      if(trimNodeResponse && trimNodeResponse.error) {
        return callback(trimNodeResponse.error)
      }
    }
    //load all json data from filesystem into info variable
    var temprecord;
    for (temprecord in recordarray) {
      //for each record load file from fs into variable info
      if (!(recordarray[temprecord].filelocation || recordarray[temprecord].isLoaded)) {
        var err = new Error('Config Error: no filelocation given in record : ' + temprecord)
        return callback(err.message)
      }
      if (!recordarray[temprecord].isLoaded) {
        if (options.connectorConstants && options.connectorConstants.CONNECTOR_BASE_PATH) {
          recordarray[temprecord].info = loadJSON(options.connectorConstants.CONNECTOR_BASE_PATH + recordarray[temprecord].filelocation)
        } else {
          recordarray[temprecord].info = loadJSON(recordarray[temprecord].filelocation)
        }
        recordarray[temprecord].isLoaded = true;
          //add bearer token in info node
        //if it is already resolved directly load in response
        if (recordarray[temprecord].resolved) {
          if (options.connectorConstants && options.connectorConstants.CONNECTOR_BASE_PATH) {
            recordarray[temprecord].info.response = loadJSON(options.connectorConstants.CONNECTOR_BASE_PATH + recordarray[temprecord].filelocation)
          } else {
            recordarray[temprecord].info.response = loadJSON(recordarray[temprecord].filelocation)
          }
        }
      }
      recordarray[temprecord].info.bearerToken = options.bearerToken;
    }
    //while every dependency is not resolved
    makeAsyncCalls(recordarray, callback);
  }
  /**
   *   signature :
   *   options [{bearerToken, resourcetype, id, data}]
   *   callback
   */
, integratorStateClient = function(options, callback) {
      if (!options.resourcetype) {
        logInSplunk('No resourcetype is given!');
        var err = new Error('No resourcetype is given!')
        return callback(err.message);
      }
      if (!options.bearerToken) {
        logInSplunk('No Auth Token is given!');
        var err = new Error('No Auth Token is given!')
        return callback(err.message);
      }
      var opts =
        { uri: CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourcetype
        , method: options.method
        , headers:
          { Authorization: 'Bearer ' + options.bearerToken
          , 'Content-Type': 'application/json'
          }
        , json: true
        }
      if(opts.method === 'PUT') {
        opts.json = options.data
      }
      // might be possible to change this to requestWrapper, please check
      request(opts, function(error, res, body) {
        if(error) {
          logRequestCalls(opts, "integratorStateClient | error " + (error.message || error), res)
          return callback(error)
        } 
        return callback(null, res, body)
      })
    }
, integratorRestClient = function(options, callback) {
    var externalIdStr = '' 
    if (!options.resourcetype) {
      var err = new Error('No resourcetype is given!')
      return callback(err.message);
    }
    if (!options.bearerToken) {
      var err = new Error('No Auth Token is given!')
      return callback(err.message);
    }
    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourcetype
      , method: 'GET'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }

    if (!!options.id) {
      opts.uri = opts.uri + '/' + options.id;
      if (!!options.data) {
        opts.method = 'PUT';
        opts.json = options.data;
      }
      if (!!options.distributed) {
        opts.uri = opts.uri + '/distributed'
      }
    } else if (!!options.data) {
      opts.method = 'POST';
      opts.json = options.data;
      //if data cotains _id that means it is a put call
      if (options.data._id) {
        //remove the _id from data
        opts.uri = opts.uri + '/' + options.data._id;
        opts.method = 'PUT';
      }
      if (!!options.distributed) {
        opts.uri = opts.uri + '/distributed'
      }
    } else if (options.externalIds && _.isArray(options.externalIds) && options.externalIds.length > 0) {
      externalIdStr = 'externalId=' + options.externalIds.join('&externalId=')
      opts.uri = opts.uri + '?' + externalIdStr
    }

    if(!!options.id && !options.data && options.method === 'DELETE'){
      opts.method = 'DELETE'
    }

    // if options has headers, then replace the headers.
    if (options.headers) {
      opts.headers = options.headers
    }
    if(options.integrationId) {
      opts.integrationId = options.integrationId
    }
    requestWrapper(opts, callback)
  }
, integratorApiIdentifierClient = function(options, callback) {
    if (!options.bearerToken) {
      var err = new Error('No Auth Token was provided!')
      return callback(err.message);
    }
    if (!options.apiIdentifier) {
      var err = new Error('No apiIdentifier was provided!')
      return callback(err.message)
    }

    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/' + options.apiIdentifier
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }

    if (!!options.data) {
      opts.json = options.data;
    }
    if(options.integrationId) {
      opts.integrationId = options.integrationId
    }
    requestWrapper( opts, callback)
  }
  /**
   *   signature :
   *   options [{bearerToken, connectionId, method, scriptId, deployId, data, relativeURI}]
   *   callback
   */
, integratorProxyCall = function(options, callback) {
    if (!options.bearerToken) {
      var err = new Error('No Auth Token is given!')
      return callback(err.message);
    }
    if(!options.connectionId){
      var err = new Error('connection id is not given')
      return callback(err.message);
    }
    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/v1/connections/' + options.connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }
    //Netsuite Restlet call
    if(!!options.scriptId && !!options.deployId && !!options.method){
      opts.headers['Integrator-Netsuite-ScriptId'] = options.scriptId
      opts.headers['Integrator-Netsuite-DeployId'] = options.deployId
      opts.headers['Integrator-Method'] = options.method
      if(!!options.data){
        opts.json = options.data
      }
    }
    // REST call
    else if(!!options.relativeURI && !!options.method){
      opts.headers['Integrator-Relative-URI'] = options.relativeURI
      opts.headers['Integrator-Method'] = options.method
      if(!!options.data){
        opts.json = options.data
      }
    }
    else{
      var err = new Error('Proxy request headers are not in correct format')
      return callback(err.message);
    }
    if(options.integrationId) {
      opts.integrationId = options.integrationId
    }
    requestWrapper(opts, callback)
  }

, getAdaptor = function(options, callback) {
    var requestOptions =
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourceType + '/' + options.resourceId
      , method : 'GET'
      , auth : { bearer : options.bearerToken}
      , json : true
      }
    request(requestOptions, function (err, res, body) {
      if(err) {
        logRequestCalls(requestOptions, "getAdaptor | error: " + (err.message || err), res)
        return callback(err)
      }
      var message = null
      try {
        message = body.errors[0].message
      } catch(ex) {
        message = ''
      }

      if(res.statusCode !== 200) {
        logRequestCalls(requestOptions, "getAdaptor | error", res)
        return callback(new Error('GET call failed for the resource ' + options.resourceType + '# ' + options.resourceId + ', statusCode: ' + res.statusCode + ', message: ' + message))
      } 
      if(!body) {
        logRequestCalls(requestOptions, "getAdaptor | error: Empty body returned for the resource", res)
        return callback(new Error('Empty body returned for the resource ' + options.resourceType + '# ' + options.resourceId))
      } 
      return callback(null, body)
    })
  }

, putAdaptor = function(options, callback) {
    var requestOptions =
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourceType + '/' + options.resourceId
      , method : 'GET'
      , auth : { bearer : options.bearerToken}
      , json : true
      }
    requestOptions.method = 'PUT'
    requestOptions.json = options.body
    request(requestOptions, function (e, r, b) {
      if(e) {
        logRequestCalls(requestOptions, "putAdaptor | error: " + (e.message || e), r)
        return callback(e)
      } 
      var message = null
      try {
        message = b.errors[0].message
      } catch(ex) {
        message = ''
      }
      if(!(r.statusCode == 200 || r.statusCode == 201)) {
        logRequestCalls(requestOptions, "putAdaptor | error", r)
        return callback(new Error('PUT call failed for the resource ' + options.resourceType + '# ' + options.resourceId + ', statusCode: ' + r.statusCode + ', message: ' + message))
      } 
      return callback(null, b)
    })
  }

, requestWrapper = function(options, callback){
    request(options, function(err, res, body){
      if(err){
        if(err.code === 'ETIMEDOUT') {
          logRequestCalls(options, "requestWrapper | retrying error because of timeout: " + (err.message || err), res)
          options.retryMethod = requestWrapper
          return retryNetworkCall(options, callback)
        }
        logRequestCalls(options, "requestWrapper | error: " + (err.message || err), res)
        return callback(new Error('Could not make network call. '+err.message))
      }
      var verifyResponseResult = verifyResponse(res, body)
      if(!verifyResponseResult.valid){
        if(isStatusCodeRetryAble({statusCode : res.statusCode, body: body}) && options.retry !== false && options.retryLeft !== 0 ) {
          logRequestCalls(options, "requestWrapper | retrying error : " + JSON.stringify(verifyResponseResult.err), res)
          options.retryMethod = requestWrapper
          options.responseHeader = res.headers
          return retryNetworkCall(options, callback)
        }
        logRequestCalls(options, "requestWrapper | error in verifying response : " + JSON.stringify(verifyResponseResult.err), res)
        return callback(verifyResponseResult.err, res, body)
      }
      return callback(err, res, body)
    })
}
/*
 * Purpose: To retry a network call in case of failure.
 * Arguments : Options which was passed to the network client (Rest client/ integratorApiIdentifierClient etc),
              To that options one just to add property retry (true/false). when true, the network call method (should be added to options) is retried after the calculated time.
              If retryCount is passed in options, the method is retried that number of times in case of successive failures before returning the error. If retryCount is not passed, it initializes it to 3
 */

, retryNetworkCall = function(options, callback){
    if( !options.retryCount){
      // Initialize retryCount if not present in options
      options.retryCount = 8
    }else if(options.retryLeft === 0 || !options.retryMethod){
      // if no retry is left. return the callback. Idelly it should be handled in the main calling function so as to return the original error.
      // options must have a retryMethod
      if(!options.retryMethod){
        logInSplunk('devloper_error : inside retryNetworkCall, could not retry network call. retryMethod is not provided. ', 'info')
      }
      return callback(new Error('Oops!! something went wrong. Please try later.'))
    }
    options.retryLeft = options.retryLeft || options.retryCount

    var headerValue
    , retryTime

    if(options.responseHeader &&  options.responseHeader['retry-after']){
      headerValue = options.responseHeader['retry-after']
    }
    retryTime = getRetryTimeInSec({
      headerValue : headerValue
      , retryCount : options.retryCount - options.retryLeft
    })
    //wait for retryTime and then call the network again.
    setTimeout(function(){
      options.retryLeft = options.retryLeft -1
      logInSplunk('Retrying network call. Number of retries left is '+options.retryLeft , 'info')
      options.retryMethod(options,callback)
    }, retryTime * 1000 )
  }

  , isStatusCodeRetryAble = function(options){
    var retryAbleStatusCodes = [408, 429, 503, 504, 502]
    , retryAbleErrorMessageCodes = ['sss_request_limit_exceeded']
    , retryAbleErrorMessages = ['request limit exceeded'] // some only had message
    , statusCode = options.statusCode
    , error

    if(retryAbleStatusCodes.indexOf(statusCode) === -1 && options.body && (options.body.error || options.body.errors)) {
      error = options.body.error || options.body.errors
      if (_.find(retryAbleErrorMessageCodes, function(errorMsg){
        return (JSON.stringify(error).toLowerCase().indexOf(errorMsg) > -1)
      }) ||
      _.find(retryAbleErrorMessages, function(errorMsg){
        return (JSON.stringify(error).toLowerCase().indexOf(errorMsg) > -1)
      })) {
        return true
      }
    }
    return (retryAbleStatusCodes.indexOf(statusCode) >= 0 ? true : false)
  }
  /*
   * Purpose: It returns wait time (in sec), after which a network call should be re-tried in case of failure
   * options = {
      headerValue : headerValue
      , retryCount : retryCount
    }
   */
  , getRetryTimeInSec = function (options) {
    var timeToWait
    , increaseExponential = function () {
      var incrExponential = options.retryCount || 1
      , timeCalculated = Math.pow(2, incrExponential)
      return timeCalculated
    }

    // if options.headerValue is  a numeric and <1000, we consider the provided data
    //is staright forward the timeToWait in sec. Else we parse the options.headerValue and check,
    //if its UTC, we get time in epoch and we take diff from the current time and decide the timeToWait
    //else we get NaN and we goto default setting to handle that case (same for options.headerValue not passed case).
    //
    if (options.headerValue) {
      if (!isNaN(options.headerValue) && options.headerValue < 1000 ){
        timeToWait = options.headerValue
      }else {
        var currentTime = moment(new Date()).unix(1318781876)   //gets the current time in epoch seconds
        var headerTimeInSecs = Date.parse(options.headerValue)      // calculate options.headerValue time in secs
        //logger.info('**epoch value' + headerTimeInSecs)
        if (isNaN(headerTimeInSecs)) {
          if (isNaN(options.headerValue)) {
            timeToWait = increaseExponential()
            return timeToWait
          }
          headerTimeInSecs = options.headerValue   //if the options.headerValue is already in epoch then we get NaN
        }

        if (headerTimeInSecs.toString().length === 13) headerTimeInSecs = Math.floor(headerTimeInSecs / 1000) //if epoch is in millisecs, converting to sec

        timeToWait = (headerTimeInSecs > currentTime) ? (headerTimeInSecs - currentTime) : 1
        timeToWait = (timeToWait < 60) ? timeToWait : increaseExponential()
      }
    }
    else {
      timeToWait = increaseExponential()
    }

    return timeToWait
  }

var verifyAndInjectDependency = function(recordarray, record) {
    logInSplunk('start verifyAndInjectDependency for ' + JSON.stringify(record));
    //get the dependency array and check if all are resolved in a loop
    var i;
    if(recordarray[record].dependencyVerified){
      logInSplunk('verifyAndInjectDependency : dependency has been verified for ' + record)
      return true;
    }
    // return true if there is no dependency for the input record
    if (!recordarray[record].dependson || recordarray[record].dependson.length === 0) {
      logInSplunk('verifyAndInjectDependency : no depenedency')
      recordarray[record].dependencyVerified = true
      return true;
    }
    //logInSplunk('recordarray[record].dependson : ' + JSON.stringify(recordarray[record].dependson))
    //return false if any dependency is not resolved for the input record
    for (i = 0; i < recordarray[record].dependson.length; i = i + 1) {
      if (!!recordarray[recordarray[record].dependson[i]] && (!recordarray[recordarray[record].dependson[i]].resolved
            || !recordarray[recordarray[record].dependson[i]].dependencyVerified)) {
        logInSplunk(record + ' still depend on ' + JSON.stringify(recordarray[record].dependson[i]))
        return false;
      }
    }
    logInSplunk('ready to resolve for ' + record)
    if (!recordarray[record].info.jsonpath) {
      recordarray[record].info.jsonpath = [];
    }
    //      sample jsonpath object
    //      {
    //             "record" : "connection-netsuite",
    //             "readfrom" : "$._id",
    //             "writeto"  : "_connectionId"
    //             "writetopath" : "the json path to node where we want to add writeto"
    //             "convertToString" : true
    //             "removeAll" : true
    //       }
    for (i = 0; i < recordarray[record].info.jsonpath.length; i = i + 1) {
      var temp = recordarray[record].info.jsonpath[i];
      //continue without resolving dependency if dependent record does not exist in meta file
      if(!!temp.record && !recordarray[temp.record]){
        //console.log("record node does not exist in meta file:", recordarray[record].info.jsonpath[i].record)
        continue
      }
      //logInSplunk(JSON.stringify(temp))
      //if readfrom and writeto both are $ replace object with incoming data
      if (temp.readfrom === '$' && temp.writeto === '$') {
        //deep copy
        if (!temp.record || !recordarray[temp.record]['info'] || !recordarray[temp.record]['info']['response']) {
          logInSplunk('Unable to resolve jsonpath for ' + temp, 'info')
          throw new Error('Unable to find jsonpath ' + temp)
        }
        recordarray[record].info.data = JSON.parse(JSON.stringify(recordarray[temp.record]['info']['response']))
        continue
      }
      //read the value of temprecord
      //if it is not an array put that in array
      if (!_.isArray(temp.readfrom)) {
        var ta = []
        ta.push({
          readfrom: temp.readfrom
        })
        if (temp.record) {
          ta[0].record = temp.record
        }
        temp.readfrom = ta
      }
      //iterate over this array and create tempvalue
      //tempReadValue
      var tempvalue = ""
      , isReadFromIgnored = false
      _.each(temp.readfrom, function(n) {
          //if there is no record use value directly
          //TODO: Hack, if the readfrom is object be can't change that in string
          //in that case use the record as is
          if (!n.record) {
            if (typeof(n.readfrom) === 'object' || typeof(tempvalue) === 'object') {
              tempvalue = n.readfrom
              logInSplunk('Setting hardcoded an object value')
              return
            } else {
              tempvalue = tempvalue + n.readfrom
              return
            }
          }
          if (n.readfrom === '$') {
            //deep copy
            tempvalue = JSON.parse(JSON.stringify(recordarray[n.record].info.data))
            return
          }
          //handles bars if exists any.
          if (!recordarray[n.record]['info']['response'] && recordarray[n.record]['info']['ignoreError']) {
            isReadFromIgnored = true
            return
          }
          n.readfrom = evalHandleBar(n.readfrom, recordarray)
          var tempJsonPath
          if(temp.isReadFromInfoData) {
            tempJsonPath = jsonPath.query(recordarray[n.record]['info']['data'], n.readfrom)
          } else {
            tempJsonPath = jsonPath.query(recordarray[n.record]['info']['response'], n.readfrom)
          }

          logInSplunk('finding ' + n.readfrom + ' in ' + JSON.stringify(recordarray[n.record]['info']['response']))
          if (tempJsonPath.length <= 0) {
            logInSplunk('Unable to find ' + n.readfrom + ' in ' + JSON.stringify(recordarray[n.record]['info']['response']))
            tempJsonPath.push(null)
          }
          //Bug# in case of object do not add as string
          if (!(typeof(tempJsonPath[0]) === 'object')) {
            tempvalue = tempvalue + tempJsonPath[0]
          } else {
            tempvalue = tempJsonPath[0]
          }
        })
        //set in record
        //TODO: Add support for nested value writes
        //if it doesn't start with $ mean no need to run JSONPath eval on writeto
        if (isReadFromIgnored) {
          continue
        }
      var tempWriteto;
      if (temp.writetopath) {
        //adding support for dynamic write to path
        temp.writetopath = evalHandleBar(temp.writetopath, recordarray)
        tempWriteto = jsonPath.query(recordarray[record].info.data, temp.writetopath);
        if (tempWriteto.length <= 0) {
          logInSplunk('Unable to find jsonpath ' + temp.writetopath + ' in ' + JSON.stringify(recordarray[record].info.data))
          throw new Error('Unable to find jsonpath ' + temp.writetopath + ' in ' + JSON.stringify(recordarray[record].info.data))
        }
        tempWriteto = tempWriteto[0];
      } else {
        tempWriteto = recordarray[record].info.data;
      }
      //if tempWriteto[temp.writeto] is an array, append tempvalue in tempWriteto[temp.writeto]
      //convert tempvalue in the required format
      if (temp.convertToString && typeof(tempvalue) !== "string") {
        tempvalue = JSON.stringify(tempvalue)
      }
      // type check if we have to insert a key as Array
      if(temp.type === 'Array' && !tempWriteto[temp.writeto]) {
        tempWriteto[temp.writeto] = []
      }

      if (_.isArray(tempWriteto[temp.writeto])) {
        if (temp.removeAll) {
          //empty the array
          tempWriteto[temp.writeto].length = 0
        }
        if(_.isArray(tempvalue) && temp.isArrayMergeable) {
          // Support for position. If temp.position is available then it will insert according to position
          if(temp.hasOwnProperty('position') && tempWriteto[temp.writeto].length > temp.position) {
            _.each(tempvalue, function(element) {
              tempWriteto[temp.writeto].splice(temp.position++, 0, element)
            })
          } else {
            _.each(tempvalue, function(element) {
              tempWriteto[temp.writeto].push(element)
            })
          }
        } else if(temp.hasOwnProperty('position') && tempWriteto[temp.writeto].length > temp.position) {
          // Support for position. If temp.position is available then it will insert according to position.
          tempWriteto[temp.writeto].splice(temp.position, 0, tempvalue)
        }
        else {
          tempWriteto[temp.writeto].push(tempvalue)
        }
      } else {
        tempWriteto[temp.writeto] = tempvalue;
      }
      logInSplunk('setting ' + temp.writeto + ' as ' + tempWriteto[temp.writeto]);
    }
    //logInSplunk('After dependecy resolution record : ' + JSON.stringify(recordarray[record].info.data) );
    //mark dependecy veriified and return true
    recordarray[record].dependencyVerified = true
    return true;
  }
, verifyAllResolved = function(graph) {
    var node;
    for (node in graph) {
      if (!graph[node].resolved) {
        return false;
      }
    }
    return true;
  }
, logRequestCalls = function (opts, msg, res) {
    var options = {}
    options.uri = opts.uri
    options.method = opts.method
    options.statusCode = res && res.statusCode || ""
    options.logName = "connectorRequestCall"
    if(opts.integrationId) {
      options.integrationId = opts.integrationId
    }
    logInSplunk(msg, 'info', options)
  }
, logInSplunk = function(logmessage, loglevel, logFields) {
    //default level is debug
    if (!loglevel && process.env.NODE_ENV === 'production') {
      loglevel = 'debug'
    } else if (!loglevel) {
      loglevel = 'info'
    }
    var logstring = ""
    _.each(logFields, function(logMsg, field) {
      logstring += `${field}="${logMsg}" `
    })
    logstring += `message="${logmessage}"`;
    logger.log(loglevel, logstring);
  }
, verifyResponse = function (response, body) {
  var result = {}
  if (response && response.statusCode && (response.statusCode >= 200 &&
      response.statusCode < 400)) {
    result.valid = true
    return result
  }
  else {
    logInSplunk('Verification failed : ' + response.statusCode,'info');
    result.valid = false
    var err = {}
    err.statusCode = response.statusCode
    if (body && _.isArray(body.errors) && body.errors[0]) {
      var array = body.errors[0]
      if (array.message) {
        err.message = array.message
      }
      else if (_.isArray(array.errors) && array.errors[0] && array.errors[0].message) {
        err.message = array.errors[0].message
      }
    }
    else if (body && body.errors && body.errors.message) {
      err.message = body.errors.message
    }
    else if (body && body.error && body.error.message) {
      err.message = body.error.message
    }
    else if (body && body.errors) { // for example : body response like this {"errors":"Not Found"}
      if(!_.isObject(body.errors) && !_.isArray(body.errors)) {
        err.message = body.errors
      } else {
        err.message = 'Errors : ' + JSON.stringify(body.errors) // These type of errors are most probably occur from post data incorrect data nodes as we seen in Shopify. for example: {"errors":{"refund":"Required parameter missing or invalid"}}
      }
    }
    else {
      err.message = 'Unable to verify response'
    }
  }
  err.message = err.message + ', Status Code: ' + err.statusCode
  result.err = err
  return result
}
, makeAsyncCalls = function(recordarray, callback) {
    var integrationId = recordarray && recordarray.state && recordarray.state.info && 
    recordarray.state.info.response && recordarray.state.info.response._integrationId
    logInSplunk('Making Async calls');
    if (verifyAllResolved(recordarray)) {
      logInSplunk('All depenedency are resolved');
      return callback(null, recordarray);
    }
    var batch = []
      , tempnode
      , asyncErrors = [];

    for (tempnode in recordarray) {
      try {
        if(verifyAndInjectDependency(recordarray, tempnode) && !recordarray[tempnode].resolved){
            batch.push(recordarray[tempnode]);
        }
      } catch (e) {
        return callback(e)
      }
    }
    //logInSplunk('batch : ' + JSON.stringify(batch))
    //we have all non dependent record perform aysn calls here
    async.each(batch, function(record, cb) {
      //we got record meta, try loading the record
      //logInSplunk('record.info :'+ JSON.stringify(record.info));
      if (record.info.apiIdentifier) {
        //Can't find a better way
        //TODO Resume state not working, boolean value coming always in resume
        if(_.isBoolean(record.info.apiIdentifier)) {
          record.info.apiIdentifier = record.info.data.apiIdentifier
          record.info.data = record.info.data.apiIdentifierData
        }
        if(integrationId) {
          record.info.integrationId = integrationId
        }
        integratorApiIdentifierClient(record.info, function(err, response, body) {
          //logInSplunk('Posting record : ' + JSON.stringify(body));
          if (err) {
            handleAsyncCallErrors(err, asyncErrors)
            return cb(null);
          }
          //this mean call was successful, now go and save the info at location info.response
          record.info.response = body;
          logInSplunk('record got created in ' + JSON.stringify(body));
          //mark as resolved
          record.resolved = true;
          return cb(null);
        });
      } else if (record.info.proxyCall) {
        // For proxy calls

        try{
          if(!record.info.data.requests) {
            record.info.method = record.info.data.proxyData.method || null
            record.info.deployId = record.info.data.proxyData.deployId || null
            record.info.scriptId = record.info.data.proxyData.scriptId || null
            record.info.relativeURI = record.info.data.proxyData.relativeURI || null
            record.info.connectionId = record.info.data.proxyData.connectionId || null
            record.info.data = {  requests :record.info.data.proxyData.requestBody } || null
          }

          if(!record.info.relativeURI){
            if(!record.info.deployId)
              record.info.deployId = CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
            if(!record.info.scriptId)
              record.info.scriptId = CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
          }
        } catch (ex) {
          handleAsyncCallErrors(ex, asyncErrors)
          return cb(null) 
        }
        if(integrationId) {
          record.info.integrationId = integrationId
        }
        integratorProxyCall(record.info, function(err, response, body) {
          if (err) {
            handleAsyncCallErrors(err, asyncErrors)
            return cb(null)
          }
          record.info.response = body
          //mark as resolved
          record.resolved = true
          return cb(null)
        })
      } else {
        //if the record.info.method === GET remove data node and use _id as id
        //BAD WAY TO DO IT
        //TODO find a better way
        if (record.info.method === 'GET') {
          if (record.info.data && record.info.data._id) {
            record.info.id = record.info.data._id
            delete record.info.data
          }
        }
        if(integrationId) {
          record.info.integrationId = integrationId
        }
        integratorRestClient(record.info, function(err, response, body) {
          //logInSplunk('Posting record : ' + JSON.stringify(body));
          if (err) {
            handleAsyncCallErrors(err, asyncErrors)
            return cb(null);
          }
          //this mean call was successful, now go and save the info at location info.response
          record.info.response = body;
          logInSplunk('record got created in ' + JSON.stringify(body));
          //mark as resolved
          record.resolved = true;
          return cb(null);
        });
      }
      //make a call to Integrator
      //call integrator rest client with resourceType
      //and data
    }, function(err) {
      if (asyncErrors.length) {
        return callback(new Error('An Error occurred while processing the resources creation. Error: ' + JSON.stringify(asyncErrors)))
      } //everything is successful for this batch let create another
      //logInSplunk('calling async');
      makeAsyncCalls(recordarray, callback);
    })
  }
, handleAsyncCallErrors = function (err, asyncErrors) {
    var errors = {
      statusCode : 400,
      message : err
    }
    if(err instanceof Error) { //fatal errors
      errors.message = err.toString()
      asyncErrors.push(errors)
    }
    else if(err instanceof Object) { //Object errors
      asyncErrors.push(err)
    }
    else { // other type of errors
      asyncErrors.push(errors)
    }
  }
, trimNodesBasedOnEdition = function(recordarray, options){
    var temprecord;
    //trim nodes in upgrade mode
    if(options.upgradeMode){
      if(!options.currentEdition || !options.upgradeEdition){
        logInSplunk('Config Error: missing edition info to upgrade');
        return { 'error': 'Config Error: missing edition info to upgrade' }
      }
      var currentEdition = options.currentEdition
      , upgradeEdition = options.upgradeEdition
      for(temprecord in recordarray) {
        //remove the node which is not eligible for provided edition
        if(_.isArray(recordarray[temprecord].edition) && _.includes(recordarray[temprecord].edition, upgradeEdition)
          && !_.includes(recordarray[temprecord].edition, currentEdition) && !_.includes(recordarray[temprecord].edition, "all")
          || !!recordarray[temprecord].includeToUpgrade){
          logInSplunk("including node " + temprecord, 'info')
          continue
        }
        else {
          if(!(recordarray[temprecord].resolved && recordarray[temprecord].dependencyVerified && recordarray[temprecord].isLoaded))
            delete recordarray[temprecord]
        }
      }
    }
    //trim nodes in installation mode
    else {
      var connectorEdition = options.connectorEdition
      var addOnId = options.addOnId
      for(temprecord in recordarray) {
        //remove the node which is not eligible for provided edition
        if(_.isArray(recordarray[temprecord].edition) && !_.includes(recordarray[temprecord].edition, connectorEdition)
            && !_.includes(recordarray[temprecord].edition, "all")){
              //console.log("deleting node", temprecord)
          delete recordarray[temprecord]
        }
        // addOn installation -> remove other addOn related nodes
        if (addOnId && _.isArray(recordarray[temprecord].addOnId) && !_.includes(recordarray[temprecord].addOnId, addOnId)
        && !_.includes(recordarray[temprecord].addOnId, "all")) {
          delete recordarray[temprecord]
        }
      }
    }
  }
  /*
    Path should start with node name holding the bar data if bar data is provided through helper.
  */
, evalHandleBar = function(sourceStr, recordarray){
    var temp = handlebars.compile(sourceStr)
    , barData = {} // dummy object
    handlebars.registerHelper('pathHelper', function(path) {
      var pathElement = path.split('.')
      , returnValue = null
      if(pathElement.length <= 0){
        return temp(barData)
      }
      returnValue = recordarray[pathElement[0]]['info']['response']
      pathElement.splice(0,1)
      _.each(pathElement, function(element){
        if(!returnValue[element]){
          throw new Error('Cannot find the bar value for the path: ' + path)
        }
        returnValue = returnValue[element]
      })
      if(!returnValue){
        throw new Error('bar path is not in required format: ' + path)
      }
      return returnValue;
    })
    return temp(barData)
  }
  //TODO: revert back to load file
, loadJSON = function(filelocation) {
    try {
      if (require.cache) {
        delete require.cache[require.resolve('../../../' + filelocation)];
      }
      return require('../../../' + filelocation);
    } catch (e) {
      //backwards compatibility
      if (e.code === 'MODULE_NOT_FOUND') {
        if (require.cache) {
          delete require.cache[require.resolve(filelocation)];
        }
        return require(filelocation);
      }
    }
  }
, isCyclic = function(graph) {
  var tempGraph = JSON.parse(JSON.stringify(graph))
  for(var key in tempGraph) {
      tempGraph[key]['visited'] = false
      tempGraph[key]['onCurrStack'] = false
  }
  for(var i in tempGraph) {
    if(isCyclicUtil(i, tempGraph))
      return true
  }
  return false
}
, isCyclicUtil = function(node, graph) {
    if(graph[node]['visited'] === false) {
      graph[node]['visited'] = true
      graph[node]['onCurrStack'] = true
      var list = graph[node]['dependson']
      if(list && _.isArray(list) && list.length > 0) {
        for(var i =0 ; i < list.length ; i++) {
          if(graph[list[i]] && !graph[list[i]]['visited'] && isCyclicUtil(list[i], graph))
            return true
          else if(graph[list[i]] && graph[list[i]]['onCurrStack'])
            return true
        }
      }
    }
    graph[node]['onCurrStack'] = false
    return false
  }
, validateOptions = function(options) {
    if(!options.bearerToken) {
      return false
    }
    if(!options._integrationId) {
      return false
    }
    return true
  }
  // validateIntegrationVersion will be used during upgrade and add new store. In this function, we will compare latest connector version and installed integration version. If integration is not on latest version then we will throw error.
  , validateIntegrationVersion = function (options, callback) {
    var arrUpdateFileNames
    var latestVersion = '0.0.0'
    if (!options || !options.integration || !options.integration._id || !options.integration.name || !options.integration._connectorId || !options.integration.version) {
      return callback(new Error('Integration is corrupted. Please contact Celigo support.'))
    }
    try {
      options.updateCodeRepo = path.resolve(__dirname, options.updateCodeRepo)
      arrUpdateFileNames = fs.readdirSync(options.updateCodeRepo)
    } catch (e) {
      logInSplunk('Exception caught:' + (e.message ? JSON.stringify(e.message) : JSON.stringify(e)), 'info')
      return callback(e)
    }

    _.each(arrUpdateFileNames, function (fileName) {
      var fileVersion = fileName.replace('.js', '')
      if (semver(fileVersion, latestVersion) > -1) {
        latestVersion = fileVersion
      }
    })

    if (semver(latestVersion, options.integration.version) > 0) {
      logInSplunk(options.type + ' blocked for connector=' + options.integration.name + ', connectorId=' + options.integration._connectorId + ',integrationId=' + options.integration._id + ', integrationVersion=' + options.integration.version, 'info')
      return callback(new Error('Unable to ' + options.type + '. You are currently using an older version of ' + options.integration.name + ' for your integrations. Please contact Celigo Support.'))
    }

    return callback(null)
  },
  //Compares the installed connector Edition with the latest licensed connector edition before adding a new store
  validateConnectorEdition = function (options, callback) {
    if (!options || !options.integration || !options.integration._id || !options.integration.name || !options.integration._connectorId || !options.integration.version || !options.integration.settings || !options.integration.settings.connectorEdition) {
      return callback(new Error('Unable to perform "add new store/account" as we received invalid options. Please retry, if the issue persists, please contact Celigo Support.'))
    }
    if (!options.licenseEdition) {
      logInSplunk('Invalid options in validateConnectorEdition, Connector Edition is missing in the license', 'info')
      return callback(new Error('Unable to perform "add new store/account" as we received invalid options. Please retry, if the issue persists, please contact Celigo Support.'))
    }
    if (options.integration.settings.connectorEdition !== options.licenseEdition) {
      logInSplunk('Blocking add new store for integration=' + options.integration._id + ', connectorEdition='+options.integration.settings.connectorEdition+', connectorEditionInLicense: '+options.licenseEdition+'.', 'info')
      return callback(new Error('Unable to add new Store/Account. Please upgrade your integration using "Settings > Subscription > Upgrade".'))
    }
    return callback(null)
  }

exports.createRecordsInOrderHelper = createRecordsInOrderHelper
exports.integratorRestClient = integratorRestClient
exports.integratorApiIdentifierClient = integratorApiIdentifierClient
exports.integratorProxyCall = integratorProxyCall
exports.getAdaptor = getAdaptor
exports.putAdaptor = putAdaptor
exports.logInSplunk = logInSplunk
exports.loadJSON = loadJSON
exports.integratorStateClient = integratorStateClient
exports.saveState = saveState
exports.isCyclic = isCyclic
exports.validateOptions = validateOptions
exports.verifyAllResolved = verifyAllResolved
exports.isStatusCodeRetryAble = isStatusCodeRetryAble
exports.getRetryTimeInSec = getRetryTimeInSec
exports.retryNetworkCall = retryNetworkCall
exports.requestWrapper = requestWrapper
exports.verifyAndInjectDependency = verifyAndInjectDependency
exports.evalHandleBar = evalHandleBar
exports.validateIntegrationVersion = validateIntegrationVersion
exports.validateConnectorEdition = validateConnectorEdition
