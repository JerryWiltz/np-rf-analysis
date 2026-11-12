<!-- Generated from nP REPL example method-chaining-nport; do not edit the copied code here. -->

# 06 Method chaining in nPort

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-method-chaining-nport)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Method chaining in nPort

nP.global.fList = nP.global.fGen(1e9, 5e9, 21);

var line1 = nP.Tlin(50, 0.01);
var attenuator1 = nP.Attn(3);
var line2 = nP.Tlin(60, 0.02);
var attenuator2 = nP.Attn(6);
var line3 = nP.Tlin(50, 0.01);

var chain = line1
  .cas(attenuator1)
  .cas(line2)
  .cas(attenuator2)
  .cas(line3);

var response = chain.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [response],
  title: 'Five cascaded two-ports',
  metricPrefix: 'giga',
  showPoints: false
});

nP.schematic(chain);
```
