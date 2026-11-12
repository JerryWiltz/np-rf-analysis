<!-- Generated from nP REPL example chebyshev-ladder; do not edit the copied code here. -->

# 29 Chebyshev filter ladder

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-chebyshev-ladder)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Chebyshev filter ladder

nP.global.fList = nP.global.fGen(10e6, 500e6, 51);

var gk = nP.chebyLPgk(3, 0.1);
var values = nP.chebyLPLCs(gk, 200e6, 50);

nP.log('Normalized g values:');
nP.log(gk);
nP.log('Terminations, capacitors, and inductor (SI units):');
nP.log(values);

var tee = nP.Tee();
var short = nP.Short();
var c1 = nP.C(values[1]);
var l1 = nP.L(values[2]);
var c2 = nP.C(values[3]);

var filter = nP.nodal(
  [tee, 1, 2, 3],
  [c1, 1, 4],
  [short, 4],
  [l1, 3, 5],
  [tee, 6, 5, 7],
  [c2, 6, 8],
  [short, 8],
  ['out', 2, 7]
);

nP.lineChart({
  inputTable: [filter.out('s11dB', 's21dB')],
  title: 'Chebyshev low-pass'
});

nP.schematic(filter);
```
