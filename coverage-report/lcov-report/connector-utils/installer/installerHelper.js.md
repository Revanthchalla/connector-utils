<!doctype html>
<html lang="en">
<head>
    <title>Code coverage report for connector-utils/installer/installerHelper.js</title>
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
<div class="header low">
    <h1>Code coverage report for <span class="entity">connector-utils/installer/installerHelper.js</span></h1>
    <h2>
        Statements: <span class="metric">49.89% <small>(224 / 449)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Branches: <span class="metric">48.12% <small>(166 / 345)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Functions: <span class="metric">41.46% <small>(17 / 41)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Lines: <span class="metric">51.03% <small>(224 / 439)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Ignored: <span class="metric"><span class="ignore-none">none</span></span> &nbsp;&nbsp;&nbsp;&nbsp;
    </h2>
    <div class="path"><a href="../../index.html">All files</a> &#187; <a href="index.html">connector-utils/installer/</a> &#187; installerHelper.js</div>
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
682
683
684
685
686
687
688
689
690
691
692
693
694
695
696
697
698
699
700
701
702
703
704
705
706
707
708
709
710
711
712
713
714
715
716
717
718
719
720
721
722
723
724
725
726
727
728
729
730
731
732
733
734
735
736
737
738
739
740
741
742
743
744
745
746
747
748
749
750
751
752
753
754
755
756
757
758
759
760
761
762
763
764
765
766
767
768
769
770
771
772
773
774
775
776
777
778
779
780
781
782
783
784
785
786
787
788
789
790
791
792
793
794
795
796
797
798
799
800
801
802
803
804
805
806
807
808
809
810
811
812
813
814
815
816
817
818
819
820
821
822
823
824
825
826
827
828
829
830
831
832
833
834
835
836
837
838
839
840
841
842
843
844
845
846
847
848
849
850
851
852
853
854
855
856</td><td class="line-coverage"><span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">15</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">14</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">41</span>
<span class="cline-any cline-yes">39</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">39</span>
<span class="cline-any cline-yes">39</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">9</span>
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
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">20</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-yes">23</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">32</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">32</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">27</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">27</span>
<span class="cline-any cline-yes">26</span>
<span class="cline-any cline-yes">24</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">26</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">13</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">8</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">107</span>
<span class="cline-any cline-yes">47</span>
<span class="cline-any cline-yes">60</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">107</span>
<span class="cline-any cline-yes">107</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">39</span>
<span class="cline-any cline-yes">39</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">9</span>
<span class="cline-any cline-yes">9</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">28</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">27</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">27</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-yes">30</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span></td><td class="text"><pre class="prettyprint lang-js">'use strict'
&nbsp;
var _ = require('lodash')
  , async = require('async')
  , jsonPath = require('JSONPath')
  , request = require('request')
  , logger = require('winston')
  , moment = require('moment')
  , handlebars = require('handlebars')
  , CONSTS = require('../constants.js');
&nbsp;
var saveState = <span class="fstat-no" title="function not covered" >function(recordarray,serializedState, key, options, callback) {</span>
<span class="cstat-no" title="statement not covered" >  var opts =</span>
  { bearerToken: options.bearerToken
  , resourcetype: 'integrations/' + options._integrationId + '/state/' + CONSTS.STATE
  , method: 'PUT'
  }
<span class="cstat-no" title="statement not covered" >    if(serializedState &amp;&amp; serializedState.errors &amp;&amp; _.isArray(serializedState.errors)) {</span>
<span class="cstat-no" title="statement not covered" >      delete serializedState.errors</span>
    }
<span class="cstat-no" title="statement not covered" >    serializedState[key] = recordarray</span>
<span class="cstat-no" title="statement not covered" >    opts.data = serializedState</span>
<span class="cstat-no" title="statement not covered" >    integratorStateClient(opts, <span class="fstat-no" title="function not covered" >function(error, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span></span>
<span class="cstat-no" title="statement not covered" >      return callback()</span>
    })
}
, createRecordsInOrderHelper = <span class="fstat-no" title="function not covered" >function(recordarray, options, callback) {</span>
    //the record should Directed Acyclic Graph
<span class="cstat-no" title="statement not covered" >    if(!!options &amp;&amp; (!!options.upgradeMode || !!options.connectorEdition)) {</span>
      //TODO: add a function to validate edition of nodes to be compatible with editions of dependent nodes
<span class="cstat-no" title="statement not covered" >      trimNodesBasedOnEdition(recordarray, options, <span class="fstat-no" title="function not covered" >function(err) {</span></span>
<span class="cstat-no" title="statement not covered" >        if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
      })
    }
    //load all json data from filesystem into info variable
<span class="cstat-no" title="statement not covered" >    var temprecord;</span>
<span class="cstat-no" title="statement not covered" >    for (temprecord in recordarray) {</span>
      //for each record load file from fs into variable info
<span class="cstat-no" title="statement not covered" >      if (!(recordarray[temprecord].filelocation || recordarray[temprecord].isLoaded)) {</span>
<span class="cstat-no" title="statement not covered" >        var err = new Error('Config Error: no filelocation given in record : ' + temprecord)</span>
<span class="cstat-no" title="statement not covered" >        return callback(err.message)</span>
      }
<span class="cstat-no" title="statement not covered" >      if (!recordarray[temprecord].isLoaded) {</span>
<span class="cstat-no" title="statement not covered" >        recordarray[temprecord].info = loadJSON(recordarray[temprecord].filelocation)</span>
<span class="cstat-no" title="statement not covered" >        recordarray[temprecord].isLoaded = true;</span>
          //add bearer token in info node
        //if it is already resolved directly load in response
<span class="cstat-no" title="statement not covered" >        if (recordarray[temprecord].resolved) {</span>
<span class="cstat-no" title="statement not covered" >          recordarray[temprecord].info.response = loadJSON(recordarray[temprecord].filelocation)</span>
        }
      }
<span class="cstat-no" title="statement not covered" >      recordarray[temprecord].info.bearerToken = options.bearerToken;</span>
    }
    //while every dependency is not resolved
<span class="cstat-no" title="statement not covered" >    makeAsyncCalls(recordarray, callback);</span>
  }
  /**
   *   signature :
   *   options [{bearerToken, resourcetype, id, data}]
   *   callback
   */
