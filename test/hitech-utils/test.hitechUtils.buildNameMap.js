'use strict'

var assert = require('assert')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.buildNameMap functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.buildNameMap is called', function(done) {

    var records = [{
        '_id': '56e68f75d534b67035bc54e1'
        , 'lastModified': '2016-03-17T12:08:24.477Z'
        , 'name': 'JIRA Issue to NetSuite Issue Add'
      }, {
        '_id': '56e68f75d534b67035bc54e2'
        , 'lastModified': '2016-03-15T14:06:21.899Z'
        , 'name': 'JIRA Issue to NetSuite Issue Update'
      }]
      , result = {
        'JIRA Issue to NetSuite Issue Add': {
          '_id': '56e68f75d534b67035bc54e1'
          , 'lastModified': '2016-03-17T12:08:24.477Z'
          , 'name': 'JIRA Issue to NetSuite Issue Add'
        }
        , 'JIRA Issue to NetSuite Issue Update': {
          '_id': '56e68f75d534b67035bc54e2'
          , 'lastModified': '2016-03-15T14:06:21.899Z'
          , 'name': 'JIRA Issue to NetSuite Issue Update'
        }

      }
      , map

    try {
      map = utils.buildNameMap(records)
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(result, map)
    done()
  })
})