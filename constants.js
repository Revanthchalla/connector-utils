'use strict'
var nconf = require('nconf')
var path = require('path')
var basePath = path.resolve(__dirname, '.')
var CONSTS =
  {
    IODOMAIN: nconf.get('IO_DOMAIN')
    , HERCULES_BASE_URL: 'https://api.' + nconf.get('IO_DOMAIN')
    , NS_CONNECTOR_UTIL_SCRIPT_ID: 'customscript_celigo_nsconnectorutil'
    , NS_CONNECTOR_UTIL_DEPLOY_ID: 'customdeploy_celigo_nsconnectorutil'
    , STATE: 'serializedState'
  }
  
/* istanbul ignore next */
if (process.env.NODE_ENV === 'staging') {
  if (!nconf.get('IO_DOMAIN')) CONSTS.HERCULES_BASE_URL = 'https://api.staging.integrator.io'
} else if (process.env.NODE_ENV === 'development') {
  CONSTS.HERCULES_BASE_URL = 'http://api.localhost.io:5000'
  CONSTS.IODOMAIN = 'localhost.io:5000'
} else if(process.env.NODE_ENV === 'unittest') {
  nconf.file({file: basePath + '/env/unittest.json'})
  CONSTS.IODOMAIN = nconf.get('IO_DOMAIN')
  CONSTS.HERCULES_BASE_URL = 'https://api.' + CONSTS.IODOMAIN
} else if(process.env.NODE_ENV === 'travis') {
  nconf.file({file: basePath + '/env/travis.json'})
  CONSTS.IODOMAIN = nconf.get('IO_DOMAIN')
  CONSTS.HERCULES_BASE_URL = 'https://api.' + CONSTS.IODOMAIN
}

module.exports = CONSTS
