<!-- Modified: 2026-08-17 -->

# Microwaves101 Branchline Coupler

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/MWs101/MWs101branchlineCoupler.html`
> - **Archive collection:** Archived MWs101 example collection
> - **Original HTML modification date:** 2026-06-27
> - **Referenced source:** https://www.microwaves101.com/encyclopedias/branchline-couplers

> [!SUCCESS] Schematic maturity
> The four Tee junctions, four quarter-wave lines, external ports, and nP node
> assignments have been checked against the runnable analysis.

## Schematic

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/branchline-coupler.svg" href="nPort RF Analysis/Examples/Images/branchline-coupler.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// set up the frequency from https://www.microwaves101.com/encyclopedias/branchline-couplers
// this is for a quarter wave at 10GHz
var g = nP.global;
g.fList = g.fGen(
    5000e6,                                 // Start frequency in hertz
    15000e6,                                // Stop frequency in hertz
    20,                                     // Number of frequency points
);

// nP physical dimensions are in meters.
var mil = 0.001 * 0.0254;                   // 1 mil = 25.4 µm
//g.fList = [15000e6];

// set up components
var tee = nP.Tee();
var z50 = nP.Tlin(
    50,                                     // Characteristic impedance in ohms
    295 * mil,                              // Physical length in meters
);
var z35 = nP.Tlin(
    35.35,                                  // Characteristic impedance in ohms
    295 * mil,                              // Physical length in meters
);
var z50half = nP.Tlin(
    50.0,                                   // Characteristic impedance in ohms
    295 * mil / 2,                          // Physical length in meters
);
var open = nP.Open();
var short = nP.Short();

// set up the branchline coupler
var tee = nP.Tee();
var branch = nP.nodal(
	[tee, 5, 1, 2],
	[z35, 2, 3],
	[tee, 6, 3, 4],
	[z50, 5, 7],
	[z50, 6, 8],
	[tee, 7, 10, 9],
	[z35, 10, 11],
	[tee, 8, 12, 11],
	['out', 1, 4, 12, 9]
);

nP.schematic(branch);
var branchOut = branch.out(
    's21dB',                                // Forward transmission
    's31dB',                                // Response at port 3 from excitation at port 1
);

// set up plot
var plot = {
	inputTable: [branchOut],
	mount: '#myChart',
	metricPrefix : 'giga',
};

var chart1 = nP.lineChart(plot);
```
