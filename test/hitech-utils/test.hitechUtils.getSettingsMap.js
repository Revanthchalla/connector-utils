'use strict'

var assert = require('assert')
  , utils = require('../../hitech-utils/utils.js').utils

describe('Testing the test.hitechUtils.getSettingsMap functionality', function() {

  before(function(done) {
    done()
  })

  after(function(done) {
    done()
  })

  it('should return expectedResult when hitechUtils.getSettingsMap is called', function(done) {

    var record = {
        '_id': '56e68bd4d534b67035bc54c7'
        , 'lastModified': '2016-03-18T05:58:52.203Z'
        , 'name': 'JIRA - NetSuite Connector'
        , '_connectorId': '56656df685c87cf835fb1b41'
        , 'install': [{
          'imageURL': '/images/company-logos/netsuite.png'
          , 'completed': true
          , 'name': 'NetSuite Connection'
          , 'description': 'Please provide NetSuite account credentials'
          , 'installerFunction': 'verifyNetSuiteConnection'
          , 'uninstallerFunction': 'deleteNetSuiteConnection'
          , '_connectionId': '56e68bd4d534b67035bc54ca'
        }, {
          'imageURL': '/images/company-logos/jira.png'
          , 'completed': true
          , 'description': 'Please provide JIRA account credentials'
          , 'name': 'JIRA Connection'
          , 'installerFunction': 'verifyJiraConnection'
          , 'uninstallerFunction': 'deleteJiraConnection'
          , '_connectionId': '56e68bd4d534b67035bc54c9'
        }, {
          'imageURL': '/images/company-logos/netsuite.png'
          , 'installURL': 'https://system.na1.netsuite.com/app/bundler/bundledetails.nl?sourcecompanyid=TSTDRV916910&domain=PRODUCTION&config=F&id=20037'
          , 'completed': true
          , 'description': 'Please install Integrator bundle in NetSuite account'
          , 'name': 'Integrator Bundle'
          , 'installerFunction': 'verifyIntegratorBundleInstallation'
          , 'uninstallerFunction': 'uninstallIntegratorBundleInNetSuite'
        }, {
          'imageURL': '/images/company-logos/netsuite.png'
          , 'installURL': 'https://system.na1.netsuite.com/app/bundler/bundledetails.nl?sourcecompanyid=TSTDRV916910&domain=PRODUCTION&config=F&id=105447'
          , 'completed': true
          , 'description': 'Please install JIRA Connector bundle in NetSuite account'
          , 'name': 'JIRA Bundle'
          , 'installerFunction': 'verifyJiraBundleInstallation'
          , 'uninstallerFunction': 'uninstallJiraBundleInNetSuite'
        }, {
          'imageURL': '/images/company-logos/jira.png'
          , 'installURL': 'https://4ba7e2fb.ngrok.io/plugins/servlet/upm/marketplace/search?q=NetSuite Connector for JIRA'
          , 'completed': true
          , 'description': 'Please install Components in JIRA account'
          , 'name': 'JIRA Components'
          , 'installerFunction': 'verifyJiraAddOnInstallation'
          , 'uninstallerFunction': 'uninstallJiraAddOn'
        }]
        , 'mode': 'settings'
        , 'settings': {
          'general': {
            'fields': [{
              'value': true
              , 'name': 'enable_test_mode'
              , 'type': 'checkbox'
              , 'label': 'Enable Test Mode'
            }, {
              'value': 'Test__'
              , 'name': 'input_test_mode_text'
              , 'type': 'input'
              , 'label': 'Test Mode Text'
            }]
          }
          , 'sections': [{
            'fields': [{
              'value': true
              , 'name': 'enable_sync_jira_comments_to_netsuite_details'
              , 'type': 'checkbox'
              , 'label': 'Sync JIRA Comments to NetSuite Details'
            }, {
              'value': true
              , 'name': 'enable_sync_netsuite_details_to_jira_comments'
              , 'type': 'checkbox'
              , 'label': 'Sync NetSuite Details to JIRA Comments'
            }, {
              'value': true
              , 'name': 'enable_sync_all_jira_issues'
              , 'type': 'checkbox'
              , 'label': 'Sync all JIRA Issues to NetSuite'
            }, {
              'supportsRefresh': true
              , 'name': 'multiselect_only_sync_jira_issues_with_priority'
              , 'type': 'multiselect'
              , 'label': 'Only Sync JIRA Issues with Priority'
              , 'options': [
                ['Highest'
                  , 'Highest'
                ]
                , ['High'
                  , 'High'
                ]
                , ['Medium'
                  , 'Medium'
                ]
                , ['Low'
                  , 'Low'
                ]
                , ['Lowest'
                  , 'Lowest'
                ]
              ]
            }, {
              'value': true
              , 'name': 'enable_sync_all_netsuite_issues'
              , 'type': 'checkbox'
              , 'label': 'Sync all NetSuite Issues to JIRA'
            }, {
              'supportsRefresh': true
              , 'name': 'multiselect_only_sync_netsuite_issues_with_priority'
              , 'type': 'multiselect'
              , 'label': 'Only Sync NetSuite Issues with Priority'
              , 'options': [
                ['P1'
                  , 'P1'
                ]
                , ['P2'
                  , 'P2'
                ]
                , ['P3'
                  , 'P3'
                ]
                , ['P4'
                  , 'P4'
                ]
                , ['P5'
                  , 'P5'
                ]
                , ['P6'
                  , 'P6'
                ]
                , ['P7'
                  , 'P7'
                ]
              ]
            }, {
              'supportsRefresh': true
              , 'name': 'select_default_jira_project'
              , 'type': 'select'
              , 'label': 'Default JIRA Project'
              , 'options': [
                ['11201_DP'
                  , 'Demo Project'
                ]
                , ['10000_JR'
                  , 'JIRA Research'
                ]
              ]
              , 'value': '10000_JR'
            }, {
              'supportsRefresh': true
              , 'name': 'select_default_netsuite_product'
              , 'type': 'select'
              , 'label': 'Default NetSuite Product'
              , 'options': [
                ['0123 Phone'
                  , '0123 Phone'
                ]
                , ['1ABC Phone'
                  , '1ABC Phone'
                ]
                , ['Motorola 4450 DSS Console'
                  , 'Motorola 4450 DSS Console'
                ]
                , ['NNNN Phone'
                  , 'NNNN Phone'
                ]
                , ['New NS Produt'
                  , 'New NS Produt'
                ]
                , ['New Product 17 Feb'
                  , 'New Product 17 Feb'
                ]
                , ['Panasonic KX-TG4500'
                  , 'Panasonic KX-TG4500'
                ]
              ]
              , 'value': '0123 Phone'
            }]
            , 'flows': [{
              'group': 'JIRA to NetSuite'
              , 'showMapping': true
              , '_id': '56e68f75d534b67035bc54e1'
            }, {
              'group': 'JIRA to NetSuite'
              , 'showMapping': true
              , '_id': '56e68f75d534b67035bc54e2'
            }, {
              'group': 'NetSuite to JIRA'
              , 'showMapping': true
              , '_id': '56e68f75d534b67035bc54de'
            }, {
              'group': 'NetSuite to JIRA'
              , 'showMapping': true
              , '_id': '56e68f75d534b67035bc54e0'
            }]
            , 'title': 'Issue Sync'
          }]
        }
        , 'version': '1.0.0'
      }
      , result = {
        'enable_sync_all_jira_issues': true
        , 'enable_sync_all_netsuite_issues': true
        , 'enable_sync_jira_comments_to_netsuite_details': true
        , 'enable_sync_netsuite_details_to_jira_comments': true
        , 'enable_test_mode': true
        , 'input_test_mode_text': 'Test__'
        , 'multiselect_only_sync_jira_issues_with_priority': undefined
        , 'multiselect_only_sync_netsuite_issues_with_priority': undefined
        , 'select_default_jira_project': '10000_JR'
        , 'select_default_netsuite_product': '0123 Phone'
      }
      , map

    try {
      map = utils.getSettingsMap(record.settings)
    } catch (ex) {
      throw new Error(ex)
    }

    assert.deepEqual(result, map)
    done()
  })
})