<!-- Generated from nP REPL example line-chart; do not edit the copied code here. -->

# 15 Line chart

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-line-chart)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Line chart

var g = nP.global;
g.fList = g.fGen(1e9, 5e9, 41);

var line1 = nP.Tlin(50, 0.0127);
var line2 = nP.Tlin(60, 0.0254);

var network = nP.cascade(line1, line2);

var table = network.out('s21dB');

nP.lineChart({
  inputTable: [table],
  title: 'Cascaded transmission',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(network);
```
