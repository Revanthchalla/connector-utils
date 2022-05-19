<!doctype html>
<html lang="en">
<head>
    <title>Code coverage report for connector-utils/settings/operations.js</title>
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
    <h1>Code coverage report for <span class="entity">connector-utils/settings/operations.js</span></h1>
    <h2>
        Statements: <span class="metric">33.54% <small>(159 / 474)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Branches: <span class="metric">27.44% <small>(87 / 317)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Functions: <span class="metric">37.68% <small>(26 / 69)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Lines: <span class="metric">35.4% <small>(154 / 435)</small></span> &nbsp;&nbsp;&nbsp;&nbsp;
        Ignored: <span class="metric"><span class="ignore-none">none</span></span> &nbsp;&nbsp;&nbsp;&nbsp;
    </h2>
    <div class="path"><a href="../../index.html">All files</a> &#187; <a href="index.html">connector-utils/settings/</a> &#187; operations.js</div>
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
856
857
858
859
860
861
862
863
864
865
866
867
868
869
870
871
872
873
874
875
876
877
878
879
880
881
882
883
884
885
886
887
888
889
890
891
892
893
894
895
896
897
898
899
900
901
902
903
904
905
906
907
908
909
910
911
912
913
914
915
916
917
918
919
920
921
922
923
924
925
926
927
928
929
930
931
932
933
934
935
936
937
938
939
940
941
942
943
944
945
946
947
948
949
950
951
952
953
954
955
956
957
958
959
960
961
962
963
964
965
966
967
968
969
970
971
972
973
974
975
976
977
978
979
980
981
982
983
984
985
986
987
988
989
990
991
992
993
994
995
996
997
998
999
1000
1001
1002
1003
1004
1005
1006
1007
1008
1009
1010
1011
1012
1013
1014
1015
1016
1017
1018
1019
1020
1021
1022
1023
1024
1025
1026
1027
1028
1029
1030
1031
1032
1033
1034
1035
1036
1037
1038
1039
1040
1041
1042
1043
1044
1045
1046
1047
1048
1049
1050
1051
1052
1053
1054
1055
1056
1057
1058
1059
1060
1061
1062
1063
1064
1065
1066
1067
1068
1069
1070
1071
1072
1073
1074
1075
1076
1077
1078
1079
1080
1081
1082
1083
1084
1085
1086
1087
1088
1089
1090
1091
1092
1093
1094
1095
1096
1097</td><td class="line-coverage"><span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
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
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">7</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">6</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">10</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-yes">5</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">4</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">3</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">2</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
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
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
<span class="cline-any cline-no">&nbsp;</span>
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
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
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
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-neutral">&nbsp;</span>
<span class="cline-any cline-yes">1</span>
<span class="cline-any cline-neutral">&nbsp;</span></td><td class="text"><pre class="prettyprint lang-js">'use strict'
&nbsp;
var operations = {}
, utils = require('ief-utils')
, logger = require('winston')
, UtilSettings = require('./setting')
, CONSTS = require('../constants')
, _ = require('lodash')
, async = require('async')
, request = require('request')
, jsonpath = require('jsonpath')
, installerUtils = require('../installer/installerHelper')
, settingsUtil = require('./settingsUtil')
&nbsp;
&nbsp;
operations.updateSearchLocationFilters = function(paramObject, cb) {
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  <span class="missing-if-branch" title="if path not taken" >I</span>if(!paramObject.nsConnectionId) {
<span class="cstat-no" title="statement not covered" >    if(commonresources) {</span>
<span class="cstat-no" title="statement not covered" >      paramObject.nsConnectionId = commonresources.netsuiteConnectionId</span>
    } else {
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))</span>
    }
  }
