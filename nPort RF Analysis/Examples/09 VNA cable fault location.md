<!-- Generated from nP REPL example vna-short-reflection; do not edit the copied code here. -->

# 09 VNA cable fault location

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-vna-short-reflection)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// VNA cable fault location

var g = nP.global();
// Start at 0 s and sample at 250 MHz, giving 4 ns between points.
// Use 4096 points (2^12) for the VNA-time inverse FFT.
// The last point is sample 4095; dividing by 250 MHz gives its time in seconds.
g.tList = g.tGen(0, 4095 / 250e6, 4096);
g.fList = [];

var tx = nP.mod({
  mode: 'VNA-time'
});

// VNA fixture: splitter feeds R; input coupler samples the return at A.
// The output coupler and receiver B are dormant for this one-port DUT.
var splitter = nP.Coupler180();
var inputCoupler = nP.Coupler180();
var lineLengthMeters = 1000;
var line = nP.Tlin(50, lineLengthMeters);
var short = nP.Short();
var open = nP.Open();
var load = nP.Load();

var shortCircuit = nP.nodal(
  [splitter, 1, 2, 3, 4],
  [inputCoupler, 2, 5, 6, 7],
  [line, 5, 8],
  [short, 8],
  [load, 3],
  [load, 7],
  ['out', 1, 4, 6],
  {signal: tx, inputPort: 1}
);

var openCircuit = nP.nodal(
  [splitter, 1, 2, 3, 4],
  [inputCoupler, 2, 5, 6, 7],
  [line, 5, 8],
  [open, 8],
  [load, 3],
  [load, 7],
  ['out', 1, 4, 6],
  {signal: tx, inputPort: 1}
);

var referenceRx = nP.demod(shortCircuit, {
  outputPort: 2,
  referenceGain: 1,
  noise: false
});
var shortRx = nP.demod(shortCircuit, {
  outputPort: 3,
  referenceReceiver: referenceRx,
  referenceGain: 2,
  noise: false
});
var openRx = nP.demod(openCircuit, {
  outputPort: 3,
  referenceReceiver: referenceRx,
  referenceGain: 2,
  noise: false
});
var referenceTable = referenceRx.out('waveform');
var shortReturn = shortRx.out('waveform');
var openReturn = openRx.out('waveform');
// Leave display space before and after the 16,384 ns periodic record.
var timePlotRangeNs = [-500, 16884];

// Find the largest return in each measured waveform, independently.
var shortPeak = shortReturn[1];
var openPeak = openReturn[1];
for (var index = 2; index < shortReturn.length; index++) {
  if (Math.abs(shortReturn[index][1]) > Math.abs(shortPeak[1])) {
    shortPeak = shortReturn[index];
  }
  if (Math.abs(openReturn[index][1]) > Math.abs(openPeak[1])) {
    openPeak = openReturn[index];
  }
}

// A fault 1 km away gives a 2 km round trip at the modeled speed of light.
var speedOfLightMetersPerSecond = 299792458;
var expectedRoundTripNs = 2 * lineLengthMeters /
  speedOfLightMetersPerSecond * 1e9;
var transitTable = [
  ['Fault', 'Predicted (ns)', 'Measured (ns)', 'Inferred distance (m)'],
  ['Short', expectedRoundTripNs, shortPeak[0],
    shortPeak[0] * 1e-9 * speedOfLightMetersPerSecond / 2],
  ['Open', expectedRoundTripNs, openPeak[0],
    openPeak[0] * 1e-9 * speedOfLightMetersPerSecond / 2]
];

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
  inputTable: [shortReturn],
  title: 'Short fault at 1 km: receiver A / R',
  xAxisTitle: 'Time (ns)',
  xAxisPosition: 'origin',
  xRange: timePlotRangeNs,
  yAxisTitle: 'Normalized reflection',
  metricPrefix: 'none',
  showPoints: false,
  showLabels: false
});

nP.lineChart({
  inputTable: [openReturn],
  title: 'Open fault at 1 km: receiver A / R',
  xAxisTitle: 'Time (ns)',
  xAxisPosition: 'origin',
  xRange: timePlotRangeNs,
  yAxisTitle: 'Normalized reflection',
  metricPrefix: 'none',
  showPoints: false,
  showLabels: false
});

nP.lineTable({
  inputTable: transitTable,
  title: 'Speed-of-light transit check: 2 km round trip',
  metricPrefix: 'none'
});

nP.schematic(shortCircuit);
nP.schematic(openCircuit);
```
