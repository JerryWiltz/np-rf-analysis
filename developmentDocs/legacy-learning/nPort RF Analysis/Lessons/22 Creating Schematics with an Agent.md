<!-- Modified: 2026-11-09 -->

# Creating Schematics with nP

nP can draw a circuit directly from the network you build in JavaScript. Use
`nP.schematic(network)` to ask nP to lay out the components and connections and
render them as an SVG. This keeps the drawing tied to the same network used
for analysis: component symbols and port connections come from nP, rather
than from a second hand-maintained symbol library.

The workflow is:

```text
Describe the circuit and its connections
                 ↓
          Build the nP network
                 ↓
       nP.schematic(network)
                 ↓
      Inspect drawing and results
```

An AI agent can help interpret a sketch, write the network code, and check the
result. It must not guess at unclear electrical details. The original sketch
or other source remains authoritative for the circuit topology, values, node
numbers, and external ports.

## Start with an unambiguous circuit

Before asking an agent to write code, identify:

- Each component and its value, with units.
- Which component ports connect to each node.
- Junctions and wire crossings that do not connect.
- External port labels and their order.
- The frequency range and reference impedance for the analysis.
- Any intended engineering arrangement, such as a series path, ladder,
  divider, or coupler.

For a hand-drawn circuit, attach a clear image. Ask the agent to list the
components, values, connections, node numbers, and external ports it can read
before it writes code. Resolve ambiguity instead of letting the agent infer a
connection from appearance alone.

## Draw the network you will analyze

Build a network with nP constructors and `nP.nodal()`. Then pass that network
to `nP.schematic()`:

```javascript
nP.global.fList = [1e9, 2e9, 3e9];

var r1 = nP.R(25);
var c1 = nP.C(1e-12);
var network = nP.nodal(
  [r1, 1, 2],
  [c1, 2, 3],
  ['out', 1, 3]
);

nP.schematic(network);
```

The rows `[r1, 1, 2]` and `[c1, 2, 3]` connect each two-port component's public
ports to the numbered nodes. The final `['out', 1, 3]` row makes node 1
external Port 1 and node 3 external Port 2. Keep this order consistent with
the result you request from the network.

The schematic is generated when the `npjs` block is run. In this plugin,
JavaScript does not run automatically: press **Run**. The drawing is an
interactive result in the output area, not a separate SVG file saved in the
vault. It does not change the analysis or make drawing wire lengths physical
RF dimensions.

## Help nP choose a familiar layout

Connectivity determines which terminals join; it does not always determine a
single obvious arrangement on the page. nP recognizes supported patterns and
can use shape guidance when you want to express an engineering arrangement.
For example:

```javascript
var drawing = nP.schematic(network, {
  shapes: ['series']
});
nP.log(drawing.detected);
```

Common supported arrangements include `series`, `ladder`, `bridgedT`,
`branchline`, `edgeCoupledFilter`, `powerDivider`, and `powerCombiner`. The
actual supported shapes and options depend on the current nP release; consult
the [nP schematic documentation](https://jerrywiltz.github.io/nP/schematics.html)
when using options beyond the basic call. Shape guidance changes the drawing
layout, not the circuit's electrical connections.

For a larger network made of recognizable sections, group the relevant
connection rows as documented by nP. Keep every component row and the final
`['out', ...]` row electrically correct even when requesting a particular
layout. If nP reports that a requested shape does not match the connections,
revisit the shape request; do not alter the circuit merely to silence the
layout error.

## Ask an agent for a reviewable result

You can adapt this request:

> Treat my attached circuit as the source of truth. First list every component,
> value, connection, node, and external port you can identify, and point out
> ambiguities. After I confirm them, write one runnable `npjs` block that
> builds the network with the current nP API, calls `nP.schematic(network)`,
> and reports the requested analysis results. Preserve the topology, values,
> node numbers, component-port order, and external-port order. Do not create a
> static SVG or use a duplicate symbol library. Explain any layout guidance
> used and verify that it leaves the electrical network unchanged.

For a simple circuit, begin with automatic layout. Add shape guidance only
when it materially improves or clarifies the drawing. For a circuit beyond
the renderer's supported layouts, ask the agent to explain the limitation and
propose a clear next step rather than fabricate a schematic.

## Verify the result

Before trusting the drawing:

1. Compare every component and value with the source circuit.
2. Check each `nP.nodal()` row against the intended component ports and nodes.
3. Check that external ports appear in the intended `['out', ...]` order.
4. Run the `npjs` block and inspect both the drawing and the requested
   analysis output.
5. Confirm that labels, wires, and branches are readable and that no
   connection is ambiguous.
6. If the drawing fails, distinguish a schematic-layout limitation from an
   electrical-model or network-construction error before changing code.

The drawing is a visual explanation of the network—not proof that the source
topology was interpreted correctly. Compare it with the original circuit and
verify the code and numerical results independently.

Return to [[21 Diagnosing an Analysis|Diagnosing an Analysis]], open [[200
Complete List of nPort RF Constructors, Complex Numbers, and Matrices|the
complete API reference]], or return to [[1 "Hello, nPort"|the beginning]].
