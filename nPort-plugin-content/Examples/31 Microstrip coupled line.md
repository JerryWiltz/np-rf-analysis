<!-- Generated from nP REPL example microstrip-coupler; do not edit the copied code here. -->

# 31 Microstrip coupled line

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-microstrip-coupler)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Microstrip coupled line

nP.global.fList = nP.global.fGen(1e9, 5e9, 21);

var coupler = nP.mclin();

nP.lineChart({
  inputTable: [coupler.out('s21dB', 's41dB')],
  title: 'Microstrip coupled line'
});

nP.schematic(coupler);
```
