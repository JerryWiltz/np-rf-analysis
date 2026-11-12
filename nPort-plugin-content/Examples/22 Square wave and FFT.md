<!-- Generated from nP REPL example square-wave-fft; do not edit the copied code here. -->

# 22 Square wave and FFT

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-square-wave-fft)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Square wave and FFT

var g = nP.global;
var sampleCount = 256;
var period = 1e-3; // Fundamental frequency: 1 kHz.
var periodsShown = 2;
g.tList = g.tGen(0, periodsShown * period * (sampleCount - 1) / sampleCount, sampleCount);
g.fList = [];

var square = nP.waveform({
  shape: 'square',
  period: period
});

nP.lineChart({
  inputTable: [square.out('waveform')],
  title: 'Ideal square wave',
  metricPrefix: 'milli',
  xAxisTitle: 'Time (ms)',
  yAxisTitle: 'Voltage (V)',
  showPoints: false
});

var fft = nP.FFT(square.out('samples'));

nP.lineChart({
  inputTable: [fft.out('dBV')],
  title: 'Odd harmonics of 1 kHz',
  plotType: 'bar',
  barWidth: 4,
  barBaseline: -80,
  yRange: [-80, 10],
  metricPrefix: 'kilo',
  xAxisTitle: 'Frequency (kHz)',
  yAxisTitle: 'Amplitude (dBV)'
});
```
