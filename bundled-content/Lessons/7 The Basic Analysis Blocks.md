<!-- Modified: 2026-08-17 -->

# The Basic Analysis Blocks

This lesson revisits the series RC analysis from [[3 Series RC Example|lesson 3]]. Instead of concentrating on the plots, it examines the three basic blocks used to build an nP analysis:

1. Define the analysis frequencies.
2. Construct the components.
3. Connect the components with `nP.nodal()`.

These blocks appear in the same order in most nP circuit analyses.

## 1. Define the Frequencies

An nP analysis normally begins by creating a frequency list:

```javascript
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);
```

`nP.global` contains settings shared by the analysis. The `fList` setting tells component constructors which frequencies to calculate.

`fGen()` receives three arguments:

```text
fGen(start frequency, stop frequency, number of points)
```

In this example:

- `1e9` means 1 × 10⁹ Hz, or 1 GHz.
- `10e9` means 10 × 10⁹ Hz, or 10 GHz.
- `11` requests 11 frequency points, including the starting and stopping frequencies.

Set `g.fList` before constructing the components. Each component uses the active frequency list to produce its frequency-dependent S-parameter data.

## 2. Construct the Components

The next block creates a resistor and a capacitor:

```javascript
var r1 = nP.R(75);
var c1 = nP.C(1e-12);
```

`nP.R()` and `nP.C()` are component constructors:

- `nP.R(75)` creates a two-port series resistor with a resistance of 75 Ω.
- `nP.C(1e-12)` creates a two-port series capacitor with a capacitance of 1 × 10⁻¹² F, or 1 pF.

The variables `r1` and `c1` are reference-designator-style names. They make it easier to recognize the components when the circuit is connected.

The constructors return n-port objects. Each object contains S-parameters calculated for the frequencies in `g.fList` and can be used as a building block in a larger circuit.

## 3. Connect the Components with `nP.nodal()`

The components exist as separate objects until `nP.nodal()` connects them:

```javascript
var seriesRC = nP.nodal(
    [r1, 1, 2],
    [c1, 2, 3],
    ['out', 1, 3]
);
```

Each component connection has this form:

```text
[component, node at component port 1, node at component port 2]
```

The first connection is:

```javascript
[r1, 1, 2]
```

It connects resistor `r1` between nodes `1` and `2`.

The second connection is:

```javascript
[c1, 2, 3]
```

It connects capacitor `c1` between nodes `2` and `3`. Both components use node `2`, so node `2` joins the resistor to the capacitor.

The final array declares the external ports of the completed circuit:

```javascript
['out', 1, 3]
```

Node `1` becomes circuit port 1, and node `3` becomes circuit port 2. Node `2` is an internal connection and is not exposed as an external port.

The resulting topology is:

![[nPort RF Analysis/Lessons/Images/series-rc.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rc.svg" href="nPort RF Analysis/Lessons/Images/series-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

`nP.nodal()` returns a new n-port object named `seriesRC`. Like an individual component, this combined object can produce output data or become a building block in a still larger circuit.

## Complete Runnable Analysis

The three basic blocks can now be read together: frequencies, components, and connections.

```npjs
// 1. Define the analysis frequencies.
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);

// 2. Construct the components.
var r1 = nP.R(75);
var c1 = nP.C(1e-12);

// 3. Connect the components.
var seriesRC = nP.nodal(
    [r1, 1, 2],
    [c1, 2, 3],
    ['out', 1, 3]
);

// Extract and plot the completed circuit's response.
var lineOut = seriesRC.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);

nP.lineChart({
    inputTable: [lineOut],
});
```

Switch to **Reading view**, and click **Run** to execute the complete analysis.

## Expected Result

The line chart should contain `s21dB` and `s11dB` traces at 11 frequency
points from 1 GHz through 10 GHz. It is the same series-RC response introduced
in lesson 3, now built from separate components and explicit node connections.

## What to Remember

- Set the frequency list before creating components.
- Component constructors create reusable n-port objects.
- Equal node numbers connect component ports together.
- The `['out', ...]` array selects and orders the completed circuit's external ports.
- `nP.nodal()` returns another reusable n-port object.

Return to [[6 Typing in an npjs Block|the typing exercise]], or continue to [[8 Display Input Objects|display input objects]].