, integratorStateClient = <span class="fstat-no" title="function not covered" >function(options, callback) {</span>
<span class="cstat-no" title="statement not covered" >      if (!options.resourcetype) {</span>
<span class="cstat-no" title="statement not covered" >        logInSplunk('No resourcetype is given!');</span>
<span class="cstat-no" title="statement not covered" >        var err = new Error('No resourcetype is given!')</span>
<span class="cstat-no" title="statement not covered" >        return callback(err.message);</span>
      }
<span class="cstat-no" title="statement not covered" >      if (!options.bearerToken) {</span>
<span class="cstat-no" title="statement not covered" >        logInSplunk('No Auth Token is given!');</span>
<span class="cstat-no" title="statement not covered" >        var err = new Error('No Auth Token is given!')</span>
<span class="cstat-no" title="statement not covered" >        return callback(err.message);</span>
      }
<span class="cstat-no" title="statement not covered" >      var opts =</span>
        { uri: CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourcetype
        , method: options.method
        , headers:
          { Authorization: 'Bearer ' + options.bearerToken
          , 'Content-Type': 'application/json'
          }
        , json: true
        }
<span class="cstat-no" title="statement not covered" >      if(opts.method === 'PUT') {</span>
<span class="cstat-no" title="statement not covered" >        opts.json = options.data</span>
      }
<span class="cstat-no" title="statement not covered" >      logInSplunk('REST call : method|' + opts.method + ', uri|' + opts.uri);</span>
<span class="cstat-no" title="statement not covered" >      request(opts, <span class="fstat-no" title="function not covered" >function(error, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >        if(error) <span class="cstat-no" title="statement not covered" >return callback(error)</span></span>
<span class="cstat-no" title="statement not covered" >        return callback(null, res, body);</span>
      })
    }
, integratorRestClient = function(options, callback) {
    if (!options.resourcetype) {
      logInSplunk('No resourcetype is given!');
      var err = new Error('No resourcetype is given!')
      return callback(err.message);
    }
    if (!options.bearerToken) {
      logInSplunk('No Auth Token is given!');
      var err = new Error('No Auth Token is given!')
      return callback(err.message);
    }
    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourcetype
      , method: 'GET'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }
&nbsp;
    if (!!options.id) {
      opts.uri = opts.uri + '/' + options.id;
      if (!!options.data) {
        opts.method = 'PUT';
        opts.json = options.data;
      }
      if (!!options.distributed) {
        opts.uri = opts.uri + '/distributed'
      }
    } else if (!!options.data) {
      opts.method = 'POST';
      opts.json = options.data;
      //if data cotains _id that means it is a put call
      if (options.data._id) {
        //remove the _id from data
        opts.uri = opts.uri + '/' + options.data._id;
        opts.method = 'PUT';
      }
      if (!!options.distributed) {
        opts.uri = opts.uri + '/distributed'
      }
    }
&nbsp;
    <span class="missing-if-branch" title="if path not taken" >I</span>if(!!options.id &amp;&amp; !options.data &amp;&amp; options.method === 'DELETE'){
<span class="cstat-no" title="statement not covered" >      opts.method = 'DELETE'</span>
    }
    logInSplunk('REST call : method|' + opts.method + ', uri|' + opts.uri);
    logInSplunk('REST call : json |' + JSON.stringify(opts.json));
    requestWrapper(opts, callback)
  }
, integratorApiIdentifierClient = function(options, callback) {
    if (!options.bearerToken) {
      logInSplunk('No Auth Token was provided!');
      var err = new Error('No Auth Token was provided!')
      return callback(err.message);
    }
    if (!options.apiIdentifier) {
      logInSplunk('No apiIdentifier was provided!');
      var err = new Error('No apiIdentifier was provided!')
      return callback(err.message)
    }
&nbsp;
    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/' + options.apiIdentifier
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }
&nbsp;
    <span class="missing-if-branch" title="else path not taken" >E</span>if (!!options.data) {
      opts.json = options.data;
    }
    //logInSplunk('call API: \n' + JSON.stringify(opts));
    requestWrapper( opts, callback)
  }
  /**
   *   signature :
   *   options [{bearerToken, connectionId, method, scriptId, deployId, data, relativeURI}]
   *   callback
   */
, integratorProxyCall = function(options, callback) {
    if (!options.bearerToken) {
      logInSplunk('No Auth Token is given!');
      var err = new Error('No Auth Token is given!')
      return callback(err.message);
    }
    <span class="missing-if-branch" title="if path not taken" >I</span>if(!options.connectionId){
<span class="cstat-no" title="statement not covered" >      logInSplunk('Connection id is not given');</span>
<span class="cstat-no" title="statement not covered" >      var err = new Error('connection id is not given')</span>
<span class="cstat-no" title="statement not covered" >      return callback(err.message);</span>
    }
    var opts = {
      uri: CONSTS.HERCULES_BASE_URL + '/v1/connections/' + options.connectionId + '/proxy'
      , method: 'POST'
      , headers: {
        Authorization: 'Bearer ' + options.bearerToken
        , 'Content-Type': 'application/json'
      }
      , json: true
      , retry : options.retry
    }
    //Netsuite Restlet call
    <span class="missing-if-branch" title="if path not taken" >I</span>if(!!options.scriptId &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >!!options.deployId </span>&amp;&amp; <span class="branch-2 cbranch-no" title="branch not covered" >!!options.method)</span>{
<span class="cstat-no" title="statement not covered" >      opts.headers['Integrator-Netsuite-ScriptId'] = options.scriptId</span>
<span class="cstat-no" title="statement not covered" >      opts.headers['Integrator-Netsuite-DeployId'] = options.deployId</span>
<span class="cstat-no" title="statement not covered" >      opts.headers['Integrator-Method'] = options.method</span>
<span class="cstat-no" title="statement not covered" >      if(!!options.data){</span>
<span class="cstat-no" title="statement not covered" >        opts.json = options.data</span>
      }
    }
    // REST call
    else if(!!options.relativeURI &amp;&amp; !!options.method){
      opts.headers['Integrator-Relative-URI'] = options.relativeURI
      opts.headers['Integrator-Method'] = options.method
      <span class="missing-if-branch" title="else path not taken" >E</span>if(!!options.data){
        opts.json = options.data
      }
    }
    else{
      logInSplunk('Proxy request headers are not in correct format');
      var err = new Error('Proxy request headers are not in correct format')
      return callback(err.message);
    }
    requestWrapper(opts, callback)
  }
