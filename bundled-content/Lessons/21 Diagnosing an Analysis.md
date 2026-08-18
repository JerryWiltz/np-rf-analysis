<!-- Modified: 2026-08-17 -->

# Diagnosing an Analysis

When an analysis gives an error or an unexpected RF result, check the code and
the circuit separately. A program can run successfully while describing the
wrong topology.

## A Reliable Check Order

1. Confirm the frequency list and reference impedance.
2. Confirm constructor spelling and capitalization.
3. Confirm values and units.
4. Confirm component port order and node numbers.
5. Confirm `['out', ...]` exposes the intended external ports.
6. Confirm every requested `sij` exists on that n-port.
7. Confirm display inputs match the display type.
8. Compare one or two frequencies with an expected checkpoint.

## Intentional Coding Error

The next block is intentionally wrong and harmless. JavaScript names are
case-sensitive, so `nP.r()` does not mean `nP.R()`.

```npjs
// Intentional error: the constructor must be uppercase R.
var resistor = nP.r(75);
console.log(resistor);
```

The error pane should report that `nP.r` is not a function. Reset the block
after reading the message.

## Corrected Analysis

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);
g.Ro = 50;

var resistor = nP.R(75);
var output = resistor.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

console.log('frequency points = ' + g.fList.length);
console.log('reference impedance = ' + g.Ro + ' ohms');
console.log('first result row = ' + output[1]);

nP.lineTable({
    inputTable: [output],
    title: 'Corrected 75 Ohm Resistor Analysis',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});
```

## Expected Corrected Result

The console should report 11 frequency points, a 50 Ω reference impedance,
and the first numeric result row. The table should then display frequency,
`s11dB`, and `s21dB` without an error pane.

## When the Code Runs but the Result Is Wrong

Check for:

- Farads entered where picofarads were intended.
- Henries entered where nanohenries were intended.
- Inches or mils passed directly to a constructor that expects meters.
- Reversed multiport component order.
- A missing shared node or two nodes accidentally given the same number.
- An `sij` selector whose excitation and response ports were reversed.
- Networks created on different frequency grids before combination.

A useful bug report includes the complete runnable block, schematic, expected
behavior, actual behavior, nPort RF Analysis version, bundled nP version, and
the full console or error message.

Return to [[20 1N4148 Diode Model|the diode model]], continue to
[[22 Creating Schematics with an Agent|creating schematics with an agent]], or
open [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the
complete API reference]].
