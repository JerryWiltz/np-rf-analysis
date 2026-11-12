<!-- Generated from nP REPL example ssb-dsb-sidebands; do not edit the copied code here. -->

# 41 SSB versus DSB-SC

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-ssb-dsb-sidebands)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// SSB versus DSB-SC

var g = nP.global;
g.tList = g.tGen(0, 1e-3, 2);
g.fList = [];

var ssb = nP.mod({
  mode: 'SSB',
  sideband: 'USB',
  carrierHz: 200e6,
  toneHz: 300
});

var dsb = nP.mod({
  mode: 'DSB-SC',
  carrierHz: 200e6,
  toneHz: 300
});

var ssbTones = ssb.out('tones');
var dsbTones = dsb.out('tones');

nP.log('SSB occupied tones:');
nP.log(ssbTones);

nP.log('DSB-SC occupied tones:');
nP.log(dsbTones);
```