&nbsp;
, getAdaptor = <span class="fstat-no" title="function not covered" >function(options, callback) {</span>
<span class="cstat-no" title="statement not covered" >    var requestOptions =</span>
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourceType + '/' + options.resourceId
      , method : 'GET'
      , auth : { bearer : options.bearerToken}
      , json : true
      }
<span class="cstat-no" title="statement not covered" >    logger.debug('installerHelper | getAdaptor, requestOptions for GET: ' + JSON.stringify(requestOptions))</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >    request(requestOptions, <span class="fstat-no" title="function not covered" >function (err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      logger.debug('installerHelper | getAdaptor, GET call res: ' + JSON.stringify(res))</span>
<span class="cstat-no" title="statement not covered" >      var message = null</span>
<span class="cstat-no" title="statement not covered" >      try {</span>
<span class="cstat-no" title="statement not covered" >        message = body.errors[0].message</span>
      } catch(ex) {
<span class="cstat-no" title="statement not covered" >        message = ''</span>
      }
&nbsp;
<span class="cstat-no" title="statement not covered" >      if(res.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return callback(new Error('GET call failed for the resource ' + options.resourceType + '# ' + options.resourceId + ', statusCode: ' + res.statusCode + ', message: ' + message))</span></span>
<span class="cstat-no" title="statement not covered" >      if(!body) <span class="cstat-no" title="statement not covered" >return callback(new Error('Empty body returned for the resource ' + options.resourceType + '# ' + options.resourceId))</span></span>
<span class="cstat-no" title="statement not covered" >      return callback(null, body)</span>
    })
  }
&nbsp;
, putAdaptor = <span class="fstat-no" title="function not covered" >function(options, callback) {</span>
<span class="cstat-no" title="statement not covered" >    var requestOptions =</span>
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/' + options.resourceType + '/' + options.resourceId
      , method : 'GET'
      , auth : { bearer : options.bearerToken}
      , json : true
      }
<span class="cstat-no" title="statement not covered" >    requestOptions.method = 'PUT'</span>
<span class="cstat-no" title="statement not covered" >    requestOptions.json = options.body</span>
<span class="cstat-no" title="statement not covered" >    logger.debug('installerHelper | putAdaptor, requestOptions for PUT: ' + JSON.stringify(requestOptions))</span>
<span class="cstat-no" title="statement not covered" >    request(requestOptions, <span class="fstat-no" title="function not covered" >function (e, r, b) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(e) <span class="cstat-no" title="statement not covered" >return callback(e)</span></span>
<span class="cstat-no" title="statement not covered" >      var message = null</span>
<span class="cstat-no" title="statement not covered" >      try {</span>
<span class="cstat-no" title="statement not covered" >        message = b.errors[0].message</span>
      } catch(ex) {
<span class="cstat-no" title="statement not covered" >        message = ''</span>
      }
<span class="cstat-no" title="statement not covered" >      logger.debug('installerHelper | putAdaptor, r: ' + JSON.stringify(r))</span>
<span class="cstat-no" title="statement not covered" >      if(!(r.statusCode == 200 || r.statusCode == 201)) <span class="cstat-no" title="statement not covered" >return callback(new Error('PUT call failed for the resource ' + options.resourceType + '# ' + options.resourceId + ', statusCode: ' + r.statusCode + ', message: ' + message))</span></span>
<span class="cstat-no" title="statement not covered" >      return callback(null, b)</span>
    })
  }
&nbsp;
, requestWrapper = function(options, callback){
    request(options, function(err, res, body){
      <span class="missing-if-branch" title="if path not taken" >I</span>if(err){
<span class="cstat-no" title="statement not covered" >        return callback(new Error('Could not make network call. '+err.message))</span>
      }
      var verifyResponseResult = verifyResponse(res, body)
      if(!verifyResponseResult.valid){
        if(isStatusCodeRetryAble({statusCode : res.statusCode}) &amp;&amp; options.retry !== false &amp;&amp; options.retryLeft !== 0 ){
          options.retryMethod = requestWrapper
          options.responseHeader = res.headers
          return retryNetworkCall(options, callback)
        }
        logInSplunk('Inside requestWrapper |' + JSON.stringify(body), 'info')
        return callback(verifyResponseResult.err, res, body)
      }
      return callback(err, res, body)
    })
}
/*
 * Purpose: To retry a network call in case of failure.
 * Arguments : Options which was passed to the network client (Rest client/ integratorApiIdentifierClient etc),
              To that options one just to add property retry (true/false). when true, the network call method (should be added to options) is retried after the calculated time.
              If retryCount is passed in options, the method is retried that number of times in case of successive failures before returning the error. If retryCount is not passed, it initializes it to 3
 */
&nbsp;
, retryNetworkCall = function(options, callback){
    if( !options.retryCount){
      // Initialize retryCount if not present in options
      options.retryCount = 8
    }else <span class="missing-if-branch" title="if path not taken" >I</span>if(options.retryLeft === 0 || !options.retryMethod){
      // if no retry is left. return the callback. Idelly it should be handled in the main calling function so as to return the original error.
      // options must have a retryMethod
<span class="cstat-no" title="statement not covered" >      if(!options.retryMethod){</span>
<span class="cstat-no" title="statement not covered" >        logInSplunk('devloper_error : inside retryNetworkCall, could not retry network call. retryMethod is not provided. ', 'info')</span>
      }
<span class="cstat-no" title="statement not covered" >      return callback(new Error('Oops!! something went wrong. Please try later.'))</span>
    }
    options.retryLeft = options.retryLeft || options.retryCount
&nbsp;
    var headerValue
    , retryTime
&nbsp;
    <span class="missing-if-branch" title="else path not taken" >E</span>if(options.responseHeader &amp;&amp;  options.responseHeader['retry-after']){
      headerValue = options.responseHeader['retry-after']
    }
    retryTime = getRetryTimeInSec({
      headerValue : headerValue
      , retryCount : options.retryCount - options.retryLeft
    })
    //wait for retryTime and then call the network again.
    setTimeout(function(){
      options.retryLeft = options.retryLeft -1
      logInSplunk('Retrying network call. Number of retries left is '+options.retryLeft , 'info')
      options.retryMethod(options,callback)
    }, retryTime * 1000 )
  }
