<!-- Modified: 2026-08-17 -->

# 3 dB Attenuator with and without Parasitics

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/GistHTMLs/AttnWithParasitics.html`
> - **Archive collection:** Archived GistHTMLs example collection
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> Both the ideal and parasitic topologies and their nP node assignments have
> been checked against the runnable analysis. Every component uses canonical
> symbol-library geometry.

## Without Parasitics

The ideal circuit is a 292–18–292 Ω π attenuator.

<div style="display:flex;justify-content:center;width:100%;">
<span class="internal-embed" src="nPort RF Analysis/Examples/Images/attenuator-without-parasitics.svg" width="760"></span>
</div>

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/attenuator-without-parasitics.svg" href="nPort RF Analysis/Examples/Images/attenuator-without-parasitics.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## With Parasitics

The second circuit adds 0.5 pF shunt capacitance at both external ports.

<div style="display:flex;justify-content:center;width:100%;">
<span class="internal-embed" src="nPort RF Analysis/Examples/Images/attenuator-with-parasitics.svg" width="760"></span>
</div>

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/attenuator-with-parasitics.svg" href="nPort RF Analysis/Examples/Images/attenuator-with-parasitics.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// generate frequency list
g = nP.global;
g.fList = g.fGen(
    50e6,                                   // Start frequency in hertz
    6e9,                                    // Stop frequency in hertz
    101,                                    // Number of frequency points
);

// define the 3 dB attenuator
var R1 = nP.R(292);
var R2 = nP.R(18);
var R3 = nP.R(292);
var cParasitic = nP.C(0.5e-12);
var Tee = nP.Tee();
var Short = nP.Short();
var Attenuator = nP.nodal(
	[Tee, 2, 1, 3],
	[R1, 2, 4],
	[Short, 4],
	[R2, 3, 5],
	[Tee, 6, 5, 7],
	[R3, 6, 8],
	[Short, 8],
	['out', 1, 7]
);

// define the output of an ideal attenuator and add to the plot in lineChart below
var AttenuatorOut = Attenuator.out('s21dB');

// add the parasitics to the input and outputs sides of the Attenuator
var AttenuatorWithParasitics = nP.nodal(
	[Tee, 2, 1, 3],
	[cParasitic, 2, 4],
	[Short, 4],
	[Tee, 6, 3, 7],
	[R1, 6, 8],
	[Short, 8],
	[R2, 7, 9],
	[Tee, 10, 9, 11],
	[R3, 10, 12],
	[Short, 12],
	[Tee, 14, 11, 15],
	[cParasitic, 14, 16],
	[Short, 16],
	['out', 1, 15]
);

// define the output with the effect of the parasitics
var AttenuatorWithParasiticsOut = AttenuatorWithParasitics.out('s21dB');

// set up the lineChartInputObject, notice there are two input tables for two plots
var fullInputObject = {
	inputTable: [AttenuatorOut, AttenuatorWithParasiticsOut],
	mount: '#chart1',
	metricPrefix: 'giga',
	title: 'Comparison of 3dB Attenuator with and without 0.5 pF parasitic capacitance',
	xAxisTitle: 'Input Frequency, GHz',
	yAxisTitle: 's21, dB',
	xRange: [0,6e9],
	yRange: [-6,0],
	showPoints: false,
	showLabels: true,
};

// plot the attenuator responses
var chart1 = nP.lineChart(fullInputObject);
```
