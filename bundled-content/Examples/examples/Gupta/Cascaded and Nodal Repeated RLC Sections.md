<!-- Modified: 2026-08-17 -->

# Cascaded and Nodal Repeated RLC Sections

This example is based on material from *Computer-Aided Design of Microwave
Circuits* by K. C. Gupta, Ramesh Garg, and Rakesh Chadha. It compares repeated
RLC sections assembled with nodal connections and cascading, following the
discussion on pages 336 and 346–347 of the 1981 Artech House book.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Gupta/pg336-pg346-347CasCascadeNodal.html`
> - **Archive collection:** Archived Gupta example collection
> - **Original HTML modification date:** 2026-06-27
> - **Book:** *Computer-Aided Design of Microwave Circuits*
> - **Authors:** K. C. Gupta, Ramesh Garg, and Rakesh Chadha
> - **Publisher and year:** Artech House, 1981
> - **Pages:** 336 and 346–347

> [!SUCCESS] Schematic maturity
> All five repeated R-L-C sections and their nP nodes have been checked against
> the nodal and cascade constructions. Each primitive is canonical.

## Schematic

![[nPort RF Analysis/Examples/Images/five-repeated-rlc-sections.svg|1100]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/five-repeated-rlc-sections.svg" href="nPort RF Analysis/Examples/Images/five-repeated-rlc-sections.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
// from Gupta page 336, 346-347
// uses default values for frequency and component values

function rlcSection(rValue, lValue, cValue) {
	var r = nP.R(rValue);
	var l = nP.L(lValue);
	var c = nP.C(cValue);

	return nP.nodal(
		[r, 1, 2],
		[l, 2, 3],
		[c, 3, 4],
		['out', 1, 4]
	);
}

var section = rlcSection(75 / 5, 5e-9 / 5, 1e-12 * 5);
var singleSectionOut = section.out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

var fiveSectionsOut = nP.nodal(
	[section, 1, 2],
	[section, 2, 3],
	[section, 3, 4],
	[section, 4, 5],
	[section, 5, 6],
	['out', 1, 6]
).out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

singleSectionOut[0][1] = 'single section s11mag';
fiveSectionsOut[0][1] = 'five sections s11mag';

nP.lineTable({
	inputTable: [singleSectionOut, fiveSectionsOut],
	title: 'Repeated RLC Section Comparison',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});
```