&nbsp;
  , isStatusCodeRetryAble = function(options){
    var retryAbleStatusCodes = [408, 429, 503, 504]
    , statusCode = options.statusCode
    return (retryAbleStatusCodes.indexOf(statusCode) &gt;= 0 ? true : false)
  }
  /*
   * Purpose: It returns wait time (in sec), after which a network call should be re-tried in case of failure
   * options = {
      headerValue : headerValue
      , retryCount : retryCount
    }
   */
  , getRetryTimeInSec = function (options) {
    var timeToWait
    , increaseExponential = function () {
      var incrExponential = options.retryCount || <span class="branch-1 cbranch-no" title="branch not covered" >1</span>
      , timeCalculated = Math.pow(2, incrExponential)
      return timeCalculated
    }
&nbsp;
    // if options.headerValue is  a numeric and &lt;1000, we consider the provided data
    //is staright forward the timeToWait in sec. Else we parse the options.headerValue and check,
    //if its UTC, we get time in epoch and we take diff from the current time and decide the timeToWait
    //else we get NaN and we goto default setting to handle that case (same for options.headerValue not passed case).
    //
    if (options.headerValue) {
      if (!isNaN(options.headerValue) &amp;&amp; options.headerValue &lt; 1000 ){
        timeToWait = options.headerValue
      }else {
        var currentTime = moment(new Date()).unix(1318781876)   //gets the current time in epoch seconds
        var headerTimeInSecs = Date.parse(options.headerValue)      // calculate options.headerValue time in secs
        //logger.info('**epoch value' + headerTimeInSecs)
        if (isNaN(headerTimeInSecs)) {
          <span class="missing-if-branch" title="else path not taken" >E</span>if (isNaN(options.headerValue)) {
            timeToWait = increaseExponential()
            return timeToWait
          }
<span class="cstat-no" title="statement not covered" >          headerTimeInSecs = options.headerValue </span>  //if the options.headerValue is already in epoch then we get NaN
        }
&nbsp;
        <span class="missing-if-branch" title="if path not taken" >I</span>if (headerTimeInSecs.toString().length === 13) <span class="cstat-no" title="statement not covered" >headerTimeInSecs = Math.floor(headerTimeInSecs / 1000) </span>//if epoch is in millisecs, converting to sec
&nbsp;
        timeToWait = (headerTimeInSecs &gt; currentTime) ? (headerTimeInSecs - currentTime) : <span class="branch-1 cbranch-no" title="branch not covered" >1</span>
        timeToWait = (timeToWait &lt; 60) ? <span class="branch-0 cbranch-no" title="branch not covered" >timeToWait </span>: increaseExponential()
      }
    }
    else {
      timeToWait = increaseExponential()
    }
&nbsp;
    return timeToWait
  }
