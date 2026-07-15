<!-- Modified: 2026-07-15 -->
# nPort RF Analysis

nPort RF Analysis embeds RF and microwave network analysis in Obsidian Markdown notes. It runs verbatim nP JavaScript on demand and retains declarative JSON blocks for safe automatic rendering. Results appear as inline SVG line charts, Smith charts, or tables.

This repository is an early local prototype and has not been submitted to the Obsidian Community Plugin directory.

## Verbatim JavaScript

Use an `npjs` block for the full nP JavaScript API. The source is executed without translation after you select **Run**.

````markdown
```npjs
var g = nP.global;
g.fList = g.fGen(100e6, 1000e6, 51);

var r1 = nP.R(25);
var l1 = nP.L(2e-9);

var network = nP.nodal(
    [r1, 1, 2],
    [l1, 2, 3],
    ['out', 1, 3]
);

var output = network.out('s11dB', 's21dB');
nP.lineChart({
    inputTable: [output],
    title: 'Network response',
    mount: '#chartDiv',
    backgroundColor: 'white'
});
```
````

Each block provides **Run**, **Stop**, and **Reset** controls:

- **Run** starts a fresh isolated execution and clears results from the previous run.
- **Stop** terminates the worker immediately and leaves results already rendered.
- **Reset** terminates execution and clears charts, tables, messages, and errors.

Successful results are saved as validated render instructions and restored when the note is rendered again. This lets Obsidian include charts, tables, and text results in **Export to PDF** without automatically rerunning JavaScript. Changing the JavaScript invalidates the saved result; run the updated block once to create a new snapshot. During PDF export, interactive controls and the security warning are hidden.

Inside an `npjs` fence, ordinary paste uses the clipboard's plain-text representation. JavaScript copied from editors such as VS Code therefore keeps its intended spaces, tabs, and line breaks without importing rich-text paragraph formatting.

In Reading view, the controls and `Status: Ready` appear above the complete, always-visible JavaScript source. Charts, tables, messages, and errors appear below the source.

Selectors such as `mount: '#chartDiv'` are resolved within that block, so existing nP development scripts can be pasted without adding HTML mount elements. `nP.lineChart()`, `nP.smithChart()`, and `nP.lineTable()` render in the note; all nP analysis constructors and composition functions remain available to the script.

## Optional declarative JSON

Use an `np` block when a validated, automatically rendered analysis is preferable:

````markdown
```np
{
  "frequencies": {
    "start": 100000000,
    "stop": 6000000000,
    "points": 101,
    "referenceImpedance": 50
  },
  "components": {
    "r1": { "type": "R", "value": 25 },
    "l1": { "type": "L", "value": 2e-9 }
  },
  "nodal": [
    ["r1", 1, 2],
    ["l1", 2, 3],
    ["out", 1, 3]
  ],
  "output": ["s11dB", "s21dB"],
  "view": {
    "type": "line",
    "title": "Series R-L response",
    "metricPrefix": "giga"
  }
}
```
````

Switch to Reading View to render the analysis.

## Security model

`npjs` deliberately executes user-authored JavaScript, but it does not run automatically. Only select **Run** for code you trust.

- Execution occurs in a disposable Web Worker inside a sandboxed iframe.
- The iframe applies a Content Security Policy that denies network connections and remote resources.
- Network, browser storage, and nested-worker APIs are disabled inside the worker.
- The script receives nP, a captured console, chart/table forwarding, and a text-only `document.getElementById(...).textContent` compatibility shim. It does not receive Obsidian's `app`, vault, actual DOM, Node.js, Electron, `require`, or `process` objects.
- Stopping, resetting, unloading the block, or completing a run destroys the execution context.
- The plugin contains no telemetry, remote code loading, self-update mechanism, or access to files outside the vault.

The safe `np` JSON format remains available and never executes JavaScript.

## Supported features

- Frequency ranges, reference impedance, and temperature.
- `R`, `L`, `C`, `seR`, `seL`, `seC`, `paR`, `paL`, `paC`, `Tee`, `Open`, `Short`, `Load`, and `Tlin` components.
- Explicit `nP.nodal()` topology.
- All `.out(...)` suffixes: `mag`, `dB`, `ang`, `Re`, and `Im`.
- Line charts, Smith charts, and SVG tables.
- Light and dark theme-aware containers.
- Isolated nP global analysis settings for every block.
- Verbatim nP JavaScript with explicit Run, Stop, and Reset controls.
- Optional JSON validation without JavaScript execution.

For a Smith chart, request paired real and imaginary outputs and set `view.type` to `smith`:

```json
"output": ["s11Re", "s11Im"],
"view": { "type": "smith", "title": "Input match" }
```

## Local development

The prototype includes a pinned, generated nP ESM bundle under `vendor/` so releases and CI are self-contained. The vendored bundle is generated from nP `0.0.47` and remains covered by nP's MIT license. The worker is bundled into `main.js`; the plugin does not download executable code at runtime.

During coordinated nP development, the repositories can still be kept as siblings:

```text
parent/
├── nP/
└── np-rf-analysis/
```

Build and test with:

```sh
npm install
npm run typecheck
npm test
npm run build
```

For manual Obsidian testing, copy or link this directory into a dedicated test vault as:

```text
<test-vault>/.obsidian/plugins/np-rf-analysis/
```

Obsidian loads `manifest.json`, `main.js`, and `styles.css`. Do not develop against an important vault.
