var constants = {
  'TEST_URL': null
}

if (['production', 'travis'].indexOf(process.env.NODE_ENV) !== -1) {
  constants.TEST_URL = 'https://api.integrator.io'
} else if (process.env.NODE_ENV === 'staging') {
  constants.TEST_URL = process.env.IO_DOMAIN ? ('https://api.' + process.env.IO_DOMAIN) : 'https://api.staging.integrator.io'
} else {
  constants.TEST_URL = 'http://api.localhost.io:5000'
}

module.exports.constants = constants
