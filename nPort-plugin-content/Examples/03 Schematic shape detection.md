<!-- Generated from nP REPL example schematic-shape-detection; do not edit the copied code here. -->

# 03 Schematic shape detection

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-schematic-shape-detection)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Schematic shape detection

nP.global.fList = [2e9];

var r1 = nP.R(25);
var r2 = nP.R(50);
var network = nP.nodal(
  [r1, 1, 2],
  [r2, 2, 3],
  ['out', 1, 3]
);

var response = network.out('s11mag', 's21mag');
nP.lineTable({inputTable: [response], title: 'Two series resistors'});

// No shape hint: the detector recognizes the complete series path.
var drawing = nP.schematic(network);
var detectedOptions = drawing.detected;
nP.log('Independently detected shape options:');
nP.log(detectedOptions);
```
