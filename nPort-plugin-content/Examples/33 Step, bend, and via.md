<!-- Generated from nP REPL example microstrip-layout; do not edit the copied code here. -->

# 33 Step, bend, and via

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-microstrip-layout)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Step, bend, and via

nP.global.fList = nP.global.fGen(1e9, 5e9, 21);

var step = nP.mstep();
var bend = nP.mbend();
var via = nP.mvia();

var path = nP.cascade(step, bend, via);

nP.lineChart({
  inputTable: [path.out('s11dB', 's21dB')],
  title: 'Microstrip layout path'
});

nP.schematic(path);
```
