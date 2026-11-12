<!-- Generated from nP REPL example microstrip-line; do not edit the copied code here. -->

# 30 Microstrip line

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-microstrip-line)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Microstrip line

var g = nP.global;
g.fList = g.fGen(1e9, 10e9, 21);

var line = nP.mlin({
  width: 0.5842e-3,
  height: 0.635e-3,
  length: 12.7e-3,
  thickness: 25.4e-6,
  relativePermittivity: 10,
  resistivity: 1.72e-8,
  lossTangent: 0.001,
  roughnessRms: 0
});

var chartTable = line.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [chartTable],
  title: 'Microstrip line',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(line);
```
