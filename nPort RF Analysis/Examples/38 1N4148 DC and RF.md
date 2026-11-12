<!-- Generated from nP REPL example diode-dc-rf; do not edit the copied code here. -->

# 38 1N4148 DC and RF

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-diode-dc-rf)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// 1N4148 DC and RF

nP.global.fList = nP.global.fGen(1e6, 1e9, 21);

var diode = nP.diode1N4148({
  biasVoltage: 0.5
});

var rfTable = diode.out('s11dB', 's21dB');

nP.log(rfTable);

nP.lineChart({
  inputTable: [diode.ivTable(0, 0.9, 41)],
  title: '1N4148 I-V curve',
  xAxisTitle: 'Voltage (V)',
  yAxisTitle: 'Current (A)',
  metricPrefix: 'none'
});

nP.schematic(diode);
```
