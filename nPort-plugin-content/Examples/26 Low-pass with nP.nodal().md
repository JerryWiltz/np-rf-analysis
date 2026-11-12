<!-- Generated from nP REPL example low-pass-nodal; do not edit the copied code here. -->

# 26 Low-pass with nP.nodal()

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-low-pass-nodal)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Low-pass with nP.nodal()

nP.global.fList = nP.global.fGen(10e6, 1e9, 51);

var c1 = nP.paC(16.41818746502858e-12);
var l1 = nP.seL(45.65360855435164e-9);
var c2 = nP.paC(16.41818746502858e-12);

var byNodes = nP.nodal(
    [c1, 1, 2],
    [l1, 2, 3],
    [c2, 3, 4],
    ['out', 1, 4]
);

var response = byNodes.out('s21dB');
nP.schematic(byNodes);
nP.lineChart({
    inputTable: [response],
    title: 'Low-pass with nP.nodal()',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency (GHz)'
});
```
