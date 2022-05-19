<!doctype html>
<html lang="en">
<head>
    <title>Code coverage report for connector-utils/hitech-utils/utils.js</title>
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
    <h1>Code coverage report for <span class="entity">connector-utils/hitech-utils/utils.js</span></h1>
    <h2>
        Statements: <span class="metric">92.48% <small>(123 / 133)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Branches: <span class="metric">85.71% <small>(72 / 84)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Functions: <span class="metric">92.11% <small>(35 / 38)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Lines: <span class="metric">92.37% <small>(121 / 131)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Ignored: <span class="metric"><span class="ignore-none">none</span></span> &nbsp;&nbsp;&nbsp;&nbsp;
    </h2>
    <div class="path"><a href="../../index.html">All files</a> &#187; <a href="index.html">connector-utils/hitech-utils/</a> &#187; utils.js</div>
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
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293</td><td class="line-coverage"><span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">17</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
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
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
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
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">9</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">8</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span></td><td class="text"><pre class="prettyprint lang-js">'use strict'
&nbsp;
var request = require('request')
  , _ = require('lodash')
  , async = require('async')
  , findWhere = require('lodash.findwhere')
  , flat = require('flat')
  , HERCULES_BASE_URL
&nbsp;
<span class="missing-if-branch" title="if path not taken" >I</span>if (['production', 'travis'].indexOf(process.env.NODE_ENV) !== -1) {
<span class="cstat-no" title="statement not covered" >  HERCULES_BASE_URL = 'https://api.integrator.io'</span>
} else <span class="missing-if-branch" title="if path not taken" >I</span>if (process.env.NODE_ENV === 'staging') {
<span class="cstat-no" title="statement not covered" >  HERCULES_BASE_URL = 'https://api.staging.integrator.io'</span>
} else {
  HERCULES_BASE_URL = 'http://api.localhost.io:5000'
}
&nbsp;
var utils = {
&nbsp;
  resolveIds: function(resourceConfigArray, globalState) {
    _.each(resourceConfigArray, function(resourceConfig) {
      _.forEach(resourceConfig, function(value, key) {
        //as per the naming pattern, reference fields will always start from underscore '_'
        if (key.indexOf('_') !== 0)
          return
        var searchObj = {}
        searchObj.name = resourceConfig[key]
        var objFromState = findWhere(globalState.configs, searchObj)
        if (objFromState &amp;&amp; _.has(objFromState, '_id')) {
          resourceConfig[key] = objFromState._id
          <span class="missing-if-branch" title="else path not taken" >E</span>if (_.has(resourceConfig, '_connectorId') &amp;&amp; _.has(objFromState, '_connectorId')) {
            resourceConfig._connectorId = objFromState._connectorId
          }
        }
      })
    })
    return resourceConfigArray
  },
&nbsp;
  createIOResource: function(resourceConfigArray, globalState, callback) {
    resourceConfigArray = utils.resolveIds(resourceConfigArray, globalState)
    var asyncLimit = 10
    if (!_.isEmpty(resourceConfigArray) &amp;&amp; resourceConfigArray[0].isDistributed == true)
      asyncLimit = 1 // Assumption here is that all the records in the resourceConfigArray are of same resourceType
    async.eachLimit(resourceConfigArray, asyncLimit
      , function(resource, cb) {
        var relUri = '/v1/' + resource.resourceType
          , reqMethod = 'POST'
&nbsp;
        if (resource.isDistributed == true) {
          relUri = relUri + '/' + resource._id + '/distributed'
          reqMethod = 'PUT'
        }
        utils.requestIntegrator(relUri, reqMethod, resource, null, globalState.bearerToken, null, function(err, res, body) {
          if (err) return cb(err)
          resource._id = body._id
          globalState.configs.push(resource)
          cb(null)
        })
      }
      , function(err) {
        if (err) return callback(err)
        return callback(null)
      })
  },
&nbsp;
  buildNameMap: function(records) {
    var map = {}
    _.forEach(records, function(record) {
      map[record.name] = record
    })
    return map
  },
&nbsp;
  concatDedup: function(hiPrecedenceArr, loPrecedenceArr, prop) {
    var concatArray = _.union(hiPrecedenceArr, loPrecedenceArr)
      , uniqArray = _.uniqBy(concatArray, prop)
    return uniqArray
  },
&nbsp;
  requestNSConnection: function(_connectionId, scriptId, deployId, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + '/v1/connections/' + _connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
        , 'Integrator-Netsuite-ScriptId': scriptId
        , 'Integrator-Netsuite-DeployId': deployId
        , 'Integrator-Method': reqMethod
      }
      , json: data
    }
&nbsp;
    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          <span class="missing-if-branch" title="else path not taken" >E</span>if (errorMsg)
            return cb(new Error(errorMsg))
          else
<span class="cstat-no" title="statement not covered" >            return cb(new Error('statuscode not in (200, 201, 204) for scriptId=' + scriptId))</span>
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },
&nbsp;
  requestRestConnection: function(_connectionId, relativeURI, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + '/v1/connections/' + _connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
        , 'Integrator-Relative-URI': relativeURI
        , 'Integrator-Method': reqMethod
      }
      , json: data
    }
&nbsp;
    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          <span class="missing-if-branch" title="else path not taken" >E</span>if (errorMsg)
            return cb(new Error(errorMsg))
          else
