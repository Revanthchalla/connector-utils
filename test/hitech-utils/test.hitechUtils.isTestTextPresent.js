'use strict'

var assert = require('assert')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.isTestTextPresent functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.isTestTextPresent is called', function(done) {

    var inputField = {
        'field1': {
          'subfield1': [{
            'element1': 'Test__value1'
          }, {
            'element1': 'value2'
          }]
        }
        , 'field2': 'value3'
      }
      , result

    try {
      result = utils.isTestTextPresent(inputField, 'Test__')
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(result, true)
    done()
  })

})