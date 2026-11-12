<!-- Generated from nP REPL example matrix-arithmetic; do not edit the copied code here. -->

# 19 Matrix arithmetic

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-matrix-arithmetic)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Matrix arithmetic

var m1 = nP.matrix([[1, 2], [3, 4]]);
var m2 = nP.matrix([[4, 3], [2, 1]]);

var sum = m1.add(m2).m;
var product = m1.mul(m2).m;

nP.log(sum);

nP.log(product);
```
