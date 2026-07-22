# TypeScript Architecture of nPort RF Analysis
<!-- Modified: 2026-07-20 -->

This document explains what the TypeScript (`.ts`) code in the nPort RF Analysis Obsidian plugin does, how the files depend on one another, and how they become the `main.js` file that Obsidian loads. It assumes familiarity with ordinary JavaScript but no prior TypeScript experience.

## The short version

Obsidian does not execute the TypeScript source directly. The development source is divided into small files according to responsibility, and esbuild combines the required code into one generated file named `main.js`.

`src/main.ts` is the plugin's entry point. It starts the plugin and connects Obsidian to two different fenced-code workflows:

- An `np` block contains declarative JSON. It is validated, converted into an nP analysis, and rendered automatically.
- An `npjs` block contains verbatim JavaScript. Its source is displayed immediately, but it is executed only after the user selects **Run**. Execution occurs in a disposable Web Worker inside a sandboxed iframe.

The high-level hierarchy is:

```text
Obsidian
└── generated main.js
    └── src/main.ts                         plugin entry point
        ├── src/settings.ts                 settings screen
        ├── src/npjs-paste.ts               editor paste handling
        ├── np JSON path
        │   └── src/render-child.ts         lifecycle and visible output
        │       ├── src/schema.ts            JSON parsing and validation
        │       └── src/analysis.ts          nP circuit construction
        │           └── vendor/nP.esm.js     pinned nP library
        └── npjs JavaScript path
            ├── src/npjs-render-child.ts     buttons, source, results, iframe
            │   ├── src/npjs-protocol.ts     allowed message definitions
            │   ├── src/npjs-snapshot.ts     saved-result data
            │   ├── src/npjs-runner-document.ts
            │   │                            sandboxed iframe document
            │   └── embedded worker source
            │       └── src/npjs-worker.ts   executes note JavaScript
            │           ├── src/npjs-protocol.ts
            │           └── vendor/nP.esm.js
            └── src/npjs-snapshot.ts         storage identity and cleanup
```

This tree describes responsibility, not merely direct imports. In particular, `src/npjs-worker.ts` is built separately and embedded as text. It does not execute in the same JavaScript environment as `src/main.ts`.

## TypeScript compared with JavaScript

TypeScript is JavaScript with a compile-time type system. Most of the executable statements in these files are normal JavaScript. TypeScript adds descriptions of what values are allowed to be.

For example:

```ts
function setStatus(status: string): void {
    this.statusEl.setText(`Status: ${status}`);
}
```

The `: string` annotation says that `status` must be text. The `: void` annotation says the function does not return a useful value. These annotations help the editor and TypeScript compiler find mistakes, but they are removed from the generated JavaScript.

The plugin commonly uses these TypeScript features:

- `interface` describes the required shape of an object.
- `type` gives a name to a type or describes alternatives.
- `value: SomeType` declares the expected type of a value.
- `value?: SomeType` makes an object property optional.
- `Readonly<T>` indicates that callers should not change a value.
- A union such as `'running' | 'complete'` permits only those exact strings.
- `unknown` means a value has not yet been trusted or identified. Code must inspect it before using it.
- `value is SomeType` is a type guard: a validation function that teaches TypeScript what a checked value is.
- `import type` imports information used only by the type checker. It disappears from the generated JavaScript.
- `private` documents and enforces that a class field or method is for internal use.

TypeScript does not make untrusted runtime data safe by itself. That is why this plugin still explicitly validates JSON, worker messages, and saved data. Type annotations disappear at build time; validation remains in the executable JavaScript.

## Startup and the central coordinator: `src/main.ts`

`main.ts` exports the default `NPortRfAnalysisPlugin` class. Obsidian expects the generated `main.js` to export a plugin class derived from Obsidian's `Plugin` class. This is the root of the running plugin.

Its `onload()` method performs the startup work:

1. Calls Obsidian's `loadData()` and passes the result through `parsePluginData()`.
2. Registers the CodeMirror extension that makes pasting into `npjs` blocks use plain text.
3. Adds the plugin settings tab.
4. Adds the **Clear saved results** command.
5. Registers a Markdown code-block processor for `np`.
6. Registers a separate Markdown code-block processor for `npjs`.
7. Watches Markdown files for edits, deletion, and renaming so obsolete saved results can be removed or reassigned.
8. Optionally clears saved results when Obsidian quits.
9. Periodically enforces saved-result age and storage limits.
10. Cleans up timers when the plugin unloads.

For an `np` block, `main.ts` creates an `NpRenderChild`. For an `npjs` block, it first determines which exact block in which note owns any saved result, then creates an `NpJsRenderChild` with a small storage interface containing `get`, `save`, and `remove` functions.

`main.ts` owns the complete plugin data object. It serializes writes through `saveQueue`, ensuring that overlapping asynchronous changes do not overwrite one another. The actual persistence is handled through Obsidian's `loadData()` and `saveData()` methods; in an installed vault this data is normally represented by the plugin's `data.json` file.

Although `main.ts` is the entry point, it is intentionally not one giant implementation file. It coordinates modules whose detailed behavior is kept elsewhere.

## The declarative `np` JSON path

The `np` path is the smaller path:

```text
Markdown ```np block
        ↓
main.ts registers the processor
        ↓
render-child.ts receives the block text
        ↓
schema.ts parses and validates JSON
        ↓
analysis.ts constructs and runs the nP circuit
        ↓
render-child.ts creates the chart or table
```

### `src/schema.ts`

This file defines the permitted structure of an `np` block and validates the text supplied by the note.

The interfaces `FrequencySpec`, `ComponentSpec`, `ViewSpec`, and `AnalysisSpec` describe a valid analysis after parsing. `COMPONENT_TYPES` is the explicit list of constructors available through this optional JSON format. This list limits only the declarative `np` path; it does not describe or constrain everything available through verbatim `npjs` JavaScript.

`parseAnalysisSpec()` performs runtime validation. It:

- Parses the source with `JSON.parse()`.
- Requires a top-level object.
- Validates the frequency range, point count, optional reference impedance, and optional temperature.
- Validates component names, component types, values, and argument lists.
- Validates every nodal connection and requires the final connection to begin with `"out"`.
- Allows only recognized S-parameter output selectors such as `s11dB` or `s21Re`.
- Validates the view type and optional chart dimensions and ranges.

If anything is invalid, it throws an `Error` with a user-facing explanation. Its main security property is that JSON is treated as data, never as executable JavaScript.

### `src/analysis.ts`

This file translates a validated `AnalysisSpec` into nP calls.

`componentFactories` maps each permitted JSON component name to the corresponding constructor in the pinned nP library. `runAnalysis()` then:

1. Saves the current nP global frequency list, reference impedance, and temperature.
2. Applies the analysis settings from the JSON.
3. Constructs each named component.
4. Replaces component names in the nodal connection arrays with actual nPort objects.
5. Calls `nP.nodal(...)`.
6. Calls `.out(...)` for the requested S-parameters.
7. Returns an `inputTable` suitable for an nP chart or table.
8. Restores the previous nP globals in a `finally` block, even if analysis fails.

The restoration is important because the nP library uses shared mutable global settings. One rendered block should not silently leave another block with different frequencies or impedance.

### `src/render-child.ts`

`NpRenderChild` connects the declarative analysis to Obsidian's rendered Markdown.

A `MarkdownRenderChild` has a lifecycle tied to the part of the note that Obsidian rendered. Its `onload()` method parses the JSON, runs the analysis, creates a mount element, and calls `nP.lineChart()`, `nP.smithChart()`, or `nP.lineTable()` according to `view.type`.

It limits the requested display width to the width currently available in the note. Errors are caught and displayed as safe text. Its `onunload()` method empties the container when Obsidian discards that rendered section.

## The verbatim `npjs` JavaScript path

The `npjs` path is deliberately more layered because arbitrary user-authored JavaScript must not run in Obsidian's privileged plugin environment.

Before **Run** is selected:

```text
Markdown ```npjs block
        ↓
main.ts creates NpJsRenderChild
        ↓
warning + buttons + source + any validated saved result are displayed
        ↓
no runner iframe and no worker exist yet
```

