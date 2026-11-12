<!-- Generated from nP REPL example full-wave-rectified-sine-fft; do not edit the copied code here. -->

# 21 Full-wave rectified sine and FFT

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-full-wave-rectified-sine-fft)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Full-wave rectified sine and FFT

var g = nP.global;
var sampleCount = 256;
var period = 1e-3; // Original sine frequency: 1 kHz.
var periodsShown = 2;
g.tList = g.tGen(0, periodsShown * period * (sampleCount - 1) / sampleCount, sampleCount);
g.fList = [];

var rectified = nP.waveform({
  shape: 'rectifiedSine',
  period: period
});

nP.lineChart({
  inputTable: [rectified.out('waveform')],
  title: 'Full-wave rectified 1 kHz sine',
  metricPrefix: 'milli',
  xAxisTitle: 'Time (ms)',
  yAxisTitle: 'Voltage (V)',
  showPoints: false
});

var fft = nP.FFT(rectified.out('samples'));

nP.lineChart({
  inputTable: [fft.out('dBV')],
  title: 'DC and even harmonics of 1 kHz',
  plotType: 'bar',
  barWidth: 4,
  barBaseline: -80,
  yRange: [-80, 10],
  metricPrefix: 'kilo',
  xAxisTitle: 'Frequency (kHz)',
  yAxisTitle: 'Amplitude (dBV)'
});
```
