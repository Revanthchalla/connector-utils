'use strict'

var assert = require('assert')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.isTestModeOn functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.isTestModeOn is called', function(done) {

    var options = {
        'settings': {
          'general': {
            'fields': [{
              'label': 'Enable Test Mode'
              , 'type': 'checkbox'
              , 'name': 'enable_test_mode'
              , 'value': true
            }]
          }
        }
      }
      , result

    try {
      result = utils.isTestModeOn(options, 'enable_test_mode')
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(result, true)
    done()
  })

})