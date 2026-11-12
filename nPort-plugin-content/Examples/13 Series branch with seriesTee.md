<!-- Generated from nP REPL example series-stub; do not edit the copied code here. -->

# 13 Series branch with seriesTee

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-series-stub)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Series branch with seriesTee

nP.global.fList = nP.global.fGen(1e9, 3e9, 21);

var line = nP.Tlin(50, 0.0254);
var seriesJunction = nP.seriesTee();
var open = nP.Open();

var network = nP.nodal(
  [seriesJunction, 1, 2, 3],
  [line, 3, 4],
  [open, 4],
  ['out', 1, 2]
);

nP.lineChart({
  inputTable: [network.out('s11dB', 's21dB')],
  title: 'Open series stub'
});

nP.schematic(network);
```
