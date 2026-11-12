<!-- Generated from nP REPL example coupled-line; do not edit the copied code here. -->

# 14 Ideal coupled line

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-coupled-line)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Ideal coupled line

nP.global.fList = nP.global.fGen(1e9, 3e9, 21);

var coupler = nP.Tclin(100, 30, 0.0373);

nP.lineChart({
  inputTable: [coupler.out('s21dB', 's41dB')],
  title: 'Through and coupled ports'
});

nP.schematic(coupler);
```
