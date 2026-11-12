<!-- Generated from nP REPL example low-pass-cascade; do not edit the copied code here. -->

# 25 Low-pass with nP.cascade()

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-low-pass-cascade)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Low-pass with nP.cascade()

nP.global.fList = nP.global.fGen(10e6, 1e9, 51);

var c1 = nP.paC(16.41818746502858e-12);
var l1 = nP.seL(45.65360855435164e-9);
var c2 = nP.paC(16.41818746502858e-12);

var byCascade = nP.cascade(c1, l1, c2);

var response = byCascade.out('s21dB');
nP.schematic(byCascade);
nP.lineChart({
    inputTable: [response],
    title: 'Low-pass with nP.cascade()',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency (GHz)'
});
```
