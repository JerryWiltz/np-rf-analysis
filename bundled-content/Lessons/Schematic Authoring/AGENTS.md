<!-- Modified: 2026-08-13 -->

# AGENTS.md

Instructions for creating and maintaining SVG circuit schematics in `Images/`.

## Scope and Purpose

These instructions apply to this directory and everything below it. This directory is the vault's canonical source for circuit schematics embedded in notes anywhere in the vault.

Write schematics as readable, hand-maintained SVG code. The purpose of this standard is to keep component symbols, spacing, reference designators, node numbers, ports, colors, and typography consistent from note to note.

Treat every finished SVG as a hand-authored vector drawing. A scan or raster
source is evidence for topology and annotations, not a pixel-by-pixel tracing
template. Identify the circuit first, then deliberately lay it out with
canonical symbols, grid-aligned wires, editable SVG primitives, and readable
text. Do not use image tracing, raster-to-vector conversion, or dense paths
that imitate the source pixels.

## Two Sources of Truth

- **SVG truth:** `Images/Symbol Library SVG/` contains the one canonical SVG
  geometry for each visually distinct constructor family. Every occurrence of
  a component in a complete schematic must reproduce that canonical geometry
  exactly.
- **Analysis truth:** the original hand-drawn, scanned, or published schematic
  defines the circuit topology. Its circuit description and matching `npjs`
  must preserve the same components, values, constructor-port order, node
  numbers, connections, and external ports.

A complete schematic is valid only when it satisfies both truths. Electrical
equivalence alone is insufficient when the source schematic specifies a
particular topology, node assignment, or constructor-port order. Stop and
resolve any disagreement among the source schematic, circuit description,
SVG, and `npjs`.

Store redistributable scans and photographs in `Images/Schematic Sources/`.
When a source cannot be stored in the vault, cite it in the associated note.

Store a shared schematic here once and embed it in a note with an Obsidian link such as:

```markdown
![[Images/series-rc.svg]]
```

Do not make an unrelated copy of the same schematic in each note folder.

Use a subfolder that mirrors the note collection when several schematics belong to that collection. For example, learning-note schematics belong in `Images/1 Learning nP SVG/`, not inside the note folder itself.

Store canonical individual-component drawings in `Images/Symbol Library SVG/`. Keep one SVG for each constructor family selected for the visual catalog. Complete circuit schematics must copy the established geometry into their self-contained SVG; they must not import the symbol file as an external resource.

Use `schematics/compose-schematic.js` when assembling a circuit from canonical
symbols. The composer expands canonical SVG primitives into one larger,
self-contained SVG and records symbol provenance; it must not redefine symbol
geometry. Use `schematics/validate-schematic.js` on composed output before
promotion. A permanent circuit-specific JavaScript drawing file is not
required because the composer accepts a declarative description or standard
input.

This rule applies to every symbol in the canonical library, without exception.
An agent must obtain component geometry from the library rather than from its
memory, a prior circuit SVG, a lesson image, or an electrically equivalent
drawing. Run `schematics/validate-symbol-library.js` before composition. The
composer derives public port coordinates directly from each canonical SVG and
rejects a circuit description whose connection coordinates do not land on
those ports. The schematic validator checks both the full-symbol hash and the
actual embedded geometry, so retaining a stale hash cannot conceal redrawn or
modified component primitives.

The constructor inventory in `1 Learning nP/200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md` is the visual symbol index. When a public component constructor is added or renamed, update that note and the symbol library together. The `seR()`, `seL()`, and `seC()` aliases reuse the identical canonical `R()`, `L()`, and `C()` drawings. Constructors with distinct shunt, internally series, or internally parallel topology receive their own canonical reference schematic. Explicit `R()`, `L()`, and `C()` components plus `nP.nodal()` remain the preferred visual language for new instructional circuits.

## Coordinate System and Grid