<span class="cstat-no" title="statement not covered" >            return cb(new Error('statuscode not in (200, 201, 204) for relative-uri=' + relativeURI))</span>
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },
&nbsp;
  requestIntegrator: function(relativeURI, reqMethod, data, errorMsg, bearerToken, cb, callback) {
    var opts = {
      uri: HERCULES_BASE_URL + relativeURI
      , method: reqMethod
      , headers: {
        Authorization: 'Bearer ' + bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: data
    }
&nbsp;
    request(opts, function(error, response, body) {
      if (cb) {
        if (error) {
          return cb(error)
        }
        if ([200, 201, 204].indexOf(response.statusCode) === -1) {
          <span class="missing-if-branch" title="else path not taken" >E</span>if (errorMsg)
            return cb(new Error(errorMsg))
          else
<span class="cstat-no" title="statement not covered" >            return cb(new Error('statuscode not in (200, 201, 204) for relative-uri=' + relativeURI))</span>
        }
        return callback(body)
      } else
        return callback(error, response, body)
    })
  },
&nbsp;
  preProcessMapping: function(rec, version) {
    var fields
      , lists
&nbsp;
    <span class="missing-if-branch" title="else path not taken" >E</span>if (rec &amp;&amp; rec.mapping &amp;&amp; rec.mapping.mappings) {
      fields = []
      lists = []
      if (!!version) {
        // Update functionality case
        _.forEach(rec.mapping.mappings, function(mapRec) {
          if (mapRec.version &gt; version) {
            _.forEach(mapRec.fields, function(fieldRec) {
              fields.push(fieldRec)
            })
            _.forEach(mapRec.lists, <span class="fstat-no" title="function not covered" >function(listRec) {</span>
<span class="cstat-no" title="statement not covered" >              lists.push(listRec)</span>
            })
          }
        })
      } else {
        // Install functionality case
        _.forEach(rec.mapping.mappings, function(mapRec) {
          _.forEach(mapRec.fields, function(fieldRec) {
            fields.push(fieldRec)
          })
          _.forEach(mapRec.lists, <span class="fstat-no" title="function not covered" >function(listRec) {</span>
<span class="cstat-no" title="statement not covered" >            lists.push(listRec)</span>
          })
        })
      }
      rec.mapping = {
        fields: fields
        , lists: lists
      }
    }
    return rec
  },
&nbsp;
  isTestModeOn: function(options, propertyName) {
    var result = false
    <span class="missing-if-branch" title="else path not taken" >E</span>if (options &amp;&amp;
      options.settings &amp;&amp;
      options.settings.general &amp;&amp;
      options.settings.general.fields &amp;&amp;
      _.isArray(options.settings.general.fields)) {
      result = _.find(options.settings.general.fields, function(field) {
        return field.name == propertyName
      }).value
    }
    return result
  },
&nbsp;
  isTestTextPresent: function(inputField, testText) {
    var inputFieldFlattened = flat(inputField)
      , result = false
    _.forEach(inputFieldFlattened, function(value) {
      if (typeof value === 'string' &amp;&amp; value.indexOf(testText) === 0) {
        result = true
      }
    })
    return result
  },
&nbsp;
  responseDataAfterValidation: function(options, propertyName) {
    var testText, i
    <span class="missing-if-branch" title="else path not taken" >E</span>if (!!options &amp;&amp;
      !!options.settings &amp;&amp;
      !!options.settings.general &amp;&amp;
      !!options.settings.general.fields) {
      testText = _.find(options.settings.general.fields, function(field) {
        return field.name == propertyName
      }).value
    }
&nbsp;
    <span class="missing-if-branch" title="if path not taken" >I</span>if (!testText)
<span class="cstat-no" title="statement not covered" >      return</span>
&nbsp;
    for (i = 0; i &lt; options.data.length; i++) {
      if (!utils.isTestTextPresent(options.data[i], testText)) {
        options.data[i] = null
      }
    }
  },
&nbsp;
  enableDisableFlow: function(flow, disabled, configToSend, toReturn, bearerToken, callback) {
    flow.disabled = disabled
    utils.requestIntegrator('/v1/flows/' + flow._id, 'PUT', flow, 'Could not save the flow setting', bearerToken, callback, function() {
      if (configToSend) {
        configToSend.disabled = disabled
        utils.requestIntegrator('/v1/exports/' + flow._exportId + '/distributed', 'PUT', configToSend, 'Could not save the flow setting in NetSuite', bearerToken, callback, function() {
          return callback(null, toReturn)
        })
      } else return callback(null, toReturn)
    })
  },
&nbsp;
  getSettingsMap: function(settings) {
    var settingsMap = {}
&nbsp;
    _.forEach(settings.sections, function(section) {
      _.forEach(section.fields, function(field) {
        settingsMap[field.name] = field.value
      })
&nbsp;
      _.forEach(section.flows, function(flow) {
        <span class="missing-if-branch" title="if path not taken" >I</span>if (flow.settings) {
<span class="cstat-no" title="statement not covered" >          _.forEach(flow.settings, <span class="fstat-no" title="function not covered" >function(setting) {</span></span>
<span class="cstat-no" title="statement not covered" >            settingsMap[setting.name] = setting.value</span>
          })
        }
      })
    })
&nbsp;
    <span class="missing-if-branch" title="else path not taken" >E</span>if (settings.general) {
      _.forEach(settings.general.fields, function(field) {
        settingsMap[field.name] = field.value
      })
    }
    return settingsMap
  }
}
&nbsp;
module.exports.utils = utils
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
