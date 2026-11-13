<!-- Modified: 2026-08-18 -->

# Multiport Networks

A multiport has more than two external ports. It cannot be placed in a
two-port cascade, but `nP.nodal()` can expose any required set of external
nodes.

Run the `npjs` block below to generate the schematic with nP.
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/microstrip-tee-three-port.svg" href="nPort RF Analysis/Lessons/Images/microstrip-tee-three-port.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

This lesson analyzes one physical microstrip tee as a three-port.

## Tee Port Order

For `nP.mtee()`:

- Port 1 is the common arm.
- Port 2 is branch 1.
- Port 3 is branch 2.

The nodal array must preserve that constructor order.

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

var tee = nP.mtee(
    23 * mil,                               // Port 1 common-arm width
    23 * mil,                               // Port 2 branch width
    23 * mil,                               // Port 3 branch width
    25 * mil,                               // Substrate height
    0.0125 * mil,                           // Conductor thickness
    10,                                     // Relative permittivity
    1,                                      // Copper resistivity multiplier
    0.001,                                  // Dielectric loss tangent
    0,                                      // RMS conductor roughness
);

var threePort = nP.nodal(
    [tee, 1, 2, 3],
    ['out', 1, 2, 3]
);

nP.schematic(threePort);

var output = threePort.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
    's31dB',                                // Response at port 3 from excitation at port 1
);

nP.lineChart({
    inputTable: [output],
    title: 'Physical Microstrip Tee',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Reading the Result

`s11dB` is reflection at the common port. `s21dB` and `s31dB` are transmission
from the common port into branches 1 and 2. Equal branch widths make the two
transmission traces equal apart from numerical roundoff.

The completed object is a three-port because `['out', 1, 2, 3]` exposes three
nodes. It cannot be passed to `.cas()` or `nP.cascade()`.

Return to [[15 Microstrip Discontinuities|microstrip discontinuities]], or
continue to [[17 Microstrip Tee Power Divider|the microstrip Tee power
divider]].
