<!-- Generated from nP REPL example series-rc-smith-chart; do not edit the copied code here. -->

# 16 Series RC Smith chart

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-series-rc-smith-chart)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Series RC Smith chart

var g = nP.global;
g.fList = g.fGen(1e6, 10e9, 41);

var r1 = nP.R(50);
var c1 = nP.C(3.17e-12);

var seriesRC = nP.nodal(
  [r1, 1, 2],
  [c1, 2, 3],
  ['out', 1, 3]
);

var smithTable = seriesRC.out('s11Re', 's11Im');

nP.smithChart({
  inputTable: [smithTable],
  title: 'Series RC reflection',
  metricPrefix: 'giga',
  margin: {
    top: 35,
    right: 35,
    bottom: 35,
    left: 35
  },
  showPoints: true
});

nP.schematic(seriesRC);
```
