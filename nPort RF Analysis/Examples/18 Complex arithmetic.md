<!-- Generated from nP REPL example complex-arithmetic; do not edit the copied code here. -->

# 18 Complex arithmetic

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-complex-arithmetic)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Complex arithmetic

var a = nP.complex(3, 4);
var b = nP.complex(2, -1);

var product = a.mul(b);
var quotient = a.div(b);
var magnitude = a.mag();
var angle = a.ang();

nP.log(product);

nP.log(quotient);

nP.log(magnitude);

nP.log(angle);
```
