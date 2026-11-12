<!-- Generated from nP REPL example math-method-chaining; do not edit the copied code here. -->

# 20 Method chaining with math objects

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-math-method-chaining)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Method chaining with math objects

var aRows = nP.dim(10, 10, nP.complex(0, 0));
var bRows = nP.dim(10, 10, nP.complex(0, 0));

for (var row = 0; row < 10; row++) {
  aRows[row][row] = nP.complex(12 + row, 1);
  bRows[row][row] = nP.complex(3, -0.5);
  if (row < 9) {
    aRows[row][row + 1] = nP.complex(-1, 0.25);
    aRows[row + 1][row] = nP.complex(-1, 0.25);
  }
}

var matrixA = nP.matrix(aRows);
var matrixB = nP.matrix(bRows);

var inverseSum = matrixA.addCplx(matrixB).invertCplx();
var identityCheck = matrixA.addCplx(matrixB).mulCplx(inverseSum);

nP.log('Inverse of the 10 by 10 complex matrix sum:');
nP.log(inverseSum);
nP.log('Sum multiplied by its inverse:');
nP.log(identityCheck);

var realA = nP.matrix([[4, 1], [2, 3]]);
var realB = nP.matrix([[1, 0], [0, 1]]);
var realResult = realA.add(realB).invert().mul(realA);

nP.log('Real matrix chain:');
nP.log(realResult);

var z1 = nP.complex(2, 3);
var z2 = nP.complex(1, -1);
var complexResult = z1.add(z2).mul(z2).inv();

nP.log('Complex number chain:');
nP.log(complexResult);
```