&nbsp;
  var setting = new UtilSettings()
    , locationArray = paramObject.newSettings[paramObject.setting]
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
    , opts = null
  setting.getSavedSearchId(paramObject, cb)
  var inventorySavedSearchId = paramObject.savedSearchId
    , opts = { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
    { requests :
      [
        { type : 'method'
        , operation : 'updateSearchLocationFilters'
        , config : {
             "searchId": inventorySavedSearchId,
             "locations" : locationArray
           }
        }
      ]
    }
   }
   utils.integratorProxyCall(opts, function(e, r, b) {
     <span class="missing-if-branch" title="else path not taken" >E</span>if(e) return cb(new Error('Error while connecting to Integrator.io'))
<span class="cstat-no" title="statement not covered" >     b = b[0]||null</span>
<span class="cstat-no" title="statement not covered" >     if(!b || !b.statusCode || b.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return cb(new Error('Error while connecting to Integrator.io'))</span></span>
<span class="cstat-no" title="statement not covered" >     return setting.setFieldValues(paramObject, cb)</span>
  })
}
&nbsp;
/*
* The following method updates multiple saved searches based on the multi-select location setting values.
* 1) It searches for search fields with namimg convention &lt;resource&gt;_&lt;id&gt;_savedSearch_listSavedSearches_inv in the section. Then adds "location is any of" filter to them.
* 2) It searches for kit inventory searches with namimg convention &lt;resource&gt;_&lt;id&gt;_savedSearch_listSavedSearches_kit in the section. Then adds "memberitem.inventorylocation filter" to them.
*/
&nbsp;
operations.updateMultipleSavedSearchLocationFilters = <span class="fstat-no" title="function not covered" >function (paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  var commonresources = settingsUtil.getCommonResources(paramObject)</span>
<span class="cstat-no" title="statement not covered" >  if(!paramObject.nsConnectionId) {</span>
<span class="cstat-no" title="statement not covered" >    if(commonresources) {</span>
<span class="cstat-no" title="statement not covered" >      paramObject.nsConnectionId = commonresources.netsuiteConnectionId</span>
    } else {
<span class="cstat-no" title="statement not covered" >      return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))</span>
    }
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  var settingObj = new UtilSettings()</span>
  , invSavedSearchIds = settingObj.getAllInventorySavedSearchIdsInSection(paramObject)
  , kitSavedSearchIds = settingObj.getKitInventorySavedSearchIdsInSection(paramObject)
  , locationArray = paramObject.newSettings[paramObject.setting]
  , opts =
    { bearerToken : paramObject.options.bearerToken
    , connectionId : paramObject.nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
      { requests :[]
      }
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    if(invSavedSearchIds.error) {</span>
<span class="cstat-no" title="statement not covered" >      if(invSavedSearchIds.splunkLog) {</span>
<span class="cstat-no" title="statement not covered" >        utils.logInSplunk(invSavedSearchIds.splunkLog)</span>
      }
<span class="cstat-no" title="statement not covered" >      return callback(new Error(invSavedSearchIds.error))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    if(kitSavedSearchIds.error) {</span>
<span class="cstat-no" title="statement not covered" >      if(kitSavedSearchIds.splunkLog) {</span>
<span class="cstat-no" title="statement not covered" >        utils.logInSplunk(kitSavedSearchIds.splunkLog)</span>
      }
<span class="cstat-no" title="statement not covered" >      return callback(new Error(kitSavedSearchIds.error))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    _.each(invSavedSearchIds.results, <span class="fstat-no" title="function not covered" >function (savedSearchId) {</span></span>
<span class="cstat-no" title="statement not covered" >      var request =</span>
        { type : 'method'
        , operation : 'updateSearchLocationFilters'
        , config : {
             "searchId": savedSearchId,
             "locations" : locationArray
           }
        }
<span class="cstat-no" title="statement not covered" >      opts.data.requests.push(request)</span>
    })
&nbsp;
<span class="cstat-no" title="statement not covered" >    _.each(kitSavedSearchIds.results, <span class="fstat-no" title="function not covered" >function (savedSearchId) {</span></span>
<span class="cstat-no" title="statement not covered" >      var request =</span>
        { type : 'method'
        , operation : 'updateSearchFilters'
        , config : {
             "searchId": savedSearchId,
             "filterParam" : locationArray,
             "filterKey" : "memberitem.inventorylocation"
           }
        }
<span class="cstat-no" title="statement not covered" >      opts.data.requests.push(request)</span>
    })
&nbsp;
<span class="cstat-no" title="statement not covered" >    utils.integratorProxyCall(opts, <span class="fstat-no" title="function not covered" >function(e, r, b) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(e) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to update saved searches in NetSuite. Error: '+ e.message))</span></span>
<span class="cstat-no" title="statement not covered" >      if(b &amp;&amp; _.isArray(b) &amp;&amp; b.length &gt; 0) {</span>
<span class="cstat-no" title="statement not covered" >        _.each(b, <span class="fstat-no" title="function not covered" >function(responseNode) {</span></span>
<span class="cstat-no" title="statement not covered" >          if(!responseNode || !responseNode.statusCode || responseNode.statusCode !== 200) {</span>
<span class="cstat-no" title="statement not covered" >            utils.logInSplunk('Method: updateMultipleSavedSearchLocationFilters: response body from NS is not in correct format: '+ JSON.stringify(b))</span>
<span class="cstat-no" title="statement not covered" >            return callback(new Error('Failed to update saved searches in NetSuite. Please contact Celigo Support.'))</span>
          }
        })
<span class="cstat-no" title="statement not covered" >        return settingObj.setFieldValues(paramObject, callback)</span>
      } else {
<span class="cstat-no" title="statement not covered" >       utils.logInSplunk('Method: updateMultipleSavedSearchLocationFilters: response body from NS is not in correct format: '+ JSON.stringify(b))</span>
<span class="cstat-no" title="statement not covered" >       return callback(new Error('Error while updating saved searches in NetSuite. Response from NetSuite is not in valid format. Please contact Celigo Support.'))</span>
      }
   })
}
&nbsp;
operations.kitInventoryCalculationPerLocationEnabled = <span class="fstat-no" title="function not covered" >function (paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  var Settings = new UtilSettings()</span>
<span class="cstat-no" title="statement not covered" >  return Settings.setFieldValues(paramObject, callback)</span>
}
&nbsp;
/*
 * Aim: For Product sync section, this method updates 'pricing levels' filters in all the saved searches under the section. It helps to choose the NetSuite price level to be used for exporting the price from NS.
 */
operations.updateSearchPricingFilters = function(paramObject, cb) {
  var pricingSettingValue = paramObject.newSettings[paramObject.setting]
  , Settings = new UtilSettings()
  operations.updatePricingSavedSearchWithProvidedFilters(paramObject, pricingSettingValue, function (err) {
    if(err) return cb(err)
    return Settings.setFieldValues(paramObject, cb)
  })
}
&nbsp;
operations.updatePricingSavedSearchWithProvidedFilters = function(paramObject, filters, callback) {
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return callback(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }
&nbsp;
  var settings = new UtilSettings()
  , savedSearchesToModify = settings.getAllSavedSearchesInSection(paramObject)
  , opts =
    { bearerToken : paramObject.options.bearerToken
    , connectionId : paramObject.nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
      { requests :[]
      }
    }
&nbsp;
  if(savedSearchesToModify.error) {
    <span class="missing-if-branch" title="else path not taken" >E</span>if(savedSearchesToModify.splunkLog) {
      utils.logInSplunk(savedSearchesToModify.splunkLog)
    }
    return callback(new Error(savedSearchesToModify.error))
  }
&nbsp;
   _.each(savedSearchesToModify.results,function(value) {
     <span class="missing-if-branch" title="else path not taken" >E</span>if(value) {
       var requestData = { type : 'method'
       , operation : 'updateSearchFilters'
       , config : {
            "searchId": value,
            "filterParam" : filters,
            "filterKey" : "pricing.pricelevel"
          }
       }
       opts.data.requests.push(requestData)
     }
   })
&nbsp;
   utils.integratorProxyCall(opts, function(e, r, b) {
     if(e) return callback(new Error('Failed to updated the saved search in NetSuite. Error: '+ e.message))
&nbsp;
     if(b &amp;&amp; _.isArray(b) &amp;&amp; b.length &gt; 0) {
       b = b[0]
     } else if(b &amp;&amp; b.statusCode &amp;&amp; b.statusCode !== 200) {
       utils.logInSplunk('Method: updateSearchPricingFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
       <span class="missing-if-branch" title="else path not taken" >E</span>if(b.error &amp;&amp; b.error.message) {
         return callback(new Error('Could not update saved search in NetSuite. Error: '+ JSON.stringify(b.error.message)))
       } else {
<span class="cstat-no" title="statement not covered" >         return callback(new Error('Could not update saved search in NetSuite.'))</span>
       }
     } else {
       utils.logInSplunk('Method: updateSearchPricingFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
       return callback(new Error('Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.'))
     }
     return callback()
   })
}
&nbsp;
/*
 * Aim: For Product sync section, this method updates 'currency' filters in all the saved searches under the section. It helps to choose the NetSuite currency to be used for exporting the price from NS.
 */
operations.updateSearchCurrencyFilters = function(paramObject, cb) {
&nbsp;
  paramObject.settingsMethodName = "savedSearch"
  paramObject.refreshMethodName = "listSavedSearches"
  var commonresources = settingsUtil.getCommonResources(paramObject)
  if(!paramObject.nsConnectionId) {
    if(commonresources) {
      paramObject.nsConnectionId = commonresources.netsuiteConnectionId
    } else {
      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))
    }
  }
&nbsp;
  var setting = new UtilSettings()
    , currencySettingValue = paramObject.newSettings[paramObject.setting]
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
    , opts = null
    , savedSearchesToModify = setting.getAllSavedSearchesInSection(paramObject)
&nbsp;
  if(savedSearchesToModify.error){
    <span class="missing-if-branch" title="else path not taken" >E</span>if(savedSearchesToModify.splunkLog){
      utils.logInSplunk(savedSearchesToModify.splunkLog)
    }
    return cb(new Error(savedSearchesToModify.error))
  }
&nbsp;
  var opts = { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
    { requests :
      [
&nbsp;
      ]
    }
   }
   _.each(savedSearchesToModify.results,function(value){
     <span class="missing-if-branch" title="else path not taken" >E</span>if(value){
       var requestData = { type : 'method'
       , operation : 'updateSearchFilters'
       , config : {
            "searchId": value,
            "filterParam" : currencySettingValue,
            "filterKey" : "pricing.currency"
          }
       }
       opts.data.requests.push(requestData)
     }
   })
   utils.integratorProxyCall(opts, function(e, r, b) {
   if(e) return cb(new Error('Failed to updated the saved search in NetSuite. Error: '+ e.message))
&nbsp;
   if(b &amp;&amp; _.isArray(b) &amp;&amp; b.length &gt; 0){
     b = b[0]
   }else if(b &amp;&amp; b.statusCode &amp;&amp; b.statusCode !== 200){
     utils.logInSplunk('Method: updateSearchCurrencyFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
     <span class="missing-if-branch" title="else path not taken" >E</span>if(b.error &amp;&amp; b.error.message){
       return cb(new Error('Could not update saved search in NetSuite. Error: '+ JSON.stringify(b.error.message)))
     }else{
<span class="cstat-no" title="statement not covered" >       return cb(new Error('Could not update saved search in NetSuite.'))</span>
     }
   }else{
     utils.logInSplunk('Method: updateSearchCurrencyFilters: response body from NS is not in correct format: '+ JSON.stringify(b))
     return cb(new Error('Error while updating saved search in NetSuite.Response from NetSuite is not in valid format.'))
   }
&nbsp;
   return setting.setFieldValues(paramObject, cb)
  })
}
&nbsp;
operations.actionSlider = function(paramObject, callback) {
  var newSettings = paramObject
  , options = paramObject.options
&nbsp;
  if(!paramObject.sliderInput){
    return callback('Unable to identify the flowid for enabling')
  }
  utils.logInSplunk('inside actionSlider marking enable of flow ' + newSettings.flowId)
  //make a call to IO server
  utils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: 'flows'
    , id: newSettings.flowId
  }, function(err, response, body) {
    <span class="missing-if-branch" title="if path not taken" >I</span>if (err) {
      //we do not want to stop other setting to save in this case
<span class="cstat-no" title="statement not covered" >      return callback('Unable to load the flow')</span>
    }
    body.disabled = newSettings.disabled
    utils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: 'flows'
        , id: newSettings.flowId
        , data: body
      }
      , function(err, response, body) {
        <span class="missing-if-branch" title="else path not taken" >E</span>if (err) {
          //we do not want to stop other setting to save in this case
          return callback('Unable to save the flow')
        }
<span class="cstat-no" title="statement not covered" >        return callback()</span>
    })
  })
}
&nbsp;
operations.updateAdaptorLookupFilter = <span class="fstat-no" title="function not covered" >function (paramObjects, cb) {</span>
  // update import adaptor and update the lookup field
<span class="cstat-no" title="statement not covered" >  var newSettings = paramObjects.newSettings</span>
<span class="cstat-no" title="statement not covered" >  var oldSetting = paramObjects.oldSettings</span>
<span class="cstat-no" title="statement not covered" >  var settingParams = paramObjects.settingParams</span>
<span class="cstat-no" title="statement not covered" >  var setting = paramObjects.setting</span>
<span class="cstat-no" title="statement not covered" >  var options = paramObjects.options</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!settingParams || !_.isArray(settingParams) || settingParams.length &lt; 3) {</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('Unable to process the request. Missing vital information')</span>
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Integration is corrupted. Please contact Celigo for more information'))</span>
  }
