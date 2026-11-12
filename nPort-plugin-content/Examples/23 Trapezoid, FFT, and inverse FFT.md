<!-- Generated from nP REPL example trapezoid-fft-round-trip; do not edit the copied code here. -->

# 23 Trapezoid, FFT, and inverse FFT

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-trapezoid-fft-round-trip)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Trapezoid, FFT, and inverse FFT

var g = nP.global;
var period = 1e-3;
var sampleCount = 256;
g.tList = g.tGen(0, period * (sampleCount - 1) / sampleCount, sampleCount);
g.fList = [];

var trapezoid = nP.waveform({
  shape: 'custom',
  period: period,
  points: [
    [0, 0],
    [0.1e-3, 1],
    [0.6e-3, 1],
    [0.7e-3, 0],
    [period, 0]
  ]
});

nP.lineChart({
  inputTable: [trapezoid.out('waveform')],
  title: 'Sampled trapezoid',
  metricPrefix: 'milli',
  xAxisTitle: 'Time (ms)',
  yAxisTitle: 'Voltage (V)',
  showPoints: false
});

var fft = nP.FFT(trapezoid.out('samples'));

nP.lineChart({
  inputTable: [fft.out('dBV')],
  title: 'Trapezoid FFT',
  plotType: 'bar',
  barWidth: 4,
  barBaseline: -80,
  yRange: [-80, 10],
  metricPrefix: 'kilo',
  xAxisTitle: 'Frequency (kHz)',
  yAxisTitle: 'Amplitude (dBV)'
});

var reconstructed = nP.invFFT(fft);

nP.lineChart({
  inputTable: [reconstructed.out('real')],
  title: 'Reconstructed trapezoid samples',
  metricPrefix: 'milli',
  xAxisTitle: 'Time (ms)',
  yAxisTitle: 'Voltage (V)',
  showPoints: false
});
```
