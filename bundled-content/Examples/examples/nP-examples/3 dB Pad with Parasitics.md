<!-- Modified: 2026-08-17 -->

# 3 dB Pad with Parasitics

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/nP-examples/dB-pad.html`
> - **Archive collection:** Archived nP-examples example collection
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> The topology and nP node assignments have been checked against the runnable
> analysis. Every component uses canonical symbol-library geometry.

## Schematic

![[nPort RF Analysis/Examples/Images/pad-with-parasitics.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/pad-with-parasitics.svg" href="nPort RF Analysis/Examples/Images/pad-with-parasitics.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Archived Page Introduction

- Resistor Attenuator with no parasitics
- Resistive Attenuator with parasitics

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// Generate frequency list
g = nP.global;
g.fList = g.fGen(
    .50e9,                                  // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    25,                                     // Number of frequency points
);

// define the components
var c1 = nP.C(0.15e-12);
var r1 = nP.R(430);
var r2 = nP.R(17);
var r3 = nP.R(430);
var c2 = nP.C(0.15e-12);
var Tee = nP.Tee();
var Short = nP.Short();


// the no parasitics case
var pad1 = nP.nodal(
	[Tee, 2, 1, 3],
	[r1, 2, 4],
	[Short, 4],
	[r2, 3, 5],
	[Tee, 6, 5, 7],
	[r3, 6, 8],
	[Short, 8],
	['out', 1, 7]
);
var table1 = pad1.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
var inputObject1 = {
	inputTable: [table1],
	mount: '#canvas1',
	metricPrefix: 'giga',
};
var chart1 = nP.lineChart(inputObject1);

// the parasitics case
var pad2 = nP.nodal(
	[Tee, 2, 1, 3],
	[c1, 2, 4],
	[Short, 4],
	[Tee, 6, 3, 7],
	[r1, 6, 8],
	[Short, 8],
	[r2, 7, 9],
	[Tee, 10, 9, 11],
	[r3, 10, 12],
	[Short, 12],
	[Tee, 14, 11, 15],
	[c2, 14, 16],
	[Short, 16],
	['out', 1, 15]
);
var table2 = pad2.out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);
var inputObject2 = {
	inputTable: [table2],
	mount: '#canvas2',
	metricPrefix: 'giga',
};
var chart2 = nP.lineChart(inputObject2);
```