- Use SVG `viewBox` units as the coordinate system. Do not treat the drawing coordinates as physical screen pixels.
- Use a 20-unit electrical grid.
- Snap wire endpoints, component terminals, junctions, external ports, and electrical nodes to coordinates divisible by 20 by default. A multi-lead component side may place terminals on the 10-unit half-grid when its symbol definition explicitly requires positions such as 10 and 30. When an established compact canonical symbol has a smaller internal port spacing, its exact transformed terminal coordinates take precedence; connect wires to those coordinates and return to the 20-unit routing grid as soon as practical.
- Use a 10-unit half-grid for ordinary symbol details and annotation placement. A 5-unit quarter-grid may be used only to center paired or repeated symbol details, such as capacitor plates or inductor loops, between electrical nodes.
- Do not put an electrical connection point on the half-grid except for an explicitly defined multi-lead side.
- Make the `viewBox` width and height multiples of 20.
- Keep at least a 40-unit margin between the circuit and each edge of the `viewBox`.
- Prefer horizontal signal flow from left to right. Use vertical branches for shunt elements.
- Use horizontal and vertical wires unless a standard component symbol requires diagonal segments.

### Electrical Centering About the Y-Axis

- Center every complete circuit schematic horizontally about the SVG's vertical
  y-axis. The y-axis is the line `viewBox min-x + width / 2`; it is not merely
  the center of an image element or Obsidian embed container.
- Identify the circuit's electrical center before laying it out. For a
  symmetric network, use its central component or junction. For a series path,
  use the midpoint of the principal signal path unless a clearly dominant
  central component exists. For an asymmetric topology, select and document
  the electrical reference that best expresses the circuit structure.
- Put that electrical center exactly on the SVG y-axis. Do not center using
  whitespace, labels, terminal captions, the overall ink bounding box, or the
  outer dimensions of an unequal branch layout.
- When two or more schematics are compared in one note, use the same kind of
  electrical reference and place every reference on the same relative y-axis.
  For the ideal and parasitic π attenuators, the center of R2 is the reference.
- Record composed-schematic centering in metadata as
  `"layout":{"centerAxisX": ..., "centerReference":"..."}`. The axis must
  equal the viewBox y-axis. A nonzero or half-grid `viewBox` minimum may be used
  to align its y-axis with an electrically meaningful center while leaving
  canonical component anchors on their required grid.

## Standard Geometry

- Use a 2-unit stroke width with round line caps and round line joins.
- Do not lengthen a component's leads merely to fill its canvas or make different component families occupy the same width.
- Use exactly 20-unit leads on both sides of a resistor or inductor. Use exactly 25-unit leads on both sides of a capacitor so its 10-unit plate gap produces a 60-unit terminal-to-terminal span on the 20-unit electrical grid.
- Use a 60-unit-wide by 20-unit-high body for a horizontal ANSI resistor. In local coordinates, put terminals at `(0, 0)` and `(100, 0)`, leads from `x = 0` to `20` and `x = 80` to `100`, and the zigzag body from `x = 20` to `80` between `y = -10` and `10`.
- Use a 10-unit gap and 20-unit plate length for a horizontal series capacitor. In local coordinates, put terminals at `(0, 0)` and `(60, 0)`, leads from `x = 0` to `25` and `x = 35` to `60`, and plates at `x = 25` and `35` from `y = -10` to `10`.
- Use a 60-unit-wide body with four equal upward loops for a horizontal series inductor. In local coordinates, put terminals at `(0, 0)` and `(100, 0)`, leads from `x = 0` to `20` and `x = 80` to `100`, and four 15-unit-wide loops from `x = 20` to `80` rising 20 units above the lead axis.
- Rotate the complete primitive geometry, including its prescribed lead lengths, when drawing a vertical resistor, inductor, or capacitor.
- Draw ideal multiport components such as `Tee()` as 40-unit by 40-unit square bodies. Use the standard component lead length between each numbered node and the square edge.
- Leave the interior of a `Tee()` square empty except for a filled port-marker dot near the square edge corresponding to Tee port 1, the common or branch port. For a downward shunt branch, put this marker inside the bottom of the square. Make an interior common-port or port-1 marker 75% of the terminal-dot diameter so it remains visibly distinct from an electrical terminal.
- Place a filled node directly where two series-component leads meet. Do not insert an arbitrary inter-component wire merely to create spacing.
- Use an ANSI zigzag resistor symbol consistently; do not mix zigzag and rectangular resistor styles.
- Rotate the same ANSI resistor geometry for a vertical resistor; do not invent a differently proportioned shunt-resistor symbol.
- Draw a capacitor as two parallel plates separated by a clear gap. Keep its plates proportionate to nearby symbols, and do not let a wire cross the dielectric gap.
- Draw an nP `Short()` as an empty 40-unit by 40-unit square one-port component with a visible `Short` label outside it. Do not draw a ground symbol or other interior lines. Connect its single numbered node to the square with the standard component lead length.
- Separate drawn `Short()` occurrences are not a shared electrical node merely because the JavaScript object is reused.
- Mark every labeled nP node with a filled connection dot, including nodes at ordinary two-terminal connections and external ports.
- Put the node number by itself inside a nearby outlined circle. Do not write labels such as `node 1` when the circled `1` identifies the node clearly.
- Keep each circled node number close to its connection dot without drawing a leader that could be mistaken for an electrical wire.
- Keep the outside edge of every 12-unit-radius node-number circle at least 8
  viewBox units from every wire, component stroke, and other electrical line.
  A circle or number may never touch, cover, straddle, or sit on a wire.
