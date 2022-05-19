'use strict'

var assert = require('assert')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.preProcessMapping functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.preProcessMapping is called - install', function(done) {

    var record = {
        'recordType': 'issue'
        , 'mapping': {
          'mappings': [{
            'version': '1.0.0'
            , 'fields': [{
              'extract': 'issue.fields.summary'
              , 'generate': 'issueabstract'
            }, {
              'extract': 'issue.id'
              , 'generate': 'custevent_celigo_jira_id'
            }]
          }]
        }
      }
      , result = {
        'recordType': 'issue'
        , 'mapping': {
          'fields': [{
            'extract': 'issue.fields.summary'
            , 'generate': 'issueabstract'
          }, {
            'extract': 'issue.id'
            , 'generate': 'custevent_celigo_jira_id'
          }]
          , 'lists': []
        }
      }
      , processedRecord

    try {
      processedRecord = utils.preProcessMapping(record, null)
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(processedRecord, result)
    done()
  })

  it('should return expectedResult when hitechUtils.preProcessMapping is called - update', function(done) {

    var record = {
        'recordType': 'issue'
        , 'mapping': {
          'mappings': [{
            'version': '1.0.0'
            , 'fields': [{
              'extract': 'issue.fields.summary'
              , 'generate': 'issueabstract'
            }, {
              'extract': 'issue.id'
              , 'generate': 'custevent_celigo_jira_id'
            }]
          }, {
            'version': '1.2.0'
            , 'fields': [{
              'extract': 'issue.fields.issuetype.name'
              , 'generate': 'issuetype'
            }, {
              'extract': 'issue.key'
              , 'generate': 'custevent_celigo_jira_issue'
            }]
          }]
        }
      }
      , result = {
        'recordType': 'issue'
        , 'mapping': {
          'fields': [{
            'extract': 'issue.fields.issuetype.name'
            , 'generate': 'issuetype'
          }, {
            'extract': 'issue.key'
            , 'generate': 'custevent_celigo_jira_issue'
          }]
          , 'lists': []
        }
      }
      , processedRecord

    try {
      processedRecord = utils.preProcessMapping(record, '1.1.0')
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(processedRecord, result)
    done()
  })

})
