<!-- Modified: 2026-08-17 -->

# Nodal Analysis of the Series RC Circuit

This lesson analyzes the same 75 Ω resistor and 1 pF capacitor used in the
previous cascade lesson. This time, `nP.nodal()` connects the component ports by
explicitly numbered circuit nodes.

## The Same Circuit

![[nPort RF Analysis/Lessons/Images/series-rc.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rc.svg" href="nPort RF Analysis/Lessons/Images/series-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

The circuit and frequency range have not changed:

- Node `1` is external circuit Port 1 and the first port of `R1`.
- Node `2` joins the second port of `R1` to the first port of `C1`.
- Node `3` is the second port of `C1` and external circuit Port 2.

Using the same circuit makes the connection methods easy to compare. Cascade
describes the order `r1, c1`; nodal analysis describes exactly which component
ports meet at nodes `1`, `2`, and `3`.

## Reading a Nodal Connection

Each component connection is an array:

```javascript
[r1, 1, 2]
[c1, 2, 3]
```

The component object comes first. The following numbers assign its ports in
order. Therefore `[r1, 1, 2]` places resistor port 1 on node `1` and resistor
port 2 on node `2`.

The last array identifies the external ports of the completed network:

```javascript
['out', 1, 3]
```

Node `1` becomes network Port 1, and node `3` becomes network Port 2. Node `2`
remains internal.

## Run the Analysis

1. Switch this note to **Reading view**.
2. Click **Run** above the `npjs` block.
3. Compare the chart and table with the preceding cascade lesson.

```npjs
// Analyze the same 11 frequencies from 1 GHz through 10 GHz.
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);
g.Ro = 50;

// Create the same two separate two-port components.
var r1 = nP.R(75);
var c1 = nP.C(1e-12);

// Connect the component ports to the numbered circuit nodes.
var seriesRC = nP.nodal(
    [r1, 1, 2],
    [c1, 2, 3],
    ['out', 1, 3]
);

// Extract the same response quantities used in the cascade lesson.
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
    title: 'Series RC — Nodal Analysis',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});

nP.lineTable({
    inputTable: [tableOut],
    title: 'Series RC — Nodal Data',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});
```

## Expected Result

The nodal result should match the cascade result:

- At 1 GHz, `s11dB` should be about −2.57 dB and `s21dB` about −7.48 dB.
- At 10 GHz, `s11dB` should be about −7.20 dB and `s21dB` about −4.90 dB.

The two methods produce the same answer because they describe the same
components, connection order, frequency list, and 50 Ω reference impedance.
Any tiny difference far beyond the displayed decimal places is numerical
roundoff.

## Why Learn Nodal Analysis?

For this unbranched circuit, nodal analysis is more detailed than necessary.
Its advantage appears when a circuit contains branches, junctions, shunt
components, or more than two external ports. Those topologies cannot be
described by a simple left-to-right cascade.

Return to [[4 Cascading a Series RC Circuit|the cascade analysis]], or continue
to [[6 Typing in an npjs Block|the typing exercise]].
