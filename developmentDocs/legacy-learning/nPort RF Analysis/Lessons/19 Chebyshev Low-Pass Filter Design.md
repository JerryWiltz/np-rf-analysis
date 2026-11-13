<!-- Modified: 2026-08-17 -->

# Chebyshev Low-Pass Filter Design

nP can calculate the required number of sections, normalized prototype values,
physical L and C values, and response of a Chebyshev low-pass filter.

![[nPort RF Analysis/Lessons/Images/chebyshev-low-pass-network.svg|420]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/chebyshev-low-pass-network.svg" href="nPort RF Analysis/Lessons/Images/chebyshev-low-pass-network.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Design Sequence

1. `chebyLPNsec()` calculates the required section count.
2. `chebyLPgk()` calculates normalized prototype values.
3. `chebyLPLCs()` scales the prototype to frequency and impedance.
4. `lpfGen()` constructs the filter two-port.

This example specifies a 200 MHz passband edge, 1.5 GHz rejection frequency,
0.1 dB passband ripple, at least 30 dB rejection, and 50 Ω impedance.

## Run the Design

```npjs
var g = nP.global;
g.fList = g.fGen(
    10e6,                                   // Start frequency in hertz
    1.5e9,                                  // Stop frequency in hertz
    151,                                    // Number of frequency points
);
g.Ro = 50;

var sections = nP.chebyLPNsec(
    0.2e9, 1.5e9, 0.1, 30,                  // Maximum pass frequency in hertz
);

var prototype = nP.chebyLPgk(
    sections,                               // Number of sections
    0.1,                                    // Passband ripple in dB
);
var filterValues = nP.chebyLPLCs(
    prototype, 0.2e9, 50,                   // Low-pass prototype values
);

// lpfGen() removes the termination values from its input array.
var filter = nP.lpfGen(filterValues.slice());
var output = filter.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

console.log('sections = ' + sections);
console.log('normalized prototype = ' + prototype);
console.log('scaled filter values = ' + filterValues);

nP.lineChart({
    inputTable: [output],
    title: 'Chebyshev Low-Pass Response',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Reading the Result

`s21dB` should remain near 0 dB in the passband, show the specified ripple, and
then fall through the transition band. Near 1.5 GHz it should meet or exceed
the requested 30 dB rejection. `s11dB` shows the frequency-dependent input
match.

The `.slice()` call preserves `filterValues`; without it, `lpfGen()` removes
the first and last values with `shift()` and `pop()`.

Return to [[18 Coupled Transmission Lines|coupled transmission lines]], or
continue to [[20 1N4148 Diode Model|the 1N4148 diode model]].