&nbsp;
var verifyAndInjectDependency = function(recordarray, record) {
    logInSplunk('start verifyAndInjectDependency for ' + JSON.stringify(record));
    //get the dependency array and check if all are resolved in a loop
    var i;
    <span class="missing-if-branch" title="if path not taken" >I</span>if(recordarray[record].dependencyVerified){
<span class="cstat-no" title="statement not covered" >      logInSplunk('verifyAndInjectDependency : dependency has been verified for ' + record)</span>
<span class="cstat-no" title="statement not covered" >      return true;</span>
    }
    // return true if there is no dependency for the input record
    <span class="missing-if-branch" title="if path not taken" >I</span>if (!recordarray[record].dependson || recordarray[record].dependson.length === 0) {
<span class="cstat-no" title="statement not covered" >      logInSplunk('verifyAndInjectDependency : no depenedency')</span>
<span class="cstat-no" title="statement not covered" >      recordarray[record].dependencyVerified = true</span>
<span class="cstat-no" title="statement not covered" >      return true;</span>
    }
    //logInSplunk('recordarray[record].dependson : ' + JSON.stringify(recordarray[record].dependson))
    //return false if any dependency is not resolved for the input record
    for (i = 0; i &lt; recordarray[record].dependson.length; i = i + 1) {
      <span class="missing-if-branch" title="if path not taken" >I</span>if (!!recordarray[recordarray[record].dependson[i]] &amp;&amp; (!recordarray[recordarray[record].dependson[i]].resolved
            || !recordarray[recordarray[record].dependson[i]].dependencyVerified)) {
<span class="cstat-no" title="statement not covered" >        logInSplunk(record + ' still depend on ' + JSON.stringify(recordarray[record].dependson[i]))</span>
<span class="cstat-no" title="statement not covered" >        return false;</span>
      }
    }
    logInSplunk('ready to resolve for ' + record)
    <span class="missing-if-branch" title="if path not taken" >I</span>if (!recordarray[record].info.jsonpath) {
<span class="cstat-no" title="statement not covered" >      recordarray[record].info.jsonpath = [];</span>
    }
    //      sample jsonpath object
    //      {
    //             "record" : "connection-netsuite",
    //             "readfrom" : "$._id",
    //             "writeto"  : "_connectionId"
    //             "writetopath" : "the json path to node where we want to add writeto"
    //             "convertToString" : true
    //             "removeAll" : true
    //       }
    for (i = 0; i &lt; recordarray[record].info.jsonpath.length; i = i + 1) {
      var temp = recordarray[record].info.jsonpath[i];
      //continue without resolving dependency if dependent record does not exist in meta file
      if(!!temp.record &amp;&amp; !recordarray[temp.record]){
        //console.log("record node does not exist in meta file:", recordarray[record].info.jsonpath[i].record)
        continue
      }
      //logInSplunk(JSON.stringify(temp))
      //if readfrom and writeto both are $ replace object with incoming data
      if (temp.readfrom === '$' &amp;&amp; temp.writeto === '$') {
        //deep copy
        <span class="missing-if-branch" title="if path not taken" >I</span>if (!temp.record || !recordarray[temp.record]['info'] || !recordarray[temp.record]['info']['response']) {
<span class="cstat-no" title="statement not covered" >          logInSplunk('Unable to resolve jsonpath for ' + temp, 'info')</span>
<span class="cstat-no" title="statement not covered" >          throw new Error('Unable to find jsonpath ' + temp)</span>
        }
        recordarray[record].info.data = JSON.parse(JSON.stringify(recordarray[temp.record]['info']['response']))
        continue
      }
      //read the value of temprecord
      //if it is not an array put that in array
      <span class="missing-if-branch" title="if path not taken" >I</span>if (!_.isArray(temp.readfrom)) {
<span class="cstat-no" title="statement not covered" >        var ta = []</span>
<span class="cstat-no" title="statement not covered" >        ta.push({</span>
          readfrom: temp.readfrom
        })
<span class="cstat-no" title="statement not covered" >        if (temp.record) {</span>
<span class="cstat-no" title="statement not covered" >          ta[0].record = temp.record</span>
        }
<span class="cstat-no" title="statement not covered" >        temp.readfrom = ta</span>
      }
      //iterate over this array and create tempvalue
      //tempReadValue
      var tempvalue = ""
      , isReadFromIgnored = false
      _.each(temp.readfrom, function(n) {
          //if there is no record use value directly
          //TODO: Hack, if the readfrom is object be can't change that in string
          //in that case use the record as is
          if (!n.record) {
            <span class="missing-if-branch" title="if path not taken" >I</span>if (typeof(n.readfrom) === 'object' || typeof(tempvalue) === 'object') {
<span class="cstat-no" title="statement not covered" >              tempvalue = n.readfrom</span>
<span class="cstat-no" title="statement not covered" >              logInSplunk('Setting hardcoded an object value')</span>
<span class="cstat-no" title="statement not covered" >              return</span>
            } else {
              tempvalue = tempvalue + n.readfrom
              return
            }
          }
          if (n.readfrom === '$') {
            //deep copy
            tempvalue = JSON.parse(JSON.stringify(recordarray[n.record].info.data))
            return
          }
          //handles bars if exists any.
          <span class="missing-if-branch" title="if path not taken" >I</span>if (!recordarray[n.record]['info']['response'] &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >recordarray[n.record]['info']['ignoreError'])</span> {
<span class="cstat-no" title="statement not covered" >            isReadFromIgnored = true</span>
<span class="cstat-no" title="statement not covered" >            return</span>
          }
          n.readfrom = evalHandleBar(n.readfrom, recordarray)
          var tempJsonPath
          <span class="missing-if-branch" title="if path not taken" >I</span>if(temp.isReadFromInfoData) {
<span class="cstat-no" title="statement not covered" >            tempJsonPath = jsonPath.eval(recordarray[n.record]['info']['data'], n.readfrom)</span>
          } else {
            tempJsonPath = jsonPath.eval(recordarray[n.record]['info']['response'], n.readfrom)
          }
&nbsp;
          logInSplunk('finding ' + n.readfrom + ' in ' + JSON.stringify(recordarray[n.record]['info']['response']))
          if (tempJsonPath.length &lt;= 0) {
            logInSplunk('Unable to find ' + n.readfrom + ' in ' + JSON.stringify(recordarray[n.record]['info']['response']))
            tempJsonPath.push(null)
          }
          //Bug# in case of object do not add as string
          if (!(typeof(tempJsonPath[0]) === 'object')) {
            tempvalue = tempvalue + tempJsonPath[0]
          } else {
            tempvalue = tempJsonPath[0]
          }
        })
        //set in record
        //TODO: Add support for nested value writes
        //if it doesn't start with $ mean no need to run JSONPath eval on writeto
        <span class="missing-if-branch" title="if path not taken" >I</span>if (isReadFromIgnored) {
<span class="cstat-no" title="statement not covered" >          continue</span>
        }
      var tempWriteto;
      if (temp.writetopath) {
        //adding support for dynamic write to path
        temp.writetopath = evalHandleBar(temp.writetopath, recordarray)
        tempWriteto = jsonPath.eval(recordarray[record].info.data, temp.writetopath);
        <span class="missing-if-branch" title="if path not taken" >I</span>if (tempWriteto.length &lt;= 0) {
<span class="cstat-no" title="statement not covered" >          logInSplunk('Unable to find jsonpath ' + temp.writetopath + ' in ' + JSON.stringify(recordarray[record].info.data))</span>
<span class="cstat-no" title="statement not covered" >          throw new Error('Unable to find jsonpath ' + temp.writetopath + ' in ' + JSON.stringify(recordarray[record].info.data))</span>
        }
        tempWriteto = tempWriteto[0];
      } else {
        tempWriteto = recordarray[record].info.data;
      }
      //if tempWriteto[temp.writeto] is an array, append tempvalue in tempWriteto[temp.writeto]
      //convert tempvalue in the required format
      <span class="missing-if-branch" title="if path not taken" >I</span>if (temp.convertToString &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >typeof(tempvalue) !== "string")</span> {
<span class="cstat-no" title="statement not covered" >        tempvalue = JSON.stringify(tempvalue)</span>
      }
      if (_.isArray(tempWriteto[temp.writeto])) {
        <span class="missing-if-branch" title="if path not taken" >I</span>if (temp.removeAll) {
          //empty the array
<span class="cstat-no" title="statement not covered" >          tempWriteto[temp.writeto].length = 0</span>
        }
        <span class="missing-if-branch" title="if path not taken" >I</span>if(_.isArray(tempvalue) &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >temp.isArrayMergeable)</span> {
          // Support for position. If temp.position is available then it will insert according to position
<span class="cstat-no" title="statement not covered" >          if(temp.position &amp;&amp; tempWriteto[temp.writeto].length &gt; temp.position) {</span>
<span class="cstat-no" title="statement not covered" >            _.each(tempvalue, <span class="fstat-no" title="function not covered" >function(element) {</span></span>
<span class="cstat-no" title="statement not covered" >              tempWriteto[temp.writeto].splice(temp.position++, 0, element)</span>
            })
          } else {
<span class="cstat-no" title="statement not covered" >            _.each(tempvalue, <span class="fstat-no" title="function not covered" >function(element) {</span></span>
<span class="cstat-no" title="statement not covered" >              tempWriteto[temp.writeto].push(element)</span>
            })
          }
        } else if(temp.position &amp;&amp; tempWriteto[temp.writeto].length &gt; temp.position) {
          // Support for position. If temp.position is available then it will insert according to position.
          tempWriteto[temp.writeto].splice(temp.position, 0, tempvalue)
        }
        else {
          tempWriteto[temp.writeto].push(tempvalue)
        }
      } else {
        tempWriteto[temp.writeto] = tempvalue;
      }
      logInSplunk('setting ' + temp.writeto + ' as ' + tempWriteto[temp.writeto]);
    }
    //logInSplunk('After dependecy resolution record : ' + JSON.stringify(recordarray[record].info.data) );
    //mark dependecy veriified and return true
    recordarray[record].dependencyVerified = true
    return true;
  }
