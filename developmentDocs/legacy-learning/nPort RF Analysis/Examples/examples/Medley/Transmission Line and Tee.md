<!-- Modified: 2026-08-18 -->

# Transmission Line and Tee

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Medley/pg30-31-TlinTee.html`
> - **Archive collection:** Archived Medley example collection
> - **Book:** *Microwave Circuit Design Using Programmable Calculators*
> - **Authors:** J. Lamar Allen and Max W. Medley Jr.
> - **Series:** The Artech House Microwave Library
> - **Publication:** Dedham, Massachusetts: Artech House, 1980
> - **ISBN:** 0-89006-089-4
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> The bare line and all four shunt- and series-stub networks preserve their
> constructor port order, local nP nodes, and separate Open and Short
> terminations. The calculations match the original Medley example at 2 GHz.

## Schematics

### Bare transmission line

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/bare-transmission-line.svg" href="nPort RF Analysis/Examples/Images/bare-transmission-line.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

### Open-circuited shunt stub

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/open-circuited-shunt-stub.svg" href="nPort RF Analysis/Examples/Images/open-circuited-shunt-stub.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

### Open-circuited series stub

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/open-circuited-series-stub.svg" href="nPort RF Analysis/Examples/Images/open-circuited-series-stub.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

### Short-circuited shunt stub

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/short-circuited-shunt-stub.svg" href="nPort RF Analysis/Examples/Images/short-circuited-shunt-stub.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

### Short-circuited series stub

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/short-circuited-series-stub.svg" href="nPort RF Analysis/Examples/Images/short-circuited-series-stub.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This restores the complete five-case Medley comparison. It uses the verified
single frequency of 2 GHz and displays the magnitude and angle of S11 and S21
for the bare line and the parallel and series Open/Short stubs.

For an ordinary `Tee()`, port 1 is the shunt branch. For `seriesTee()`, ports 1
and 2 form the through path and port 3 accepts the one-port network that is
inserted in series.

```npjs
// From Medley pages 30–31.
var g = nP.global;
g.fList = [2e9];

var line = nP.Tlin();
var open = nP.Open();
var short = nP.Short();
var tee = nP.Tee();
var seriesTee = nP.seriesTee();

var outputSelections = ['s11mag', 's11ang', 's21mag', 's21ang'];

function medleyOutput(network) {
	return network.out.apply(network, outputSelections);
}

var bareLine = medleyOutput(line);

var openParallelStub = nP.nodal(
	[tee, 2, 1, 3],
	[line, 2, 4],
	[open, 4],
	['out', 1, 3]
);

nP.schematic(openParallelStub);

var openSeriesStub = nP.nodal(
	[seriesTee, 1, 2, 3],
	[line, 3, 4],
	[open, 4],
	['out', 1, 2]
);

nP.schematic(openSeriesStub);

var shortParallelStub = nP.nodal(
	[tee, 2, 1, 3],
	[line, 2, 4],
	[short, 4],
	['out', 1, 3]
);

nP.schematic(shortParallelStub);

var shortSeriesStub = nP.nodal(
	[seriesTee, 1, 2, 3],
	[line, 3, 4],
	[short, 4],
	['out', 1, 2]
);

nP.schematic(shortSeriesStub);

var outputs = [
	['bare line', bareLine],
	['parallel open stub', medleyOutput(openParallelStub)],
	['series open stub', medleyOutput(openSeriesStub)],
	['parallel short stub', medleyOutput(shortParallelStub)],
	['series short stub', medleyOutput(shortSeriesStub)]
];

outputs.forEach(function (entry) {
	outputSelections.forEach(function (selection, index) {
		entry[1][0][index + 1] = entry[0] + ' ' + selection;
	});
});

nP.lineTable({
	inputTable: outputs.map(function (entry) { return entry[1]; }),
	title: 'Transmission Line and Stub Comparison',
	metricPrefix: 'giga',
	columnWidth: 180,
	backgroundColor: 'white',
});
```