- Show crossing wires without a junction dot as unconnected. Avoid wire crossings when a clearer layout is possible.

When adding a new symbol family, establish one reusable geometry for it and use that geometry in later schematics. Do not casually redraw an existing symbol with different proportions.

### Symbol Library Reference Drawings

- A symbol-library SVG documents a constructor's component body and public port order; it is not a complete circuit schematic.
- Label constructor ports as `Port 1`, `Port 2`, and so on. Do not add nP circuit-node numbers to a reference symbol.
- Put a filled terminal dot at every public port.
- Put the constructor name in the SVG title area. Omit a circuit reference designator and value unless the symbol itself requires explanatory text.
- Use one-port, two-port, and multiport layouts consistently across ideal and physical versions of the same topology.
- Use the nP public port order even when a source paper or internal equation uses a different order.
- Do not relabel or duplicate the preferred `R()`, `L()`, and `C()` files for the geometrically identical `seR()`, `seL()`, and `seC()` aliases. Give a distinct `pa*`, combined-series, or combined-parallel constructor its own labeled reference schematic when its topology differs.
- A synthesized-network constructor such as `lpfGen()` may use a labeled block symbol instead of implying one primitive component.
- Draw an abstract network or subcircuit block as a plain square-cornered
  rectangle. Do not use rounded rectangles for electrical network blocks.
- In every RLC constructor whose public name begins with lowercase `pa`, keep
  the two-port through path horizontal and draw the internally shunt impedance
  vertically beneath it. Rotate each canonical R, L, or C primitive by 90
  degrees without changing its proportions. Stack internally series elements
  vertically; place internally parallel elements on separate vertical
  branches. Increase the reference SVG height as required rather than turning
  the shunt network sideways or compressing its component geometry.

### Microstrip Bend Handedness

- Maintain separate right-turn and left-turn reference symbols for `nP.mbend()`.
- In the default orientation, port 1 enters from the left. The right-turn variant exits downward at port 2; the left-turn variant exits upward at port 2.
- Begin a bend with one 14-unit by 14-unit corner square plus one 6-unit by 14-unit rectangular extension at each port. Remove the 7-unit by 7-unit triangular outside corner from the copper to form the chamfer. The resulting copper footprint remains 20 units by 20 units. Draw the chamfer as the actual copper boundary; do not overlay a dashed construction line. Do not stretch the port extensions to fill the canvas.
- Rotation may reposition a chosen bend, but it does not change that bend's handedness while preserving the port-flow convention. Use the mirrored variant when the circuit turns the other way.
- Both drawings represent the same reciprocal `nP.mbend()` constructor; handedness is a schematic-layout choice, not a different nP electrical model.

### Microstrip Cross Geometry

- Construct `nP.mcross()` from one 14-unit by 14-unit center square plus one 6-unit by 14-unit rectangular extension centered on each of its four sides.
- The resulting copper footprint is 26 units by 26 units. Do not stretch the port extensions to fill the canvas.
- Preserve the public port order: port 1 left, port 2 top, port 3 right, and port 4 bottom.
- Put a filled port-1 reference dot inside the center square near the left edge. Make it 75% of the terminal-dot diameter and keep it visually separate from the terminal dot at the end of the left extension.

### Microstrip Tee Geometry

