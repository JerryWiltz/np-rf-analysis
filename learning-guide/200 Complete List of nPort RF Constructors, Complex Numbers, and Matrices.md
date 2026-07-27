<!-- Modified: 2026-07-27 -->

# Complete List of nPort RF Constructors, Complex Numbers, and Matrices

This reference lists the public nP RF constructors and the complex-number and matrix APIs available in nPort RF Analysis.

## Version Covered

This list applies to:

- **nP library:** `0.0.47`
- **nPort RF Analysis Obsidian plugin:** `0.3.0`
- **Reference updated:** 2026-07-19

The two version numbers are independent. The plugin has its own release version and bundles a particular version of the nP library.

Display the bundled nP version in the console pane with:

```npjs
console.log("nP version " + nP.version);
```

Expected console output:

```text
[log] nP version 0.0.47
```

When nP gains or changes a public constructor, update both the version statement and this inventory.

## Constructor Conventions

Set the frequency list before calling an RF constructor:

```javascript
var g = nP.global;
g.fList = g.fGen(1e9, 10e9, 11);
```

Unless stated otherwise:

- Resistance is in ohms.
- Inductance is in henries.
- Capacitance is in farads.
- Frequency is in hertz.
- Physical dimensions are in meters.
- Constructors use `nP.global.fList`, `nP.global.Ro`, and, when applicable, `nP.global.Temp`.
- RF constructors return n-port objects containing S-parameters for every active frequency.

## Basic RLC Constructors

The uppercase short names are the preferred constructors for ordinary explicit circuit descriptions.

| Constructor | Default | Description                                                           |
| ----------- | ------: | --------------------------------------------------------------------- |
| `nP.R(R)`   |    `75` | Two-port series resistor.                                             |
| `nP.L(L)`   |  `5e-9` | Two-port series inductor.                                             |
| `nP.C(C)`   | `1e-12` | Two-port series capacitor.                                            |
| `nP.seR(R)` |    `75` | Explicitly named two-port series resistor; equivalent role to `R()`.  |
| `nP.seL(L)` |  `5e-9` | Explicitly named two-port series inductor; equivalent role to `L()`.  |
| `nP.seC(C)` | `1e-12` | Explicitly named two-port series capacitor; equivalent role to `C()`. |
| `nP.paR(R)` |    `75` | Two-port shunt resistor.                                              |
| `nP.paL(L)` |  `5e-9` | Two-port shunt inductor.                                              |
| `nP.paC(C)` | `1e-12` | Two-port shunt capacitor.                                             |

Example:

```javascript
var r1 = nP.R(75);
var l1 = nP.L(5e-9);
var c1 = nP.C(1e-12);
```

### Basic RLC Symbols

This visual catalog uses the preferred explicit constructors.

| Constructor | Canonical symbol |
| --- | --- |
| `nP.R()` | ![[Getting Started/Images/resistor.svg\|240]] |
| `nP.L()` | ![[Getting Started/Images/inductor.svg\|240]] |
| `nP.C()` | ![[Getting Started/Images/capacitor.svg\|240]] |

## Combined RLC Constructors

The combined-constructor names contain two topology prefixes:

- The first `se` or `pa` says whether the completed equivalent impedance is placed in the two-port's **series path** or as a **shunt branch**.
- The second `Se` or `Pa` says whether the R, L, and C elements are internally combined in **series** or **parallel**.

For example, `sePaRC()` places a parallel-RC equivalent impedance in the two-port's series path. `paSeRC()` places a series-RC branch in shunt.

### Internally Series Elements

