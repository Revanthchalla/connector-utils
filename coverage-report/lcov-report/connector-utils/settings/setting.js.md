<!doctype html>
<html lang="en">
<head>
    <title>Code coverage report for connector-utils/settings/setting.js</title>
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
<div class="header medium">
    <h1>Code coverage report for <span class="entity">connector-utils/settings/setting.js</span></h1>
    <h2>
        Statements: <span class="metric">62.39% <small>(204 / 327)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Branches: <span class="metric">50.93% <small>(109 / 214)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Functions: <span class="metric">62.12% <small>(41 / 66)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Lines: <span class="metric">65.58% <small>(202 / 308)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Ignored: <span class="metric"><span class="ignore-none">none</span></span> &nbsp;&nbsp;&nbsp;&nbsp;
    </h2>
    <div class="path"><a href="../../index.html">All files</a> &#187; <a href="index.html">connector-utils/settings/</a> &#187; setting.js</div>
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
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
378
379
380
381
382
383
384
385
386
387
388
389
390
391
392
393
394
395
396
397
398
399
400
401
402
403
404
405
406
407
408
409
410
411
412
413
414
415
416
417
418
419
420
421
422
423
424
425
426
427
428
429
430
431
432
433
434
435
436
437
438
439
440
441
442
443
444
445
446
447
448
449
450
451
452
453
454
455
456
457
458
459
460
461
462
463
464
465
466
467
468
469
470
471
472
473
474
475
476
477
478
479
480
481
482
483
484
485
486
487
488
489
490
491
492
493
494
495
496
497
498
499
500
501
502
503
504
505
506
507
508
509
510
511
512
513
514
515
516
517
518
519
520
521
522
523
524
525
526
527
528
529
530
531
532
533
534
535
536
537
538
539
540
541
542
543
544
545
546
547
548
549
550
551
552
553
554
555
556
557
558
559
560
561
562
563
564
565
566
567
568
569
570
571
572
573
574
575
576
577
578
579
580
581
582
583
584
585
586
587
588
589
590
591
592
593
594
595
596
597
598
599
600
601
602
603
604
605
606
607
608
609
610
611
612
613
614
615
616
617
618
619
620
621
622
623
624
625
626
627
628
629
630
631
632
633
634
635
636
637
638
639
640
641
642
643
644
645
646
647
648
649
650
651
652
653
654
655
656
657
658
659
660
661
662
663
664
665
666
667
668
669
670
671
672
673
674
675
676
677
678
679
680
681
682</td><td class="line-coverage"><span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">464</span>
<span class="cline-any cline-yes">462</span>
<span class="cline-any cline-yes">461</span>
<span class="cline-any cline-yes">461</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
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
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
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
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">15</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">12</span>
<span class="cline-any cline-yes">8</span>
<span class="cline-any cline-yes">8</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">12</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">12</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">12</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">20</span>
<span class="cline-any cline-yes">20</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">12</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
  , jsonpath = require('jsonpath')
  , logger = require('winston')
