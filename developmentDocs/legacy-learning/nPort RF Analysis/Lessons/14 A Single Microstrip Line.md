<!-- Modified: 2026-08-17 -->

# A Single Microstrip Line

`nP.mlin()` models a physical microstrip transmission line from its conductor
and substrate dimensions.

![[nPort RF Analysis/Lessons/Images/single-microstrip-line.svg|420]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/single-microstrip-line.svg" href="nPort RF Analysis/Lessons/Images/single-microstrip-line.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

This example uses a 23 mil wide, 500 mil long trace over a 25 mil substrate
with relative permittivity `10`.

## Run the Analysis

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    51,                                     // Number of frequency points
);
g.Ro = 50;

var mil = 0.001 * 0.0254;

var line = nP.mlin(
    23 * mil,                               // Width
    25 * mil,                               // Substrate height
    500 * mil,                              // Length
    0.0125 * mil,                           // Conductor thickness
    10,                                     // Relative permittivity
    1,                                      // Copper-resistivity multiplier
    0.001,                                  // Dielectric loss tangent
    0                                       // RMS surface roughness
);

var lineOut = line.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
var smithOut = line.out(
    's11Re',                                // Input reflection
    's11Im',                                // Input reflection
);

nP.lineChart({
    inputTable: [lineOut],
    title: 'Physical Microstrip Line',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});

nP.smithChart({
    inputTable: [smithOut],
    title: 'Microstrip Input Reflection',
    backgroundColor: 'white',
});
```

## Reading the Arguments

All physical dimensions are in meters. `mil` converts one thousandth of an
inch to meters. For `mlin()`, `rho = 1` means copper conductivity and `rho = 0`
disables conductor loss. `tand` is dielectric loss tangent.

## Expected Result

The chart should show insertion loss in `s21dB` and a frequency-dependent input
reflection in `s11dB`. The Smith chart should trace the complex input
reflection. Unlike `Tlin()`, this model calculates behavior from the physical
cross section and includes line loss.

Return to [[13 Ideal Transmission Lines|ideal transmission lines]], or continue
to [[15 Microstrip Discontinuities|microstrip discontinuities]].