| Constructor | Signature | Description |
| --- | --- | --- |
| `nP.seSeRL()` | `(R = 75, L = 5e-9)` | Series-RL impedance in the two-port series path. |
| `nP.paSeRL()` | `(R = 75, L = 5e-9)` | Series-RL impedance as a shunt branch. |
| `nP.seSeRC()` | `(R = 75, C = 1e-12)` | Series-RC impedance in the two-port series path. |
| `nP.paSeRC()` | `(R = 75, C = 1e-12)` | Series-RC impedance as a shunt branch. |
| `nP.seSeLC()` | `(L = 5e-9, C = 1e-12)` | Series-LC impedance in the two-port series path. |
| `nP.paSeLC()` | `(L = 5e-9, C = 1e-12)` | Series-LC impedance as a shunt branch. |
| `nP.seSeRLC()` | `(R = 75, L = 5e-9, C = 1e-12)` | Series-RLC impedance in the two-port series path. |
| `nP.paSeRLC()` | `(R = 75, L = 5e-9, C = 1e-12)` | Series-RLC impedance as a shunt branch. |

### Internally Parallel Elements

| Constructor | Signature | Description |
| --- | --- | --- |
| `nP.sePaRL()` | `(R = 75, L = 5e-9)` | Parallel-RL impedance in the two-port series path. |
| `nP.paPaRL()` | `(R = 75, L = 5e-9)` | Parallel-RL impedance as a shunt branch. |
| `nP.sePaRC()` | `(R = 75, C = 1e-12)` | Parallel-RC impedance in the two-port series path. |
| `nP.paPaRC()` | `(R = 75, C = 1e-12)` | Parallel-RC impedance as a shunt branch. |
| `nP.sePaLC()` | `(L = 5e-9, C = 1e-12)` | Parallel-LC impedance in the two-port series path. |
| `nP.paPaLC()` | `(L = 5e-9, C = 1e-12)` | Parallel-LC impedance as a shunt branch. |
| `nP.sePaRLC()` | `(R = 75, L = 5e-9, C = 1e-12)` | Parallel-RLC impedance in the two-port series path. |
| `nP.paPaRLC()` | `(R = 75, L = 5e-9, C = 1e-12)` | Parallel-RLC impedance as a shunt branch. |

For instructional circuits and arbitrary topologies, explicit `R()`, `L()`, and `C()` components connected with `nP.nodal()` usually make the circuit easier to read.

The combined RLC constructors intentionally have no symbol-library entries. Their internal combinations are clearer when drawn and coded as explicit components connected with `nP.nodal()`.

## Transformer Constructors

| Constructor | Signature | Description |
| --- | --- | --- |
| `nP.trf()` | `(N = 0.5)` | Ideal two-port transformer model. |
| `nP.trf4Port()` | `(N = 0.5)` | Ideal four-port transformer model. |

`N` is the transformer turns-ratio parameter used by the model.

| Constructors | Canonical symbol |
| --- | --- |
| `nP.trf()` | ![[Getting Started/Images/transformer.svg\|240]] |
| `nP.trf4Port()` | ![[Getting Started/Images/transformer-four-port.svg\|240]] |

For `trf4Port()`, ports 1 and 3 are the primary pair and ports 2 and 4 are the secondary pair.

## Ideal Components and Junctions

Ideal component names begin with an uppercase letter.

| Constructor | Signature | Ports | Description |
| --- | --- | ---: | --- |
| `nP.Open()` | `()` | 1 | Ideal open circuit. |
| `nP.Short()` | `()` | 1 | Ideal short circuit. |
| `nP.Load()` | `()` | 1 | Ideal matched load. |
| `nP.Shift90()` | `()` | 2 | Matched lossless two-port with +90° through phase. |
| `nP.Tee()` | `()` | 3 | Ideal three-port junction. |
| `nP.Tee4()` | `()` | 4 | Ideal four-port junction. |
| `nP.Tee5()` | `()` | 5 | Ideal five-port junction. |
| `nP.Tlin()` | `(Z = 60, Length = 0.0127)` | 2 | Ideal lossless transmission line. |
| `nP.Tclin()` | `(Zoe = 100, Zoo = 30, Length = 0.037338)` | 4 | Ideal lossless coupled transmission line. |