- Construct `nP.mtee()` from one 14-unit by 14-unit center square plus one 6-unit by 14-unit rectangular extension at the left, top, and bottom ports.
- The resulting copper footprint is 20 units wide by 26 units high. Do not stretch the port extensions to fill the canvas.
- Preserve the public port order: common port 1 left, branch port 2 top, and branch port 3 bottom.
- Put a filled dot inside the center square near the left edge to identify port 1 as the common port. Keep this marker visually separate from the filled terminal dot at the end of the port extension.
- Reorient a microstrip Tee only by rotating its complete geometry, port numbers, and common-port marker together. Do not mirror the symbol. Rotation never changes the constructor order `[common, branch 1, branch 2]`, and branch 1 and branch 2 must not be renamed input and output.

### `Tee4()` and `Tee5()` Side Convention

Define these symbols in a local 40-unit square coordinate system with the upper-left corner at `(0, 0)` and the lower-right corner at `(40, 40)`. The default orientation puts side 1 at the bottom. Number the remaining sides clockwise:

1. Side 1: bottom, the common side.
2. Side 2: left.
3. Side 3: top, opposite side 1.
4. Side 4: right.

Measure a lead position from the first corner encountered while moving clockwise along that side. Draw every external lead 20 units outward from the square. The entire symbol may be rotated, but rotate the side numbering, common-port dot, and port order together.

For `Tee4()`:

- Port 1 is centered on side 1 at local position 20. Put the common-port dot inside the square at `(20, 30)`.
- Port 2 is centered on side 2 at local position 20.
- Port 3 is centered on side 3 at local position 20.
- Port 4 is centered on side 4 at local position 20.
- Leave all other interior space empty.

For `Tee5()`:

- Port 1 is centered on side 1 at local position 20. Put the common-port dot inside the square at `(20, 30)`.
- Port 2 is centered on side 2 at local position 20.
- Side 3 has two leads: port 3 at local position 10 and port 4 at local position 30.
- Port 5 is centered on side 4 at local position 20.
- Leave all other interior space empty.

## Reference Designators, Values, and Ports

- Preserve reference designators supplied by the user.
- When the user does not supply them, suggest standard designators in circuit order: `R1`, `R2`, `C1`, `L1`, `TL1`, and so on.
- Number components from left to right along the main signal path, then number shunt branches from input toward output.
- Put the reference designator and value together on one line above a horizontal component, using the form `R1 = 75 Ω`, unless the layout requires another clear placement.
- Place every component label fully clear of wires, copper, component bodies, terminal dots, and node markers. A wire must never pass behind or through label text; move the label to one side and change its text anchor when necessary.
- Keep labels on the 10-unit annotation grid.
- Use ordinary engineering units in visible labels, such as `75 Ω`, `5 nH`, `1 pF`, and `50 Ω`.
- Label external ports explicitly as `Port 1`, `Port 2`, and so on.
- Preserve port numbers supplied by the user. Otherwise suggest port numbering that agrees with the matching nP circuit and `['out', ...]` order.
- Keep external port labels visually distinct from internal node labels.

## Node Numbers and nP Nodal Agreement

- Preserve node numbers supplied by the user.
- If node numbers are absent, suggest them in a simple, deterministic order from input to output, followed by shunt-branch nodes.
- Label every node referenced by the matching `nP.nodal()` call.
- Make the SVG topology, component terminal order, node labels, and `nP.nodal()` connection arrays agree exactly.
- Distinguish an external circuit port from its associated nP node number when both are shown.
- For `nP.Tee()`, remember that its internal port 1 is the common or shunt branch. Make the drawing and nodal connection order reflect that convention.
- For `nP.seriesTee()`, ports 1 and 2 form the horizontal through path and port 3 is the series branch. Keep its port-1 marker beside the left through-path port so it cannot be mistaken for an ordinary `Tee()`.
- A reused JavaScript `Tee` or `Short` object does not mean that separate drawn occurrences are electrically connected. Show only the actual circuit connectivity.
- Do not silently invent or renumber nodes when updating an existing schematic. Update the associated note and code if a node change is intentional.

## SVG File Structure

Start each standalone schematic with a structure like this:

```svg
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 600 300"
     role="img"
     aria-labelledby="title description">
  <title id="title">Circuit name</title>
  <desc id="description">Concise description of the circuit topology.</desc>

  <rect width="100%" height="100%" fill="#ffffff"/>

  <g fill="none"
     stroke="#202020"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">
    <!-- Wires and component symbols -->
  </g>

  <g fill="#202020"
     font-family="Arial, Helvetica, sans-serif"
     font-size="16">
    <!-- Labels -->
  </g>
</svg>
```