After **Run** is selected:

```text
npjs-render-child.ts
        ↓ creates
sandboxed iframe using npjs-runner-document.ts
        ↓ creates
disposable Web Worker built from npjs-worker.ts
        ↓ executes source with restricted arguments
worker messages
        ↓ validated by npjs-protocol.ts
npjs-render-child.ts
        ↓ renders through trusted nP chart functions
visible result in the note
        ↓
successful render messages saved through npjs-snapshot.ts and main.ts
```

### `src/npjs-render-child.ts`

`NpJsRenderChild` is the user-interface controller for one `npjs` block. Every block gets its own instance, buttons, output area, execution sandbox, and saved-result identity. Blocks do not share JavaScript scope.

During `onload()`, it creates:

- The warning about running trusted code.
- **Run**, **Stop**, and **Reset** buttons.
- The status display.
- A permanently visible copy of the JavaScript source.
- A console pane, initially hidden.
- An output area for charts, tables, and text.
- Event handlers for the buttons and messages.
- Any previously saved, validated rendering snapshot.

Selecting **Run** clears the old output and snapshot, creates a fresh unpredictable token, and then creates an iframe. The iframe has `sandbox="allow-scripts"`, but deliberately does not have `allow-same-origin`. Only after the iframe loads does the render child send it the source text.

Incoming messages must come from that exact iframe, use the plugin channel, contain the current token, and pass `isNpJsWorkerMessage()`. Valid render messages are replayed using trusted chart functions in the main plugin context. The worker does not receive a reference to the actual DOM element.

The render child also captures console, style, and limited text-output messages. On successful completion, it saves those declarative messages as a snapshot. It does not save an executable result or insert generated output into the Markdown note.

Selecting **Stop** asks the iframe to terminate its worker and removes the iframe. **Reset** also clears visible output and removes the saved snapshot. `onunload()` destroys the runner when Obsidian unloads the rendered block.

### `src/npjs-runner-document.ts`

This file generates the small HTML document placed in the sandboxed iframe's `srcdoc` property. The document contains a fixed runner script written by the plugin, not the JavaScript from the note.

The generated document:

- Applies a restrictive Content Security Policy.
- Disables connections with `connect-src 'none'`.
- Accepts messages only from its parent and only on the expected channel.
- Creates a Blob URL containing the prebuilt worker program.
- Starts a Web Worker from that Blob URL.
- Sends the note's source to the worker as message data.
- Relays worker output to the parent render child.
- Terminates the worker and revokes the Blob URL after completion, failure, or **Stop**.

The worker source is encoded with `JSON.stringify()` and every `<` is escaped before insertion into the HTML. This prevents worker text containing `</script>` from ending the fixed runner script and injecting another HTML script element.

### `src/npjs-worker.ts`

This is the program that actually executes the JavaScript written in an `npjs` block. It runs in a disposable Web Worker rather than in the Obsidian plugin context.

At startup it replaces network, storage, and nested-worker entry points with a function that throws. Blocked names include `fetch`, `XMLHttpRequest`, `WebSocket`, `indexedDB`, `caches`, `Worker`, and `SharedWorker`. The iframe's Content Security Policy supplies an additional network boundary.

For each run, the worker creates a restricted execution environment containing:

- The pinned nP module.
- A console proxy that sends `log`, `warn`, and `error` messages outward.
- Chart proxies for `lineChart`, `lineTable`, and `smithChart`.
- A small text-only substitute for `document.getElementById(...).textContent`.
- Explicitly unavailable `require`, `process`, `module`, `exports`, `app`, and `window` values.
- Blocked `Function` and `eval` arguments.

