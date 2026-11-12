<!-- Generated from nP REPL example line-table; do not edit the copied code here. -->

# 17 Line table

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-line-table)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Line table

nP.global.fList = nP.global.fGen(1e9, 3e9, 11);

var line = nP.Tlin(60, 0.0254);

var table = line.out('s11dB', 's21dB');

nP.lineTable({
  inputTable: [table],
  title: 'Transmission line data'
});

nP.schematic(line);
```