For `Tlin()`, `Z` is characteristic impedance and `Length` is physical length. For `Tclin()`, `Zoe` and `Zoo` are the even- and odd-mode impedances.

| Constructor | Canonical symbol |
| --- | --- |
| `nP.Open()` | ![[Getting Started/Images/open.svg\|240]] |
| `nP.Short()` | ![[Getting Started/Images/short.svg\|240]] |
| `nP.Load()` | ![[Getting Started/Images/load.svg\|240]] |
| `nP.Shift90()` | ![[Getting Started/Images/shift-90.svg\|240]] |
| `nP.Tee()` | ![[Getting Started/Images/tee.svg\|240]] |
| `nP.Tee4()` | ![[Getting Started/Images/tee4.svg\|240]] |
| `nP.Tee5()` | ![[Getting Started/Images/tee5.svg\|240]] |
| `nP.Tlin()` | ![[Getting Started/Images/transmission-line.svg\|240]] |
| `nP.Tclin()` | ![[Getting Started/Images/coupled-transmission-line.svg\|240]] |

Coupled-line ports are numbered clockwise:

```text
port 1  ─── coupled line ─── port 2
port 4  ─── coupled line ─── port 3
```

## Physical Transmission-Media Constructors

Physical transmission-media constructors are organized by their modeling family. The current library provides the microstrip `mlin` family. Future stripline, coaxial, and waveguide families can be added here as peer sections without being grouped under a JavaScript argument style.

### Microstrip: the `mlin` Constructor Family

All current microstrip component implementations belong to the `mlin` source family. Their public constructor names are lowercase, and physical dimensions are in meters.

#### Positional-Argument Constructors

```javascript
nP.mlin(Width, Height, Length, Thickness, er, rho, tand, roughnessRms)
```

Creates a physical two-port microstrip transmission line.

```javascript
nP.mclin(Width, Space, Height, Thickness, Length, er, rho, tand, roughnessRms)
```

Creates a physical four-port coupled microstrip line. It uses the same clockwise port convention as `Tclin()`.

#### Options-Object Constructors

`nP.mtee(options)` creates a physical three-port microstrip tee. Its options are:

```text
commonWidth, branch1Width, branch2Width, Height, Thickness,
er, rho, tand, roughnessRms
```

Port 1 is the common arm, port 2 is branch 1, and port 3 is branch 2.

`nP.mcross(options)` creates a physical four-port microstrip cross. Its options are:

```text
leftWidth, topWidth, rightWidth, bottomWidth, Height, Thickness,
er, rho, tand, roughnessRms
```

`nP.mstep(options)` creates a two-port microstrip width step. Its options are:

```text
width1, width2, Height, Thickness, er, rho, tand, roughnessRms
```

`nP.mbend(options)` creates a two-port microstrip bend. Its options are:

```text
Width, miterLength, Height, Thickness, er, rho, tand, roughnessRms
```

`nP.mtfr(options)` creates a distributed thin-film resistor. Its options are:

```text
ohmsPerSquare, Width, Length, Height, Thickness, er, tand,
temperatureCoefficient, temperatureReference, sections
```

`nP.mvgnd(options)` creates a one-port via-to-ground model. Its options are:

```text
Diameter, Height, Thickness, rho
```

`nP.mvia(options)` creates a two-port via transition with optional pads, antipads, and stubs. Its options are:

```text
Diameter, connectionHeight, Thickness, rho, er,
padDiameter, antipadDiameter, topPadHeight, bottomPadHeight,
topStubLength, bottomStubLength
```

#### `mlin` Family Symbols

