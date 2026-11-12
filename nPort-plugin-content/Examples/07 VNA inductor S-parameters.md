<!-- Generated from nP REPL example vna-port1; do not edit the copied code here. -->

# 07 VNA inductor S-parameters

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-vna-port1)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// VNA inductor S-parameters

var g = nP.global;
g.fList = g.fGen(1e9, 3e9, 101);

var tx = nP.mod({
  mode: 'VNA-frequency',
  fList: g.fList
});

var splitter = nP.Coupler180();
var inputCoupler = nP.Coupler180();
var outputCoupler = nP.Coupler180();
var l1 = nP.L(5e-9);
var load = nP.Load();

var circuit = nP.nodal(
  [splitter, 1, 2, 3, 4],
  [inputCoupler, 2, 5, 6, 7],
  [l1, 5, 8],
  [outputCoupler, 8, 9, 10, 11],
  [load, 3],
  [load, 7],
  [load, 9],
  [load, 10],
  ['out', 1, 4, 6, 11],
  {signal: tx, inputPort: 1}
);

var referenceRx = nP.demod(circuit, {
  outputPort: 2,
  referenceGain: 1,
  noise: false
});
var reflectionRx = nP.demod(circuit, {
  outputPort: 3,
  referenceReceiver: referenceRx,
  referenceGain: 2,
  noise: false
});
var transmissionRx = nP.demod(circuit, {
  outputPort: 4,
  referenceReceiver: referenceRx,
  referenceGain: 2,
  noise: false
});
var referenceTable = referenceRx.out('response magnitude');
var s11Table = reflectionRx.out('response dB');
var s21Table = transmissionRx.out('response dB');
var directTable = l1.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [s11Table],
  title: 'Measured inductor S11',
  xAxisTitle: 'Frequency (GHz)',
  yAxisTitle: 'S11 (dB)',
  metricPrefix: 'giga',
  showPoints: false
});

nP.lineChart({
  inputTable: [s21Table],
  title: 'Measured inductor S21',
  xAxisTitle: 'Frequency (GHz)',
  yAxisTitle: 'S21 (dB)',
  metricPrefix: 'giga',
  showPoints: false
});

nP.lineTable({
  inputTable: directTable,
  title: 'Direct L(5 nH) S-parameters'
});

nP.lineTable({
  inputTable: referenceTable,
  title: 'VNA reference receiver R'
});

nP.schematic(circuit);
```