&nbsp;
  // load distributed adaptor (assuming it to be NS side)
<span class="cstat-no" title="statement not covered" >  var requestParam = {</span>
    bearerToken: options.bearerToken,
    resourcetype : 'imports',
    id: settingParams[1],
    distributed : true
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  if (!newSettings[setting]) {</span>
<span class="cstat-no" title="statement not covered" >    return cb(new Error('Lookup criteria cannot be empty. Please add proper criteria and save it.'))</span>
  }
<span class="cstat-no" title="statement not covered" >  utils.integratorRestClient(requestParam, <span class="fstat-no" title="function not covered" >function (err, response, body) {</span></span>
<span class="cstat-no" title="statement not covered" >    if (err) {</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('Failed to load adaptor due to err '+ err.message)</span>
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Error connecting to Integrator.io ' + err.message))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    if(response &amp;&amp; response.statusCode !== 200) {</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('Error connecting to Integrator.io ' + response.statusCode)</span>
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Error connecting to Integrator.io ' + response.statusCode))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    var data = body</span>
<span class="cstat-no" title="statement not covered" >    data.internalIdLookup = {</span>
      expression : newSettings[setting]
    }
<span class="cstat-no" title="statement not covered" >    requestParam.data = data</span>
<span class="cstat-no" title="statement not covered" >    utils.integratorRestClient(requestParam, <span class="fstat-no" title="function not covered" >function (err, response, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if (err) {</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('Failed to save adaptor due to err '+ err.message)</span>
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Error connecting to Integrator.io ' + err.message))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    if(response &amp;&amp; response.statusCode !== 200) {</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('Error connecting to Integrator.io ' + response.statusCode)</span>
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Error connecting to Integrator.io ' + response.statusCode))</span>
    }
<span class="cstat-no" title="statement not covered" >    var settingObj = new UtilSettings()</span>
<span class="cstat-no" title="statement not covered" >    settingObj.setFieldValues(paramObjects, cb)</span>
    })
  })
&nbsp;
  // return cb()
}
&nbsp;
operations.toggleNetsuiteExportType = function(paramObject, cb) {
  var oldSettings = paramObject.oldSettings
    , newSettings = paramObject.newSettings
    , settingParams = paramObject.settingParams
    , setting = paramObject.setting
    , options = paramObject.options
    , dateField = settingParams[3] || <span class="branch-1 cbranch-no" title="branch not covered" >'lastmodifieddate'</span>
    //make a call to IO server
  utils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: settingParams[0]
    , id: settingParams[1]
  }, function(err, response, body) {
      <span class="missing-if-branch" title="if path not taken" >I</span>if (err) {
        //we do not want to stop other setting to save in this case
<span class="cstat-no" title="statement not covered" >        return cb(null)</span>
      }
      if(newSettings[setting]) {
        //delete "type" and "delta" from the export adaptor
        delete body.type
        delete body.delta
      } else {
        //enable delta flow again
        body.type = 'delta'
        body.delta = {
          dateField: dateField
        }
      }
      utils.logInSplunk('setting body ' + JSON.stringify(body))
      utils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
        , id: settingParams[1]
        , data: body
      } , function(err, response, body) {
          if (err) {
            //we do not want to stop other setting to save in this case
            return cb(null)
          }
          oldSettings[setting].value = newSettings[setting]
          return cb(null)
        })
    })
  }
&nbsp;
operations.savedSearch = function(paramObject, callback) {
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , options = paramObject.options
  , setting = paramObject.setting
&nbsp;
  //make a call to IO server
  utils.integratorRestClient({
    bearerToken: options.bearerToken
    , resourcetype: settingParams[0]
    , id: settingParams[1]
  }, function(err, response, body) {
    if (err) {
      //we do not want to stop other setting to save in this case
      return callback(null)
    }
&nbsp;
    <span class="missing-if-branch" title="if path not taken" >I</span>if (body &amp;&amp; <span class="branch-1 cbranch-no" title="branch not covered" >body.netsuite </span>&amp;&amp; <span class="branch-2 cbranch-no" title="branch not covered" >body.netsuite </span>&amp;&amp; <span class="branch-3 cbranch-no" title="branch not covered" >body.netsuite.restlet)</span> {
<span class="cstat-no" title="statement not covered" >      body.netsuite.restlet.searchId = newSettings[setting]</span>
    }
    utils.logInSplunk('setting body ' + JSON.stringify(body))
    utils.integratorRestClient({
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
        , id: settingParams[1]
        , data: body
      }
      , function(err, response, body) {
        <span class="missing-if-branch" title="if path not taken" >I</span>if (err) {
          //we do not want to stop other setting to save in this case
<span class="cstat-no" title="statement not covered" >          return callback(null)</span>
        }
        oldSettings[setting].value = newSettings[setting]
        return callback(null)
      })
  })
}
&nbsp;
operations.setStartDateOnDeltaBasedExports = function (paramObject, callback) {
  var oldSettings = paramObject.oldSettings
  , newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , oldDate = oldSettings[setting].value
  , newDate = newSettings[setting]
  // TODO validate all settings
  var opts =
    { bearerToken : options.bearerToken
    , resourcetype : settingParams[0]  //'exports'
    , id : settingParams[1] //_exportId
    }
  utils.integratorRestClient(opts, function(err, response, body) {
      <span class="missing-if-branch" title="if path not taken" >I</span>if (err || !body) <span class="cstat-no" title="statement not covered" >return callback(null)</span>
      <span class="missing-if-branch" title="else path not taken" >E</span>if(!body.delta) {
        body.delta = {}
        body.delta['startDate'] = newDate
      }
      else {
<span class="cstat-no" title="statement not covered" >        body.delta['startDate'] = newDate</span>
      }
      opts.data = body
      utils.logInSplunk('setting body ' + JSON.stringify(body))
      utils.integratorRestClient(opts, function(err, response, body) {
        if (err) return callback(null)
        oldSettings[setting].value = newSettings[setting]
        return callback(null)
      })
    })
}
&nbsp;
operations.savedSearchAllExports = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  var oldSettings = paramObject.oldSettings</span>
    , newSettings = paramObject.newSettings
    , settingParams = paramObject.settingParams
    , options = paramObject.options
    , setting = paramObject.setting
