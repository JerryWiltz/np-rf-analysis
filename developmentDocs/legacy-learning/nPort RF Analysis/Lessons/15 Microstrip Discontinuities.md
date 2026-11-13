<!-- Modified: 2026-08-18 -->

# Microstrip Discontinuities

A physical layout changes behavior where a trace changes width, bends, tees,
or crosses another trace. nP provides discontinuity constructors for those
local structures.

Run the `npjs` block below to generate the schematic with nP.
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/microstrip-step-and-bend.svg" href="nPort RF Analysis/Lessons/Images/microstrip-step-and-bend.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

This lesson cascades a width step and a right-angle bend. Both are two-ports,
so their order can be expressed with `nP.cascade()`.

## Run the Analysis

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    12e9,                                   // Stop frequency in hertz
    51,                                     // Number of frequency points
);
g.Ro = 50;

// nP physical dimensions are in meters.
var mil = 0.001 * 0.0254;                   // 1 mil = 25.4 µm

var step = nP.mstep({
    width1: 46 * mil,
    width2: 23 * mil,
    Height: 25 * mil,
    Thickness: 0.0125 * mil,
    er: 10,
    rho: 1,
    tand: 0.001,
    roughnessRms: 0,
});

var bend = nP.mbend({
    Width: 23 * mil,
    miterLength: 0,
    Height: 25 * mil,
    Thickness: 0.0125 * mil,
    er: 10,
    rho: 1,
    tand: 0.001,
    roughnessRms: 0,
});

var discontinuities = nP.cascade(
    step,                                   // First n-port
    bend,                                   // Next n-port
);

nP.schematic(discontinuities);
var output = discontinuities.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

nP.lineChart({
    inputTable: [output],
    title: 'Microstrip Step and Bend',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Expected Result

The chart should contain `s11dB` and `s21dB` traces from 1 GHz through 12 GHz.
The response changes with frequency because the width step and bend introduce
frequency-dependent discontinuity reactance even though neither component has
a finite transmission-line length.

## What the Models Include

`mstep()` calculates a width-change discontinuity. `mbend()` calculates a bend
with an optional miter. Their `rho`, `tand`, and `roughnessRms` values are
retained as metadata in nP 0.0.48, but these local discontinuity models do not
add conductor, dielectric, or roughness loss themselves. Connected `mlin()`
sections model their own finite-length loss.

Return to [[14 A Single Microstrip Line|a single microstrip line]], or continue
to [[16 Multiport Networks|multiport networks]].
