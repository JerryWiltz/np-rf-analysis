<!-- Modified: 2026-08-17 -->

# Edge-Coupled Filter Design

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

This edge-coupled filter is the design example presented on pages 113–114 of
*Microwave Circuit Design Using Programmable Calculators*. The book supplies
the even-mode characteristic impedance, $Z_{oe}$, and odd-mode characteristic
impedance, $Z_{oo}$, for each coupled-line section. The two identical outer
sections use $Z_{oe}=79.667\ \Omega$ and $Z_{oo}=37.834\ \Omega$; the center
section uses $Z_{oe}=60.866\ \Omega$ and $Z_{oo}=42.505\ \Omega$. The nP model
connects these three quarter-wave sections as the complete filter and analyzes
its response from 4 GHz to 8 GHz about the specified 6 GHz center frequency.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/documentation/readme-html/edgeCoupledFilter.html`
> - **Archive collection:** Archived nP documentation example collection
> - **Book:** *Microwave Circuit Design Using Programmable Calculators*
> - **Authors:** J. Lamar Allen and Max W. Medley Jr.
> - **Series:** The Artech House Microwave Library
> - **Publication:** Dedham, Massachusetts: Artech House, 1980
> - **ISBN:** 0-89006-089-4
> - **Example pages:** 113–114
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> The three coupled-line sections, six separate Open terminations, external
> ports, and nP node assignments have been checked against the runnable code.
> Every constructor uses canonical symbol-library geometry.

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

## Schematic

![[nPort RF Analysis/Examples/Images/edge-coupled-filter.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/edge-coupled-filter.svg" href="nPort RF Analysis/Examples/Images/edge-coupled-filter.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

```npjs
// this is for a quarter wave at 6GHz
var g = nP.global;
g.fList = g.fGen(
    4e9,                                    // Start frequency in hertz
    8e9,                                    // Stop frequency in hertz
    21,                                     // Number of frequency points
);

// nP physical dimensions are in meters.
var mil = 0.001 * 0.0254;                   // 1 mil = 25.4 µm

// set up the couplers
var tclin1 = nP.Tclin(
    79.667,                                 // Even-mode impedance in ohms
    37.834,                                 // Odd-mode impedance in ohms
    491 * mil,                              // Physical length in meters
);
var tclin2 = nP.Tclin(
    60.866,                                 // Even-mode impedance in ohms
    42.505,                                 // Odd-mode impedance in ohms
    491 * mil,                              // Physical length in meters
);
var tclin3 = nP.Tclin(
    79.667,                                 // Even-mode impedance in ohms
    37.834,                                 // Odd-mode impedance in ohms
    491 * mil,                              // Physical length in meters
);

// set up the open
var open = nP.Open();

// set up the filter
var filt = nP.nodal(
	[tclin1, 1, 2, 3, 4],
	[tclin2, 3, 5, 6, 7],
	[tclin3, 6, 8, 9, 10],
	[open, 2],
	[open, 4],
	[open, 5],
	[open, 7],
	[open, 8],
	[open, 10],
	['out', 1, 9]
);
var filtOut = filt.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);

// set up the plot
var plot = {
	title: 'Edge Coupled Filter',
	inputTable: [filtOut],
};

// plot the data
var chart1 = nP.lineChart(plot);

// set up the table
var table = {
	title: 'Edge Coupled Filter',
	inputTable: [filtOut],
};

// tabulate the data
var table1 = nP.lineTable(table);
```
