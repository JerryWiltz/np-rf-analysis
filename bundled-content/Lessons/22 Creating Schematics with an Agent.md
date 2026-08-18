<!-- Modified: 2026-08-12 -->

# Creating Schematics with an Agent

For a complicated circuit, begin with a hand-drawn schematic. Mark its
components, values, ports, and node numbers before writing JavaScript. That
schematic is the electrical source of truth for both the clean SVG drawing and
the `npjs` analysis.

The workflow is:

```text
Hand-drawn, node-labeled schematic
                 ↓
          Clean SVG schematic
                 ↓
          Matching npjs code
                 ↓
        Run and verify the result
```

An agent such as Codex can remove the drawing and programming tedium. The agent
is an authoring aid, not part of the finished analysis. After the files are
saved, Obsidian displays the SVG and the nPort RF Analysis plugin runs the code
without requiring the agent or internet access.

## Draw the Circuit First

Your drawing does not need to be polished, but it must contain the electrical
facts needed to reproduce the circuit:

- Every component and its reference designator, such as `R1` or `C2`.
- Every component value with units, such as `75 Ω`, `5 nH`, or `1 pF`.
- Wires, junction dots, and unconnected wire crossings.
- A number for every node that the code will use.
- External ports labeled `Port 1`, `Port 2`, and so on.
- The intended terminal order of multiport components when it is not obvious.

Use a filled junction dot wherever wires connect. Show crossing wires without
a junction dot when they do not connect. Write node numbers close to their
junctions without placing them over a wire.

The frequency range and reference impedance do not determine the drawing's
topology, but write them beside the circuit or include them in your request so
the agent can build the complete analysis.

## Scan or Photograph the Drawing

Scan the page or take a clear photograph. Before giving it to the agent, check
that:

- The whole circuit is visible and in focus.
- Component labels, values, node numbers, and port numbers are readable.
- Shadows, folds, or notebook lines do not hide connections.
- The image orientation makes signal flow easy to follow.

Attach the image to a vision-capable agent, or place it in a location that a
filesystem-capable agent has permission to read. A text-only chat that cannot
inspect the image cannot reliably reconstruct the circuit.

## Ask the Agent to Read Before Drawing

Use a request like this:

> Treat my attached schematic as the electrical source of truth. First list
> every component, value, connection, node number, and external port that you
> can read. Identify anything ambiguous instead of guessing. After I resolve
> any ambiguity, create a clean, self-contained SVG in the vault's designated
> learning-image folder. Preserve my topology, reference designators, values,
> node numbers, and port numbers exactly. Follow all applicable `AGENTS.md`
> instructions.

The agent should describe what it sees before creating files. Compare that
description with the original drawing. Correct any mistaken value, missing
junction, swapped port, or misread node number at this stage.

## Resolve Ambiguities

A scan can make electrically different drawings look similar. The agent should
stop and ask when it cannot determine whether:

- Crossing wires connect.
- A handwritten value is `1 pF` or `7 pF`.
- A label is `R1` or `R7`.
- A branch connects to one node or an adjacent node.
- A terminal is an external port or an internal connection.
- A multiport symbol has a particular port order.

Do not let the agent silently choose the most convenient interpretation. A
visually plausible guess can create a valid program for the wrong circuit.

## Generate the Clean SVG

After the circuit has been confirmed, the agent can create the SVG. In this
learning vault, canonical lesson schematics belong under:

```text
nPort RF Analysis/Lessons/Images/
```

The lesson embeds the saved image with an Obsidian link such as:

```markdown
![[nPort RF Analysis/Lessons/Images/my-circuit.svg]]
```

Obsidian resolves this link and displays the image. It does not electrically
connect the SVG to the analysis or check the drawing against the code.

Before drawing, tell the agent to read `Images/AGENTS.md`,
`schematics/README.md`, and the canonical files in
`nPort RF Analysis/Lessons/Schematic Authoring/Symbols/`. Every constructor symbol must come from that
library. The agent must not redraw a resistor, capacitor, transmission line,
Tee, diode, microstrip element, or any other available symbol from memory.

Run the library check, compose the self-contained SVG, and validate it:

```bash
node schematics/validate-symbol-library.js
node schematics/compose-schematic.js description.json output.svg
node schematics/validate-schematic.js output.svg
```

The composer reads the public port positions from every canonical SVG, copies
the exact component primitives, and records their hashes in the finished
schematic. The validator rejects stale provenance, altered embedded geometry,
missing constructor ports, and connection coordinates that do not agree with
the canonical symbol. A complete schematic remains one portable SVG; it does
not depend on external SVG imports when Obsidian renders it.

Before moving on, compare the clean SVG with the hand drawing. Confirm every
component, value, wire, junction, node number, and external port.

## Translate the Schematic into `npjs`

Once the SVG matches the source drawing, ask the agent to write the code:

> Using the confirmed schematic as the source of truth, write one complete,
> runnable `npjs` block. Set the stated frequency range and reference
> impedance, construct each component, and use `nP.nodal()` to reproduce the
> labeled nodes exactly. Make the `['out', ...]` order agree with the external
> port labels. Include the requested S-parameter outputs and the smallest
> useful display options. Do not change the schematic to make the code easier.

For example, this connection array:

```javascript
[r1, 1, 2]
```

means that `r1` port 1 connects to schematic node 1 and `r1` port 2 connects to
schematic node 2. The final output connection:

```javascript
['out', 1, 3]
```

makes node 1 external port 1 and node 3 external port 2. Array order matters.

## Compare the Drawing, SVG, and Code

Check the three representations one connection at a time:

| Source drawing | Clean SVG | `npjs` code |
| --- | --- | --- |
| Component and value | Same designator and visible value | Matching constructor and numeric value |
| Wire or junction | Same electrical connection | Shared `nP.nodal()` node number |
| Unconnected crossing | No junction dot | Different node numbers |
| External port label | Same port label | Same position in `['out', ...]` |
| Multiport terminal | Same terminal order | Matching connection-array order |

Scientific notation must preserve the visible engineering value. For example,
`5e-9` henries is 5 nH, and `1e-12` farads is 1 pF.

## Verify Before Clicking Run

Ask the agent to:

1. Validate the SVG as XML and confirm that it contains no scripts or external
   resources.
2. Inspect the rendered SVG for clipped text, overlaps, unclear junctions, and
   missing labels.
3. Compare the SVG and `nP.nodal()` arrays node by node.
4. Confirm that each component constructor runs after the frequency list and
   reference impedance are set.
5. Confirm that the requested `sij` values exist for the number of external
   ports.
6. Open the note in Obsidian Reading view and confirm that the SVG appears.
7. Report the exact note and SVG files that are ready for promotion.

Then perform your own final comparison with the original hand drawing. When
all three representations agree, click **Run** above the `npjs` block and
compare the calculated behavior with what you expect from the circuit.

## Requesting a Correction

Refer to the source schematic and describe the electrical fact that is wrong:

> The source drawing shows C1 connected between nodes 2 and 4, but the SVG and
> code connect it between nodes 2 and 3. Keep every other component, node, and
> port unchanged. Correct the SVG and the `nP.nodal()` array together, then
> repeat the verification.

This is more precise than asking the agent to “move the capacitor down.” A
change in appearance is not necessarily a change in electrical connectivity.

Return to [[21 Diagnosing an Analysis|Diagnosing an Analysis]], open
[[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the
complete API reference]], or return to [[1 "Hello, nPort"|the beginning]].
