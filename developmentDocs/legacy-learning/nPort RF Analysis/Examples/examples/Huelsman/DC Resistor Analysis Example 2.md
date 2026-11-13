<!-- Modified: 2026-08-18 -->

# DC Resistor Analysis Example 2

This example is based on Example 3.4-1 from *Basic Circuit Theory with Digital
Computations* by Lawrence P. Huelsman. The nP code uses matrix inversion to
solve the larger system of circuit equations presented on page 90 of the 1972
Prentice-Hall book.

This larger example shows the same nP matrix workflow scaling to a more involved
resistor network. After the network equations are assembled into a resistance
matrix and a voltage matrix, `.invert().mul()` solves the complete set of
unknown currents without writing a separate scalar equation for each one.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/Huelsman/pg90-Ex3-4-1.html`
> - **Archive collection:** Archived Huelsman example collection
> - **Original HTML modification date:** 2026-06-27
> - **Book:** *Basic Circuit Theory with Digital Computations*
> - **Author:** Lawrence P. Huelsman
> - **Publisher and year:** Prentice-Hall, 1972
> - **Page and example:** Page 90, Example 3.4-1

> [!SUCCESS] Analysis maturity
> This is a matrix-analysis example rather than an nP component-network
> example. The archived source contains the coefficient and excitation
> matrices but no circuit drawing, so the matrices—not a reconstructed
> schematic—remain the retained source of truth. Both solution methods have
> been run against the bundled nP API and agree for all five currents.

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
// Set up the resistance matrix.
var r = nP.matrix([
	[1017 + 3492, -1017, 0, 0, -3492],
	[-1017, 842 + 4821 + 1017, -842, -4281, 0],
	[0, -842, 5670 + 5732 + 842, -5732, 0],
	[0, -4821, -5732, 5732 + 986 + 837 + 4821, -837],
	[-3492, 0, 0, -837, 837 + 949 + 3492],
]);

// Set up the voltage matrix.
var v = nP.matrix([
	[38.9],
	[42.1],
	[59.76],
	[0],
	[0],
]);

function formatCurrentVector(matrix) {
	return matrix.m.map(function (row, index) {
		return 'I' + (index + 1) + ' = ' + Number(row[0].toPrecision(8)) + ' A';
	}).join('\n');
}

// Compute the current matrix by inversion and multiplication.
var i = r.invert().mul(v);
console.log('Solution from invert().mul()\n' + formatCurrentVector(i) + '\n');

// Add the voltage column and solve the augmented matrix with Gaussian elimination.
var augmented = nP.matrix([
	[1017 + 3492, -1017, 0, 0, -3492, 38.9],
	[-1017, 842 + 4821 + 1017, -842, -4281, 0, 42.1],
	[0, -842, 5670 + 5732 + 842, -5732, 0, 59.76],
	[0, -4821, -5732, 5732 + 986 + 837 + 4821, -837, 0],
	[-3492, 0, 0, -837, 837 + 949 + 3492, 0],
]);

var gaussianSolution = augmented.solveGaussFB();
console.log(
	'Solution from solveGaussFB()\n' + formatCurrentVector(gaussianSolution)
);

var methodsAgree = i.m.every(function (row, index) {
	return Math.abs(row[0] - gaussianSolution.m[index][0]) < 1e-12;
});
console.log('\nMethods agree: ' + methodsAgree);
```
