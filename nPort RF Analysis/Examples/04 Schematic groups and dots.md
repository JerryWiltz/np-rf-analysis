<!-- Generated from nP REPL example schematic-groups-and-dots; do not edit the copied code here. -->

# 04 Schematic groups and dots

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-schematic-groups-and-dots)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Schematic groups and dots

var g = nP.global;
g.fList = g.fGen(100e6, 2e9, 41);

var r1 = nP.R(75);
var r2 = nP.R(50);
var c1 = nP.C(1e-12);
var tee1 = nP.Tee();
var short1 = nP.Short();

// Three shape groups in one electrical network; component objects are reused.
var network = nP.nodal(
  {series: [
    [r1, 1, 2],
    [r2, 2, 3]
  ]},
  {ladder: [
    [tee1, 4, 3, 5],
    [c1, 4, 6],
    [short1, 6],
    [r2, 5, 7]
  ]},
  {series: [
    [r1, 7, 8]
  ]},
  ['out', 1, 8]
);

var response = network.out('s11dB', 's21dB');
nP.lineChart({
  inputTable: [response],
  title: 'Series–ladder–series response',
  metricPrefix: 'giga',
  showPoints: false
});

// Default dots: external ports and numbered nodes on, component terminals off.
nP.log('Default dots:');
var drawing = nP.schematic(network);
var detectedOptions = drawing.detected;
nP.log('Detection uses group membership without reading the group names:');
nP.log(detectedOptions);

// The same network and positions, with optional component-terminal dots.
nP.log('Component-terminal dots enabled:');
var terminalDrawing = nP.schematic(network, {
  dots: {
    terminals: true
  }
});
```
