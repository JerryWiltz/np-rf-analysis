<!-- Modified: 2026-08-17 -->

# Microwaves101 Directional Coupler

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/MWs101/MWs101directionalCoupler.html`
> - **Archive collection:** Archived MWs101 example collection
> - **Original HTML modification date:** 2026-06-27
> - **Referenced source:** https://www.microwaves101.com/encyclopedias/branchline-couplers

> [!SUCCESS] Schematic maturity
> The ideal and microstrip four-port models preserve clockwise constructor-port
> order and use canonical coupled-line geometry. Both model midpoints lie on
> the same vertical y-axis, and all node numbers remain clear of conductors and
> annotations.

## Schematic

![[nPort RF Analysis/Examples/Images/directional-coupler-comparison.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/directional-coupler-comparison.svg" href="nPort RF Analysis/Examples/Images/directional-coupler-comparison.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// set up the frequency from https://www.microwaves101.com/encyclopedias/branchline-couplers
// this is for a quarter wave at 10GHz
var g = nP.global;
g.fList = g.fGen(
    2000e6,                                 // Start frequency in hertz
    18000e6,                                // Stop frequency in hertz
    21,                                     // Number of frequency points
);

// nP physical dimensions are in meters.
var mil = 0.001 * 0.0254;                   // 1 mil = 25.4 µm

//set up the coupleing factor
var C = 3;
var c = Math.pow(10,-C/20);
var zoe = 50*Math.sqrt((1+c)/(1-c));
var zoo = 50*Math.sqrt(((1-c)/(1+c)));

// set up the Tclin directional coupler
var Tclin = nP.Tclin(
    zoe,                                    // Even-mode impedance in ohms
    zoo,                                    // Odd-mode impedance in ohms
    295 * mil,                              // Physical length in meters
);
var q1 = nP.nodal(
	[Tclin, 1, 2, 3, 4],
	['out', 1, 2, 3, 4]
);
var directionalCouplerOut1 = q1.out(
    's21dB',                                // Forward transmission
    's41dB',                                // Response at port 4 from excitation at port 1
);

// set up plot
var plot1 = {
	inputTable: [directionalCouplerOut1],
	mount: '#canvas1',
	metricPrefix : 'giga',
};
var chart1 = nP.lineChart(plot1);

// set up the mclin directional coupler
var mclin = nP.mclin(
    Width = 20 * mil,                       // Width in meters
    Space = 2.5 * mil,                      // Spacing in meters
    Height = 25 * mil,                      // Substrate height in meters
    Thickness = 0,                          // Conductor thickness in meters
    Length = 300 * mil,                     // Length in meters
    er = 9.9,                               // Relative permittivity
    rho = 1,                                // Copper resistivity multiplier
    tand = 0.001,                           // Dielectric loss tangent
);
var q2 = nP.nodal(
	[mclin, 1, 2, 3, 4],
	['out', 1, 2, 3, 4]
);
var directionalCouplerOut2 = q2.out(
    's21dB',                                // Forward transmission
    's41dB',                                // Response at port 4 from excitation at port 1
);

// set up plot
var plot2 = {
	inputTable: [directionalCouplerOut2],
	mount: '#canvas2',
	metricPrefix : 'giga',
};
var chart2 = nP.lineChart(plot2);
```
