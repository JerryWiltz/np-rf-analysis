<!-- Modified: 2026-08-17 -->

# Display Input Objects

The nP display functions receive their settings in JavaScript objects:

- `nP.lineChart()` plots numeric data as traces.
- `nP.lineTable()` displays numeric data as a table.
- `nP.smithChart()` plots complex reflection data on a Smith chart.

These are JavaScript objects, not JSON files. They can refer directly to variables created earlier in the `npjs` block.

## Object Syntax

A JavaScript object begins with `{` and ends with `}`. Each property has a name, a colon, and a value. Commas separate the properties.

```javascript
var options = {
    inputTable: [lineOut],
    title: 'Series RC Response',
    metricPrefix: 'giga',
};
```

The object is passed to a display function:

```javascript
nP.lineChart(options);
```

The properties may appear in any order. A variable name such as `lineOut` is not placed in quotes because it refers to data already held by JavaScript.

## The `inputTable` Property

`inputTable` is the most important property shared by all three display functions:

```javascript
inputTable: [lineOut]
```

The value is an array of one or more nP output tables. The outer brackets are required even when there is only one table.

An output table has a header row followed by numeric data rows:

```javascript
[
    ['Freq', 's21dB', 's11dB'],
    [1e9, -7.48, -2.57],
    [1.9e9, -5.76, -4.74]
]
```

The first column supplies the x value or frequency. The remaining columns supply the values to plot or display.

The easiest way to create a correctly shaped table is to call `.out()` on an n-port object:

```javascript
var lineOut = seriesRC.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);
```

## Shared Properties

The following properties are useful with all three display functions:

- `inputTable` supplies an array containing one or more data tables.
- `title` supplies the displayed title.
- `metricPrefix` scales the first column for display. Common values include `'giga'`, `'mega'`, `'kilo'`, and `'none'`.
- `backgroundColor` sets the display and exported-image background.
- `fontFamily` selects the font family.
- `fontSize` sets the base text size in pixels.

The `metricPrefix` property changes how frequency values are displayed; it does not change the circuit's analysis frequencies.

## `lineChart` Input Object

`lineChart` expects a numeric x column followed by one or more numeric y columns. Every y column becomes a trace.

```javascript
var lineChartOptions = {
    inputTable: [lineOut],
    title: 'Series RC Response',
    metricPrefix: 'giga',
    xAxisTitle: 'Frequency, GHz',
    yAxisTitle: 'Magnitude, dB',
    backgroundColor: 'white',
};

nP.lineChart(lineChartOptions);
```

Common `lineChart` properties include:

- `xAxisTitle` and `yAxisTitle` label the axes.
- `xScale` and `yScale` select `'linear'` or `'log'` scaling.
- `xRange` and `yRange` set explicit axis limits.
- `showPoints`, `showLabels`, and `showGrid` turn those features on or off.
- `traceWidth` and `pointRadius` control trace and point sizes.
- `width` and `height` set the chart dimensions in pixels.

Only `inputTable` is needed when the defaults are acceptable:

```javascript
nP.lineChart({
    inputTable: [lineOut],
});
```

## `lineTable` Input Object

`lineTable` consumes the same general numeric table shape. It displays the header and every data row rather than drawing traces.

```javascript
var tableOptions = {
    inputTable: [tableOut],
    title: 'Series RC Data',
    metricPrefix: 'giga',
    backgroundColor: 'white',
};

nP.lineTable(tableOptions);
```

Common `lineTable` properties include:

- `headerColor` selects the header text treatment.
- `headerFill` sets the header background.
- `cellFill` sets the data-cell background.
- `cellBorderColor` and `cellBorderWidth` style the cell borders.
- `columnWidth` and `rowHeight` control cell dimensions.

Create the table data by selecting the columns in the order they should appear:

```javascript
var tableOut = seriesRC.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
```

The frequency column is added automatically by `.out()`.

## `smithChart` Input Object

`smithChart` requires real and imaginary columns in adjacent pairs:

```javascript
var smithOut = seriesRC.out(
    's11Re',                                // Input reflection
    's11Im',                                // Input reflection
);
```

The real column must come first, followed immediately by its matching imaginary column. The shared S-parameter name tells the chart that `s11Re` and `s11Im` belong to the same trace.

```javascript
var smithChartOptions = {
    inputTable: [smithOut],
    title: 'Input Reflection Coefficient',
    metricPrefix: 'giga',
    backgroundColor: 'white',
};

nP.smithChart(smithChartOptions);
```

Common `smithChart` properties include:

- `showPoints`, `showLabels`, and `showGrid` control visible chart features.
- `gridColor` sets the Smith chart grid color.
- `traceWidth` and `pointRadius` control trace and point sizes.
- `unitCircleColor` and `unitCircleWidth` style the outer circle.
- `width` and `height` set the chart dimensions in pixels.

Additional traces can be supplied as more adjacent real/imaginary pairs:

```javascript
var smithOut = network.out(
    's11Re', 's11Im',                       // Input reflection
    's22Re', 's22Im',                       // Response at port 2 from excitation at port 2
);
```

## Complete Example

This example creates the series RC network from lesson 3 and displays three different output tables.

```npjs
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);

var r1 = nP.R(75);
var c1 = nP.C(1e-12);

var seriesRC = nP.nodal(
    [r1, 1, 2],
    [c1, 2, 3],
    ['out', 1, 3]
);

var lineOut = seriesRC.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);
var tableOut = seriesRC.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
var smithOut = seriesRC.out(
    's11Re',                                // Input reflection
    's11Im',                                // Input reflection
);

nP.lineChart({
    inputTable: [lineOut],
    title: 'Series RC Response',
    metricPrefix: 'giga',
});

nP.lineTable({
    inputTable: [tableOut],
    title: 'Series RC Data',
    metricPrefix: 'giga',
});

nP.smithChart({
    inputTable: [smithOut],
    title: 'Input Reflection Coefficient',
    metricPrefix: 'giga',
});
```

## Expected Result

One run should render three independent displays: a line chart of `s21dB` and
`s11dB`, a numeric table containing those same quantities, and a Smith chart
of the real and imaginary parts of `s11`. All three use the same 11-point
series-RC analysis.

## What to Remember

- The display options are ordinary JavaScript objects, not separate JSON documents.
- `inputTable` contains an array of output tables.
- `lineChart` plots numeric x/y columns.
- `lineTable` displays numeric columns and rows.
- `smithChart` consumes adjacent real/imaginary column pairs.
- Start with a minimal object, and add properties only when they improve the display.

Return to [[7 The Basic Analysis Blocks|the basic analysis blocks]], continue to [[9 A 3 dB Attenuator|the π attenuator]], or open [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the complete API inventory]].
