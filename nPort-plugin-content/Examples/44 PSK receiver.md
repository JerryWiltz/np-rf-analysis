<!-- Generated from nP REPL example psk-receiver; do not edit the copied code here. -->

# 44 PSK receiver

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-psk-receiver)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// PSK receiver

var g = nP.global;
g.tList = g.tGen(0, 511 / 640e6, 512); // 8 bits, 64 samples per bit.
g.fList = [];

var tx = nP.mod({
  mode: 'PSK',
  carrierHz: 200e6,
  bitRate: 10e6,
  samplesPerBit: 64,
  bits: '01011010'
});

var attenuator = nP.Attn(3, 0);

var chain = nP.cascade(attenuator, {
  signal: tx
});

var rx = nP.demod(chain, {
  noise: false
});

var sentBits = tx.out('bit string');
var receivedBits = rx.out('bit string');

nP.log('Sent:');
nP.log(sentBits);

nP.log('Received:');
nP.log(receivedBits);

nP.schematic({transmitter: tx, circuit: chain, receiver: rx});
```
