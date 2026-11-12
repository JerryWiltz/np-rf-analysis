<!-- Generated from nP REPL example pn7-waveform; do not edit the copied code here. -->

# 43 PN7 clocked waveform

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-pn7-waveform)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// PN7 clocked waveform

var context = nP.global();
context.tList = context.tGen(0, 126e-9, 127);

var pn = nP.PN({
  stages: 7,
  time: context.tList
});

var bits = pn.out('bit string');

nP.log('PN7 bits:');
nP.log(bits);

nP.lineChart({
  inputTable: [pn.out('waveform')],
  title: 'PN7 waveform',
  xAxisTitle: 'Time (ns)',
  yAxisTitle: 'V',
  metricPrefix: 'none'
});
```
