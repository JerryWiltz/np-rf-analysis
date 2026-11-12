<!-- Generated from nP REPL example microstrip-film-resistor; do not edit the copied code here. -->

# 34 Thin-film resistor

[Open this example in the nP REPL](https://jerrywiltz.github.io/nP/repl.html#example-microstrip-film-resistor)

This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.

```npjs
// Thin-film resistor

nP.global.fList = nP.global.fGen(1e9, 5e9, 21);

var resistor = nP.mtfr({
  ohmsPerSquare: 50,
  width: 0.25e-3,
  length: 0.5e-3,
  sections: 3
});

var resistanceOhms = resistor.filmResistor.resistance;

nP.log('DC resistance (ohms):');
nP.log(resistanceOhms);

nP.lineChart({
  inputTable: [resistor.out('s11dB', 's21dB')],
  title: 'Thin-film resistor'
});

nP.schematic(resistor);
```
