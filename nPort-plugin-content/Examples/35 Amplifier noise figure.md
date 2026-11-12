<!-- Generated from nP REPL example amplifier-noise; do not edit the copied code here. -->

# 35 Amplifier noise figure

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-amplifier-noise)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Amplifier noise figure

nP.global.fList = nP.global.fGen(1e9, 2e9, 11);
nP.global.Temp = 290;

var amp = nP.Amp(20, 4);
var attenuator = nP.Attn(3);

var chain = nP.nodal(
  [amp, 1, 2],
  [attenuator, 2, 3],
  ['out', 1, 3]
);

nP.lineTable({
  inputTable: [chain.out('s21dB', 'NF21dB', 'noiseFloor')],
  title: 'Gain and noise'
});

nP.schematic(chain);
```