, verifyAllResolved = <span class="fstat-no" title="function not covered" >function(graph) {</span>
<span class="cstat-no" title="statement not covered" >    var node;</span>
<span class="cstat-no" title="statement not covered" >    for (node in graph) {</span>
<span class="cstat-no" title="statement not covered" >      if (!graph[node].resolved) {</span>
<span class="cstat-no" title="statement not covered" >        return false;</span>
      }
    }
<span class="cstat-no" title="statement not covered" >    return true;</span>
  }
, logInSplunk = function(logmessage, loglevel) {
    //default level is debug
    if (!loglevel &amp;&amp; process.env.NODE_ENV === 'production') {
      loglevel = 'debug'
    } else <span class="missing-if-branch" title="if path not taken" >I</span>if (!loglevel) {
<span class="cstat-no" title="statement not covered" >      loglevel = 'info'</span>
    }
    var logstring = 'module="extensionUtils" message="';
    logger.log(loglevel, logstring + logmessage + '"');
  }
, verifyResponse = function (response, body) {
  var result = {}
  if (response &amp;&amp; response.statusCode &amp;&amp; (response.statusCode &gt;= 200 &amp;&amp;
      response.statusCode &lt; 400)) {
    result.valid = true
    return result
  }
  else {
    logInSplunk('Verification failed : ' + response.statusCode,'info');
    result.valid = false
    var err = {}
    err.statusCode = response.statusCode
    if (body &amp;&amp; _.isArray(body.errors) &amp;&amp; body.errors[0]) {
      var array = body.errors[0]
      if (array.message) {
        err.message = array.message
      }
      else <span class="missing-if-branch" title="else path not taken" >E</span>if (_.isArray(array.errors) &amp;&amp; array.errors[0] &amp;&amp; array.errors[0].message) {
        err.message = array.errors[0].message
      }
    }
    else if (body &amp;&amp; body.errors &amp;&amp; body.errors.message) {
      err.message = body.errors.message
    }
    else <span class="missing-if-branch" title="if path not taken" >I</span>if (body &amp;&amp; body.errors) { // for example : body response like this {"errors":"Not Found"}
<span class="cstat-no" title="statement not covered" >      if(!_.isObject(body.errors) &amp;&amp; !_.isArray(body.errors)) {</span>
<span class="cstat-no" title="statement not covered" >        err.message = body.errors</span>
      } else {
<span class="cstat-no" title="statement not covered" >        err.message = 'Errors : ' + JSON.stringify(body.errors) </span>// These type of errors are most probably occur from post data incorrect data nodes as we seen in Shopify. for example: {"errors":{"refund":"Required parameter missing or invalid"}}
      }
    }
    else {
      err.message = 'Unable to verify response'
    }
  }
  err.message = err.message + ', Status Code: ' + err.statusCode
  result.err = err
  return result
}
, makeAsyncCalls = <span class="fstat-no" title="function not covered" >function(recordarray, callback) {</span>
<span class="cstat-no" title="statement not covered" >    logInSplunk('Making Async calls');</span>
<span class="cstat-no" title="statement not covered" >    if (verifyAllResolved(recordarray)) {</span>
<span class="cstat-no" title="statement not covered" >      logInSplunk('All depenedency are resolved');</span>
<span class="cstat-no" title="statement not covered" >      return callback(null, recordarray);</span>
    }
<span class="cstat-no" title="statement not covered" >    var batch = []</span>
      , tempnode;
&nbsp;
<span class="cstat-no" title="statement not covered" >    for (tempnode in recordarray) {</span>
<span class="cstat-no" title="statement not covered" >      try {</span>
<span class="cstat-no" title="statement not covered" >        if(verifyAndInjectDependency(recordarray, tempnode) &amp;&amp; !recordarray[tempnode].resolved){</span>
<span class="cstat-no" title="statement not covered" >            batch.push(recordarray[tempnode]);</span>
        }
      } catch (e) {
        //we need to push that error message in callback
<span class="cstat-no" title="statement not covered" >        return callback(e)</span>
      }
    }
    //logInSplunk('batch : ' + JSON.stringify(batch))
    //we have all non dependent record perform aysn calls here
<span class="cstat-no" title="statement not covered" >    async.each(batch, <span class="fstat-no" title="function not covered" >function(record, cb) {</span></span>
      //we got record meta, try loading the record
      //logInSplunk('record.info :'+ JSON.stringify(record.info));
<span class="cstat-no" title="statement not covered" >      if (record.info.apiIdentifier) {</span>
        //Can't find a better way
        //TODO Resume state not working, boolean value coming always in resume
<span class="cstat-no" title="statement not covered" >        if(_.isBoolean(record.info.apiIdentifier)) {</span>
<span class="cstat-no" title="statement not covered" >          record.info.apiIdentifier = record.info.data.apiIdentifier</span>
<span class="cstat-no" title="statement not covered" >          record.info.data = record.info.data.apiIdentifierData</span>
        }
&nbsp;
<span class="cstat-no" title="statement not covered" >        integratorApiIdentifierClient(record.info, <span class="fstat-no" title="function not covered" >function(err, response, body) {</span></span>
          //logInSplunk('Posting record : ' + JSON.stringify(body));
<span class="cstat-no" title="statement not covered" >          if (err) {</span>
<span class="cstat-no" title="statement not covered" >            return cb(err);</span>
          }
          //this mean call was successful, now go and save the info at location info.response
<span class="cstat-no" title="statement not covered" >          record.info.response = body;</span>
<span class="cstat-no" title="statement not covered" >          logInSplunk('record got created in ' + JSON.stringify(body));</span>
          //mark as resolved
<span class="cstat-no" title="statement not covered" >          record.resolved = true;</span>
<span class="cstat-no" title="statement not covered" >          return cb(null);</span>
        });
      } else <span class="cstat-no" title="statement not covered" >if (record.info.proxyCall) {</span>
        // For proxy calls
&nbsp;
<span class="cstat-no" title="statement not covered" >        try{</span>
<span class="cstat-no" title="statement not covered" >          if(!record.info.data.requests) {</span>
<span class="cstat-no" title="statement not covered" >            record.info.method = record.info.data.proxyData.method || null</span>
<span class="cstat-no" title="statement not covered" >            record.info.deployId = record.info.data.proxyData.deployId || null</span>
<span class="cstat-no" title="statement not covered" >            record.info.scriptId = record.info.data.proxyData.scriptId || null</span>
<span class="cstat-no" title="statement not covered" >            record.info.relativeURI = record.info.data.proxyData.relativeURI || null</span>
<span class="cstat-no" title="statement not covered" >            record.info.connectionId = record.info.data.proxyData.connectionId || null</span>
<span class="cstat-no" title="statement not covered" >            record.info.data = {  requests :record.info.data.proxyData.requestBody } || null</span>
          }
&nbsp;
<span class="cstat-no" title="statement not covered" >          if(!record.info.relativeURI){</span>
<span class="cstat-no" title="statement not covered" >            if(!record.info.deployId)</span>
<span class="cstat-no" title="statement not covered" >              record.info.deployId = CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID</span>
<span class="cstat-no" title="statement not covered" >            if(!record.info.scriptId)</span>
<span class="cstat-no" title="statement not covered" >              record.info.scriptId = CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID</span>
          }
        } catch (e) { <span class="cstat-no" title="statement not covered" >return cb(e) }</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >        integratorProxyCall(record.info, <span class="fstat-no" title="function not covered" >function(err, response, body) {</span></span>
<span class="cstat-no" title="statement not covered" >          if (err)  <span class="cstat-no" title="statement not covered" >return cb(err)</span></span>
<span class="cstat-no" title="statement not covered" >          record.info.response = body</span>
          //mark as resolved
<span class="cstat-no" title="statement not covered" >          record.resolved = true</span>
<span class="cstat-no" title="statement not covered" >          return cb(null)</span>
        })
      } else {
        //if the record.info.method === GET remove data node and use _id as id
        //BAD WAY TO DO IT
        //TODO find a better way
<span class="cstat-no" title="statement not covered" >        if (record.info.method === 'GET') {</span>
<span class="cstat-no" title="statement not covered" >          if (record.info.data &amp;&amp; record.info.data._id) {</span>
<span class="cstat-no" title="statement not covered" >            record.info.id = record.info.data._id</span>
<span class="cstat-no" title="statement not covered" >            delete record.info.data</span>
          }
        }
<span class="cstat-no" title="statement not covered" >        integratorRestClient(record.info, <span class="fstat-no" title="function not covered" >function(err, response, body) {</span></span>
          //logInSplunk('Posting record : ' + JSON.stringify(body));
<span class="cstat-no" title="statement not covered" >          if (err) {</span>
<span class="cstat-no" title="statement not covered" >            return cb(err);</span>
          }
          //this mean call was successful, now go and save the info at location info.response
<span class="cstat-no" title="statement not covered" >          record.info.response = body;</span>
<span class="cstat-no" title="statement not covered" >          logInSplunk('record got created in ' + JSON.stringify(body));</span>
          //mark as resolved
<span class="cstat-no" title="statement not covered" >          record.resolved = true;</span>
<span class="cstat-no" title="statement not covered" >          return cb(null);</span>
        });
      }
      //make a call to Integrator
      //call integrator rest client with resourceType
      //and data
    }, <span class="fstat-no" title="function not covered" >function(err) {</span>
<span class="cstat-no" title="statement not covered" >      if (err) {</span>
<span class="cstat-no" title="statement not covered" >        return callback(err)</span>
      } //everything is successful for this batch let create another
      //logInSplunk('calling async');
<span class="cstat-no" title="statement not covered" >      makeAsyncCalls(recordarray, callback);</span>
    })
  }
