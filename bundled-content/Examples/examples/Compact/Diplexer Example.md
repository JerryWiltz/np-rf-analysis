<!-- Modified: 2026-08-17 -->

# Diplexer Example

COMPACT—Computerized Optimization of Microwave Passive and Active
Circuits—was written by Les Besser and commercialized in 1973 as an early
microwave circuit-analysis and optimization program, initially delivered
through commercial time-sharing systems. This diplexer analysis comes from
page 27 of Besser's earliest 1978 COMPACT user manual. The nP example follows
the manual's schematic, constructs its high-pass and low-pass branches, and
reproduces the original analysis. For historical background, see
[Microwave Journal's history of microwave design software](https://www.microwavejournal.com/articles/8206-how-design-software-changed-the-world)
and [Besser Associates' company history](https://www.besserassociates.com/About-Us/History).

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Compact/pg27-Ex1.html`
> - **Archive collection:** Archived Compact example collection
> - **Original HTML modification date:** 2026-07-18
> - **Source:** Les Besser's 1978 COMPACT user manual, page 27
> - **Circuit:** Diplexer filter

> [!SUCCESS] Schematic maturity
> The combined drawing preserves the top-level `filt` topology and nodes 1
> through 5. The two branch drawings preserve the COMPACT component values,
> constructor order, and each nested network's local nP node numbers.

## High-Pass Branch

![[nPort RF Analysis/Examples/Images/diplexer-high-pass-branch.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/diplexer-high-pass-branch.svg" href="nPort RF Analysis/Examples/Images/diplexer-high-pass-branch.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Low-Pass Branch

![[nPort RF Analysis/Examples/Images/diplexer-low-pass-branch.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/diplexer-low-pass-branch.svg" href="nPort RF Analysis/Examples/Images/diplexer-low-pass-branch.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Combined Diplexer

The input Tee sends node 2 into the high-pass two-port and node 3 into the
low-pass two-port. Their outputs at nodes 4 and 5 become diplexer ports 2 and
3, exactly matching the final `nP.nodal()` call.

![[nPort RF Analysis/Examples/Images/diplexer-combined.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/diplexer-combined.svg" href="nPort RF Analysis/Examples/Images/diplexer-combined.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// set up the frequency
		var g = nP.global;
		g.fList = g.fGen(
		    100e6,                          // Start frequency in hertz
		    1000e6,                         // Stop frequency in hertz
		    500,                            // Number of frequency points
		);
		//g.fList = [100e6,400e6,700e6,1000e6];

		// set up the high pass
		var c1 = nP.C(3.05e-12);
		var Tee = nP.Tee();
		var r1 = nP.R(0.6);
		var l1 = nP.L(56.4e-9);
		var c2 = nP.C(23.55e-12);
		var Short = nP.Short();
		var hp = nP.nodal(
			[c1, 1, 2],
			[Tee, 5, 2, 3],
			[c2, 3, 4],
			[r1, 5, 6],
			[l1, 6, 7],
			[Short, 7],
			['out', 1, 4]
		);

		// set up the low pass
		var r2 = nP.R(0.3);
		var l2 = nP.L(32.4e-9);
		var c3 = nP.C(7.15e-12);
		var r3 = nP.R(0.1);
		var l3 = nP.L(33.5e-9);
		var lp = nP.nodal(
			[r2, 1, 2],
			[l2, 2, 3],
			[Tee, 7, 3, 4],
			[r3, 4, 5],
			[l3, 5, 6],
			[c3, 7, 8],
			[Short, 8],
			['out', 1, 6]
		);

		// set up the diplexer and run the analysis
		var filt = nP.nodal(
			[Tee, 1, 2, 3],
			[hp, 2, 4],
			[lp, 3, 5],
			['out', 1, 4, 5]
		);
		var filtOut = filt.out(
		    's21dB',                        // Forward transmission
		    's31dB',                        // Response at port 3 from excitation at port 1
		);

		// set up plot
		var plot = {
			mount: '#myChart',
			inputTable: [filtOut],
			metricPrefix: 'giga',
		};

		var chart1 = nP.lineChart(plot);

		//var chart2 = nP.lineChart();
```
