<!-- Generated from nP REPL example ber-attenuation; do not edit the copied code here. -->

# 45 BER through an attenuator

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-ber-attenuation)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// BER through an attenuator

var g = nP.global;
g.tList = g.tGen(0, 127 / 8e9, 128); // 16 bits, 8 samples per bit.
g.fList = [];

var tx = nP.mod({
  mode: 'ASCII',
  message: 'Hi',
  bitRate: 1e9,
  samplesPerBit: 8,
  highVolts: 1e-3
});

var attenuator = nP.Attn(17.6, 290);

var chain = nP.cascade(attenuator, {
  signal: tx
});

var ber = nP.bitErrorRate(tx, chain, {
  receptions: 50
});

nP.log('Measured BER:');
nP.log(ber);

nP.schematic({transmitter: tx, circuit: chain});
```
