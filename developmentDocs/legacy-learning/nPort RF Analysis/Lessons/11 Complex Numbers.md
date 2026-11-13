<!-- Modified: 2026-08-17 -->

# Complex Numbers

RF impedances and S-parameters contain real and imaginary parts. nP represents
one complex value with `nP.complex(real, imaginary)`.

## Create and Read a Complex Number

```javascript
var z = nP.complex(
    3,                                      // Real part
    4,                                      // Imaginary part
);
```

This creates $z=3+j4$. The real part is `3`, the imaginary part is `4`, its
magnitude is `5`, and its angle is about `53.13°`.

## Method Chaining

Complex arithmetic methods return another complex object, so operations can be
chained:

```javascript
z1.add(z2).mul(z3)
```

This means $(z_1+z_2)z_3$. Methods such as `.mag()` and `.ang()` return ordinary
numbers and end the chain.

## Run the Calculations

```npjs
var z1 = nP.complex(
    3,                                      // Real part
    4,                                      // Imaginary part
);
var z2 = nP.complex(
    1,                                      // Real part
    -2,                                     // Imaginary part
);
var scale = nP.complex(
    2,                                      // Real part
    0,                                      // Imaginary part
);

var sum = z1.add(z2);
var chained = z1.add(z2).mul(scale);

console.log('z1 real = ' + z1.getR());
console.log('z1 imaginary = ' + z1.getI());
console.log('z1 magnitude = ' + z1.mag());
console.log('z1 angle = ' + z1.ang() + ' degrees');
console.log('z1 + z2 = ' + sum.getR() + ' + j' + sum.getI());
console.log('2(z1 + z2) = ' +
    chained.getR() + ' + j' + chained.getI());
```

## Expected Result

The console should report:

- `z1` has real part `3`, imaginary part `4`, and magnitude `5`.
- `z1 + z2` is `4 + j2`.
- The chained result `2(z1 + z2)` is `8 + j4`.

The angle may contain more decimal places than `53.13`.

Return to [[10 Understanding S-Parameters|understanding S-parameters]], or
continue to [[12 Matrix Operations|matrix operations]].