&nbsp;
var HERCULES_BASE_URL = 'https://api.integrator.io'
<span class="missing-if-branch" title="if path not taken" >I</span>if (process.env.NODE_ENV === 'staging') {
<span class="cstat-no" title="statement not covered" >  HERCULES_BASE_URL = 'https://api.staging.integrator.io'</span>
} else <span class="missing-if-branch" title="if path not taken" >I</span>if (process.env.NODE_ENV === 'development') {
  //local testing of code
<span class="cstat-no" title="statement not covered" >  HERCULES_BASE_URL = 'http://api.localhost.io:5000'</span>
}
&nbsp;
//constructor
function Settings(isSettingsGroupingEnabled) {
&nbsp;
  //isSettingsGroupingEnabled is a boolean parameter of the constructor, which needs to be set to true when settings are divided into logical groupings.
  this.isSettingsGroupingEnabled = isSettingsGroupingEnabled ? isSettingsGroupingEnabled : false
  //Register predefined functions here
  var predefinedOps = require('./operations.js')
  this.registerFunction({name: 'toggleNetsuiteExportType', method: predefinedOps.toggleNetsuiteExportType})
  this.registerFunction({name: 'actionSlider', method: predefinedOps.actionSlider})
  this.registerFunction({name: 'secondaryCustomerLookupFilter', method: this.setFieldValues})
  this.registerFunction({name: 'primaryCustomerLookupFilter', method: predefinedOps.updateAdaptorLookupFilter})
  this.registerFunction({name: 'savedSearch', method: predefinedOps.savedSearch})
  this.registerFunction({name: 'updateSearchLocationFilters', method: predefinedOps.updateSearchLocationFilters})
  this.registerFunction({name: 'kitInventoryCalculationPerLocationEnabled', method: predefinedOps.kitInventoryCalculationPerLocationEnabled})
  this.registerFunction({name: 'updateMultipleSavedSearchLocationFilters', method: predefinedOps.updateMultipleSavedSearchLocationFilters})
  this.registerFunction({name: 'updateSearchPricingFilters', method: predefinedOps.updateSearchPricingFilters})
  this.registerFunction({name: 'updateSearchCurrencyFilters', method: predefinedOps.updateSearchCurrencyFilters})
  this.registerFunction({name: 'setStartDateOnDeltaBasedExports', method: predefinedOps.setStartDateOnDeltaBasedExports})
  this.registerFunction({name: 'updateSearchSalesOrderStatusFilters', method: predefinedOps.updateSearchSalesOrderStatusFilters})
  this.registerFunction({name: 'savedSearchAllExports', method: predefinedOps.savedSearchAllExports})
  this.registerFunction({name: 'setDefaultCustomerIdForAllOrders', method: predefinedOps.setDefaultCustomerIdForAllOrders})
  this.registerFunction({name: 'setDefaultCustomerId', method: predefinedOps.setDefaultCustomerId})
  this.registerFunction({name: 'updatePricingSavedSearchWithProvidedFilters', method: predefinedOps.updatePricingSavedSearchWithProvidedFilters})
  this.registerFunction({name: 'invokeOnDemandOrderImport', method: predefinedOps.invokeOnDemandOrderImport})
  this.registerFunction({name: 'setCustomDeltaFilterCheckBox', method: predefinedOps.setCustomDeltaFilterCheckBox})
  this.registerFunction({name: 'selectDateFilterForOrders', method: predefinedOps.selectDateFilterForOrders})
  this.registerFunction({name: 'setDeltaDays', method: predefinedOps.setDeltaDays})
  //TODO: Set options if they are given here
}
&nbsp;
Settings.prototype.getIsSettingsGroupingEnabled = function() {
  return this.isSettingsGroupingEnabled || false
}
&nbsp;
/**
* Register connector specific schema so that utils can extract recordType, recordId, Opeartion
*/
Settings.prototype.registerSchema = function() {
  //TODO : design part to register options schema coming from IO
  return true
}
&nbsp;
/**
* Register functions implementation
* @param funcObj JSON containing function name and implementation object
* @param callback Callback
* @return Callback with error if any otherwise null
*/
Settings.prototype.registerFunction = function(funcObj) {
  if(funcObj.hasOwnProperty('name') &amp;&amp; funcObj.hasOwnProperty('method')) {
    if(typeof funcObj.method === 'function') {
      Settings.prototype[funcObj.name] = funcObj.method
      return true
    }
    else {
        throw new Error('Function implementation is missing while registering this function | '+funcObj.name)
    }
  }
  throw new Error('Either name or method property is missing while registering this function')
}
&nbsp;
/**
* Main function will execute in sequence to save changed settings
* @param options contains pending section of changed settings from IO
* @return response to IO after saving settings
*/
Settings.prototype.persistSettings = function(options, callback) {
  // TODO return structured error
  //TODO optimize multiple call of if(error) return callback(error)
  // TODO common function for request call
  var that = this
  var opts =
    { uri: HERCULES_BASE_URL + '/v1/' + 'integrations/' + options._integrationId
    , method: 'GET'
    , headers:
      { Authorization: 'Bearer ' + options.bearerToken
      , 'Content-Type': 'application/json'
      }
    , json: true
    }
  var paramObject =
    { oldSettings : null // before saving settings including setting and its json
    , newSettings : null // contains changed setting and value
    , setting : null // new setting key
    , options : null // contains integration records with shopId
    , settingParams: null // array of setting parameter, assuming ['recordType','recordId','method'] for now
    }
  request(opts, function(error, res, body) {
    if(error) return callback(error)
    paramObject.options = options
    paramObject.options.integrationRecord = body
    that.consumeInput(paramObject, function(error) {
      if(error) return callback(error)
      <span class="missing-if-branch" title="if path not taken" >I</span>if(paramObject.sliderInput){
<span class="cstat-no" title="statement not covered" >        return that.handleSliderInput(paramObject, <span class="fstat-no" title="function not covered" >function(error) {</span></span>
<span class="cstat-no" title="statement not covered" >          if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span></span>
<span class="cstat-no" title="statement not covered" >          return callback()</span>
        })
      }
      that.loadSettings(paramObject, function(error) {
        <span class="missing-if-branch" title="if path not taken" >I</span>if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span>
        that.verifyIfChanged(paramObject, function(error) {
          <span class="missing-if-branch" title="if path not taken" >I</span>if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span>
          var errArray = []
          async.forEachOfSeries(paramObject.newSettings, function(value, setting, cb) {
            that.performSettingAction(paramObject, setting, function(error) {
              <span class="missing-if-branch" title="else path not taken" >E</span>if(error) {
                errArray.push(error)
                return cb() // ignore error and continue
              }
<span class="cstat-no" title="statement not covered" >              return cb()</span>
            })
          }, function(err) {
              var combinedErrorMessage = ''
              _.each(errArray, function(error, index) {
                combinedErrorMessage = combinedErrorMessage + ' ' + error.message
              })
              <span class="missing-if-branch" title="else path not taken" >E</span>if (errArray.length &gt; 0 ) {
                return callback(new Error(combinedErrorMessage))
              }
              //save oldSettings in Integrator now
<span class="cstat-no" title="statement not covered" >              var opts =</span>
                { uri: HERCULES_BASE_URL + '/v1/' + 'integrations/' + options._integrationId
                , method: 'PUT'
                , headers:
                  { Authorization: 'Bearer ' + options.bearerToken
                  , 'Content-Type': 'application/json'
                  }
                , json: body
                }
<span class="cstat-no" title="statement not covered" >              request(opts, <span class="fstat-no" title="function not covered" >function(error, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >                if(error) {</span>
<span class="cstat-no" title="statement not covered" >                  return callback(new Error('Error while connecting to Integrator.io'))</span>
                }
<span class="cstat-no" title="statement not covered" >                return callback()</span>
              })
          })
        })
      })
    })
  })
}
&nbsp;
/**
* This function must override if IO does not gives default options
* @param options IO options while saving the settings
* @param callback Callback
* @newSettings include new seeting in paramObject
*/
Settings.prototype.consumeInput = function(paramObject, callback) {
  var options = paramObject.options
    , pending = paramObject.options.pending
  if(!options.hasOwnProperty('pending'))
    return callback(new Error('pending property is missing from options'))
  <span class="missing-if-branch" title="if path not taken" >I</span>if(pending &amp;&amp; pending.flowId &amp;&amp; <span class="branch-2 cbranch-no" title="branch not covered" >_.isBoolean(pending.disabled))</span>{
<span class="cstat-no" title="statement not covered" >    paramObject.sliderInput = true</span>
<span class="cstat-no" title="statement not covered" >    paramObject.flowId = pending.flowId</span>
<span class="cstat-no" title="statement not covered" >    paramObject.disabled = pending.disabled</span>
<span class="cstat-no" title="statement not covered" >    return callback()</span>
  }
  paramObject.newSettings = pending
  return callback()
}
&nbsp;
/**
* Loads the integrator record from IO
* @param bearerToken
* @param integrationId
* @param shopId
* @return old settings before saving settings
*/
Settings.prototype.loadSettings = function(paramObject, callback) {
  var integrationRecord = paramObject.options.integrationRecord
    , oldSettings = {}
    , sections = []
    , that = this
    , oldfields = {}
  try {
    sections = integrationRecord.settings.sections
    <span class="missing-if-branch" title="if path not taken" >I</span>if (!sections || !_.isArray(sections) || sections.length &lt; 1)
<span class="cstat-no" title="statement not covered" >      return callback(new Error('sections under settings is missing'))</span>
    logger.info('Settings.loadSettings, that.getIsSettingsGroupingEnabled()', that.getIsSettingsGroupingEnabled())
    if(!that.getIsSettingsGroupingEnabled()) {
      _.each(sections, function(section) {
        _.each(section.fields, function(field) {
          oldfields[field.name] = field
        })
&nbsp;
        that.getFlowSettings(section, oldfields)
      })
    } else {
      _.each(sections, function(section) {
        if(section.hasOwnProperty('sections') &amp;&amp; _.isArray(section.sections)) {
          _.each(section.sections, function (subSection) {
            _.each(subSection.fields, function(field) {
              oldfields[field.name] = field
            })
            that.getFlowSettings(subSection, oldfields)
          })
        } else {
          _.each(section.fields, function(field) {
            oldfields[field.name] = field
          })
        }
      })
    }
    logger.info('oldfields', JSON.stringify(oldfields))
    oldSettings = oldfields
    paramObject.oldSettings = oldSettings
    return callback()
  } catch(exception) {
<span class="cstat-no" title="statement not covered" >    return callback(exception)</span>
  }
}
&nbsp;
Settings.prototype.getFlowSettings = function (section, oldfields) {
  _.each(section.flows, function (flow) {
    var settings = flow.settings
    <span class="missing-if-branch" title="else path not taken" >E</span>if (!settings) {
      return
    }
<span class="cstat-no" title="statement not covered" >    _.each(settings, <span class="fstat-no" title="function not covered" >function (field) {</span></span>
<span class="cstat-no" title="statement not covered" >      oldfields[field.name] = field</span>
    })
  })
}
&nbsp;
/**
* This function must be implemented to validate settings if any
* @param oldSettings old IO settings
* @param newSettings new IO settings
* @param integrationRecord IO records
*/
Settings.prototype.validateSettings = function(oldSettings, newSettings, integrationRecord) {
  // TODO  Throw error if this function is not overriden by connector
  return true
}
&nbsp;
/**
* This function must be used to handle slider Input sent from Integrator UI
* @param oldSettings old IO settings
* @param newSettings new IO settings
* @param integrationRecord IO records
*/
Settings.prototype.handleSliderInput = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
  // TODO  Throw error if this function is not overriden by connector
