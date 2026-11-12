<!-- Generated from nP REPL example two-tone-ip3; do not edit the copied code here. -->

# 37 Two-tone IM3 and OIP3

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-two-tone-ip3)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Two-tone IM3 and OIP3

nP.global.fList = nP.global.fGen(1e9, 1.1e9, 5);
nP.global.twoTone = {
  spacingHz: 1e6,
  p1dBm: -30,
  p2dBm: -30
};

var amp = nP.Amp({
  gainDb: 20,
  oip3dBm: 30
});
var attenuator = nP.Attn(3);

var chain = nP.nodal(
  [amp, 1, 2],
  [attenuator, 2, 3],
  ['out', 1, 3]
);

nP.lineTable({
  inputTable: [chain.out('IM3lower21dBm', 'OIP3lower21dBm')],
  title: 'Two-tone products'
});

nP.schematic(chain);
```