&nbsp;
<span class="cstat-no" title="statement not covered" >  var exportAdaptors = []</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  exportAdaptors.push(settingParams[1])</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  for (var i = 4; i &lt; settingParams.length; i++) {</span>
<span class="cstat-no" title="statement not covered" >    exportAdaptors.push(settingParams[i])</span>
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >   var requestheaders = {</span>
    bearerToken: options.bearerToken
    , resourcetype: settingParams[0]
  }
<span class="cstat-no" title="statement not covered" >  utils.integratorRestClient(requestheaders, <span class="fstat-no" title="function not covered" >function(err, response, body) {</span></span>
<span class="cstat-no" title="statement not covered" >    if (err) {</span>
      //we do not want to stop other setting to save in this case
<span class="cstat-no" title="statement not covered" >      return callback(null)</span>
    }
    //log response
<span class="cstat-no" title="statement not covered" >    var eAdaptors =[];</span>
<span class="cstat-no" title="statement not covered" >    for(var i =0; i&lt;body.length; i++){</span>
<span class="cstat-no" title="statement not covered" >      var eInd = exportAdaptors.indexOf(body[i]._id)</span>
<span class="cstat-no" title="statement not covered" >      if(eInd === -1){</span>
<span class="cstat-no" title="statement not covered" >        continue;</span>
      }
<span class="cstat-no" title="statement not covered" >      eAdaptors.push(body[i])</span>
<span class="cstat-no" title="statement not covered" >      exportAdaptors.splice(eInd,1)</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >      if(exportAdaptors.length &lt; 1){</span>
<span class="cstat-no" title="statement not covered" >        break;</span>
      }
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    async.each(eAdaptors, <span class="fstat-no" title="function not covered" >function(adaptor, cb){</span></span>
<span class="cstat-no" title="statement not covered" >      var requestheaders = {</span>
        bearerToken: options.bearerToken
        , resourcetype: settingParams[0]
      }
&nbsp;
<span class="cstat-no" title="statement not covered" >      if (adaptor &amp;&amp; adaptor.netsuite &amp;&amp; adaptor.netsuite &amp;&amp; adaptor.netsuite.restlet) {</span>
<span class="cstat-no" title="statement not covered" >         adaptor.netsuite.restlet.searchId = newSettings[setting]</span>
        }
&nbsp;
<span class="cstat-no" title="statement not covered" >        utils.logInSplunk('setting a body ' + JSON.stringify(adaptor))</span>
<span class="cstat-no" title="statement not covered" >        requestheaders.data = adaptor</span>
<span class="cstat-no" title="statement not covered" >        utils.integratorRestClient(requestheaders,cb)</span>
&nbsp;
    },<span class="fstat-no" title="function not covered" >function(err, response, body){</span>
<span class="cstat-no" title="statement not covered" >      if(err){</span>
<span class="cstat-no" title="statement not covered" >        return callback(null)</span>
      }
<span class="cstat-no" title="statement not covered" >      oldSettings[setting].value = newSettings[setting]</span>
<span class="cstat-no" title="statement not covered" >      return callback(null)</span>
    })
  })
}
/**
* @param paramObject
* @param cb is the callback function
*/
operations.updateSearchSalesOrderStatusFilters = <span class="fstat-no" title="function not covered" >function(paramObject, cb) {</span>
<span class="cstat-no" title="statement not covered" >  paramObject.settingsMethodName = "savedSearch"</span>
<span class="cstat-no" title="statement not covered" >  paramObject.refreshMethodName = "listSavedSearches"</span>
<span class="cstat-no" title="statement not covered" >  var commonresources = settingsUtil.getCommonResources(paramObject)</span>
<span class="cstat-no" title="statement not covered" >  if(!paramObject.nsConnectionId) {</span>
<span class="cstat-no" title="statement not covered" >    if(commonresources) {</span>
<span class="cstat-no" title="statement not covered" >      paramObject.nsConnectionId = commonresources.netsuiteConnectionId</span>
    } else {
<span class="cstat-no" title="statement not covered" >      return cb(new Error('Integration record does not contain NetSuite connectionId. Kindly update the Json or contact Celigo Support.'))</span>
    }
  }
<span class="cstat-no" title="statement not covered" >  var setting = new UtilSettings()</span>
    , orderStatus = []
    , options = paramObject.options
    , nsConnectionId = paramObject.nsConnectionId
&nbsp;
  //fetching saved auto-billing saved search id
<span class="cstat-no" title="statement not covered" >  if(paramObject.settingParams &amp;&amp; paramObject.settingParams.length &lt; 4)</span>
<span class="cstat-no" title="statement not covered" >    setting.getSavedSearchId(paramObject, cb)</span>
  else{
<span class="cstat-no" title="statement not covered" >      paramObject.settingsMethodName = "savedSearchAllExports"</span>
<span class="cstat-no" title="statement not covered" >      setting.getMultiExportSavedSearchId(paramObject, cb)</span>
  }
<span class="cstat-no" title="statement not covered" >  orderStatus.push(paramObject.newSettings[paramObject.setting])</span>
<span class="cstat-no" title="statement not covered" >  var autoBillingSavedSearchId = paramObject.savedSearchId</span>
    , opts = { bearerToken : options.bearerToken
    , connectionId : nsConnectionId
    , method : 'POST'
    , scriptId : CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
    , deployId : CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
    , data :
    { requests :
      [
        { type : 'method'
        , operation : 'updateSearchSalesOrderStatusFilters'
        , config : {
             "searchId": autoBillingSavedSearchId,
             "status" : orderStatus
           }
        }
      ]
    }
   }
<span class="cstat-no" title="statement not covered" >   utils.integratorProxyCall(opts, <span class="fstat-no" title="function not covered" >function(e, r, b) {</span></span>
<span class="cstat-no" title="statement not covered" >   if(e) <span class="cstat-no" title="statement not covered" >return cb(new Error('Error while connecting to Integrator.io'))</span></span>
<span class="cstat-no" title="statement not covered" >   b = b[0]||null</span>
<span class="cstat-no" title="statement not covered" >   if(!b || !b.statusCode || b.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return cb(new Error('Error while connecting to Integrator.io'))</span></span>
   //saving changed setting value in integration
<span class="cstat-no" title="statement not covered" >   return setting.setFieldValues(paramObject, cb)</span>
  })
}
&nbsp;
operations.setDefaultCustomerIdForAllOrders = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  utils.logInSplunk('setDefaultCustomerIdForAllOrders, paramObject is', JSON.stringify(paramObject))</span>
<span class="cstat-no" title="statement not covered" >  var defaultCustomerInternalId = Number(paramObject.newSettings[paramObject.setting])</span>
  , settingParams = paramObject.settingParams
  , commonResources = settingsUtil.getCommonResources(paramObject)
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!commonResources) <span class="cstat-no" title="statement not covered" >return callback(new Error('common resources are missing in Connector integration.'))</span></span>
<span class="cstat-no" title="statement not covered" >  if(!commonResources.netsuiteConnectionId) <span class="cstat-no" title="statement not covered" >return callback(new Error('netsuiteConnectionId is missing in settings data.'))</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  validateCustomerInternalId(defaultCustomerInternalId, paramObject, commonResources, <span class="fstat-no" title="function not covered" >function(err) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
&nbsp;
    //fetching order import adaptor
<span class="cstat-no" title="statement not covered" >    var options = paramObject.options</span>
    , optsData =
      { bearerToken : options.bearerToken
      , resourcetype : 'imports'
      , id : settingParams[1] //orderImportAdaptorId
      , distributed : true
      }
&nbsp;
<span class="cstat-no" title="statement not covered" >    utils.integratorRestClient(optsData, <span class="fstat-no" title="function not covered" >function(err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to load Order Import Adaptor, ' + err.message + '. Please contact Celigo support.'))</span></span>
      //updating order import adaptor mapping
<span class="cstat-no" title="statement not covered" >      updateImportAdaptorMapping(body, 'entity', 'netSuiteCustomerId', defaultCustomerInternalId)</span>
<span class="cstat-no" title="statement not covered" >      utils.logInSplunk('setDefaultCustomerIdForAllOrders | updated order import adaptor is : ', JSON.stringify(body))</span>
      //saving updated order import adaptor to Integrator.io
<span class="cstat-no" title="statement not covered" >      var requestData =</span>
        { bearerToken : options.bearerToken
        , resourcetype : 'imports'
        , _id : options.orderImportAdaptorId
        , data : body
        , distributed : true
        }
        , setting = new UtilSettings()
&nbsp;
<span class="cstat-no" title="statement not covered" >      utils.integratorRestClient(requestData, <span class="fstat-no" title="function not covered" >function(err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >        if(err) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to update the Order mapping for Customer# ' +  defaultCustomerInternalId + ', ' + err.message + '. Please contact Celigo support.'))</span></span>
<span class="cstat-no" title="statement not covered" >        if(res.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to update the Order mapping for Customer# ' +  defaultCustomerInternalId + ', status code while trying to update mappings : ' + res.statusCode + '. Please contact Celigo support.'))</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >        return setting.setFieldValues(paramObject, callback)</span>
      })
    })
  })
}
&nbsp;
operations.setDefaultCustomerId = function(paramObject, callback) {
&nbsp;
  utils.logInSplunk('setDefaultCustomerId, paramObject is', JSON.stringify(paramObject))
  var defaultCustomerInternalId = Number(paramObject.newSettings[paramObject.setting])
  , commonResources = settingsUtil.getCommonResources(paramObject)
&nbsp;
  <span class="missing-if-branch" title="if path not taken" >I</span>if(!commonResources) <span class="cstat-no" title="statement not covered" >return callback(new Error('common resources are missing in Connector integration.'))</span>
  <span class="missing-if-branch" title="if path not taken" >I</span>if(!commonResources.netsuiteConnectionId) <span class="cstat-no" title="statement not covered" >return callback(new Error('netsuiteConnectionId is missing in settings data.'))</span>
&nbsp;
  validateCustomerInternalId(defaultCustomerInternalId, paramObject, commonResources, function(err) {
    <span class="missing-if-branch" title="if path not taken" >I</span>if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span>
&nbsp;
    var setting = new UtilSettings()
    return setting.setFieldValues(paramObject, callback)
  })
}
&nbsp;
operations.invokeOnDemandOrderImport = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  logger.info('invokeOnDemandOrderImport, paramObject : ' + JSON.stringify(paramObject))</span>
<span class="cstat-no" title="statement not covered" >  var oldSettings = paramObject.oldSettings</span>
  , newSettings = paramObject.newSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , orderAckFlowIdString = settingParams[3] || 'orderAckFlowId'
  , onDemandOrderImportFlowIdString = settingParams[4] || 'onDemandOrderImportFlowId'
