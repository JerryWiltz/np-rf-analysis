<!-- Modified: 2026-08-13 -->

# Schematic Composer and Validator

These authoring tools preserve two separate truths:

- Canonical component geometry comes from `nPort RF Analysis/Lessons/Schematic Authoring/Symbols/`.
- Circuit topology comes from an original schematic interpreted into a
  declarative circuit description.

## Scanned examples

`Images/Schematic Sources/PNG/` contains historical raster examples imported
from the nP repository. Treat these PNG files as scanned electrical-source
references only. They are not canonical component geometry, composer inputs,
or finished lesson and Example schematics. When one is used as source
material, preserve its circuit topology but construct the clean SVG from the
canonical symbol library.

The tools do not infer a complicated circuit from `npjs`, and they do not
replace the original schematic. An author or agent first identifies the
components, constructor-port connections, values, nodes, external ports, and
layout from the source schematic.

Validate the complete canonical library before drawing:

```bash
node nPort RF Analysis/Lessons/Schematic Authoring/Tools/validate-symbol-library.js
```

Use `--json` to print the SHA-256 values and public port coordinates derived
from all canonical SVGs. These coordinates—not a remembered or redrawn
version of a symbol—control component placement.

## Compose a complete SVG

```bash
node nPort RF Analysis/Lessons/Schematic Authoring/Tools/compose-schematic.js description.json output.svg
```

Use `-` as the description path to read JSON from standard input. A permanent
`circuits/*.js` file is not required. The composer embeds the description and
canonical-symbol hashes inside the resulting self-contained SVG.

The composer also exports `compose()` and `validateDescription()` for trusted
authoring scripts that need to create several drawings in one process. The CLI
and imported API run the same description checks and canonical-geometry logic.

The description has this general shape:

```json
{
  "title": "Series resistor",
  "description": "R1 connected between nP nodes 1 and 2.",
  "viewBox": [0, 0, 320, 200],
  "layout": {"centerAxisX": 160, "centerReference": "R1 midpoint"},
  "components": [
    {
      "id": "R1",
      "symbol": "resistor.svg",
      "at": [80, 100],
      "sourceAnchor": [60, 80],
      "connections": [
        {"port": 1, "node": 1, "at": [80, 100], "labelAt": [80, 60]},
        {"port": 2, "node": 2, "at": [180, 100], "labelAt": [180, 60]}
      ]
    }
  ],
  "wires": [
    {"points": [[40, 100], [80, 100]]},
    {"points": [[180, 100], [280, 100]]}
  ],
  "terminals": [
    {"at": [40, 100]},
    {"at": [280, 100]}
  ],
  "labels": [
    {"text": "R1 = 75 Ω", "at": [130, 50], "anchor": "middle"},
    {"text": "Port 1", "at": [40, 140], "anchor": "middle"},
    {"text": "Port 2", "at": [280, 140], "anchor": "middle"}
  ]
}
```

`nPort RF Analysis/Lessons/Schematic Authoring/Tools/fixtures/three-series-resistors.json` is a complete composition
example that places the exact canonical resistor geometry three times. Shared
series nodes use the same coordinates, so no arbitrary wire is inserted
between touching component terminals.

`at` is where the canonical symbol's `sourceAnchor` is placed. If
`sourceAnchor` is omitted, it defaults to constructor port 1. Rotation must be
a multiple of 90 degrees. The composer derives every other constructor-port
coordinate and rejects a mismatched `connections` entry. Use the 20-unit grid
for ordinary electrical routing and the 10-unit annotation grid for labels.
Exact terminal coordinates from an established compact canonical symbol are
allowed between grid points; route back to the standard grid when practical.

Use `terminals` for filled external-port dots at the outer ends of explicitly
described wires. Terminal coordinates use the 20-unit grid. Do not use an
anonymous circle when the dot represents an external electrical terminal; the
composer and validator keep declared terminals tied to their metadata.

`layout.centerAxisX` records the electrical center used to lay out the
schematic, and `layout.centerReference` names that component, junction, or
principal-path midpoint. When `layout` is present, the composer and validator
require `centerAxisX` to equal `viewBox min-x + width / 2`, the SVG's vertical
y-axis. This documents electrical centering rather than assuming that equal
outer canvases imply aligned circuits.

The composer copies all component geometry between the canonical SVG's white
reference background and its label/terminal group. This includes canonical
symbols whose geometry uses root-level paths or rectangles instead of a
wrapper `<g>`. Standalone titles, port captions, terminal dots, and the white
reference background are not copied. The complete SVG supplies its own labels
and node markers.

## Validate

```bash
node nPort RF Analysis/Lessons/Schematic Authoring/Tools/validate-schematic.js output.svg
node nPort RF Analysis/Lessons/Schematic Authoring/Tools/validate-centering.js output.svg
```

Validation checks:

- safe, self-contained SVG content;
- a viewBox whose dimensions are multiples of 20;
- a documented electrical center that coincides with the viewBox y-axis when
  `layout` metadata is present;
- component placement and wires on the electrical grid;
- labels on the annotation grid;
- one connection entry for every described constructor port;
- canonical full-symbol and geometry SHA-256 provenance still match the library;
- the actual embedded component primitives match the canonical geometry;
- every described connection lands on its constructor's canonical port;
- every described node has a visible dot and circled number in the output.
- every rendered node-number circle matches its metadata position, retains the
  standard 12-unit radius, and keeps at least 8 units of clearance outside its
  edge from every described wire segment;
- rendered non-node text has a clear bounding box that does not intersect a
  described wire segment;
- described wires contain no diagonal segments.

This validator proves agreement with the embedded declarative description. A
human or agent must still compare that description with the original
schematic and the associated `npjs`, then inspect the rendered SVG for text,
symbol, and component-stroke collisions before promotion.

`apply-centering-audit.js` records the audited electrical centers for composed
Example schematics. `apply-lesson-centering-audit.js` records the corresponding
centers for the hand-authored Lesson drawings. These are deliberate migration
maps, not automatic center inference: update a mapping only after checking the
topology and matching `npjs`. After either migration, run
`validate-centering.js`, render the affected SVGs, and inspect their actual
Obsidian Reading-view embeds.

`apply-bottom-margin-audit.js` records deliberate viewBox-height reductions for
schematics whose rendered content left excessive blank space below the
drawing. Preserve at least the required 40-unit bottom margin, and keep paired
comparison drawings at equal canvas heights when their note alignment depends
on matching aspect ratios.
