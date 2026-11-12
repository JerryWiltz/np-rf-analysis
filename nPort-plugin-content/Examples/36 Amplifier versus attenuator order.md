<!-- Generated from nP REPL example noise-order; do not edit the copied code here. -->

# 36 Amplifier versus attenuator order

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-noise-order)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Amplifier versus attenuator order

nP.global.fList = [1e9];

var amp = nP.Amp(20, 4);
var attenuator = nP.Attn(3);

var ampFirst = nP.cascade(amp, attenuator);
var attenuatorFirst = nP.cascade(attenuator, amp);

var ampFirstTable = ampFirst.out('s21dB', 'NF21dB');
var attenuatorFirstTable = attenuatorFirst.out('s21dB', 'NF21dB');

nP.log('Amplifier first:');
nP.log(ampFirstTable);

nP.log('Attenuator first:');
nP.log(attenuatorFirstTable);

nP.schematic(ampFirst);
nP.schematic(attenuatorFirst);
```
