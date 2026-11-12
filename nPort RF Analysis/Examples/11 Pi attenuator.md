<!-- Generated from nP REPL example pi-attenuator; do not edit the copied code here. -->

# 11 Pi attenuator

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-pi-attenuator)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Pi attenuator

nP.global.fList = [2e9];

var inputShunt = nP.R(292.4);
var seriesR = nP.R(17.6);
var outputShunt = nP.R(292.4);
var inputTee = nP.Tee();
var outputTee = nP.Tee();
var ground = nP.Short();

var attenuator = nP.nodal(
    [inputTee, 2, 1, 3],
    [inputShunt, 2, 4],
    [ground, 4],
    [seriesR, 3, 5],
    [outputTee, 6, 5, 7],
    [outputShunt, 6, 8],
    [ground, 8],
    ['out', 1, 7]
);

var response = attenuator.out('s11dB', 's21dB');
nP.schematic(attenuator);
nP.lineTable({
    inputTable: [response],
    title: 'Pi attenuator at 2 GHz'
});
```
