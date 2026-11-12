<!-- Generated from nP REPL example rlc-ladder; do not edit the copied code here. -->

# 05 RLC ladder

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-rlc-ladder)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// RLC ladder

var g = nP.global;
g.fList = g.fGen(10e6, 2e9, 51);

var tee = nP.Tee();
var short = nP.Short();
var l1 = nP.L(9.57e-9);
var c1 = nP.C(3.17e-12);
var l2 = nP.L(9.57e-9);

var ladder = nP.nodal(
  [l1, 1, 2],
  [tee, 4, 2, 3],
  [c1, 4, 5],
  [short, 5],
  [l2, 3, 6],
  ['out', 1, 6]
);

var chartTable = ladder.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [chartTable],
  title: 'RLC ladder',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(ladder);
```