<span class="cstat-no" title="statement not covered" >  return this.actionSlider(paramObject, callback)</span>
}
/**
* Verify changed settings and return object containing changed one only
* @param oldSettings contains sections object for old settings
* @param newSettings contains pending records coming from IO
* @return newSetings contains changed fields of settings only
*/
Settings.prototype.verifyIfChanged = function(paramObject, callback ) {
  var oldSettings = paramObject.oldSettings
    , newSettings = paramObject.newSettings
  // TODO validate oldSettings and newSettings format
  var changedFields = {}
  _.each(newSettings, function(value, field){
    if(oldSettings.hasOwnProperty(field) &amp;&amp; ((oldSettings[field].hasOwnProperty('value') &amp;&amp; oldSettings[field].value !== value) || (!oldSettings[field].value &amp;&amp; <span class="branch-4 cbranch-no" title="branch not covered" >oldSettings[field].type !== 'staticMapWidget' </span>&amp;&amp; <span class="branch-5 cbranch-no" title="branch not covered" >!!value </span>))) {
      changedFields[field] = value
    }
    else <span class="missing-if-branch" title="if path not taken" >I</span>if(oldSettings.hasOwnProperty(field) &amp;&amp; oldSettings[field].type === 'staticMapWidget'
    &amp;&amp; (<span class="branch-2 cbranch-no" title="branch not covered" >oldSettings[field].map = !!oldSettings[field].map ? oldSettings[field].map : {} </span>)
      &amp;&amp; (<span class="branch-3 cbranch-no" title="branch not covered" >oldSettings[field].default !== value.default </span>|| <span class="branch-4 cbranch-no" title="branch not covered" >oldSettings[field].allowFailures !== value.allowFailures</span>
        || <span class="branch-5 cbranch-no" title="branch not covered" >JSON.stringify(oldSettings[field].map) !== JSON.stringify(value.map))</span>) {
<span class="cstat-no" title="statement not covered" >        changedFields[field] = value</span>
    }
&nbsp;
&nbsp;
  })
  newSettings = changedFields
  paramObject.newSettings = newSettings
  return callback()
}
&nbsp;
/**
* Performs saving the settings based on record type, id and operation
* @param oldSettings settings contain fields information
* @param settingName of pending section coming from IO
* @param settingValue of pending section coming from IO
* @param integrationRecord contains old integrations record
*/
Settings.prototype.performSettingAction = function(paramObject, setting, callback) {
  var settingParams = setting.split('_')
  paramObject.settingParams = settingParams
  paramObject.setting = setting
  // TODO design to know parameters at run time
  // assuming settingParams[0] as record_type, settingParams[1] as record_id, settingParams[2] as method
  var op = settingParams[2]
  <span class="missing-if-branch" title="else path not taken" >E</span>if(typeof Settings.prototype[op] !== 'function')
    return callback(new Error(op + ' method not registered in connector-utils'))
<span class="cstat-no" title="statement not covered" >  Settings.prototype[op](paramObject, <span class="fstat-no" title="function not covered" >function(error) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span></span>
<span class="cstat-no" title="statement not covered" >    return callback()</span>
  })
}
&nbsp;
Settings.prototype.setFieldValues = function(paramObject, cb) {
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , setting = paramObject.setting
  oldSettings[setting].value = newSettings[setting]
  return cb(null)
}
&nbsp;
Settings.prototype.getSettingsFromHerculesForSingleSection = function(herculesFlowData, sectionName) {
  var resourceId = null,
  resourceType = null,
  settings = herculesFlowData.settings,
  returnSettings = {};
  //console.log("herculesFlowData : "+ JSON.stringify(herculesFlowData))
  if(herculesFlowData._importId){
    resourceId = herculesFlowData._importId;
    resourceType = 'imports';
  }
  else <span class="missing-if-branch" title="if path not taken" >I</span>if(herculesFlowData._exportId){
<span class="cstat-no" title="statement not covered" >    resourceId = herculesFlowData._exportId;</span>
<span class="cstat-no" title="statement not covered" >    resourceType = 'exports';</span>
  }
  else {
    //invalid resource type
    return
  }
&nbsp;
  //iterate through settings
  //check if the settings are in older format
  <span class="missing-if-branch" title="if path not taken" >I</span>if(settings &amp;&amp; settings.sections &amp;&amp; _.isArray(settings.sections) &amp;&amp; settings.sections.length &gt; 0 &amp;&amp; settings.sections.fields){
    //nothing to return for old settings
<span class="cstat-no" title="statement not covered" >    return {}</span>
  }
&nbsp;
  var that = this
  //iterate through these settings and add those
  _.each(settings.sections, function(subSection) {
    <span class="missing-if-branch" title="if path not taken" >I</span>if(sectionName &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >sectionName === subSection.title)</span>{
<span class="cstat-no" title="statement not covered" >      that.getSettingFromSection(returnSettings, subSection, null)</span>
    }else <span class="missing-if-branch" title="else path not taken" >E</span>if(!sectionName){
      that.getSettingFromSection(returnSettings, subSection, resourceId)
    }
  })
&nbsp;
  return returnSettings
}
&nbsp;
Settings.prototype.getSettingsFromHerculesForSingleSectionWithGrouping = function(herculesFlowData, sectionName) {
  var resourceId = null
  , settings = herculesFlowData.settings
  , returnSettings = {}
  , that = this
  //console.log("herculesFlowData : "+ JSON.stringify(herculesFlowData))
  if(herculesFlowData._importId) {
    resourceId = herculesFlowData._importId
  } else if(herculesFlowData._exportId) {
    resourceId = herculesFlowData._exportId
  } else {
    //invalid resource type
    return
  }
  //iterate through these settings and add those
  try {
    _.each(settings.sections, function(subSection) {
      <span class="missing-if-branch" title="if path not taken" >I</span>if(sectionName &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >sectionName === subSection.title)</span> {
<span class="cstat-no" title="statement not covered" >        if(subSection.hasOwnProperty('sections') &amp;&amp; _.isArray(subSection.sections)) {</span>
<span class="cstat-no" title="statement not covered" >          _.each(subSection.sections, <span class="fstat-no" title="function not covered" >function (settingGroupSection) {</span></span>
<span class="cstat-no" title="statement not covered" >            that.getSettingFromSection(returnSettings, settingGroupSection, null)</span>
          })
        } else {
<span class="cstat-no" title="statement not covered" >            that.getSettingFromSection(returnSettings, subSection, null)</span>
        }
      } else <span class="missing-if-branch" title="else path not taken" >E</span>if(!sectionName) {
        if(subSection.hasOwnProperty('sections') &amp;&amp; _.isArray(subSection.sections)) {
          _.each(subSection.sections, function (settingGroupSection) {
            that.getSettingFromSection(returnSettings, settingGroupSection, resourceId)
          })
        } else {
            that.getSettingFromSection(returnSettings, subSection, null)
        }
      }
    })
    return returnSettings
  } catch (ex) {
<span class="cstat-no" title="statement not covered" >    logger.info('Settings.getSettingsFromHerculesForSingleSectionWithGrouping, exception ', JSON.stringify(ex))</span>
<span class="cstat-no" title="statement not covered" >    return {}</span>
  }
}
&nbsp;
Settings.prototype.getSettingFromSection = function (returnSettings, subSection, resourceId){
&nbsp;
  _.each(subSection.fields, function(field) {
      //if the setting name matches with resourceId
      if(!resourceId || ~(field.name.indexOf(resourceId))) {
        <span class="missing-if-branch" title="else path not taken" >E</span>if(field.hasOwnProperty('value'))
          returnSettings[field.name] = field.value
        else <span class="cstat-no" title="statement not covered" >if(field.hasOwnProperty('map'))</span>
<span class="cstat-no" title="statement not covered" >          returnSettings[field.name] = {</span>
            map : field.map,
            allowFailures : field.allowFailures
          }
        else
<span class="cstat-no" title="statement not covered" >          returnSettings[field.name] = null</span>
      }
&nbsp;
      if(!returnSettings.hasOwnProperty('defaultGuestCustomer') &amp;&amp; ~(field.name.indexOf('defaultGuestCustomer')))
          returnSettings['defaultGuestCustomer'] = field.value
   })
}
&nbsp;
Settings.prototype.getSavedSearchId = function (paramObject, callback) {
  if(paramObject &amp;&amp; paramObject.searchId) {
    paramObject.savedSearchId = paramObject.options.pending.searchId
    return
  }
  <span class="missing-if-branch" title="else path not taken" >E</span>if(paramObject.options &amp;&amp; paramObject.options.pending &amp;&amp; paramObject.settingParams &amp;&amp; paramObject.settingParams.length &gt; 2) {
    var savedSearchIdKey = paramObject.settingParams[0] + '_' +  paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName
    paramObject.savedSearchId =  paramObject.options.pending[savedSearchIdKey]
    return
  }
<span class="cstat-no" title="statement not covered" >  return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))</span>
}
&nbsp;
Settings.prototype.getSavedSearchIdAsync = <span class="fstat-no" title="function not covered" >function (paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  if(paramObject.savedSearchId) <span class="cstat-no" title="statement not covered" >return callback(null, paramObject)</span></span>
<span class="cstat-no" title="statement not covered" >  if(paramObject &amp;&amp; paramObject.options.pending.searchId) {</span>
<span class="cstat-no" title="statement not covered" >    paramObject.savedSearchId = paramObject.options.pending.searchId</span>
<span class="cstat-no" title="statement not covered" >    return callback(null, paramObject)</span>
  } else <span class="cstat-no" title="statement not covered" >if(paramObject.options &amp;&amp; paramObject.options.pending &amp;&amp; paramObject.settingParams &amp;&amp; paramObject.settingParams.length &gt; 2) {</span>
<span class="cstat-no" title="statement not covered" >    var savedSearchIdKey = paramObject.settingParams[0] + '_' +  paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName</span>
<span class="cstat-no" title="statement not covered" >    paramObject.savedSearchId =  paramObject.options.pending[savedSearchIdKey]</span>
<span class="cstat-no" title="statement not covered" >    return callback(null, paramObject)</span>
  } else {
<span class="cstat-no" title="statement not covered" >    return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))</span>
  }
}
&nbsp;
/*
 * Aim: To retrieve all the saved searches in the section for which setting's save action is perfomed. It uses our naming convention that saved searches end with 'listSavedSearches'
 * Returns: Array containing searches
 */
