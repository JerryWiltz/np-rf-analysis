<!-- Modified: 2026-07-30 -->

# Matrix Operations

nP matrices support addition, subtraction, multiplication, inversion, and
equation solving. This lesson solves a small real system and demonstrates
matrix method chaining.

## The System

Solve:

$$
\begin{bmatrix}
3 & 5 & 2\\
0 & 8 & 2\\
6 & 2 & 8
\end{bmatrix}
\begin{bmatrix}x_1\\x_2\\x_3\end{bmatrix}
=
\begin{bmatrix}8\\-7\\26\end{bmatrix}
$$

The matrix form is $\boldsymbol{A}\boldsymbol{x}=\boldsymbol{b}$, so
$\boldsymbol{x}=\boldsymbol{A}^{-1}\boldsymbol{b}$.

## Run the Calculation

```npjs
var a = nP.matrix([
    [3, 5, 2],
    [0, 8, 2],
    [6, 2, 8]
]);

var b = nP.matrix([
    [8],
    [-7],
    [26]
]);

var x = a.invert().mul(b);

console.log('x1 = ' + x.m[0][0]);
console.log('x2 = ' + x.m[1][0]);
console.log('x3 = ' + x.m[2][0]);
```

## Reading the Code

`nP.matrix()` wraps a two-dimensional JavaScript array in a Matrix object.
`.invert()` returns the inverse as another Matrix, so `.mul(b)` can immediately
continue the chain. The public `.m` field exposes the resulting array.

Matrix dimensions must be compatible. Inversion requires a square,
nonsingular matrix; multiplication requires the left column count to equal the
right row count.

## Expected Result

The solution should be approximately:

$$
\boldsymbol{x}=
\begin{bmatrix}4\\-1\\0.5\end{bmatrix}
$$

Return to [[11 Complex Numbers|complex numbers]], or continue to
[[13 Ideal Transmission Lines|ideal transmission lines]].
