<!-- Modified: 2026-08-18 -->

# DC Resistor Analysis 1

This example is based on Example 3.2-1 from *Basic Circuit Theory with Digital
Computations* by Lawrence P. Huelsman. The nP code uses matrix inversion to
solve the circuit equations presented on page 70 of the 1972 Prentice-Hall
book.

This example highlights how nP matrices support network analysis. The circuit's
resistance coefficients and source voltages are entered as matrices; nP then
inverts the resistance matrix and multiplies it by the voltage matrix to obtain
all three mesh currents in one calculation.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Huelsman/pg70-Ex3-2-1.html`
> - **Archive collection:** Archived Huelsman example collection
> - **Original HTML modification date:** 2026-06-27
> - **Book:** *Basic Circuit Theory with Digital Computations*
> - **Author:** Lawrence P. Huelsman
> - **Publisher and year:** Prentice-Hall, 1972
> - **Page and example:** Page 70, Example 3.2-1

> [!SUCCESS] Analysis maturity
> This is a matrix-analysis example rather than an nP component-network
> example. The archived source contains the coefficient and excitation
> matrices but no circuit drawing, so the matrices—not a reconstructed
> schematic—remain the retained source of truth. The calculation has been run
> against the bundled nP API and reproduces the three published mesh currents.

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
// Set up the resistance matrix.
var r = nP.matrix([
	[3, -2, -1],
	[-2, 5, -3],
	[-1, -3, 8],
]);

// Set up the voltage matrix.
var v = nP.matrix([
	[7],
	[-12],
	[9],
]);

function formatCurrentVector(matrix) {
	return matrix.m.map(function (row, index) {
		return 'I' + (index + 1) + ' = ' + Number(row[0].toPrecision(8)) + ' A';
	}).join('\n');
}

// Compute the current matrix by inversion and multiplication.
var i = r.invert().mul(v);
console.log('Mesh currents\n' + formatCurrentVector(i));
```
