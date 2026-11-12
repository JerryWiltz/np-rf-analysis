<!-- Generated from nP REPL example rc-low-pass; do not edit the copied code here. -->

# 02 RC low-pass

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-rc-low-pass)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// RC low-pass

var g = nP.global;
g.fList = g.fGen(1e6, 1e9, 51);

var tee = nP.Tee();
var short = nP.Short();
var r1 = nP.R(50);
var c1 = nP.C(3.17e-12);

var lowPass = nP.nodal(
  [r1, 1, 2],
  [tee, 4, 2, 3],
  [c1, 4, 5],
  [short, 5],
  ['out', 1, 3]
);

var chartTable = lowPass.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [chartTable],
  title: 'RC low-pass',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(lowPass);
```
