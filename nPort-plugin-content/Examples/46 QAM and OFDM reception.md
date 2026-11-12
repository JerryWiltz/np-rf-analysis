<!-- Generated from nP REPL example qam-ofdm; do not edit the copied code here. -->

# 46 QAM and OFDM reception

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-qam-ofdm)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// QAM and OFDM reception

var g = nP.global;
g.tList = g.tGen(0, 1279 / 640e6, 1280); // Four data symbols and one QAM pilot.
g.fList = [];

var qam = nP.mod({
  mode: 'QAM',
  order: 16,
  carrierHz: 200e6,
  bitRate: 10e6,
  samplesPerBit: 64,
  bits: '1010011010110010'
});

var qamThru = nP.Thru();
var qamChain = nP.cascade(qamThru, {
  signal: qam
});
var qamRx = nP.demod(qamChain, {
  noise: false
});

var qamBits = qamRx.out('bit string');

nP.log('QAM bits:');
nP.log(qamBits);

g.tList = g.tGen(0, 127 / 640e6, 128); // One 128-sample OFDM block.
g.fList = [];

var ofdm = nP.mod({
  mode: 'OFDM',
  carrierHz: 200e6,
  subcarrierCount: 8,
  fftSize: 128,
  symbolRate: 5e6,
  bits: '1010011010110010'
});

var ofdmThru = nP.Thru();
var ofdmChain = nP.cascade(ofdmThru, {
  signal: ofdm
});
var ofdmRx = nP.demod(ofdmChain, {
  noise: false
});

var ofdmBits = ofdmRx.out('bit string');

nP.log('OFDM bits:');
nP.log(ofdmBits);

nP.schematic({transmitter: qam, circuit: qamChain, receiver: qamRx});
nP.schematic({transmitter: ofdm, circuit: ofdmChain, receiver: ofdmRx});
```
