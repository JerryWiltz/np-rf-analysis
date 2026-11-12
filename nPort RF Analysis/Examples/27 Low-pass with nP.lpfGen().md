<!-- Generated from nP REPL example low-pass-lpfgen; do not edit the copied code here. -->

# 27 Low-pass with nP.lpfGen()

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-low-pass-lpfgen)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Low-pass with nP.lpfGen()

nP.global.fList = nP.global.fGen(10e6, 1e9, 51);

var byGenerator = nP.lpfGen([
    50,
    16.41818746502858e-12,
    45.65360855435164e-9,
    16.41818746502858e-12,
    50
]);

var response = byGenerator.out('s21dB');
nP.schematic(byGenerator);
nP.lineChart({
    inputTable: [response],
    title: 'Low-pass with nP.lpfGen()',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency (GHz)'
});
```
