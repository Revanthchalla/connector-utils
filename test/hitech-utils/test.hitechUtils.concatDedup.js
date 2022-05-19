'use strict'

var assert = require('assert')
  , _ = require('lodash')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.concatDedup functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.concatDedup is called', function(done) {

    var arr1 = [{
        '_id': '56e68f75d534b67035bc54e1'
        , 'lastModified': '2016-03-17T12:08:24.477Z'
        , 'name': 'JIRA Issue to NetSuite Issue Add'

      }, {
        '_id': '56e68f75d534b67035bc54e2'
        , 'lastModified': '2016-03-15T14:06:21.899Z'
        , 'name': 'JIRA Issue to NetSuite Issue Update'
      }]
      , arr2 = [{
        '_id': '56e68f75d534b67035bc54e2 updated'
        , 'lastModified': '2016-03-15T14:06:21.899Z'
        , 'name': 'JIRA Issue to NetSuite Issue Update'
      }, {
        '_id': '56e68f75d534b67035bc54df'
        , 'lastModified': '2016-03-14T10:16:21.616Z'
        , 'name': 'JIRA Project to NetSuite Project(custom)'
      }]
      , uniqArray1 = [{
        '_id': '56e68f75d534b67035bc54e1'
        , 'lastModified': '2016-03-17T12:08:24.477Z'
        , 'name': 'JIRA Issue to NetSuite Issue Add'

      }, {
        '_id': '56e68f75d534b67035bc54e2'
        , 'lastModified': '2016-03-15T14:06:21.899Z'
        , 'name': 'JIRA Issue to NetSuite Issue Update'
      }, {

        '_id': '56e68f75d534b67035bc54df'
        , 'lastModified': '2016-03-14T10:16:21.616Z'
        , 'name': 'JIRA Project to NetSuite Project(custom)'
      }]
      , uniqArray2 = [{
        _id: '56e68f75d534b67035bc54e2 updated'
        , lastModified: '2016-03-15T14:06:21.899Z'
        , name: 'JIRA Issue to NetSuite Issue Update'
      }, {
        _id: '56e68f75d534b67035bc54df'
        , lastModified: '2016-03-14T10:16:21.616Z'
        , name: 'JIRA Project to NetSuite Project(custom)'
      }, {
        _id: '56e68f75d534b67035bc54e1'
        , lastModified: '2016-03-17T12:08:24.477Z'
        , name: 'JIRA Issue to NetSuite Issue Add'
      }]
      , result
      , result1
      , result2

    try {
      result = utils.concatDedup(arr1, arr2, 'name')
    } catch (ex) {
      throw new Error(ex)
    }

    result1 = []
    _.forEach(uniqArray1, function(obj) {
      result1.push(JSON.stringify(obj))
    })

    result2 = []
    _.forEach(result, function(obj) {
      result2.push(JSON.stringify(obj))
    })

    assert.deepEqual([], _.difference(result1, result2))

    try {
      result = utils.concatDedup(arr2, arr1, 'name')
    } catch (ex) {
      throw new Error(ex)
    }

    result1 = []
    _.forEach(uniqArray2, function(obj) {
      result1.push(JSON.stringify(obj))
    })

    result2 = []
    _.forEach(result, function(obj) {
      result2.push(JSON.stringify(obj))
    })

    assert.deepEqual([], _.difference(result1, result2))
    done()
  })
})
