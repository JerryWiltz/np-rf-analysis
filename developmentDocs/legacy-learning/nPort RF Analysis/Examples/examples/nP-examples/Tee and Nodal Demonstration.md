<!-- Modified: 2026-08-17 -->

# Tee and Nodal Demonstration

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/nP-examples/nodalDemo.html`
> - **Archive collection:** Archived nP-examples example collection
> - **Original HTML modification date:** 2026-06-27

> [!SUCCESS] Schematic maturity
> Each test has its own self-contained drawing because the code intentionally
> reuses local nP node numbers. All six topologies, constructor-port orders,
> values, external ports, and terminations have been checked against the
> runnable analysis and use canonical symbol-library geometry.

## Test 1 — Back-to-Back Tees

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-test-1-back-to-back.svg" href="nPort RF Analysis/Examples/Images/tee-test-1-back-to-back.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Test 2 — Parallel Resistors Between Tees

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-test-2-parallel-resistors.svg" href="nPort RF Analysis/Examples/Images/tee-test-2-parallel-resistors.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Test 3 — Parallel Resistor and Inductor Between Tees

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-test-3-parallel-rl.svg" href="nPort RF Analysis/Examples/Images/tee-test-3-parallel-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Shunt-Branch Network

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-shunt-branch-network.svg" href="nPort RF Analysis/Examples/Images/tee-shunt-branch-network.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Alternate Shunt Topology

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-alternate-shunt-network.svg" href="nPort RF Analysis/Examples/Images/tee-alternate-shunt-network.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Parallel R-L and Dual-Shunt Network

Run the `npjs` block below to generate the schematic with nP.

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/tee-parallel-network.svg" href="nPort RF Analysis/Examples/Images/tee-parallel-network.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
var r150 = nP.R(150);
var r37  = nP.R(37.5);

var r75  = nP.R(75);

var l5   = nP.L(5e-9);

var Tee  = nP.Tee();

//Test 1 backToBack Tee's
var backToBack1 = nP.nodal(
	[Tee, 1, 3, 2],
	[Tee, 4, 2, 3],
	['out', 1, 4]
).out(
    's11dB',                                // Input reflection
    's21dB',                                // Forward transmission
);

//Test 2 backToBack with parallel resistors between Tee's
var backToBack2 = nP.nodal(
	[Tee, 1, 4, 2],
	[r150, 2, 3],
	[r150, 4, 5],
	[Tee, 6, 5, 3],
	['out', 1, 6]
).out(
    's11mag',                               // Input reflection
    's21mag',                               // Forward transmission
);

//Test 3 backToBack with parallel resistor and inductor between Tee's
var backToBack3 = nP.nodal(
	[Tee, 1, 4, 2],
	[r75, 2, 3],
	[l5, 4, 5],
	[Tee, 6, 5, 3],
	['out', 1, 6]
).out(
    's11mag',                               // Input reflection
    's21mag',                               // Forward transmission
);

var Short = nP.Short()

var sp = nP.nodal(
	[Tee, 1, 2, 3],
	[r150, 1, 4],
	[Short, 4],
	[r150, 3, 5],
	['out', 2, 5]
).out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

var altsp = nP.nodal(
	[Tee, 1, 4, 2],
	[r150, 2, 3],
	[r150, 4, 5],
	[Short, 5],
	['out', 1, 3]
).out(
    's11mag',                               // Input reflection
    's11ang',                               // Input reflection
    's21mag',                               // Forward transmission
    's21ang',                               // Forward transmission
);

var parl = nP.nodal(
	[Tee, 1, 3, 2],
	[r37, 3, 4],
	[l5, 4, 5],
	[Tee, 5, 6, 8],
	[r75, 6, 7],
	[r75, 8, 9],
	[Short, 7],
	[Short, 9],
	['out', 1, 2]
).out(
    's11mag',                               // Input reflection
    's12mag',                               // Response at port 1 from excitation at port 2
    's12ang',                               // Response at port 1 from excitation at port 2
);

nP.lineTable({
	inputTable: [backToBack1],
	title: 'Test 1 — Back-to-Back Tees',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});

nP.lineTable({
	inputTable: [backToBack2],
	title: 'Test 2 — Parallel Resistors Between Tees',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});

nP.lineTable({
	inputTable: [backToBack3],
	title: 'Test 3 — Parallel Resistor and Inductor Between Tees',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});

nP.lineTable({
	inputTable: [sp],
	title: 'Shunt-Branch S-Parameters',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});

nP.lineTable({
	inputTable: [altsp],
	title: 'Alternate-Topology S-Parameters',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});

nP.lineTable({
	inputTable: [parl],
	title: 'Parallel-Network S-Parameters',
	metricPrefix: 'giga',
	backgroundColor: 'white',
});
```
