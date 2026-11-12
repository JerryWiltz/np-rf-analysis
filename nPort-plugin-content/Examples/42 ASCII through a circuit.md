<!-- Generated from nP REPL example ascii-through-circuit; do not edit the copied code here. -->

# 42 ASCII through a circuit

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-ascii-through-circuit)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// ASCII through a circuit

var context = nP.global();
context.tList = context.tGen(0, 319 / 8e9, 320); // 40 bits, 8 samples per bit.
context.fList = [];

var tx = nP.mod({
  mode: 'ASCII',
  message: 'hello'
});

var attenuator = nP.Attn(3);

var chain = nP.cascade(attenuator, {
  signal: tx
});

var rx = nP.demod(chain, {
  noise: false
});

var receivedText = rx.out('ASCII text');

nP.log('Received:');
nP.log(receivedText);

nP.lineChart({
  inputTable: [rx.out('waveform')],
  title: 'Received waveform',
  xAxisTitle: 'Time (ns)',
  yAxisTitle: 'V',
  metricPrefix: 'none'
});

nP.schematic({transmitter: tx, circuit: chain, receiver: rx});
```
