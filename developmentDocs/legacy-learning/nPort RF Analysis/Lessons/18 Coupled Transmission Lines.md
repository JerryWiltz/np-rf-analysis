<!-- Modified: 2026-08-17 -->

# Coupled Transmission Lines

Coupled lines transfer energy between adjacent conductors. nP provides
`Tclin()` for an ideal coupled line and `mclin()` for a physical coupled
microstrip line.

Run the `npjs` block below to generate the schematic with nP.
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/coupled-microstrip-line.svg" href="nPort RF Analysis/Lessons/Images/coupled-microstrip-line.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Clockwise Port Numbering

Both constructors use this order:

```text
Port 1  ─── coupled line ─── Port 2
Port 4  ─── coupled line ─── Port 3
```

With Port 1 excited, Port 2 is the through response, Port 4 is the coupled
response, Port 3 is the isolated response, and Port 1 is the reflected
response.

## Run the Physical-Line Analysis

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    3e9,                                    // Stop frequency in hertz
    51,                                     // Number of frequency points
);
g.Ro = 50;

var mil = 0.001 * 0.0254;

var coupledLine = nP.mclin(
    19.1155 * mil,                          // Width
    5.82185 * mil,                          // Space
    25 * mil,                               // Substrate height
    0.0125 * mil,                           // Conductor thickness
    719.794 * mil,                          // Coupled length
    10,                                     // Relative permittivity
    1,                                      // Copper-resistivity multiplier
    0.001,                                  // Dielectric loss tangent
    0                                       // RMS surface roughness
);

var coupler = nP.nodal(
    [coupledLine, 1, 2, 3, 4],
    ['out', 1, 2, 3, 4]
);

nP.schematic(coupler);

var output = coupler.out(
    's21dB', 's41dB', 's11dB', 's31dB',     // Forward transmission
);

nP.lineChart({
    inputTable: [output],
    title: 'Coupled Microstrip Line',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Expected Result

The chart should contain through (`s21dB`), coupled (`s41dB`), reflected
(`s11dB`), and isolated (`s31dB`) traces. Their exact values vary with
frequency because the coupled length changes electrically.

Return to [[17 Microstrip Tee Power Divider|the power divider]], or continue to
[[19 Chebyshev Low-Pass Filter Design|Chebyshev low-pass filter design]].