Settings.prototype.getAllSavedSearchesInSection = function (paramObject) {
  var savedSearches = []
  , pendingSettings = this.getPendingSettingsObject(paramObject)
  if(pendingSettings.error){
    return pendingSettings
  }
&nbsp;
  _.each(pendingSettings.results,function(settingValue, field){
    <span class="missing-if-branch" title="else path not taken" >E</span>if(field.indexOf('listSavedSearches') &gt;= 0){
      savedSearches.push(settingValue)
    }
  })
&nbsp;
  return {
    results : savedSearches
    , error : null
  }
}
&nbsp;
Settings.prototype.getAllInventorySavedSearchIdsInSection = <span class="fstat-no" title="function not covered" >function (paramObject) {</span>
<span class="cstat-no" title="statement not covered" >  var savedSearches = []</span>
  , pendingSettings = this.getPendingSettingsObject(paramObject)
<span class="cstat-no" title="statement not covered" >  if(pendingSettings.error) {</span>
<span class="cstat-no" title="statement not covered" >    return pendingSettings</span>
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  _.each(pendingSettings.results, <span class="fstat-no" title="function not covered" >function(settingValue, field) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(field.indexOf('listSavedSearches_inv') &gt;= 0){</span>
<span class="cstat-no" title="statement not covered" >      savedSearches.push(settingValue)</span>
    }
  })
&nbsp;
<span class="cstat-no" title="statement not covered" >  return {</span>
    results : savedSearches
    , error : null
  }
}
&nbsp;
Settings.prototype.getKitInventorySavedSearchIdsInSection = <span class="fstat-no" title="function not covered" >function (paramObject) {</span>
<span class="cstat-no" title="statement not covered" >  var savedSearches = []</span>
  , pendingSettings = this.getPendingSettingsObject(paramObject)
<span class="cstat-no" title="statement not covered" >  if(pendingSettings.error) {</span>
<span class="cstat-no" title="statement not covered" >    return pendingSettings</span>
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  _.each(pendingSettings.results, <span class="fstat-no" title="function not covered" >function(settingValue, field) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(field.indexOf('listSavedSearches_kit') &gt;= 0){</span>
<span class="cstat-no" title="statement not covered" >      savedSearches.push(settingValue)</span>
    }
  })
&nbsp;
<span class="cstat-no" title="statement not covered" >  return {</span>
    results : savedSearches
    , error : null
  }
}
&nbsp;
/*
 * Aim: To retrieve valid pending object. It returns considering some connector has multi store json where pending object is nested inside the store id property.
 */
