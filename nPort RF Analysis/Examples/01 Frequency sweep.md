<!-- Generated from nP REPL example frequency-sweep; do not edit the copied code here. -->

# 01 Frequency sweep

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-frequency-sweep)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Frequency sweep

nP.global.fList = nP.global.fGen(1e9, 3e9, 5);

var r1 = nP.R(25);

var response = r1.out('s11dB', 's21dB');

nP.log(response);

nP.schematic(r1);
```
