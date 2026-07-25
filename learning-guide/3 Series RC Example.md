<!-- Modified: 2026-07-25 -->

# Series RC Example

This example analyzes a simple series circuit containing a 75 Ω resistor and a 1 pF capacitor. It displays the circuit response as a line chart, a Smith chart, and a table.

> [!NOTE]
> The response of this series RC network changes with frequency because the capacitor's reactance decreases as frequency increases. The plots show how that behavior affects transmission and reflection.

## Circuit

The circuit contains two components connected in series:

![[Getting Started/Images/series-rc.svg]]

The analysis uses 11 frequency points from 1 GHz through 10 GHz.

## Run the Analysis

1. Switch this note to **Reading view**.
2. Click **Run** above the JavaScript block.
3. Review the line chart, Smith chart, and table below the code.

```npjs
// Generate 11 frequency points from 1 GHz through 10 GHz.
var g = nP.global;
g.fList = g.fGen(1e9, 10e9, 11);

// Create the series components.
var r1 = nP.R(75);
var c1 = nP.C(1e-12);

// Connect the resistor and capacitor between ports 1 and 2.
var seriesRC = nP.nodal(
    [r1, 1, 2],
    [c1, 2, 3],
    ['out', 1, 3]
);

// Extract the values needed by each display.
var lineOut = seriesRC.out('s21dB', 's11dB');
var smithOut = seriesRC.out('s11Re', 's11Im');
var tableOut = seriesRC.out('s11dB', 's21dB');

// Plot transmission and reflection versus frequency.
nP.lineChart({
    inputTable: [lineOut],
    title: 'Series RC Response',
    mount: '#lineChart',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white'
});

// Plot the input reflection coefficient on a Smith chart.
nP.smithChart({
    inputTable: [smithOut],
    title: 'Input Reflection Coefficient',
    mount: '#smithChart',
    metricPrefix: 'giga',
    backgroundColor: 'white'
});

// Display frequency, s11dB, and s21dB as a table.
nP.lineTable({
    inputTable: [tableOut],
    title: 'Series RC Data',
    mount: '#lineTable',
    metricPrefix: 'giga',
    backgroundColor: 'white'
});
```

## Reading the Results

- The line chart shows `s21dB` and `s11dB` from 1 GHz through 10 GHz.
- The Smith chart shows the real and imaginary parts of `s11`.
- The table lists frequency, `s11dB`, and `s21dB` for all 11 frequency points.

Click **Reset** to clear the displayed results.

Return to [[2 Understanding an npjs Block|Understanding an npjs Block]], or continue to [[4 Typing in an npjs Block|the typing exercise]].
