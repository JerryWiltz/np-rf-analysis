<!-- Modified: 2026-08-17 -->

# 3 GHz Rat-Race Divider

This example is based on the rat-race divider presented in
*Computer-Aided Design of Microwave Circuits* by K. C. Gupta, Ramesh Garg, and
Rakesh Chadha. The nP analysis follows the 3 GHz transmission-line circuit from
page 583 of the 1981 Artech House book. The first analysis uses ideal
transmission lines and ideal Tee junctions. The second uses physical
microstrip lines and physical microstrip tee discontinuity models.

Although each ring contains four Tee junctions, it needs only one kind of Tee.
All four junctions in the ideal ring are electrically identical, so one
`nP.Tee()` object is reused at the four nodal locations. Likewise, all four
junctions in the physical ring have the same arm widths, substrate, and
material properties, so one `nP.mtee()` object is reused four times. The nodal
connection list places each reusable model at a different set of circuit nodes;
separate constructor calls would be needed only if a junction had different
dimensions or properties.

In this divider configuration, port 1 is the input. At the 3 GHz design
frequency, the incident power divides equally between the paths from port 1 to
port 2 and from port 1 to port 4, so each output ideally receives one-half of
the input power. The two waves traveling around the ring cancel at port 3,
making port 3 the isolated port. The plotted $S_{31}$ response shows that
isolation, while $S_{41}$ shows one of the two equal-power output paths.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Gupta/pg583-ratRaceDivider.html`
> - **Archive collection:** Archived Gupta example collection
> - **Original HTML modification date:** 2026-07-18
> - **Book:** *Computer-Aided Design of Microwave Circuits*
> - **Authors:** K. C. Gupta, Ramesh Garg, and Rakesh Chadha
> - **Publisher and year:** Artech House, 1981
> - **Page:** 583

> [!SUCCESS] Schematic maturity
> The closed ring, four Tee junctions, three quarter-wave sections, one
> three-quarter-wave section, external ports, and nP node numbers have been
> checked against both analyses. The ideal and microstrip code use the same
> topology; only the line model changes.

## Schematic

![[nPort RF Analysis/Examples/Images/rat-race-divider.svg|900]]

<a class="internal-link" data-href="nPort RF Analysis/Examples/Images/rat-race-divider.svg" href="nPort RF Analysis/Examples/Images/rat-race-divider.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## Example Code

This archived code uses the nP API without direct browser-page dependencies. Review legacy constructor and display choices before relying on it as current recommended practice.

```npjs
// center frequency is 3.0 GHz
		// set up the frequency
		var g = nP.global;
		g.fList = g.fGen(
			0.5e9,                          // Start frequency: 0.5 GHz
			5.5e9,                          // Stop frequency: 5.5 GHz
			101,                            // Number of frequency points
		);

		// nP physical dimensions are in metres.
		// Keep the source dimensions readable by defining 1 mil once.
		var mil = 0.001 * 0.0254;           // 1 mil = 0.001 inch = 25.4 µm

		// set up the rat race with tlins
		var idealTee = nP.Tee();
		var t3qtr = nP.Tlin(
			70.7,                           // Zo: characteristic impedance in ohms
			2950.7 * mil,                   // Length: three-quarter wavelength
		);

		var t1qtr = nP.Tlin(
			70.7,                           // Zo: characteristic impedance in ohms
			983.5 * mil,                    // Length: one-quarter wavelength
		);

		var pwr = nP.nodal(
			[idealTee, 1, 12, 2],
			[t1qtr, 2, 3],
			[idealTee, 4, 3, 5],
			[t1qtr, 5, 6],
			[idealTee, 7, 6, 8],
			[t1qtr, 8, 9,],
			[idealTee, 10, 9, 11],
			[t3qtr, 11, 12],
			['out', 1, 4, 7, 10]);

		// set up the plot
		var plot1 = pwr.out(
			's41dB',                        // Port 1 to port 4 divided output
			's31dB',                        // Port 1 to port 3 isolation
		);
		var inputObject1 = {
			inputTable: [plot1],
			mount: '#canvas1',
			title: 'Ideal 3 GHz Rat-Race Divider — S41 dB blue, S31 dB orange',
			showLabels: false,
		};

		// Plot the frequency response
		var chart1 = nP.lineChart(inputObject1);

		// set up the rat race with mlins and physical microstrip tees
		var microstripTee = nP.mtee(
			196 * mil,                      // Port 1 common-arm width
			196 * mil,                      // Port 2 branch width
			196 * mil,                      // Port 3 branch width
			125 * mil,                      // Substrate height
			0.0125 * mil,                   // Conductor thickness
			2.55,                           // Relative permittivity
			0,                              // Conductor loss disabled
			0,                              // Dielectric loss disabled
			0,                              // RMS conductor roughness
		);

		var m3qtr = nP.mlin(
			196 * mil,                      // Width
			125 * mil,                      // Substrate height
			3 * 685 * mil,                  // Length: three-quarter wavelength
			0.0125 * mil,                   // Conductor thickness
			2.55,                           // er: relative permittivity
			0,                              // rho: conductor loss disabled
			0,                              // tand: dielectric loss disabled
		);

		var m1qtr = nP.mlin(
			196 * mil,                      // Width
			125 * mil,                      // Substrate height
			685 * mil,                      // Length: one-quarter wavelength
			0.0125 * mil,                   // Conductor thickness
			2.55,                           // er: relative permittivity
			0,                              // rho: conductor loss disabled
			0,                              // tand: dielectric loss disabled
		);

		var pwr = nP.nodal(
			[microstripTee, 1, 12, 2],
			[m1qtr, 2, 3],
			[microstripTee, 4, 3, 5],
			[m1qtr, 5, 6],
			[microstripTee, 7, 6, 8],
			[m1qtr, 8, 9,],
			[microstripTee, 10, 9, 11],
			[m3qtr, 11, 12],
			['out', 1, 4, 7, 10]);

		// set up the plot
		var plot2 = pwr.out(
			's41dB',                        // Port 1 to port 4 divided output
			's31dB',                        // Port 1 to port 3 isolation
		);
		var inputObject2 = {
			inputTable: [plot2],
			mount: '#canvas2',
			title: 'Microstrip 3 GHz Rat-Race Divider — S41 dB blue, S31 dB orange',
			showLabels: false,
		};

		// Plot the frequency response
		var chart2 = nP.lineChart(inputObject2);
```
