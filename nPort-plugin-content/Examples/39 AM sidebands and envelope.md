<!-- Generated from nP REPL example am-envelope; do not edit the copied code here. -->

# 39 AM sidebands and envelope

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-am-envelope)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// AM sidebands and envelope

var g = nP.global;
g.tList = g.tGen(0, 1e-3, 2);
g.fList = [];

var tx = nP.mod({
  mode: 'AM',
  carrierHz: 200e6,
  toneHz: 300,
  modulationIndex: 0.5
});

var attenuator = nP.Attn(3);

var chain = nP.cascade(attenuator, {
  signal: tx
});

var rx = nP.demod(chain, {
  noise: false
});

var tones = tx.out('tones');

nP.log(tones);
nP.lineChart({
  inputTable: [rx.out('envelope')],
  title: 'AM envelope',
  xAxisTitle: 'Time (ms)',
  yAxisTitle: 'V',
  metricPrefix: 'milli'
});

nP.schematic({transmitter: tx, circuit: chain, receiver: rx});
```
