<!-- Generated from nP REPL example tee-power-divider; do not edit the copied code here. -->

# 12 Tee power divider

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-tee-power-divider)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Tee power divider

var g = nP.global;
g.fList = g.fGen(1e9, 3e9, 21);

var tee = nP.Tee();
var branch1 = nP.Tlin(50, 0.0254);
var branch2 = nP.Tlin(50, 0.0254);

var divider = nP.nodal(
  [tee, 1, 2, 3],
  [branch1, 2, 4],
  [branch2, 3, 5],
  ['out', 1, 4, 5]
);

var chartTable = divider.out('s11dB', 's21dB', 's31dB');

nP.lineChart({
  inputTable: [chartTable],
  title: 'Tee power divider',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(divider);
```
