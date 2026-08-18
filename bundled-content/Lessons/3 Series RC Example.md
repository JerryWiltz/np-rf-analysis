<!-- Modified: 2026-08-17 -->

# Series RC Example

This example analyzes a simple series circuit containing a 75 Ω resistor and a 1 pF capacitor. It displays the circuit response as a line chart, a Smith chart, and a table.

> [!NOTE]
> The response of this series RC network changes with frequency because the capacitor's reactance decreases as frequency increases. The plots show how that behavior affects transmission and reflection.

## Circuit

The circuit contains two components connected in series:

![[nPort RF Analysis/Lessons/Images/series-rc-seserc.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rc-seserc.svg" href="nPort RF Analysis/Lessons/Images/series-rc-seserc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

The resistor, capacitor, and their connection remain visible in the completed
two-port.

The analysis uses 11 frequency points from 1 GHz through 10 GHz.

## Reading the Constructor Name

`nP.seSeRC(75, 1e-12)`

The parts of `seSeRC` describe both levels of the topology:

| Name part | Meaning |
| --- | --- |
| `se` | Place the completed impedance in the **series path** of the two-port. |
| `Se` | Connect the individual elements **in series** with each other. |
| `RC` | Use a **resistor** followed by a **capacitor**. |

JavaScript capitalization matters. The lower-case `se` describes how the
completed impedance is placed in the two-port. The capitalized `Se` describes
how the R and C elements are combined inside that impedance.

Together, `nP.seSeRC(75, 1e-12)` means: create a two-port whose series path
contains a 75 Ω resistor and a 1 pF capacitor connected in series.

## Run the Analysis

1. Switch this note to **Reading view**.
2. Click **Run** above the JavaScript block.
3. Review the line chart, Smith chart, and table below the code.

```npjs
// Generate 11 frequency points from 1 GHz through 10 GHz.
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);

// Create one two-port containing the series-connected R and C.
var seriesRC = nP.seSeRC(
    75,                                     // Resistance in ohms
    1e-12,                                  // Capacitance in farads
);

// Extract the values needed by each display.
var lineOut = seriesRC.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);
var smithOut = seriesRC.out(
    's11Re',                                // Input reflection
    's11Im',                                // Input reflection
);
var tableOut = seriesRC.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

// Plot transmission and reflection versus frequency.
nP.lineChart({
    inputTable: [lineOut],
    title: 'Series RC Response',
    mount: '#lineChart',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});

// Plot the input reflection coefficient on a Smith chart.
nP.smithChart({
    inputTable: [smithOut],
    title: 'Input Reflection Coefficient',
    mount: '#smithChart',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});

// Display frequency, s11dB, and s21dB as a table.
nP.lineTable({
    inputTable: [tableOut],
    title: 'Series RC Data',
    mount: '#lineTable',
    metricPrefix: 'giga',
    backgroundColor: 'white',
});
```

## Reading the Results

- The line chart shows `s21dB` and `s11dB` from 1 GHz through 10 GHz.
- The Smith chart shows the real and imaginary parts of `s11`.
- The table lists frequency, `s11dB`, and `s21dB` for all 11 frequency points.

`nP.seSeRC(75, 1e-12)` is a convenient constructor for this complete
series-RC two-port. Later lessons rebuild the same circuit from separate
`R()` and `C()` objects, first with [[4 Cascading a Series RC Circuit|cascade]]
and then with [[5 Nodal Analysis of the Series RC Circuit|nodal analysis]].

Click **Reset** to clear the displayed results.

Return to [[2 Understanding an npjs Pane|Understanding an npjs Pane]], or continue to [[4 Cascading a Series RC Circuit|the cascade lesson]].
