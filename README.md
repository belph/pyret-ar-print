# Pyret Activation Record Tool
This tool allows for the programmatic inspection of Pyret
Activation Records. Currently, one tool is provided, called
`pyret-ar-print`, which prints a histogram of activation record
sizes belonging to a given Pyret compiled output. For example,
here is the result of running the program on Phase 0 at the time
of writing this document:

```
$ pyret-ar-print ~/pyret-lang/build/phase0/pyret.jarr
    0 | ############################################################ | 2102
    1 | ########################                                     | 852
    2 | #############                                                | 440
    3 | #######                                                      | 252
    4 | ####                                                         | 141
    5 | ####                                                         | 130
    6 | ##                                                           | 60
    7 | ##                                                           | 55
    8 | #                                                            | 52
    9 | #                                                            | 45
   10 | #                                                            | 36
   11 |                                                              | 14
   12 | #                                                            | 19
   13 |                                                              | 17
   14 | #                                                            | 18
   15 |                                                              | 14
   16 |                                                              | 6
   17 |                                                              | 5
   18 |                                                              | 11
   19 |                                                              | 8
   20 |                                                              | 2
   21 |                                                              | 5
   22 |                                                              | 3
   23 |                                                              | 7
   24 |                                                              | 2
   25 |                                                              | 3
   26 |                                                              | 2
   27 |                                                              | 2
   28 |                                                              | 3
   29 |                                                              | 1
   30 |                                                              | 1
   31 |                                                              | 2
   33 |                                                              | 2
   36 |                                                              | 1
   37 |                                                              | 1
   38 |                                                              | 1
   39 |                                                              | 1
   40 |                                                              | 1
   41 |                                                              | 1
   43 |                                                              | 1
   46 |                                                              | 2
   47 |                                                              | 1
   49 |                                                              | 1
   57 |                                                              | 1
   61 |                                                              | 1
   69 |                                                              | 1
   74 |                                                              | 1
   76 |                                                              | 1
   78 |                                                              | 1
   79 |                                                              | 1
   81 |                                                              | 1
   84 |                                                              | 1
   89 |                                                              | 1
   97 |                                                              | 1
  102 |                                                              | 1
  108 |                                                              | 1
  111 |                                                              | 1
  122 |                                                              | 1
  125 |                                                              | 1
  128 |                                                              | 1
  137 |                                                              | 1
  191 |                                                              | 1
  199 |                                                              | 1
  208 |                                                              | 1
  286 |                                                              | 1
  351 |                                                              | 1
  438 |                                                              | 1
  458 |                                                              | 1
  767 |                                                              | 1
```
