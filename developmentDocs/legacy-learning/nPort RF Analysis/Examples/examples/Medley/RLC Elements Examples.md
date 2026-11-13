<!-- Modified: 2026-11-09 -->

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

This example uses nP's current runtime schematic renderer. It does not ship or
maintain separate drawings for each constructor. The constructor comparison
below remains focused on the measured S-parameter results; see [[22 Creating
Schematics with an Agent]] for a runnable network-and-schematic example.

## Runtime schematic example

This small circuit draws explicit series RLC components with nP's current
schematic renderer. The diagram comes from the same network that is analyzed.
Press **Run** to see the SVG in the result area.

```npjs
nP.global.fList = [2e9];

var r1 = nP.R(75);
var l1 = nP.L(5e-9);
var c1 = nP.C(1e-12);
var rlc = nP.nodal(
  [r1, 1, 2],
  [l1, 2, 3],
  [c1, 3, 4],
  ['out', 1, 4]
);

nP.schematic(rlc);
```

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