, trimNodesBasedOnEdition = <span class="fstat-no" title="function not covered" >function(recordarray, options, callback){</span>
<span class="cstat-no" title="statement not covered" >    var temprecord;</span>
    //trim nodes in upgrade mode
<span class="cstat-no" title="statement not covered" >    if(options.upgradeMode){</span>
<span class="cstat-no" title="statement not covered" >      if(!options.currentEdition || !options.upgradeEdition){</span>
<span class="cstat-no" title="statement not covered" >        logInSplunk('Config Error: missing edition info to upgrade');</span>
<span class="cstat-no" title="statement not covered" >        var err = new Error('Config Error: missing edition info to upgrade')</span>
<span class="cstat-no" title="statement not covered" >        return callback(err.message)</span>
      }
<span class="cstat-no" title="statement not covered" >      var currentEdition = options.currentEdition</span>
      , upgradeEdition = options.upgradeEdition
<span class="cstat-no" title="statement not covered" >      for(temprecord in recordarray) {</span>
        //remove the node which is not eligible for provided edition
<span class="cstat-no" title="statement not covered" >        if(_.isArray(recordarray[temprecord].edition) &amp;&amp; _.includes(recordarray[temprecord].edition, upgradeEdition)</span>
          &amp;&amp; !_.includes(recordarray[temprecord].edition, currentEdition) &amp;&amp; !_.includes(recordarray[temprecord].edition, "all")
          || !!recordarray[temprecord].includeToUpgrade){
<span class="cstat-no" title="statement not covered" >          logInSplunk("including node " + temprecord, 'info')</span>
<span class="cstat-no" title="statement not covered" >          continue</span>
        }
        else {
<span class="cstat-no" title="statement not covered" >          if(!(recordarray[temprecord].resolved &amp;&amp; recordarray[temprecord].dependencyVerified &amp;&amp; recordarray[temprecord].isLoaded))</span>
<span class="cstat-no" title="statement not covered" >            delete recordarray[temprecord]</span>
        }
      }
    }
    //trim nodes in installation mode
    else {
<span class="cstat-no" title="statement not covered" >      var connectorEdition = options.connectorEdition</span>
<span class="cstat-no" title="statement not covered" >      for(temprecord in recordarray) {</span>
        //remove the node which is not eligible for provided edition
<span class="cstat-no" title="statement not covered" >        if(_.isArray(recordarray[temprecord].edition) &amp;&amp; !_.includes(recordarray[temprecord].edition, connectorEdition)</span>
            &amp;&amp; !_.includes(recordarray[temprecord].edition, "all")){
              //console.log("deleting node", temprecord)
<span class="cstat-no" title="statement not covered" >          delete recordarray[temprecord]</span>
        }
      }
    }
  }
  /*
    Path should start with node name holding the bar data if bar data is provided through helper.
  */
