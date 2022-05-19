<!doctype html>
<html lang="en">
<head>
    <title>Code coverage report for connector-utils/nsConnectorUtil/verifyBundleInstall.js</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="../../prettify.css">
    <link rel="stylesheet" href="../../base.css">
    <style type='text/css'>
        div.coverage-summary .sorter {
            background-image: url(../../sort-arrow-sprite.png);
        }
    </style>
</head>
<body>
<div class="header high">
    <h1>Code coverage report for <span class="entity">connector-utils/nsConnectorUtil/verifyBundleInstall.js</span></h1>
    <h2>
        Statements: <span class="metric">85.71% <small>(30 / 35)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Branches: <span class="metric">84.85% <small>(28 / 33)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Functions: <span class="metric">100% <small>(6 / 6)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Lines: <span class="metric">96.67% <small>(29 / 30)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Ignored: <span class="metric"><span class="ignore-none">none</span></span> &nbsp;&nbsp;&nbsp;&nbsp;
    </h2>
    <div class="path"><a href="../../index.html">All files</a> &#187; <a href="index.html">connector-utils/nsConnectorUtil/</a> &#187; verifyBundleInstall.js</div>
</div>
<div class="body">
<pre><table class="coverage">
<tr><td class="line-count">1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92</td><td class="line-coverage"><span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span></td><td class="text"><pre class="prettyprint lang-js">'use strict'
&nbsp;
var _ = require('lodash')
  , request = require('request')
  , jsonPath = require('JSONPath')
  , async = require('async')
  , utils = require('ief-utils')
  , CONSTS = require('../constants')
&nbsp;
//constructor
function VerifyBundleInstall() {
&nbsp;
}
&nbsp;
/**
* Performs the execution of verifying a bundle on NetSuite account
* @param paramObject eg.:{"bearerToken":"XX","integrationId":"XX","nsConnectionId":"XX"}
* bearerToken is mandatory.
* If nsConnectionId is provided, the method will directly use that to make proxy call to IO,
* else,
* method will load the integration using integrationId, read nsConnectionId from location "settings.commonresources.netsuiteConnectionId"
* @param scriptId : scriptId of the Bundle Installation script.
* @param callback
* @return err
* @return isBundlePresent : Boolean value
* @return results : results of the search performed in NetSuite
*/
VerifyBundleInstall.prototype.execute = function (paramObject, callback) {
  var that = this
  , scriptId = paramObject.scriptId || null
  , isPresent = false
&nbsp;
  if(!paramObject || !paramObject.bearerToken || (!paramObject.nsConnectionId &amp;&amp; !paramObject.integrationId)) {
    utils.logInSplunk('No bearerToken or nsConnectionId/integrationId provided.')
    return callback(null, isPresent)
  }
&nbsp;
  if (!scriptId) {
    utils.logInSplunk('No scriptId provided in verifying bundle install ')
    return callback(null, isPresent)
  }
&nbsp;
  var opts =
    { bearerToken : paramObject.bearerToken
    , connectionId : paramObject.nsConnectionId || null
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
        { requests :
            [
              { type : 'method'
              , operation : 'verifyBundleInstall'
              , config :
                {  parameters : { scriptId : scriptId }  }
              }
            ]
        }
    }
&nbsp;
  that.getConnectionIdFromIntegrationIfRequired(opts, paramObject, function(error) {
    <span class="missing-if-branch" title="if path not taken" >I</span>if(error) <span class="cstat-no" title="statement not covered" >return callback(new Error('Error while connecting to Integrator.io'))</span>
    utils.integratorProxyCall(opts, function(e, r, b) {
      <span class="missing-if-branch" title="if path not taken" >I</span>if(e) <span class="cstat-no" title="statement not covered" >return callback(new Error('Error while connecting to Integrator.io'))</span>
      b = b[0] || {}
      if(b &amp;&amp; b.statusCode === 200 &amp;&amp; b.results.length &gt;=1 ) {
        isPresent = true
      }
      return callback(null, isPresent, b.results || [])
    })
  })
}
&nbsp;
VerifyBundleInstall.prototype.getConnectionIdFromIntegrationIfRequired = function (opts, paramObject, callback) {
  if(opts.connectionId) return callback()
  utils.integratorRestClient({bearerToken: paramObject.bearerToken, resourcetype: 'integrations', id: paramObject.integrationId}, function(err, response, body) {
    <span class="missing-if-branch" title="if path not taken" >I</span>if (err) <span class="cstat-no" title="statement not covered" >return callback(new Error('Error while connecting to Integrator.io'))</span>
&nbsp;
    try {
      var nsConnectionId = body.settings.commonresources.netsuiteConnectionId || <span class="branch-1 cbranch-no" title="branch not covered" >null</span>
    } catch (ex) {
<span class="cstat-no" title="statement not covered" >      return callback(new Error('Integration does not contain netsuiteConnectionId at location settings.commonresources.netsuiteConnectionId '))</span>
    }
&nbsp;
    <span class="missing-if-branch" title="if path not taken" >I</span>if(!nsConnectionId) <span class="cstat-no" title="statement not covered" >return callback(new Error('Error while connecting to Integrator.io'))</span>
    opts.connectionId = nsConnectionId
    return callback()
  })
}
&nbsp;
module.exports = VerifyBundleInstall
&nbsp;</pre></td></tr>
</table></pre>

</div>
<div class="footer">
    <div class="meta">Generated by <a href="http://istanbul-js.org/" target="_blank">istanbul</a> at Fri Mar 10 2017 15:55:23 GMT+0530 (IST)</div>
</div>
<script src="../../prettify.js"></script>
<script>
window.onload = function () {
        if (typeof prettyPrint === 'function') {
            prettyPrint();
        }
};
</script>
<script src="../../sorter.js"></script>
</body>
</html>
