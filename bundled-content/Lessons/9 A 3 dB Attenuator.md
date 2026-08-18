<!-- Modified: 2026-08-17 -->

# A 3 dB Attenuator

This example builds an approximately matched 3 dB resistive π network for 50 Ω ports from three resistors and two ideal tee junctions. The input enters the left branch of the first tee. Each tee's common branch connects through a shunt resistor to an ideal short.

> [!NOTE]
> The calculated values are rounded to `R1 = R3 = 292.4 Ω` and `R2 = 17.6 Ω`. The plot shows the small effect of rounding on the nominal 3 dB response.

## Circuit

![[nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg" href="nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

The two tee junctions divide the main signal path from the two shunt branches:

- Tee 1 connects nodes `2`, `1`, and `3` in `[common, left, right]` order.
- Tee 2 connects nodes `6`, `5`, and `7` in `[common, left, right]` order.
- Node `1` is circuit port 1.
- Node `7` is circuit port 2.
- `R1` and `R3` terminate through `Short()` objects.

## Run the Analysis

1. Switch this note to **Reading view**.
2. Click **Run** above the `npjs` block.
3. Examine `s21dB` for transmission and `s11dB` for input reflection.

```npjs
// Define 11 frequency points from 1 GHz through 10 GHz.
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);

// Construct the three resistors.
var r1 = nP.R(292.4);
var r2 = nP.R(17.6);
var r3 = nP.R(292.4);

// Construct reusable ideal connection components.
var Tee = nP.Tee();
var Short = nP.Short();

// Connect the resistors as a pi network.
var attenuator = nP.nodal(
    [Tee, 2, 1, 3],
    [r1, 2, 4],
    [Short, 4],

    [r2, 3, 5],

    [Tee, 6, 5, 7],
    [r3, 6, 8],
    [Short, 8],

    ['out', 1, 7]
);

var lineOut = attenuator.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);

nP.lineChart({
    inputTable: [lineOut],
    title: 'Pi Attenuator Response',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
});
```

## Expected Result

The two traces should be flat because this ideal resistor network is not
frequency dependent. With the rounded component values, `s21dB` should be
about −2.999 dB and `s11dB` about −79.8 dB across the sweep.

## Reading the Code

The first tee is connected as:

```javascript
[Tee, 2, 1, 3]
```

Tee port 1 is the common shunt branch at node `2`. Tee ports 2 and 3 form the left-to-right signal path through nodes `1` and `3`.

The second tee follows the same convention:

```javascript
[Tee, 6, 5, 7]
```

Its common shunt branch is node `6`, while nodes `5` and `7` continue the signal path to circuit port 2.

The final array exposes only the input and output nodes:

```javascript
['out', 1, 7]
```

The completed π network is therefore returned as a two-port n-port object.

Return to [[8 Display Input Objects|display input objects]], continue to [[10 Understanding S-Parameters|understanding S-parameters]], or open [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the complete API inventory]].
