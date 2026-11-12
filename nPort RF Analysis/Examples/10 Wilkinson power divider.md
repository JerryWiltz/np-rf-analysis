<!-- Generated from nP REPL example wilkinson-power-divider; do not edit the copied code here. -->

# 10 Wilkinson power divider

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-wilkinson-power-divider)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Wilkinson power divider

nP.global.fList = nP.global.fGen(4e9, 8e9, 41);

var inputTee = nP.Tee();
var outputTee1 = nP.Tee();
var outputTee2 = nP.Tee();
var branch1 = nP.Tlin(70.7, 0.49 * 0.0254);
var branch2 = nP.Tlin(70.7, 0.49 * 0.0254);
var isolationR = nP.R(100);

var divider = nP.nodal(
    [inputTee, 1, 2, 3],
    [branch1, 2, 4],
    [branch2, 3, 5],
    [outputTee1, 6, 4, 7],
    [outputTee2, 8, 5, 9],
    [isolationR, 6, 8],
    ['out', 1, 7, 9]
);

var response = divider.out('s11dB', 's21dB', 's31dB', 's23dB');
nP.schematic(divider);
nP.lineChart({
    inputTable: [response],
    title: 'Wilkinson power divider',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency (GHz)'
});
```