&nbsp;
<span class="cstat-no" title="statement not covered" >  var settingObj = new UtilSettings()</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!newSettings[setting] &amp;&amp; !!oldSettings[setting].value) <span class="cstat-no" title="statement not covered" >return settingObj.setFieldValues(paramObject, callback)</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  var autoAcknowledgeOnDemandOrdersField = 'exports_' + exportId + '_autoAcknowledgeOnDemandOrders'</span>
  , autoAcknowledgeOnDemandOrders = false
&nbsp;
<span class="cstat-no" title="statement not covered" >  logger.info('invokeOnDemandOrderImport, autoAcknowledgeOnDemandOrdersField', autoAcknowledgeOnDemandOrdersField)</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(newSettings.hasOwnProperty(autoAcknowledgeOnDemandOrdersField)) {</span>
<span class="cstat-no" title="statement not covered" >    logger.info('invokeOnDemandOrderImport, reading autoAcknowledgeOnDemandOrdersField value from newSettings')</span>
<span class="cstat-no" title="statement not covered" >    autoAcknowledgeOnDemandOrders = newSettings[autoAcknowledgeOnDemandOrdersField]</span>
  } else <span class="cstat-no" title="statement not covered" >if(oldSettings.hasOwnProperty(autoAcknowledgeOnDemandOrdersField)) {</span>
<span class="cstat-no" title="statement not covered" >    logger.info('invokeOnDemandOrderImport, reading autoAcknowledgeOnDemandOrdersField value from oldSettings')</span>
<span class="cstat-no" title="statement not covered" >    autoAcknowledgeOnDemandOrders = oldSettings[autoAcknowledgeOnDemandOrdersField].value</span>
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  checkAutoAckValueAndCheckFlowEnabled(autoAcknowledgeOnDemandOrders, options, orderAckFlowIdString, <span class="fstat-no" title="function not covered" >function(err) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >    var onDemandOrderIds = newSettings[setting].split(',')</span>
    // To process inputs in the form of "123, 124, 11,12,, 142-111-ABC"
<span class="cstat-no" title="statement not covered" >    _.each(onDemandOrderIds, <span class="fstat-no" title="function not covered" >function (orderId, index) {</span></span>
<span class="cstat-no" title="statement not covered" >      onDemandOrderIds[index] = orderId.trim()</span>
<span class="cstat-no" title="statement not covered" >      if(!orderId) {</span>
<span class="cstat-no" title="statement not covered" >        delete onDemandOrderIds[index]</span>
<span class="cstat-no" title="statement not covered" >        return</span>
      }
    })
&nbsp;
<span class="cstat-no" title="statement not covered" >    onDemandOrderIds = _.compact(onDemandOrderIds) </span>//To remove the deleted entries
<span class="cstat-no" title="statement not covered" >    onDemandOrderIds = _.uniq(onDemandOrderIds) </span>//To remove duplicates
&nbsp;
<span class="cstat-no" title="statement not covered" >    if(onDemandOrderIds.length &lt; 1) {</span>
<span class="cstat-no" title="statement not covered" >      oldSettings[setting].value = newSettings[setting]</span>
<span class="cstat-no" title="statement not covered" >      return callback()</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    var values = [autoAcknowledgeOnDemandOrders , onDemandOrderIds]</span>
<span class="cstat-no" title="statement not covered" >    var paths = ['$.wrapper.configuration.autoAcknowledgeOnDemandOrders', '$.wrapper.configuration.onDemandOrderIds']</span>
<span class="cstat-no" title="statement not covered" >    logger.info('invokeOnDemandOrderImport, values : ' + values)</span>
<span class="cstat-no" title="statement not covered" >    settingObj.updateResource('exports', exportId, paths, values, options.bearerToken, <span class="fstat-no" title="function not covered" >function (err) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >      var onDemandOrderImportFlowId = options.integrationRecord.settings.commonresources[onDemandOrderImportFlowIdString]</span>
<span class="cstat-no" title="statement not covered" >      var requestOptions =</span>
        { uri : CONSTS.HERCULES_BASE_URL + '/v1/flows/' + onDemandOrderImportFlowId + '/run'
        , method : 'POST'
        , auth : { bearer : options.bearerToken }
        , json : true
        }
<span class="cstat-no" title="statement not covered" >      logger.info('invokeOnDemandOrderImport, flow invocation requestOptions : ' + JSON.stringify(requestOptions))</span>
<span class="cstat-no" title="statement not covered" >      request(requestOptions, <span class="fstat-no" title="function not covered" >function (e, r, b) {</span></span>
<span class="cstat-no" title="statement not covered" >        if(e) <span class="cstat-no" title="statement not covered" >return callback(e)</span></span>
<span class="cstat-no" title="statement not covered" >        logger.info('invokeOnDemandOrderImport, flow invocation response' + JSON.stringify(r))</span>
<span class="cstat-no" title="statement not covered" >        var message = null</span>
<span class="cstat-no" title="statement not covered" >        try {</span>
<span class="cstat-no" title="statement not covered" >          message = b.errors[0].message</span>
        } catch(ex) {
<span class="cstat-no" title="statement not covered" >          message = ''</span>
        }
&nbsp;
<span class="cstat-no" title="statement not covered" >        if(r.statusCode !== 200) <span class="cstat-no" title="statement not covered" >return callback(new Error('Cannot invoke the on demand order flow because : ' + message))</span></span>
&nbsp;
<span class="cstat-no" title="statement not covered" >        if(!!paramObject.options &amp;&amp; !!paramObject.options.pending) {</span>
<span class="cstat-no" title="statement not covered" >          paramObject.options.pending[setting] = null</span>
        }
<span class="cstat-no" title="statement not covered" >        logger.info('invokeOnDemandOrderImport, paramObject.options before returning callback', JSON.stringify(paramObject.options))</span>
<span class="cstat-no" title="statement not covered" >        return callback()</span>
      })
    })
  })
}
&nbsp;
operations.selectDateFilterForOrders = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  logger.debug('selectDateFilterForOrders, paramObject: ' + JSON.stringify(paramObject))</span>
<span class="cstat-no" title="statement not covered" >  var newSettings = paramObject.newSettings</span>
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , customDeltaFilterCheckBox = 'exports_' + exportId + '_setCustomDeltaFilterCheckBox'
  , dateFilter = 'exports_' + exportId + '_selectDateFilterForOrders' + '_' + settingParams[3] + '_' + settingParams[4]
  , settingObj = new UtilSettings()
  , dateFilterObject = {
      OrderCreatedDate: 'dateCreated'
    , OrderLastModifiedDate: 'lastModified'
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(newSettings[setting] === dateFilterObject.OrderCreatedDate &amp;&amp; !options.pending[customDeltaFilterCheckBox] &amp;&amp; !newSettings.hasOwnProperty(customDeltaFilterCheckBox)) {</span>
<span class="cstat-no" title="statement not covered" >    return callback(new Error('Select Custom delta range for Order Creation Time filter.'))</span>
  }
  else {
    //Update relative uri to change date filter from lastmodified to createddate and viceversa
<span class="cstat-no" title="statement not covered" >    updateRelativeURIForDeltaExportOrders({</span>
      resourceType: 'exports'
    , resourceId: exportId
    , bearerToken: options.bearerToken
    , dateFilter: options.pending[dateFilter]
    , createdDateFilterLabel: settingParams[3]
    , lastmodifiedDateFilterLabel: settingParams[4]
   }, <span class="fstat-no" title="function not covered" >function (err) {</span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
      else <span class="cstat-no" title="statement not covered" >return settingObj.setFieldValues(paramObject, callback)</span>
    })
  }
}
&nbsp;
operations.setCustomDeltaFilterCheckBox = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  logger.debug('setCustomDeltaFilterCheckBox, paramObject : ' + JSON.stringify(paramObject))</span>
<span class="cstat-no" title="statement not covered" >  var newSettings = paramObject.newSettings</span>
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , dateFilter = getDatefilterLabel(options.pending)
  , deltaDays = 'exports_' + exportId + '_setDeltaDays'
  , dateFilterObject = {
      OrderCreatedDate: 'dateCreated'
    , OrderLastModifiedDate: 'lastModified'
  }