| Constructor | Canonical symbol |
| --- | --- |
| `nP.mlin()` | ![[Getting Started/Images/microstrip-line.svg\|240]] |
| `nP.mclin()` | ![[Getting Started/Images/microstrip-coupled-line.svg\|240]] |
| `nP.mtee()` | ![[Getting Started/Images/microstrip-tee.svg\|240]] |
| `nP.mcross()` | ![[Getting Started/Images/microstrip-cross.svg\|240]] |
| `nP.mstep()` | ![[Getting Started/Images/microstrip-step.svg\|240]] |
| `nP.mbend()` right turn | ![[Getting Started/Images/microstrip-right-bend.svg\|240]] |
| `nP.mbend()` left turn | ![[Getting Started/Images/microstrip-left-bend.svg\|240]] |
| `nP.mtfr()` | ![[Getting Started/Images/microstrip-thin-film-resistor.svg\|240]] |
| `nP.mvgnd()` | ![[Getting Started/Images/microstrip-via-to-ground.svg\|240]] |
| `nP.mvia()` | ![[Getting Started/Images/microstrip-via-transition.svg\|240]] |

## Diode Constructor

`nP.diode1N4148(options)` creates a small-signal RF two-port model with Shockley DC I-V behavior.

Its options are:

```text
is, n, rs, cj0, vj, m, tt, leakageResistance,
breakdownVoltage, breakdownCurrent, breakdownSoftness,
biasVoltage, temperatureK, ivStart, ivStop, ivPoints
```

The returned object is an n-port and also provides:

- `.diode` for model parameters, bias results, and model provenance.
- `.ivTable(start, stop, points)` for a DC voltage/current table.

![[Getting Started/Images/diode-1n4148.svg|240]]

## Low-Pass Network Constructor

```javascript
nP.lpfGen(filt)
```

Creates a low-pass n-port from an alternating termination/component value array. New instructional examples should normally show the individual components and their `nP.nodal()` connections when circuit topology matters.

Because `lpfGen()` synthesizes a complete network rather than one primitive component, its library drawing is a labeled network block:

![[Getting Started/Images/low-pass-network.svg|240]]

## Connecting n-Port Objects

These functions combine objects returned by the constructors:

| Function | Purpose |
| --- | --- |
| `nP.nodal(...connections)` | Connects arbitrary n-port objects by numbered nodes and declares external ports with `['out', ...]`. |
| `nP.cascade(...nPorts)` | Cascades two-port objects in order. |

Every returned n-port also supports `.cas(nextTwoPort)` for a chained two-port cascade.

## Methods on Returned n-Port Objects

The public constructors return objects with these fields and methods:

| Member | Purpose |
| --- | --- |
| `.spars` | S-parameter rows shaped as `[frequency, s11, s12, s21, s22, ...]`. |
| `.global` | The analysis settings associated with the object. |
| `.setspars(rows)` | Sets the S-parameter rows. |
| `.getspars()` | Returns the S-parameter rows. |
| `.setglobal(settings)` | Associates global settings with the object. |
| `.getglobal()` | Returns the associated global settings. |
| `.cas(nextTwoPort)` | Cascades this two-port with another two-port. |
| `.out(...selections)` | Returns a numeric display table. |
| `.outTable(...selections)` | Returns the same general numeric output-table shape. |

Valid `.out()` suffixes are `mag`, `dB`, `ang`, `Re`, and `Im`:

```javascript
var table = network.out(
    's11dB',
    's21dB',
    's11Re',
    's11Im'
);
```

The internal base constructor is not exported as `nP.nPort()`. Users create n-port objects through the public RF constructors listed above.

## Complex Numbers

Create a complex number with:

```javascript
var z = nP.complex(real, imaginary);
```

Example:

```javascript
var z1 = nP.complex(3, 4);
```

The real and imaginary values are available as public numeric fields `.x` and `.y`.

### Complex Accessors and Mutators

| Method | Purpose |
| --- | --- |
| `.set(real, imaginary)` | Mutates both parts and returns the same object. Normally used internally by `nP.complex()`. |
| `.getR()` | Returns the real part. |
| `.getI()` | Returns the imaginary part. |
| `.setR(value)` | Mutates the real part and returns the same object. |
| `.setI(value)` | Mutates the imaginary part and returns the same object. |

