<!-- Modified: 2026-08-17 -->

# Ideal Transmission Lines

`nP.Tlin(Z, Length)` creates a lossless two-port transmission line with
characteristic impedance `Z` in ohms and physical `Length` in meters.

![[nPort RF Analysis/Lessons/Images/ideal-transmission-line-comparison.svg|420]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/ideal-transmission-line-comparison.svg" href="nPort RF Analysis/Lessons/Images/ideal-transmission-line-comparison.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

This lesson compares a 50 Ω line with a 75 Ω line. Both are 25 mm long in a
50 Ω reference system.

## Run the Comparison

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    51,                                     // Number of frequency points
);
g.Ro = 50;

var matchedLine = nP.Tlin(
    50,                                     // Characteristic impedance in ohms
    0.025,                                  // Physical length in meters
);
var mismatchedLine = nP.Tlin(
    75,                                     // Characteristic impedance in ohms
    0.025,                                  // Physical length in meters
);

var matchedOut = matchedLine.out(
    's11mag',                               // Input reflection
    's21mag',                               // Forward transmission
);
matchedOut[0][1] = '50 ohm s11mag';
matchedOut[0][2] = '50 ohm s21mag';

var mismatchedOut = mismatchedLine.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
mismatchedOut[0][1] = '75 ohm s11dB';
mismatchedOut[0][2] = '75 ohm s21dB';

nP.lineTable({
    inputTable: [matchedOut],
    title: 'Matched 50 Ohm Ideal Line',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});

nP.lineChart({
    inputTable: [mismatchedOut],
    title: 'Mismatched 75 Ohm Ideal Line',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Expected Result

The lossless 50 Ω line is matched to `g.Ro = 50`, so the table should show
`s11mag = 0` and `s21mag = 1`. Expressing zero reflection in decibels would
produce negative infinity, so the matched-line table deliberately uses linear
magnitude. The 75 Ω line is lossless but mismatched, so its reflection and
transmission vary with electrical length as frequency changes.

An ideal line has physical length but no substrate width, dielectric loss,
conductor loss, or surface roughness. The next lesson adds those physical
properties.

Return to [[12 Matrix Operations|matrix operations]], or continue to
[[14 A Single Microstrip Line|a single microstrip line]].