The chart proxies do not draw inside the worker. They package the renderer name, mount name, and options into messages. The trusted outer render child receives those messages and calls the real nP display function against a real element it created.

The note source is compiled as an `AsyncFunction`, which permits top-level `await` inside an `npjs` block. After it completes or throws, the worker restores the nP frequency list, reference impedance, and temperature.

### `src/npjs-protocol.ts`

This file defines the narrow message language shared by the worker and the trusted renderer.

Allowed message categories are:

- `render`: request a line chart, line table, or Smith chart.
- `status`: report that execution is running or complete.
- `console`: report a captured log, warning, or error line.
- `error`: report an execution failure.
- `style`: call one of an explicit list of permitted nP styling methods.
- `text`: update a text-only output mount.

`isNpJsWorkerMessage()` validates data at runtime, including permitted renderer names, message lengths, object shapes, and style-method names. This matters because `postMessage` crosses a trust boundary. A TypeScript type alone cannot prove that a runtime message is safe.

`normalizeMountKey()` converts a traditional selector such as `#chartDiv` to the internal key `chartDiv`. If no mount is supplied, it assigns names such as `output-1`. This is why calls such as `nP.lineChart()` can work in an `npjs` block without an explicit options object or HTML element.

### `src/npjs-snapshot.ts`

This file defines and manages saved `npjs` results. Its purpose is to let completed charts and tables appear in Reading view and PDF export without silently rerunning the JavaScript.

A snapshot contains validated declarative output messages—render requests, console output, style changes, and text output. It does not contain an active iframe, worker, DOM tree, or executable copy of a result.

The file handles several related jobs:

- Defines the snapshot, storage, settings, and block-identity interfaces.
- Normalizes and hashes the source of each `npjs` block.
- Distinguishes duplicate blocks containing identical source by occurrence number.
- Finds `npjs` fences in the full Markdown note.
- Associates a saved result with note path, source hash, and occurrence.
- Validates data loaded from Obsidian and migrates the older snapshot format.
- Encodes and decodes `Infinity`, `-Infinity`, and `NaN`, which ordinary JSON cannot preserve directly.
- Removes snapshots when blocks are edited or deleted.
- Moves snapshot ownership when a note is renamed.
- Enforces maximum age and total storage limits, removing the oldest data first.
- Estimates stored byte size.

`main.ts` owns when plugin data is read and written; `npjs-snapshot.ts` owns the rules and transformations applied to that data.

### `src/npjs-paste.ts`

This file provides a CodeMirror editor extension. Obsidian's editor is based on CodeMirror.

The extension detects whether every current selection lies inside an `npjs` fenced code block. When it does, a paste uses the clipboard's `text/plain` value, normalizes line endings, prevents the normal rich-text paste path, and inserts the plain source directly.

Outside `npjs` blocks it returns `false`, allowing Obsidian's normal paste handling to continue. This keeps the behavior local to the place where rich clipboard formatting previously caused blank lines to appear between pasted JavaScript lines.

### `src/settings.ts`

This file builds the plugin's settings screen with Obsidian's settings API.

It presents controls for:

- Maximum saved-result age.
- Maximum saved-result storage in megabytes.
- Optional best-effort clearing when Obsidian quits.
- Manual clearing of all saved results.
- Current saved-result count and approximate size.

The settings tab does not save data directly. It calls public methods on the plugin class in `main.ts`, which updates the central data object, applies limits, and queues the Obsidian `saveData()` operation.

### `src/worker-source.d.ts`

This is a declaration file. The `.d.ts` suffix means it contains type information only and produces no JavaScript of its own.

The build defines a special virtual module named `npjs-worker-source`. TypeScript does not automatically know what that build-only module exports, so this declaration tells it:

```ts
declare module 'npjs-worker-source' {
    const source: string;
    export default source;
}
```

That allows `npjs-render-child.ts` to import the already-bundled worker as a string while still passing type checking.

## How the build produces `main.js`