&nbsp;
<span class="cstat-no" title="statement not covered" >  var settingObj = new UtilSettings()</span>
  , dateFilterSettingParams = dateFilter.split('_')
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!newSettings[setting] &amp;&amp; options.pending[dateFilter] === dateFilterObject.OrderCreatedDate) {</span>
<span class="cstat-no" title="statement not covered" >    return callback(new Error('Select Custom delta range for Order Creation Time filter.'))</span>
  }
  else <span class="cstat-no" title="statement not covered" >if(!newSettings[deltaDays] &amp;&amp; newSettings[setting]) {</span>
<span class="cstat-no" title="statement not covered" >    var lagOffset = Number(options.pending[deltaDays]) * 24 * 60 * 60 * 1000 * -1 </span>//milliseconds
&nbsp;
<span class="cstat-no" title="statement not covered" >    updateRelativeURIForDeltaExportOrders({</span>
       resourceType: 'exports'
     , resourceId: exportId
     , lagOffset: lagOffset
     , createdDateFilterLabel: dateFilterSettingParams[3]
     , lastmodifiedDateFilterLabel: dateFilterSettingParams[4]
     , bearerToken: options.bearerToken
    }, <span class="fstat-no" title="function not covered" >function (err) {</span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      return settingObj.setFieldValues(paramObject, callback)</span>
    })
&nbsp;
 }
  else <span class="cstat-no" title="statement not covered" >if(!newSettings[setting]) {</span>
    //Update relative uri with lagOffset as 0, since we unchecked customDeltaFilterCheckBox
<span class="cstat-no" title="statement not covered" >    updateRelativeURIForDeltaExportOrders({</span>
      resourceType: 'exports'
    , resourceId: exportId
    , lagOffset: 0
    , createdDateFilterLabel: dateFilterSettingParams[3]
    , lastmodifiedDateFilterLabel: dateFilterSettingParams[4]
    , bearerToken: options.bearerToken
   }, <span class="fstat-no" title="function not covered" >function (err) {</span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      return settingObj.setFieldValues(paramObject, callback)</span>
    })
  }
  else <span class="cstat-no" title="statement not covered" >return settingObj.setFieldValues(paramObject, callback)</span>
}
&nbsp;
operations.setDeltaDays = <span class="fstat-no" title="function not covered" >function(paramObject, callback) {</span>
<span class="cstat-no" title="statement not covered" >  logger.debug('setDeltaDays, paramObject : ' + JSON.stringify(paramObject))</span>
<span class="cstat-no" title="statement not covered" >  var newSettings = paramObject.newSettings</span>
  , oldSettings = paramObject.oldSettings
  , settingParams = paramObject.settingParams
  , setting = paramObject.setting
  , options = paramObject.options
  , exportId = settingParams[1]
  , customDeltaFilterCheckBox = 'exports_' + exportId + '_setCustomDeltaFilterCheckBox'
  , deltaDays = newSettings[setting]
  , dateFilter = getDatefilterLabel(options.pending)
  , settingObj = new UtilSettings()
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!options.pending[customDeltaFilterCheckBox]) {</span>
<span class="cstat-no" title="statement not covered" >    newSettings[setting] = oldSettings[setting].value</span>
<span class="cstat-no" title="statement not covered" >    return settingObj.setFieldValues(paramObject, callback)</span>
  }
  else {
<span class="cstat-no" title="statement not covered" >    validateDeltaDays(deltaDays, <span class="fstat-no" title="function not covered" >function(err) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      var lagOffset = Number(deltaDays) * 24 * 60 * 60 * 1000 * -1 //milliseconds</span>
      , dateFilterSettingParams = dateFilter.split('_')
      //Update relative uri with lagOffset value
<span class="cstat-no" title="statement not covered" >      updateRelativeURIForDeltaExportOrders({</span>
         resourceType: 'exports'
       , resourceId: exportId
       , lagOffset: lagOffset
       , createdDateFilterLabel: dateFilterSettingParams[3]
       , lastmodifiedDateFilterLabel: dateFilterSettingParams[4]
       , bearerToken: options.bearerToken
      }, <span class="fstat-no" title="function not covered" >function (err) {</span>
<span class="cstat-no" title="statement not covered" >        if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >        return settingObj.setFieldValues(paramObject, callback)</span>
      })
    })
  }
}
&nbsp;
//TODO make it more generic function, where one mapping array and another updated mapping array will be passed
//TODO and it will auto-merge them
var updateImportAdaptorMapping = <span class="fstat-no" title="function not covered" >function(adaptorJson, generateFieldKey, extractFieldKey, hardCodedVal) {</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >  if(!!adaptorJson &amp;&amp; !!adaptorJson.mapping) {</span>
<span class="cstat-no" title="statement not covered" >    var mappingArray = []</span>
<span class="cstat-no" title="statement not covered" >    _.each(adaptorJson.mapping.fields, <span class="fstat-no" title="function not covered" >function(mapObject, index) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(mapObject['generate'] === generateFieldKey ) {</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >        if(!!hardCodedVal) {</span>
<span class="cstat-no" title="statement not covered" >          mapObject = { generate : generateFieldKey</span>
                      , hardCodedValue : hardCodedVal
                      , internalId : true
                      }
        } else {
<span class="cstat-no" title="statement not covered" >          mapObject = { generate : generateFieldKey</span>
                      , extract : extractFieldKey
                      }
        }
      }
<span class="cstat-no" title="statement not covered" >      mappingArray.push(mapObject)</span>
    })
<span class="cstat-no" title="statement not covered" >    adaptorJson.mapping.fields = mappingArray</span>
  }
}
&nbsp;
, getDatefilterLabel = <span class="fstat-no" title="function not covered" >function(option) {</span>
<span class="cstat-no" title="statement not covered" >  var dateFilterLabel = ''</span>
<span class="cstat-no" title="statement not covered" >  _.each(option, <span class="fstat-no" title="function not covered" >function(key, value) {</span></span>
<span class="cstat-no" title="statement not covered" >    if(value.indexOf('selectDateFilterForOrders') &gt; -1) {</span>
<span class="cstat-no" title="statement not covered" >      dateFilterLabel = value</span>
    }
  })
<span class="cstat-no" title="statement not covered" >  return dateFilterLabel</span>
}
&nbsp;
, updateRelativeURIForDeltaExportOrders = <span class="fstat-no" title="function not covered" >function(options, callback) {</span>
<span class="cstat-no" title="statement not covered" >  installerUtils.getAdaptor({</span>
     resourceType: options.resourceType
   , resourceId: options.resourceId
   , bearerToken: options.bearerToken
 }, <span class="fstat-no" title="function not covered" >function(err, body) {</span>
<span class="cstat-no" title="statement not covered" >    if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >    try {</span>
<span class="cstat-no" title="statement not covered" >      var isRestExport = !!(body.rest)</span>
      , isHttpExport = !!(body.http)
      , relativeURIRootPath = ''
      , relativeURIPath = ''
&nbsp;
<span class="cstat-no" title="statement not covered" >      if(isRestExport) {</span>
<span class="cstat-no" title="statement not covered" >        relativeURIRootPath = 'rest'</span>
      } else <span class="cstat-no" title="statement not covered" >if(isHttpExport) {</span>
<span class="cstat-no" title="statement not covered" >        relativeURIRootPath = 'http'</span>
      }
<span class="cstat-no" title="statement not covered" >      relativeURIPath = relativeURIRootPath + '.relativeURI'</span>
&nbsp;
<span class="cstat-no" title="statement not covered" >      var target = body[relativeURIRootPath]['relativeURI']</span>
      , dateFilterObject = {
          OrderCreatedDate: 'dateCreated'
        , OrderLastModifiedDate: 'lastModified'
      }
      , lastExportDateTimeFilter = 'lastExportDateTime'
      , dateCreatedFilter = '(timeStamp)'
&nbsp;
<span class="cstat-no" title="statement not covered" >      if(!options.lagOffset &amp;&amp; options.lagOffset !== 0) {</span>
        //update datefilter label and datefilter value
<span class="cstat-no" title="statement not covered" >        if(options.dateFilter === dateFilterObject.OrderCreatedDate) {</span>
<span class="cstat-no" title="statement not covered" >          target = target.indexOf(options.lastmodifiedDateFilterLabel) &gt; -1 ? target.replace(options.lastmodifiedDateFilterLabel, options.createdDateFilterLabel) : target</span>
<span class="cstat-no" title="statement not covered" >          target = target.indexOf(lastExportDateTimeFilter) &gt; -1 ? target.replace(lastExportDateTimeFilter, dateCreatedFilter) : target</span>
        } else {
<span class="cstat-no" title="statement not covered" >          target = target.indexOf(options.createdDateFilterLabel) &gt; -1 ? target.replace(options.createdDateFilterLabel, options.lastmodifiedDateFilterLabel) : target</span>
<span class="cstat-no" title="statement not covered" >          target = target.indexOf(dateCreatedFilter) &gt; -1 ? target.replace(dateCreatedFilter, lastExportDateTimeFilter) : target</span>
        }
      } else {
        //update lagOffset value
<span class="cstat-no" title="statement not covered" >        var regex = null</span>
        , match = ''
        , index = -1
<span class="cstat-no" title="statement not covered" >        if(target.indexOf(lastExportDateTimeFilter) &gt; -1) {</span>
<span class="cstat-no" title="statement not covered" >          regex = new RegExp(options.lastmodifiedDateFilterLabel + "=.*\"(-?[0-9]+).*&amp;", "g")</span>
<span class="cstat-no" title="statement not covered" >          match = regex.exec(target)</span>
<span class="cstat-no" title="statement not covered" >          if(match !== null) {</span>
<span class="cstat-no" title="statement not covered" >            target = target.replace(match[0], match[0].replace(match[1], options.lagOffset))</span>
          } else {
<span class="cstat-no" title="statement not covered" >            index = target.indexOf(lastExportDateTimeFilter) + (lastExportDateTimeFilter).length</span>
<span class="cstat-no" title="statement not covered" >            target = target.substring(0, index) + ' "' + options.lagOffset + '" ' + target.substring(index)</span>
          }
        }
        else {
<span class="cstat-no" title="statement not covered" >          regex = new RegExp(options.createdDateFilterLabel + "=.*\"(-?[0-9]+).*&amp;", "g")</span>
<span class="cstat-no" title="statement not covered" >          match = regex.exec(target)</span>
<span class="cstat-no" title="statement not covered" >          if(match !== null) {</span>
<span class="cstat-no" title="statement not covered" >            target = target.replace(match[0], match[0].replace(match[1], options.lagOffset))</span>
          } else {
<span class="cstat-no" title="statement not covered" >            index = target.indexOf(dateCreatedFilter) + (dateCreatedFilter).length</span>
<span class="cstat-no" title="statement not covered" >            target = target.substring(0, index) + ' "' + options.lagOffset + '" ' + target.substring(index)</span>
          }
        }
      }
<span class="cstat-no" title="statement not covered" >      jsonpath.apply(body, relativeURIPath, <span class="fstat-no" title="function not covered" >function() {</span> <span class="cstat-no" title="statement not covered" >return target}</span>)</span>
    } catch (ex) {
<span class="cstat-no" title="statement not covered" >      return callback(new Error('Unable to update the resource ' + options.resourceType + '# ' + options.resourceId + '. Exception : ' + ex.message))</span>
    }
&nbsp;
<span class="cstat-no" title="statement not covered" >    installerUtils.putAdaptor({</span>
       resourceType: options.resourceType
     , resourceId: options.resourceId
     , bearerToken: options.bearerToken
     , body: body
   }, <span class="fstat-no" title="function not covered" >function(e, b) {</span>
<span class="cstat-no" title="statement not covered" >      if(e) <span class="cstat-no" title="statement not covered" >return callback(e)</span></span>
<span class="cstat-no" title="statement not covered" >      return callback(null, b)</span>
    })
  })
}
&nbsp;
, validateDeltaDays = <span class="fstat-no" title="function not covered" >function(deltaDays, callback) {</span>
<span class="cstat-no" title="statement not covered" >  var numberFormat = new RegExp('^[0-9]+$')</span>
<span class="cstat-no" title="statement not covered" >  if(!numberFormat.test(deltaDays) || deltaDays == 0) {</span>
<span class="cstat-no" title="statement not covered" >    return callback(new Error('Please enter non-zero numeric value for number of delta days.'))</span>
  }
  else {
<span class="cstat-no" title="statement not covered" >    return callback()</span>
  }
}
&nbsp;
, checkAutoAckValueAndCheckFlowEnabled = <span class="fstat-no" title="function not covered" >function(autoAcknowledgeOnDemandOrders, options, orderAckFlowIdString, callback) {</span>
<span class="cstat-no" title="statement not covered" >    logger.info('checkAutoAckValueAndCheckFlowEnabled, autoAcknowledgeOnDemandOrders : ' + autoAcknowledgeOnDemandOrders)</span>
<span class="cstat-no" title="statement not covered" >    if(!autoAcknowledgeOnDemandOrders) <span class="cstat-no" title="statement not covered" >return callback()</span></span>
<span class="cstat-no" title="statement not covered" >    var orderAckFlowId = options.integrationRecord.settings.commonresources[orderAckFlowIdString]</span>
<span class="cstat-no" title="statement not covered" >    var requestOptions =</span>
      { uri : CONSTS.HERCULES_BASE_URL + '/v1/flows/' + orderAckFlowId
      , method : 'GET'
      , auth : { bearer : options.bearerToken }
      , json : true
      }
<span class="cstat-no" title="statement not covered" >    logger.info('checkAutoAckValueAndCheckFlowEnabled, requestOptions' + JSON.stringify(requestOptions))</span>
<span class="cstat-no" title="statement not covered" >    request(requestOptions, <span class="fstat-no" title="function not covered" >function (err, res, body) {</span></span>
<span class="cstat-no" title="statement not covered" >      if(err) <span class="cstat-no" title="statement not covered" >return callback(err)</span></span>
<span class="cstat-no" title="statement not covered" >      logger.info('checkAutoAckValueAndCheckFlowEnabled, res' + JSON.stringify(res))</span>
<span class="cstat-no" title="statement not covered" >      if(!!body &amp;&amp; body.disabled) <span class="cstat-no" title="statement not covered" >return callback(new Error('Order Acknowledgement Flow is currently disabled. For setting "Auto Acknowledge On Demand Orders" as checked, this flow needs to be enabled'))</span></span>
<span class="cstat-no" title="statement not covered" >      return callback()</span>
    })
  }
