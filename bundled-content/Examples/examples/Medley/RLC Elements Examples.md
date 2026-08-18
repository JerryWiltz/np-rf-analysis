<!-- Modified: 2026-08-18 -->

# RLC Elements Examples

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

## Example Overview

This example follows the lumped-element network comparisons on pages 26–30 of
*Microwave Circuit Design Using Programmable Calculators*. Allen and Medley
begin with individual resistors, inductors, and capacitors in series and shunt
connections, then combine them into two- and three-element series chains,
cascaded series/shunt networks, and parallel shunt branches. The progression
shows how a small set of RLC elements can be connected into increasingly
general two-port networks.

The nP version compares the 22 dedicated RLC two-port constructors represented
by these networks. The first name segment describes whether the equivalent
impedance is placed in the series path (`se`) or in shunt (`pa`). For a
combined constructor, the second segment says whether its RLC elements are
internally in series (`Se`) or parallel (`Pa`). For example, `sePaRC()` is a
parallel R-C impedance placed in the two-port series path, while `paSeRC()` is
a series R-C branch placed in shunt. No nodal assembly is needed because each
constructor returns the completed two-port directly.

Every constructor reports the magnitude and angle of input reflection
($S_{11}$) and forward transmission ($S_{21}$). The calls omit their arguments
and therefore use the nP defaults: $R=75\ \Omega$, $L=5\ \text{nH}$
($5\times10^{-9}\ \text{H}$), and $C=1\ \text{pF}$
($1\times10^{-12}\ \text{F}$). The example also retains nP's default frequency
list of 2 GHz.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Medley/pg26-30-RLCs.html`
> - **Archive collection:** Archived Medley example collection
> - **Book:** *Microwave Circuit Design Using Programmable Calculators*
> - **Authors:** J. Lamar Allen and Max W. Medley Jr.
> - **Series:** The Artech House Microwave Library
> - **Publication:** Dedham, Massachusetts: Artech House, 1980
> - **ISBN:** 0-89006-089-4
> - **Example pages:** 26–30
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> All 22 constructor drawings come directly from the canonical symbol library
> and match the constructors analyzed below. The complete code has been run
> against the bundled nP API; each constructor produces its own labeled output
> table at the default frequency and component values stated above.

## Schematics

These are the same canonical constructor schematics used in [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices]]. They show the
topology implemented inside each constructor rather than an invented nodal
equivalent.

### Basic RLC constructors

| Constructor | Canonical schematic |
| --- | --- |
| `nP.R()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/resistor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/resistor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/resistor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paR()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-resistor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-resistor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-resistor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.L()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/inductor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/inductor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/inductor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paL()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-inductor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-inductor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-inductor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.C()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/capacitor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/capacitor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/capacitor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-capacitor.svg\|240]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-capacitor.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/parallel-capacitor.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |

### Internally series elements

| Constructor | Canonical schematic |
| --- | --- |
| `nP.seSeRL()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rl.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rl.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paSeRL()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rl.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rl.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.seSeRC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paSeRC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.seSeLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-lc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-lc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-lc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paSeLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-lc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-lc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-lc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.seSeRLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rlc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rlc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-series-rlc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paSeRLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rlc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rlc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-series-rlc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |

### Internally parallel elements

| Constructor | Canonical schematic |
| --- | --- |
| `nP.sePaRL()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rl.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rl.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paPaRL()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rl.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rl.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.sePaRC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paPaRC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.sePaLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-lc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-lc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-lc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paPaLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-lc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-lc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-lc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.sePaRLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rlc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rlc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/se-parallel-rlc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| `nP.paPaRLC()` | <span style="display:flex;flex-direction:column;align-items:flex-start;">![[nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rlc.svg\|300]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rlc.svg" href="nPort RF Analysis/Lessons/Schematic Authoring/Symbols/pa-parallel-rlc.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |

## Example Code

This version uses the dedicated nP constructors that correspond to the
schematics above. Each constructor produces its own output data and its own
table, with the constructor name shown as the table title.

```npjs
// from Medley page 26-30
// uses default values for frequency and components

var rData = nP.R().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [rData],
	title: '1 - nP.R()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paRData = nP.paR().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paRData],
	title: '2 - nP.paR()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var lData = nP.L().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [lData],
	title: '3 - nP.L()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paLData = nP.paL().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paLData],
	title: '4 - nP.paL()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var cData = nP.C().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [cData],
	title: '5 - nP.C()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paCData = nP.paC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paCData],
	title: '6 - nP.paC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var seSeRLData = nP.seSeRL().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [seSeRLData],
	title: '7 - nP.seSeRL()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paSeRLData = nP.paSeRL().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paSeRLData],
	title: '8 - nP.paSeRL()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var seSeRCData = nP.seSeRC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [seSeRCData],
	title: '9 - nP.seSeRC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paSeRCData = nP.paSeRC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paSeRCData],
	title: '10 - nP.paSeRC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var seSeLCData = nP.seSeLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [seSeLCData],
	title: '11 - nP.seSeLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paSeLCData = nP.paSeLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paSeLCData],
	title: '12 - nP.paSeLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var seSeRLCData = nP.seSeRLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [seSeRLCData],
	title: '13 - nP.seSeRLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paSeRLCData = nP.paSeRLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paSeRLCData],
	title: '14 - nP.paSeRLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var sePaRLData = nP.sePaRL().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [sePaRLData],
	title: '15 - nP.sePaRL()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paPaRLData = nP.paPaRL().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paPaRLData],
	title: '16 - nP.paPaRL()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var sePaRCData = nP.sePaRC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [sePaRCData],
	title: '17 - nP.sePaRC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paPaRCData = nP.paPaRC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paPaRCData],
	title: '18 - nP.paPaRC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var sePaLCData = nP.sePaLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [sePaLCData],
	title: '19 - nP.sePaLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paPaLCData = nP.paPaLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paPaLCData],
	title: '20 - nP.paPaLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var sePaRLCData = nP.sePaRLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [sePaRLCData],
	title: '21 - nP.sePaRLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});

var paPaRLCData = nP.paPaRLC().out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);
nP.lineTable({
	inputTable: [paPaRLCData],
	title: '22 - nP.paPaRLC()',
	metricPrefix: 'giga',
	columnWidth: 115,
	fontSize: 12,
	backgroundColor: 'white',
});
```
