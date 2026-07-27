<!-- Modified: 2026-07-27 -->

# Microstrip Tee Power Divider

This lesson compares an ideal Wilkinson-style power divider with a physical implementation made from microstrip Tees, microstrip lines, and a microstrip thin-film isolation resistor. Both dividers are designed for a 50 Ω system and a center frequency near 6 GHz.

The example is based on [[nP Development/mteePowerDividerDevelopment|the microstrip Tee power-divider development analysis]]. Each Tee symbol is placed using rotation only. Its ports always remain common, branch 1, and branch 2.

## Physical Circuit

![[Getting Started/Images/microstrip-tee-power-divider.svg]]

The horizontal axis through Port 1 is the line of symmetry. The upper and lower paths have the same electrical construction:

- `MT1` divides Port 1 into two branches.
- `ML1` and `ML2` are equal 10 mil wide, 190 mil long microstrip lines.
- `MT2` and `MT3` connect the lines to output Ports 2 and 3.
- `TF1` is a 100 Ω microstrip thin-film resistor between the two output Tee common ports. It improves isolation between the outputs.

In the Tee labels, `Wc` is the common-arm width, while `W1` and `W2` are the branch 1 and branch 2 widths. Branches 1 and 2 are component port identities; they are not inherently an input and an output.

The short black wires join component terminals without adding another nP component. Every circled number is an nP node used by `nP.nodal()`.

## What This Lesson Adds

Earlier lessons used ideal components such as `R()` and `Tee()`. This lesson introduces physical microstrip constructors whose behavior depends on dimensions and, for transmission structures, substrate properties:

- `mtee()` models a physical three-port microstrip junction.
- `mlin()` models a physical microstrip transmission line.
- `mtfr()` models a physical microstrip thin-film resistor.

The dimensions passed to these constructors are in meters. Multiplying inches by `0.0254` converts inches to meters. For example, `0.010 * 0.0254` is 10 mil, or 0.010 inch, expressed in meters.

## Run the Comparison

1. Switch this note to **Reading view**.
2. Click **Run** above the `npjs` block.
3. Compare the ideal and physical `s11dB` input-match traces.
4. Compare the ideal and physical `s21dB` transmission traces.

```npjs
// Analyze 51 frequencies from 1 GHz through 12 GHz.
var g = nP.global;
g.fList = g.fGen(1e9, 12e9, 51);

// Construct the ideal comparison divider.
var tee = nP.Tee();
var quarterWaveLine = nP.Tlin(70, 2.997925e8 / (4 * 6e9));
var isolationResistor = nP.R(100);

var idealDivider = nP.nodal(
    [tee, 1, 2, 3],
    [quarterWaveLine, 2, 4],
    [quarterWaveLine, 3, 5],
    [tee, 8, 4, 6],
    [tee, 9, 7, 5],
    [isolationResistor, 8, 9],
    ['out', 1, 6, 7]
);

// Construct the physical 23 mil-to-10 mil input Tee.
var mt1 = nP.mtee({
    commonWidth: 0.023 * 0.0254,
    branch1Width: 0.010 * 0.0254,
    branch2Width: 0.010 * 0.0254,
    Height: 0.025 * 0.0254,
    Thickness: 0.0000125 * 0.0254,
    er: 10,
    rho: 0,
    tand: 0
});

// Construct one 10 mil by 190 mil line object and reuse it twice.
var branchLine = nP.mlin(
    0.010 * 0.0254,
    0.025 * 0.0254,
    0.190 * 0.0254,
    0.0000125 * 0.0254,
    10,
    0,
    0
);

// MT2 has 23 mil common, 10 mil branch 1, and 23 mil branch 2 arms.
var mt2 = nP.mtee({
    commonWidth: 0.023 * 0.0254,
    branch1Width: 0.010 * 0.0254,
    branch2Width: 0.023 * 0.0254,
    Height: 0.025 * 0.0254,
    Thickness: 0.0000125 * 0.0254,
    er: 10,
    rho: 0,
    tand: 0
});

// MT3 has 23 mil common, 23 mil branch 1, and 10 mil branch 2 arms.
var mt3 = nP.mtee({
    commonWidth: 0.023 * 0.0254,
    branch1Width: 0.023 * 0.0254,
    branch2Width: 0.010 * 0.0254,
    Height: 0.025 * 0.0254,
    Thickness: 0.0000125 * 0.0254,
    er: 10,
    rho: 0,
    tand: 0
});

// A 46 mil by 23 mil film at 50 ohms per square is 100 ohms.
var thinFilmResistor = nP.mtfr({
    ohmsPerSquare: 50,
    Width: 0.023 * 0.0254,
    Length: 0.046 * 0.0254
});

var microstripDivider = nP.nodal(
    [mt1, 1, 2, 3],
    [branchLine, 2, 4],
    [branchLine, 3, 5],
    [mt2, 8, 4, 6],
    [mt3, 9, 7, 5],
    [thinFilmResistor, 8, 9],
    ['out', 1, 6, 7]
);

var idealOut = idealDivider.out('s11dB', 's21dB');
idealOut[0][1] = 'ideal s11dB';
idealOut[0][2] = 'ideal s21dB';

var microstripOut = microstripDivider.out('s11dB', 's21dB');
microstripOut[0][1] = 'microstrip s11dB';
microstripOut[0][2] = 'microstrip s21dB';

nP.lineChart({
    inputTable: [idealOut, microstripOut],
    title: 'Wilkinson Power Divider Comparison',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white'
});
```

## Reading the Nodal Connections

The input Tee uses nP's public `[common, branch 1, branch 2]` port order:

```javascript
[mt1, 1, 2, 3]
```

Node `1` is Port 1. Nodes `2` and `3` begin the equal upper and lower paths. The lines end at nodes `4` and `5`.

Rotating a Tee does not change its nP array order. Every `mtee()` connection remains `[common, branch 1, branch 2]`:

```javascript
[mt2, 8, 4, 6]
[mt3, 9, 7, 5]
```

For `MT2`, node `8` is common, node `4` is branch 1, and node `6` is branch 2. The symbol is rotated so common is down, branch 1 is left, and branch 2 is right. For `MT3`, node `9` is common, node `7` is branch 1, and node `5` is branch 2. Its symbol is rotated so common is up, branch 1 is right, and branch 2 is left.

The resistor joins only the two common arms:

```javascript
[thinFilmResistor, 8, 9]
```

The final array exposes the completed network as a three-port n-port object:

```javascript
['out', 1, 6, 7]
```

## Expected Result

The chart should show four traces: ideal and physical versions of `s11dB` and `s21dB`. Near the 6 GHz design frequency:

- `s11dB` should dip as the input match improves.
- `s21dB` should be near the approximately −3 dB equal power split.
- The physical microstrip curves should differ somewhat from the ideal curves because `mtee()`, `mlin()`, and `mtfr()` model physical dimensions.

Because the circuit is symmetric, `s31dB` should equal `s21dB` apart from numerical roundoff. This example plots only `s21dB` to keep the comparison readable.

Return to [[7 A 3 dB Attenuator|the 3 dB attenuator]], or open [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the complete API inventory]].