&nbsp;
, validateCustomerInternalId = function(customerInternalId, paramObject, commonResources, callback) {
  //checking if user's input is some garbage value
  <span class="missing-if-branch" title="if path not taken" >I</span>if(_.isNaN(customerInternalId)) <span class="cstat-no" title="statement not covered" >return callback(new Error('Please enter a valid customer Internal Id.'))</span>
&nbsp;
  <span class="missing-if-branch" title="else path not taken" >E</span>if(customerInternalId || <span class="branch-1 cbranch-no" title="branch not covered" >customerInternalId === 0)</span> {
&nbsp;
    var options = paramObject.options
      , nsConnectionId = commonResources.netsuiteConnectionId
      , opts =
        { bearerToken : options.bearerToken
        , connectionId : nsConnectionId
        , method : 'POST'
        , scriptId: CONSTS.NS_CONNECTOR_UTIL_SCRIPT_ID
        , deployId: CONSTS.NS_CONNECTOR_UTIL_DEPLOY_ID
        , data :
        { requests :
          [
            { type : 'savedsearch'
              , operation : 'run'
              , config : {
                  "recordType" : "customer",
                  "filters" : [["internalid","is", customerInternalId]] ,
                  "columns" : [{"name":"internalId", "label": "id"}]
                }
              }
            ]
          }
        }
&nbsp;
      utils.integratorProxyCall(opts, function(e, r, b) {
        <span class="missing-if-branch" title="if path not taken" >I</span>if(e) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to get information from NetSuite for Customer# ' + customerInternalId + ', ' + e.message + '. Please contact Celigo support.'))</span>
        <span class="missing-if-branch" title="if path not taken" >I</span>if(!(r.statusCode === 200 || <span class="branch-1 cbranch-no" title="branch not covered" >r.statusCode === 201)</span>) <span class="cstat-no" title="statement not covered" >return callback(new Error('Failed to get information from NetSuite for Customer# ' + customerInternalId + ', status Code while connecting to NetSuite : ' + r.statusCode + '. Please contact Celigo support.'))</span>
        b = b &amp;&amp; b[0] || <span class="branch-2 cbranch-no" title="branch not covered" >null</span>
&nbsp;
        //No existing customer found on NS with id as customerInternalId
        <span class="missing-if-branch" title="if path not taken" >I</span>if(!!customerInternalId &amp;&amp; (!b || !b.results || !b.results.length)) <span class="cstat-no" title="statement not covered" >return callback(new Error('Please enter a valid customer Internal Id. Customer with Internal Id# ' + customerInternalId + ' not found in NetSuite.'))</span>
&nbsp;
        return callback()
      })
    }
}
&nbsp;
module.exports = operations
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