Settings.prototype.getPendingSettingsObject = function (paramObject) {
&nbsp;
  if(paramObject &amp;&amp; paramObject.options &amp;&amp; paramObject.options.pending){
    var pendingSettings = {}
    _.each(paramObject.options.pending, function(value, key){
      <span class="missing-if-branch" title="else path not taken" >E</span>if(typeof value === 'object'){
        pendingSettings = value
      }else{
<span class="cstat-no" title="statement not covered" >        pendingSettings = paramObject.options.pending</span>
      }
      return false
    })
&nbsp;
    return {
      results : pendingSettings
      , error : null
    }
  }
&nbsp;
  return {
    results : null
    , error : 'Update params does not have valid values. Please update integration data or contact Celigo Support'
    , splunkLog : 'Method: getPendingSettingsObject: Invalid integration json : ' + JSON.stringify(paramObject)
  }
}
&nbsp;
Settings.prototype.getMultiExportSavedSearchId = function (paramObject, callback) {
  if(paramObject &amp;&amp; paramObject.searchId &amp;&amp; paramObject.options &amp;&amp; paramObject.options.pending &amp;&amp; paramObject.options.pending.searchId) {
    paramObject.savedSearchId = paramObject.options.pending.searchId
    return
  }
  <span class="missing-if-branch" title="else path not taken" >E</span>if(paramObject.options &amp;&amp; paramObject.options.pending &amp;&amp; paramObject.settingParams &amp;&amp; paramObject.settingParams.length &gt; 2) {
    var savedSearchIdKey = paramObject.settingParams[0] + '_' +  paramObject.settingParams[1] + '_' + paramObject.settingsMethodName + '_' + paramObject.refreshMethodName
    , i =3
&nbsp;
    while(i&lt;paramObject.settingParams.length){
        savedSearchIdKey += '_'+paramObject.settingParams[i++]
    }
    paramObject.savedSearchId =  paramObject.options.pending[savedSearchIdKey]
    return
  }
<span class="cstat-no" title="statement not covered" >  return callback(new Error('paramObject is not having valid values | paramObject:' + JSON.stringify(paramObject)))</span>
}
&nbsp;
/**
  staticMapConfig: { // properties to this config may grow based on needs
    distributed: { // add this object to config only if distributed adaptor needs to be updated.
      staticFielddMap: {} //holds the static field mapping
    }
  }
  *Naming convention for static map widget field:
    &lt;adaptorName&gt;_&lt;adaptorId&gt;_&lt;uniqueMethodName&gt;_&lt;NSExecMethodForRefreshMetaData&gt;__&lt;ECPlatformMethodForRefreshMetadata&gt;
*/
Settings.prototype.staticMapFunctionFactory = <span class="fstat-no" title="function not covered" >function(staticMapConfig) {</span>
<span class="cstat-no" title="statement not covered" >  var genericOperations = require('./genericOperations.js')</span>
  , that = this
&nbsp;
<span class="cstat-no" title="statement not covered" >  return <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span></span>
<span class="cstat-no" title="statement not covered" >    paramObject.staticMapConfig = staticMapConfig</span>
    // Each depedent operation for static map will hold a method in async series call and should be listed after validate method operation.
<span class="cstat-no" title="statement not covered" >    async.series([</span>
      //validate eligibility of "paramObject" data for static Map Update
<span class="fstat-no" title="function not covered" >      function(cbSeries) {</span>
<span class="cstat-no" title="statement not covered" >        return genericOperations.validateParamObjectDataForStaticMap(paramObject, cbSeries)</span>
      }
      /*Override the called method to extended connector specific operations for static map.
        Do read comment section before defination of the method CAREFULLY before using it.
      */
      , <span class="fstat-no" title="function not covered" >function(cbSeries) {</span>
<span class="cstat-no" title="statement not covered" >        return that.extendConnectorSpecificImplementionForStaticMap(paramObject, cbSeries)</span>
      }
&nbsp;
      //Updation of saved searches
      , <span class="fstat-no" title="function not covered" >function(cbSeries) {</span>
<span class="cstat-no" title="statement not covered" >        if(paramObject.staticMapConfig &amp;&amp; paramObject.staticMapConfig.updateSavedSearch) {</span>
<span class="cstat-no" title="statement not covered" >          if(paramObject.staticMapConfig.updateFiltersType === 'location')</span>
<span class="cstat-no" title="statement not covered" >            return genericOperations.updateSearchLocationFiltersFromMap(paramObject, cbSeries)</span>
          else <span class="cstat-no" title="statement not covered" >if(paramObject.staticMapConfig.updateFiltersType === 'locationForMultipleSearch')</span>
<span class="cstat-no" title="statement not covered" >            return genericOperations.updateMultipleSearchLocationFiltersFromMap(paramObject, cbSeries)</span>
          else <span class="cstat-no" title="statement not covered" >if (paramObject.staticMapConfig.updateFiltersType === 'pricelevel')</span>
<span class="cstat-no" title="statement not covered" >            return genericOperations.updateSearchPricingFiltersFromMap(paramObject, cbSeries)</span>
        }
<span class="cstat-no" title="statement not covered" >        return cbSeries()</span>
      }
&nbsp;
      // Update NS distributed adaptor based on 'distributed' property of staticMapConfig
      , <span class="fstat-no" title="function not covered" >function(cbSeries) {</span>
<span class="cstat-no" title="statement not covered" >        if(paramObject.staticMapConfig &amp;&amp; paramObject.staticMapConfig.distributed) <span class="cstat-no" title="statement not covered" >return genericOperations.updateDistributedAdaptor(paramObject, cbSeries)</span></span>
<span class="cstat-no" title="statement not covered" >        return cbSeries()</span>
      }
&nbsp;
      // Update import adaptor lookup based on 'type' property of staticMapConfig
      , <span class="fstat-no" title="function not covered" >function(cbSeries) {</span>
<span class="cstat-no" title="statement not covered" >        if(paramObject.staticMapConfig &amp;&amp; !paramObject.staticMapConfig.distributed &amp;&amp; paramObject.staticMapConfig.importType) <span class="cstat-no" title="statement not covered" >return genericOperations.updateImportAdaptorLookup(paramObject, cbSeries)</span></span>
<span class="cstat-no" title="statement not covered" >        return cbSeries()</span>
      }
&nbsp;
    ], <span class="fstat-no" title="function not covered" >function(err) {</span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
      //if all the mappings dependent opeartions are successful, update the setting's map
<span class="cstat-no" title="statement not covered" >      genericOperations.updateStaticMap(paramObject, callback)</span>
    })
  }
}
&nbsp;
/**
  Use this function to extend operations specific to a connetor for static map widget.
  This function need to be registered befor being used by a connector's setting module.
  *Note that once this function is overriden, it will be executed for every static map widget's save operation
  and functionality for each widget needs to be handled using some condition that identifies the operation respective
  to the widget.
  ex: Below is the pseudo code to handle operations for two different static map widget mappings (shipmethod and paymentmethod)
    if name of widget identifies shipmethod
      perform operation specific to shipmethod
    else if name of widget identifies paymentmethod
      perform operation specific to paymentmethod
    ...
    else callback()
*/
&nbsp;
Settings.prototype.extendConnectorSpecificImplementionForStaticMap = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  return callback()</span>
}
&nbsp;
Settings.prototype.updateResource = <span class="fstat-no" title="function not covered" >function(resourceType, resourceId, paths, values, bearerToken, callback) {</span>
<span class="cstat-no" title="statement not covered" >    if(!_.isArray(paths)) <span class="cstat-no" title="statement not covered" >paths = [paths]</span></span>
<span class="cstat-no" title="statement not covered" >    if(!_.isArray(values)) <span class="cstat-no" title="statement not covered" >values = [values]</span></span>
<span class="cstat-no" title="statement not covered" >    if(paths.length !== values.length)  <span class="cstat-no" title="statement not covered" >return callback('Paths and Values arrays should have equal number of entries')</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >    var requestOptions =</span>
      { uri : HERCULES_BASE_URL + '/v1/' + resourceType + '/' + resourceId
      , method : 'GET'
      , auth : { bearer : bearerToken}
      , json : true
      }
<span class="cstat-no" title="statement not covered" >    logger.info('updateResource, requestOptions for GET : ' + JSON.stringify(requestOptions))</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >    request(requestOptions, <span class="fstat-no" title="function not covered" >function (err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      logger.info('updateResource, GET call res : ' + JSON.stringify(res))</span>
<span class="cstat-no" title="statement not covered" >      if(res.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return callback('GET call failed for the resource : ' + resourceType + ': ' + resourceId + ', statusCode :' + res.statusCode)</span></span>
<span class="cstat-no" title="statement not covered" >      if(!body) <span class="cstat-no" title="statement not covered" >return callback('Empty body returned for the resource : ' + resourceType + ': ' + resourceId)</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >      try {</span>
<span class="cstat-no" title="statement not covered" >        _.each(paths, <span class="fstat-no" title="function not covered" >function (path, index) {</span></span>
<span class="cstat-no" title="statement not covered" >          jsonpath.apply(body, path, <span class="fstat-no" title="function not covered" >function() {</span> <span class="cstat-no" title="statement not covered" >return values[index] }</span>)</span>
        })
      } catch (ex) {
<span class="cstat-no" title="statement not covered" >        return callback(new Error('Unable to assign values of the order ids provided to flow. Exception : ' + ex.message))</span>
      }
&nbsp;
<span class="cstat-no" title="statement not covered" >      requestOptions.method = 'PUT'</span>
<span class="cstat-no" title="statement not covered" >      requestOptions.json = body</span>
<span class="cstat-no" title="statement not covered" >      logger.info('updateResource, requestOptions for PUT : ' + JSON.stringify(requestOptions))</span>
<span class="cstat-no" title="statement not covered" >      request(requestOptions, <span class="fstat-no" title="function not covered" >function (err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >        if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >        logger.info('updateResource, res : ' + JSON.stringify(res))</span>
<span class="cstat-no" title="statement not covered" >        if(!(res.statusCode == 200 || res.statusCode == 201)) <span class="cstat-no" title="statement not covered" >return callback('PUT call failed for the resource : ' + resourceType + ': ' + resourceId + ', statusCode :' + res.statusCode)</span></span>
<span class="cstat-no" title="statement not covered" >        return callback()</span>
      })
    })
  }
&nbsp;
module.exports = Settings
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
