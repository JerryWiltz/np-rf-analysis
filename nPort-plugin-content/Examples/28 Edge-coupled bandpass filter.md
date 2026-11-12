<!-- Generated from nP REPL example edge-coupled-bandpass-filter; do not edit the copied code here. -->

# 28 Edge-coupled bandpass filter

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-edge-coupled-bandpass-filter)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Edge-coupled bandpass filter

nP.global.fList = nP.global.fGen(4e9, 8e9, 21);

var coupled1 = nP.Tclin(79.667, 37.834, 0.491 * 0.0254);
var coupled2 = nP.Tclin(60.866, 42.505, 0.491 * 0.0254);
var coupled3 = nP.Tclin(79.667, 37.834, 0.491 * 0.0254);
var open = nP.Open();

var filter = nP.nodal(
    [coupled1, 1, 2, 3, 4],
    [coupled2, 3, 5, 6, 7],
    [coupled3, 6, 8, 9, 10],
    [open, 2],
    [open, 4],
    [open, 5],
    [open, 7],
    [open, 8],
    [open, 10],
    ['out', 1, 9]
);

var response = filter.out('s11dB', 's21dB');
nP.schematic(filter);
nP.lineChart({
    inputTable: [response],
    title: 'Edge-coupled bandpass filter',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency (GHz)'
});
```
