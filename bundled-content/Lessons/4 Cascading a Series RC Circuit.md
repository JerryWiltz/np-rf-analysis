<!-- Modified: 2026-08-17 -->

# Cascading a Series RC Circuit

This lesson analyzes a 75 Ω series resistor followed by a 1 pF series
capacitor. It introduces `nP.cascade()`, the simplest way to connect two-port
objects in a single left-to-right signal path.

## Circuit

![[nPort RF Analysis/Lessons/Images/series-rc.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rc.svg" href="nPort RF Analysis/Lessons/Images/series-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

The signal enters Port 1, passes through `R1`, then passes through `C1` before
reaching Port 2.

## What Cascade Means

To **cascade** two-ports is to connect the output of one directly to the input
of the next. The order of the arguments follows the signal path:

```javascript
nP.cascade(
    r1,                                     // First n-port
    c1,                                     // Next n-port
)
```

Here, `r1` comes first and `c1` comes second. `nP.cascade()` joins the hidden
connection between them and returns one combined two-port.

Use cascade when all of these statements are true:

- Every component being combined is a two-port.
- The components form one unbranched path.
- Their order from Port 1 to Port 2 is clear.

## Run the Analysis

1. Switch this note to **Reading view**.
2. Click **Run** above the `npjs` block.
3. Examine `s21dB` for forward transmission and `s11dB` for input reflection.

```npjs
// Analyze 11 frequencies from 1 GHz through 10 GHz.
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);
g.Ro = 50;

// Create the two separate two-port components.
var r1 = nP.R(75);
var c1 = nP.C(1e-12);

// Connect R1 followed by C1 in one left-to-right path.
var seriesRC = nP.cascade(
    r1,                                     // First n-port
    c1,                                     // Next n-port
);

// Extract the response of the completed two-port.
var lineOut = seriesRC.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);
var tableOut = seriesRC.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

nP.lineChart({
    inputTable: [lineOut],
    title: 'Series RC — Cascade Analysis',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});

nP.lineTable({
    inputTable: [tableOut],
    title: 'Series RC — Cascade Data',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});
```

## Expected Result

The chart should show transmission improving as frequency rises because the
capacitor's reactance decreases. In the table:

- At 1 GHz, `s11dB` should be about −2.57 dB and `s21dB` about −7.48 dB.
- At 10 GHz, `s11dB` should be about −7.20 dB and `s21dB` about −4.90 dB.

These values provide checkpoints for the nodal version in the next lesson.

## The Limit of Cascade

Cascade does not describe node numbers or branching. The series RC circuit does
not need either one, so cascade is a natural fit. A tee, parallel branch, or
multiport connection requires a more general connection method.

Continue to [[5 Nodal Analysis of the Series RC Circuit|nodal analysis of this
same circuit]], or return to [[3 Series RC Example|the series RC example]].
