<!-- Modified: 2026-08-17 -->

# Understanding S-Parameters

S-parameters describe how RF waves enter, reflect from, and pass through an
n-port. This lesson uses a 75 Ω series resistor as a simple two-port and shows
how to read the two digits in an S-parameter name.

## Reading `sij`

In `sij`, the second digit `j` is the excited port and the first digit `i` is
the response port.

| S-parameter | Meaning in a two-port |
| --- | --- |
| `s11` | Reflection measured at Port 1 when Port 1 is excited. |
| `s21` | Forward transmission measured at Port 2 when Port 1 is excited. |
| `s12` | Reverse transmission measured at Port 1 when Port 2 is excited. |
| `s22` | Reflection measured at Port 2 when Port 2 is excited. |

The order is **response first, excitation second**. Therefore `s21` means
“response at Port 2 from excitation at Port 1.”

## Magnitude, Decibels, and Phase

An S-parameter is complex. nP can return several views of the same value:

| Selector | Returned quantity |
| --- | --- |
| `s11mag` | Linear magnitude. |
| `s11dB` | Magnitude in decibels. |
| `s11ang` | Phase angle in degrees. |
| `s11Re`, `s11Im` | Real and imaginary parts. |

For voltage-wave magnitude, decibels are calculated as
$20\log_{10}|s_{ij}|$.

## Run the Analysis

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
    's11mag', 's11dB', 's11ang',            // Input reflection
    's21mag', 's21dB', 's21ang',            // Forward transmission
);

nP.lineTable({
    inputTable: [output],
    title: 'S-Parameters of a 75 Ohm Series Resistor',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});
```

## Expected Result

An ideal resistor is not frequency dependent, so every row should contain the
same S-parameter values. The 75 Ω series resistor is not matched to the 50 Ω
system, so `s11mag` is not zero. Its loss also makes `s21mag` less than one.

Return to [[9 A 3 dB Attenuator|the 3 dB attenuator]], or continue to
[[11 Complex Numbers|complex numbers]].
