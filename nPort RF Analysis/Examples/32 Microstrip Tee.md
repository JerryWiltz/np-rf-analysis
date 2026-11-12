<!-- Generated from nP REPL example microstrip-tee; do not edit the copied code here. -->

# 32 Microstrip Tee

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-microstrip-tee)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Microstrip Tee

nP.global.fList = nP.global.fGen(1e9, 5e9, 21);

var tee = nP.mtee();

nP.lineChart({
  inputTable: [tee.out('s21dB', 's31dB')],
  title: 'Microstrip Tee branches'
});

nP.schematic(tee);
```
