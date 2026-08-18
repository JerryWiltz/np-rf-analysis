<!-- Modified: 2026-08-17 -->

# Complex Numbers and Matrices

This example note adapts material from an archived nP browser page for use in Obsidian. The original source details are retained below, and code changes are described in the note.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/GistHTMLs/ComplexNumbersAndMatrix.html`
> - **Archive collection:** Archived GistHTMLs example collection
> - **Original HTML modification date:** 2026-06-27

## Example Code

This archived example has been adapted to use the `npjs` console. Its `nP.log()` calls were replaced with `console.log()`, and the resulting block executes against the bundled nP API. Other legacy modeling choices remain unchanged.

```npjs
// define some complex numbers
var c1 = nP.complex(
    2,                                      // Real part
    3,                                      // Imaginary part
);
var c2 = nP.complex(
    -2,                                     // Real part
    4,                                      // Imaginary part
);
var c3 = nP.complex(
    37,                                     // Real part
    -89,                                    // Imaginary part
);
var c4 = nP.complex(
    -5,                                     // Real part
    7,                                      // Imaginary part
);

// put them in a 2 by 2 matrix
var m1 = nP.matrix([
		[c1, c2],
		[c3, c4]
]);

// Format an nP complex Matrix as readable rows of a + jb values.
function formatNumber(value) {
	if (Math.abs(value) < 1e-12) return '0';
	return Number(value.toPrecision(6)).toString();
}

function formatComplex(value) {
	var real = formatNumber(value.x);
	var imaginaryValue = Math.abs(value.y) < 1e-12 ? 0 : value.y;
	var imaginary = formatNumber(Math.abs(imaginaryValue));
	var sign = imaginaryValue < 0 ? ' - j' : ' + j';
	return real + sign + imaginary;
}

function formatMatrix(matrix) {
	return matrix.m.map(function (row) {
		return '[ ' + row.map(formatComplex).join('    ') + ' ]';
	}).join('\n');
}

// display m1
console.log('The original matrix, m1\n' + formatMatrix(m1) + '\n');

// invert matrix, m1
var m2 = m1.invertCplx();

// display m2
console.log('The inverted matrix, m2\n' + formatMatrix(m2) + '\n');

// multipliy m1 by m2
var m3 = m1.mulCplx(m2);

// display m3
console.log('The product of m1 and m2, m3\n' + formatMatrix(m3) + '\n');

// show method chaining
var m4 = m3.mulCplx(m2).subCplx(m1).addCplx(m1);
console.log('The result of method chaining\n' + formatMatrix(m4));
```
