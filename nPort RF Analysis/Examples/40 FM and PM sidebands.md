<!-- Generated from nP REPL example fm-pm-sidebands; do not edit the copied code here. -->

# 40 FM and PM sidebands

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-fm-pm-sidebands)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// FM and PM sidebands

var g = nP.global;
g.tList = g.tGen(0, 1e-3, 2);
g.fList = [];

var fm = nP.mod({
  mode: 'FM',
  carrierHz: 200e6,
  toneHz: 300,
  beta: 1
});

var pm = nP.mod({
  mode: 'PM',
  carrierHz: 200e6,
  toneHz: 300,
  beta: 1
});

var fmTones = fm.out('tones');
var pmTones = pm.out('tones');

nP.log('FM tones:');
nP.log(fmTones);

nP.log('PM tones:');
nP.log(pmTones);
```
