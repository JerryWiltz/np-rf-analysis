<!-- Generated from nP REPL example vna-inductor-time; do not edit the copied code here. -->

# 08 VNA inductor impulse response

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-vna-inductor-time)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// VNA inductor impulse response

var g = nP.global();
// 4096 samples at 16 GHz are 62.5 ps apart: 0 to 255.9375 ns.
// VNA-time makes 2049 bins from DC to 8 GHz, spaced 3.90625 MHz.
// The 8 GHz Nyquist bin is zero so demod can make a real waveform.
g.tList = g.tGen(0, 4095 / 16e9, 4096);
g.fList = [];

var tx = nP.mod({
  mode: 'VNA-time'
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
// R is the source reference after the ideal splitter, in volts.
// A divided by R is the inductor's normalized S11 impulse response.
// B divided by R is its normalized S21 impulse response.
// The gain of 2 on A and B removes the ideal couplers' voltage split.
var referenceTable = referenceRx.out('waveform');
var reflectionTable = reflectionRx.out('waveform');
var transmissionTable = transmissionRx.out('waveform');
// Leave display space before and after the 256 ns periodic record.
var timePlotRangeNs = [-10, 266];

nP.lineChart({
  inputTable: [referenceTable],
  title: 'VNA reference receiver R',
  xAxisTitle: 'Time (ns)',
  xAxisPosition: 'origin',
  xRange: timePlotRangeNs,
  yAxisTitle: 'Receiver voltage (V)',
  metricPrefix: 'none',
  showPoints: false,
  showLabels: false
});

nP.lineChart({
  inputTable: [reflectionTable],
  title: 'Inductor reflection impulse response',
  xAxisTitle: 'Time (ns)',
  xAxisPosition: 'origin',
  xRange: timePlotRangeNs,
  yAxisTitle: 'Normalized reflection',
  metricPrefix: 'none',
  showPoints: false,
  showLabels: false
});

nP.lineChart({
  inputTable: [transmissionTable],
  title: 'Inductor transmission impulse response',
  xAxisTitle: 'Time (ns)',
  xAxisPosition: 'origin',
  xRange: timePlotRangeNs,
  yAxisTitle: 'Normalized transmission',
  metricPrefix: 'none',
  showPoints: false,
  showLabels: false
});

nP.schematic(circuit);
```