### Complex Arithmetic

These methods return new complex objects rather than changing the original value:

| Method | Purpose |
| --- | --- |
| `.add(z)` | Addition. |
| `.sub(z)` | Subtraction. |
| `.mul(z)` | Multiplication. |
| `.div(z)` | Division. |
| `.inv()` | Multiplicative inverse. |
| `.neg()` | Additive inverse. |
| `.copy()` | Independent copy. |

### Complex Magnitude, Angle, and Hyperbolic Functions

| Method | Purpose |
| --- | --- |
| `.mag()` | Magnitude. |
| `.ang()` | Phase angle in degrees. |
| `.mag10dB()` | `10 log10` of the magnitude. |
| `.mag20dB()` | `20 log10` of the magnitude. |
| `.sinhCplx()` | Complex hyperbolic sine. |
| `.coshCplx()` | Complex hyperbolic cosine. |

Example:

```npjs
var z1 = nP.complex(3, 4);
var z2 = nP.complex(1, -2);

console.log("magnitude = " + z1.mag());
console.log("angle = " + z1.ang());
console.log(z1.add(z2));
```

## Matrices

Create a matrix from a two-dimensional JavaScript array:

```javascript
var a = nP.matrix([
    [1, 2],
    [3, 4]
]);
```

The two-dimensional array is available in the public `.m` field.

### Matrix Construction Helpers

| Function or method | Purpose |
| --- | --- |
| `nP.matrix(array2d)` | Creates a matrix object from a two-dimensional array. |
| `nP.dim(rows, cols, initial)` | Creates a two-dimensional array filled with an initial value. |
| `nP.dup(array2d)` | Duplicates the row arrays of a two-dimensional array. |
| `.set(array2d)` | Replaces `.m` and returns the same matrix object. Normally used internally by `nP.matrix()`. |
| `.dimension(rows, cols, initial)` | Creates a matrix object with the requested dimensions. |
| `.copyMatrix()` | Returns a copied matrix object. |

### Real Matrix Methods

Use these when every entry is a JavaScript number:

| Method | Purpose |
| --- | --- |
| `.add(matrixB)` | Matrix addition. |
| `.sub(matrixB)` | Matrix subtraction. |
| `.mul(matrixB)` | Matrix multiplication. |
| `.solveGaussFB()` | Gaussian forward-elimination/back-substitution solver for an augmented matrix. |
| `.invert()` | Matrix inverse. |

### Complex Matrix Methods

Use these when the entries are `nP.complex()` objects:

| Method | Purpose |
| --- | --- |
| `.addCplx(matrixB)` | Complex matrix addition. |
| `.subCplx(matrixB)` | Complex matrix subtraction. |
| `.mulCplx(matrixB)` | Complex matrix multiplication. |
| `.solveGaussFBCplx()` | Complex Gaussian forward-elimination/back-substitution solver. |
| `.invertCplx()` | Complex matrix inverse. |

The solving and inversion methods operate on duplicated data and return new matrix objects. They do not intentionally overwrite the caller's matrix.

Example:

```npjs
var a = nP.matrix([
    [1, 2],
    [3, 4]
]);

var inverse = a.invert();

console.log(inverse.m);
```

## Related Public APIs

The same nP `0.0.47` bundle also exports:

- Global settings: `nP.global`, including `fList`, `Ro`, `Temp`, and `fGen()`.
- Displays: `nP.lineChart()`, `nP.lineTable()`, and `nP.smithChart()`.
- Logging: `nP.log()`.
- Chebyshev helpers: `nP.chebyLPgk()`, `nP.chebyLPLCs()`, and `nP.chebyLPNsec()`.
- Version: `nP.version`.

The bundle contains older browser-page support helpers as well, but they are not the RF constructor, complex-number, or matrix APIs documented by this note. In Obsidian, use the `npjs` block controls instead of older page-level run helpers.

Return to [[6 Display Input Objects|display input objects]].