, evalHandleBar = function(sourceStr, recordarray){
    var temp = handlebars.compile(sourceStr)
    , barData = {} // dummy object
    handlebars.registerHelper('pathHelper', <span class="fstat-no" title="function not covered" >function(path) {</span>
<span class="cstat-no" title="statement not covered" >      var pathElement = path.split('.')</span>
      , returnValue = null
<span class="cstat-no" title="statement not covered" >      if(pathElement.length &lt;= 0){</span>
<span class="cstat-no" title="statement not covered" >        return temp(barData)</span>
      }
<span class="cstat-no" title="statement not covered" >      returnValue = recordarray[pathElement[0]]['info']['response']</span>
<span class="cstat-no" title="statement not covered" >      pathElement.splice(0,1)</span>
<span class="cstat-no" title="statement not covered" >      _.each(pathElement, <span class="fstat-no" title="function not covered" >function(element){</span></span>
<span class="cstat-no" title="statement not covered" >        if(!returnValue[element]){</span>
<span class="cstat-no" title="statement not covered" >          throw new Error('Cannot find the bar value for the path: ' + path)</span>
        }
<span class="cstat-no" title="statement not covered" >        returnValue = returnValue[element]</span>
      })
<span class="cstat-no" title="statement not covered" >      if(!returnValue){</span>
<span class="cstat-no" title="statement not covered" >        throw new Error('bar path is not in required format: ' + path)</span>
      }
<span class="cstat-no" title="statement not covered" >      return returnValue;</span>
    })
    return temp(barData)
  }
  //TODO: revert back to load file
, loadJSON = <span class="fstat-no" title="function not covered" >function(filelocation) {</span>
<span class="cstat-no" title="statement not covered" >    try {</span>
<span class="cstat-no" title="statement not covered" >      if (require.cache) {</span>
<span class="cstat-no" title="statement not covered" >        delete require.cache[require.resolve('../../../' + filelocation)];</span>
      }
<span class="cstat-no" title="statement not covered" >      return require('../../../' + filelocation);</span>
    } catch (e) {
      //backwards compatibility
<span class="cstat-no" title="statement not covered" >      if (e.code === 'MODULE_NOT_FOUND') {</span>
<span class="cstat-no" title="statement not covered" >        if (require.cache) {</span>
<span class="cstat-no" title="statement not covered" >          delete require.cache[require.resolve(filelocation)];</span>
        }
<span class="cstat-no" title="statement not covered" >        return require(filelocation);</span>
      }
    }
  }
, isCyclic = function(graph) {
  var tempGraph = JSON.parse(JSON.stringify(graph))
  for(var key in tempGraph) {
      tempGraph[key]['visited'] = false
      tempGraph[key]['onCurrStack'] = false
  }
  for(var i in tempGraph) {
    if(isCyclicUtil(i, tempGraph))
      return true
  }
  return false
}
, isCyclicUtil = function(node, graph) {
    <span class="missing-if-branch" title="else path not taken" >E</span>if(graph[node]['visited'] === false) {
      graph[node]['visited'] = true
      graph[node]['onCurrStack'] = true
      var list = graph[node]['dependson']
      if(list &amp;&amp; _.isArray(list) &amp;&amp; list.length &gt; 0) {
        for(var i =0 ; i &lt; list.length ; i++) {
          if(graph[list[i]] &amp;&amp; !graph[list[i]]['visited'] &amp;&amp; isCyclicUtil(list[i], graph))
            return true
          else if(graph[list[i]] &amp;&amp; graph[list[i]]['onCurrStack'])
            return true
        }
      }
    }
    graph[node]['onCurrStack'] = false
    return false
  }
, validateOptions = <span class="fstat-no" title="function not covered" >function(options) {</span>
<span class="cstat-no" title="statement not covered" >    if(!options.bearerToken) {</span>
<span class="cstat-no" title="statement not covered" >      return false</span>
    }
<span class="cstat-no" title="statement not covered" >    if(!options._integrationId) {</span>
<span class="cstat-no" title="statement not covered" >      return false</span>
    }
<span class="cstat-no" title="statement not covered" >    return true</span>
  }
&nbsp;
exports.createRecordsInOrderHelper = createRecordsInOrderHelper
exports.integratorRestClient = integratorRestClient
exports.integratorApiIdentifierClient = integratorApiIdentifierClient
exports.integratorProxyCall = integratorProxyCall
exports.getAdaptor = getAdaptor
exports.putAdaptor = putAdaptor
exports.logInSplunk = logInSplunk
exports.loadJSON = loadJSON
exports.integratorStateClient = integratorStateClient
exports.saveState = saveState
exports.isCyclic = isCyclic
exports.validateOptions = validateOptions
exports.verifyAllResolved = verifyAllResolved
exports.isStatusCodeRetryAble = isStatusCodeRetryAble
exports.getRetryTimeInSec = getRetryTimeInSec
exports.retryNetworkCall = retryNetworkCall
exports.verifyAndInjectDependency = verifyAndInjectDependency
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
