<!-- Modified: 2026-08-17 -->

# Two-Port and Four-Port Transformers

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Medley/pg34-TRFandTRF4Port.html`
> - **Archive collection:** Archived Medley example collection
> - **Book:** *Microwave Circuit Design Using Programmable Calculators*
> - **Authors:** J. Lamar Allen and Max W. Medley Jr.
> - **Series:** The Artech House Microwave Library
> - **Publication:** Dedham, Massachusetts: Artech House, 1980
> - **ISBN:** 0-89006-089-4
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> The two-port model and separately terminated four-port model preserve their
> constructor-port order and use canonical transformer and Short geometry.

## Schematics

![[nPort RF Analysis/Examples/Images/transformer-comparison.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/transformer-comparison.svg" href="nPort RF Analysis/Examples/Images/transformer-comparison.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
//from Medley page 34
//uses default values for frequency and components
var trf = nP.trf().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

var t = nP.trf4Port()
var short = nP.Short();
var trf4Port = nP.nodal(
	[t, 1, 2, 3, 4],
	[short, 3],
	[short, 4],
	['out', 1, 2]
).out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

trf[0][1] = 'two-port transformer s11mag';
trf4Port[0][1] = 'terminated four-port transformer s11mag';

nP.lineTable({
	inputTable: [trf, trf4Port],
	title: 'Transformer Comparison',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});
```