- Include one descriptive `<title>` and `<desc>` for accessibility.
- Use a white background and dark strokes so schematics remain legible in Obsidian, exported PDFs, and printed notes.
- Keep wires and symbols as SVG primitives and paths. Keep text as SVG `<text>` elements.
- Group related geometry and add concise comments for components, ports, and node groups.
- Prefer explicit coordinates that a person can inspect and edit over generated or minified path data.
- Use lowercase, hyphen-separated filenames such as `series-rc.svg`.
- Do not include an XML declaration unless a consumer specifically requires it.

## Obsidian and Security Compatibility

- Produce self-contained SVG files.
- Do not use JavaScript, `<script>`, event-handler attributes, animation, embedded HTML, `<foreignObject>`, network requests, or external images.
- Do not reference external fonts, style sheets, symbol files, or remote resources.
- Do not put executable links in the SVG.
- Avoid relying on CSS inherited from Obsidian because an embedded SVG may be rendered as an image with its own styling context.
- Do not require the nPort RF Analysis plugin to display a static schematic.

## Editing Workflow

When creating or changing a schematic:

1. Read the note and its applicable `AGENTS.md` instructions.
2. Identify the exact topology, component values, reference designators, external ports, and nP node numbers.
3. Ask the user only about choices that materially change the circuit. Suggest conventional labels when labels are omitted.
4. Sketch the electrical grid coordinates before writing paths and text.
5. Write or update the SVG in this directory.
6. Embed the SVG in the appropriate note rather than duplicating it.
7. For a symbol-library file, add or update its constructor mapping in the complete-list note.
8. Compare the schematic against the note's ASCII diagram and JavaScript, if present.
9. Validate the SVG as XML and inspect the rendered image.
10. For composed schematics, run `schematics/validate-schematic.js` and resolve every error.
11. Run `schematics/validate-centering.js` and confirm the documented
    electrical reference equals the SVG y-axis.
12. Check legibility in Obsidian reading view and, when relevant, PDF export.

### Mandatory Visual-Layout Preflight

Perform this short check on the final rendered SVG after structural validation.
Do not promote the schematic if any item fails:

1. No node-number circle or numeral touches, crosses, covers, or sits over a
   wire, lead, symbol body, or other electrical stroke. Preserve at least the
   required 8-unit clearance outside the circle.
2. The documented electrical center lies exactly on the SVG's vertical y-axis;
   comparison schematics use the same reference convention.
3. No component label, value, port label, title, or annotation touches or
   crosses an electrical line or another text item.
4. Network blocks use square corners; symbols reproduce their canonical SVG
   geometry exactly.
5. Wires terminate precisely on ports and node dots, without gaps, overshoot,
   or hidden junctions.
6. Nothing is clipped at the viewBox edges, and the required margins remain
   visible at the actual Obsidian embed size.
7. When a note shows detailed subcircuits and their combined network, present
   the detailed subcircuits first and the combined schematic last, immediately
   before the associated code or results unless the user specifies otherwise.

Passing XML, composer, or schematic-validator checks never replaces this
rendered visual review. When clearance is questionable, move the annotation;
do not accept near contact.

## Verification Checklist

- Every terminal and electrical node is on the 20-unit grid, except terminals intentionally placed at positions 10 and 30 by a defined multi-lead symbol.
- The circuit's documented electrical center is on the viewBox y-axis.
- Labels use the 10-unit annotation grid and do not overlap symbols or wires.
- Every node-number circle has at least 8 units of visible clearance outside
  its edge from wires and electrical strokes.
- All user-provided designators, values, ports, and node numbers are preserved.
- Suggested labels follow the deterministic rules above.
- The visible topology agrees with the matching nP JavaScript.
- Series and shunt connections are electrically unambiguous.
- The `viewBox` includes the full drawing with at least a 40-unit margin.
- The SVG contains no scripts or external resources.
- The file renders in Obsidian and remains readable on a white PDF page.
- Spelling, capitalization, and engineering units are consistent with the rest of the vault.

## Modification Dates

When intentionally editing a hand-maintained Markdown file in this directory, add or update `<!-- Modified: YYYY-MM-DD -->` near the top. Do not add a visible modification date to a schematic unless the user requests it; Git history records SVG changes.
