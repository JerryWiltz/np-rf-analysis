<!-- Modified: 2026-08-17 -->

# 1N4148 Diode Model

`nP.diode1N4148(options)` returns a two-port RF small-signal model and also
provides a DC current-voltage table.

![[nPort RF Analysis/Lessons/Images/diode-1n4148-zero-bias.svg|420]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/diode-1n4148-zero-bias.svg" href="nPort RF Analysis/Lessons/Images/diode-1n4148-zero-bias.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

This lesson evaluates the default model at zero-volt DC bias.

## Run the Analysis

```npjs
var g = nP.global;
g.fList = g.fGen(
    100e6,                                  // Start frequency in hertz
    2.1e9,                                  // Stop frequency in hertz
    101,                                    // Number of frequency points
);
g.Ro = 50;
g.Temp = 293;

var diode = nP.diode1N4148({
    biasVoltage: 0,
});

var rfOut = diode.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

nP.lineChart({
    inputTable: [rfOut],
    title: '1N4148 S-Parameters at Zero Bias',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});

var ivRaw = diode.ivTable(-1, 1, 201);
var ivMilliamp = ivRaw.map(function (row, index) {
    if (index === 0) {
        return ['vD', 'iD mA'];
    }
    return [row[0], row[1] * 1000];
});

nP.lineChart({
    inputTable: [ivMilliamp],
    title: '1N4148 DC I-V Curve',
    metricPrefix: 'none',
    xAxisTitle: 'Diode Voltage, V',
    yAxisTitle: 'Diode Current, mA',
    backgroundColor: 'white',
});
```

## Expected Result

One run should render two charts. The RF chart shows `s11dB` and `s21dB` from
100 MHz through 2.1 GHz at zero-volt bias. The DC chart shows diode current in
milliamperes from −1 V through +1 V; its forward current rises rapidly as the
voltage becomes positive.

## Two Related Analyses

The RF chart comes from the n-port `.out()` method. The DC chart comes from the
diode-specific `.ivTable()` method. `biasVoltage` sets the operating point used
to linearize the RF small-signal model; it does not restrict the voltage range
returned by `.ivTable()`.

The default model includes junction capacitance, series resistance, transit
time, leakage, temperature, and reverse-breakdown behavior. See note 200 for
the complete defaults.

Return to [[19 Chebyshev Low-Pass Filter Design|Chebyshev filter design]], or
continue to [[21 Diagnosing an Analysis|diagnosing an analysis]].