The build behavior is defined in `esbuild.config.mjs`, which is JavaScript rather than TypeScript.

The production command is:

```sh
npm run build
```

That command performs two related bundles:

1. esbuild starts from `src/npjs-worker.ts`, follows its imports, includes the required nP worker-side code, and produces a self-contained browser-worker program in memory.
2. A custom esbuild plugin exposes that entire worker program as the string exported by the virtual `npjs-worker-source` module.
3. The main esbuild process starts from `src/main.ts`, follows its imports, substitutes the worker-program string, and produces the CommonJS file `main.js` that Obsidian loads.

The result can be pictured as:

```text
src/npjs-worker.ts + dependencies
             │
             └── worker JavaScript stored as a string ──┐
                                                        │
src/main.ts + ordinary imports ─────────────────────────┤
                                                        ↓
                                                  generated main.js
```

The Obsidian package and CodeMirror packages are marked `external`. Their implementations are not copied into `main.js`; the running Obsidian application provides them. The pinned `vendor/nP.esm.js` code is bundled because it belongs to this plugin distribution.

`main.js` is therefore the executable distribution artifact, but the individual `.ts` files remain the maintainable, reviewable source of truth. `main.js` is generated and intentionally excluded from Git; releases attach a fresh production build.

## Files that support the TypeScript but do not enter the plugin runtime

### `test/analysis.test.ts`

Tests the declarative path. It verifies successful parsing and RF output, rejection of JavaScript and unsupported component types, rejection of unknown nodal components, and restoration of nP global state.

### `test/npjs-editor-and-snapshot.test.ts`

Tests `npjs` fence detection, plain-text paste targeting, stable block identity, duplicate-block handling, legacy-data migration, snapshot pruning and renaming, storage limits, and preservation of non-finite RF values.

### `test/npjs-protocol.test.ts`

Tests mount normalization, acceptance and rejection of worker messages, and safe construction of the iframe runner document—including protection against worker text that resembles a closing script tag.

These tests are executed by `npm test`. They import production modules, but esbuild does not include the test files in `main.js` because nothing in the `src/main.ts` dependency tree imports them.

### `vendor/nP.esm.d.ts`

This declaration file describes the JavaScript exports of `vendor/nP.esm.js` to TypeScript. It supplies editor assistance and compile-time checking without changing how the nP library executes.

### `tsconfig.json`

This file configures the TypeScript checker. Important settings include strict type checking, browser DOM types, modern JavaScript library definitions, and `noUncheckedIndexedAccess`, which forces code to consider that an array lookup might return `undefined`.

The command:

```sh
npm run typecheck
```

runs TypeScript with `--noEmit`. It checks the code but does not create `main.js`; esbuild performs the actual production compilation and bundling.

## Runtime ownership summary

It is useful to think of the source in terms of ownership:

| Concern | Owning file |
| --- | --- |
| Plugin startup and Obsidian integration | `src/main.ts` |
| Declarative JSON contract | `src/schema.ts` |
| Declarative nP circuit execution | `src/analysis.ts` |
| Declarative result display | `src/render-child.ts` |
| `npjs` buttons, source, output, and iframe lifecycle | `src/npjs-render-child.ts` |
| Iframe HTML, CSP, and worker creation | `src/npjs-runner-document.ts` |
| Actual execution of note JavaScript | `src/npjs-worker.ts` |
| Allowed worker-to-renderer messages | `src/npjs-protocol.ts` |
| Saved-result identity, validation, and limits | `src/npjs-snapshot.ts` |
| Plain-text paste inside `npjs` fences | `src/npjs-paste.ts` |
| User settings screen | `src/settings.ts` |
| Type declaration for the embedded worker string | `src/worker-source.d.ts` |

The important boundary is that only trusted plugin code has access to Obsidian and the actual note DOM. User-authored `npjs` code gets nP calculation capability and narrow output proxies inside a disposable worker. The protocol between them carries data describing what to render, not privileged Obsidian objects.
