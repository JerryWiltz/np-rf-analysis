<!-- Modified: 2026-11-12 -->
# nPort RF Analysis

nPort RF Analysis brings the nP RF and microwave analysis library into Obsidian. Its primary workflow is JavaScript: write or copy an `npjs` block, inspect the lint feedback, then select **Run** to calculate and render results in the note.

The plugin currently supports Obsidian desktop. Mobile support will be declared only after testing in Obsidian Mobile.

## Install

After publication in the Obsidian Community Plugin directory:

1. Open **Settings → Community plugins**.
2. Select **Browse**, find **nPort RF Analysis**, then choose **Install** and **Enable**.
3. Open **Settings → Community plugins → nPort RF Analysis** and install **What's new** and **Examples**. These can be installed independently.
4. Close Settings and open `nPort RF Analysis/Examples/Examples Home` from the Files pane. The release note is in `nPort RF Analysis/What's new in version 0.3.3/`.

The plugin installs the current version's release note and the REPL examples into the current vault only. It creates missing files and never overwrites existing notes. Each example note contains one runnable `npjs` block and a link to the same example in the nP REPL. All 46 notes are directly inside one `Examples` folder and numbered in the REPL's order (`01`, `02`, …).

For manual installation, download `main.js`, `manifest.json`, and `styles.css` from the GitHub release matching the version in `manifest.json`, and place them in:

```text
<vault>/.obsidian/plugins/np-rf-analysis/
```

Restart Obsidian and enable the plugin in that vault. A manual installation is separate for each vault.

## Run nP JavaScript

Use an `npjs` code block for the full nP JavaScript API:

````markdown
```npjs
nP.global.fList = nP.global.fGen(1e9, 3e9, 5);

var r1 = nP.R(25);
var response = r1.out('s11dB', 's21dB');

nP.lineChart({
  inputTable: [response],
  title: 'Frequency sweep',
  metricPrefix: 'giga'
});

nP.schematic(r1);
```
````

Before execution, **Run** checks JavaScript syntax, suspicious line continuations, accidental comma expressions, and direct calls to unknown nP API names. Suggestions use the exact nP API bundled with the plugin. These checks show line and column locations; warnings do not block execution. They are static checks and do not run the code. Select **Run** to execute, **Stop** to terminate, or **Reset** to clear the result.

The [nP REPL](https://jerrywiltz.github.io/nP/repl.html) is the source of truth for the ordered example list and current nP guidance. It runs the same starter examples in a browser. The plugin's numbered notes are generated from that ordered list; they are a convenient offline, in-vault copy, not an independently maintained curriculum.

## Optional declarative blocks

The plugin also accepts `np` blocks containing validated JSON. These blocks are automatically analyzed and rendered without executing JavaScript. Use this limited declarative format when automatic rendering is useful; use `npjs` for the full nP API and REPL examples.

## Results and PDF export

Each `npjs` run uses an isolated execution context. Successful rendered results are saved as validated display data and restored when the note is rendered again, allowing Obsidian to include them in **Export to PDF** without rerunning JavaScript. Editing a block invalidates its saved result; run it again to save the new output.

Saved results are stored in the plugin's `data.json`, not inserted into Markdown. Their age and storage limits can be configured in plugin settings. Results can be cleared from settings or the command palette. Optional session-only mode clears them on a normal Obsidian quit; this is best-effort and cannot run after a crash or forced shutdown.

## Security

`npjs` runs user-authored JavaScript only after **Run** is selected. It executes in a disposable Web Worker inside a sandboxed iframe. Network connections, remote resources, browser storage, and nested workers are blocked. The worker does not receive Obsidian's app or vault APIs, the real DOM, Node.js, Electron, `require`, or `process`.

Linting is static analysis outside the worker; it never evaluates user code. The worker remains the execution boundary. The `np` JSON workflow validates input and never executes JavaScript. The plugin has no telemetry, advertisements, self-update mechanism, or runtime code download.

## Support and feedback

For questions, bug reports, or feature requests, [open an issue on GitHub](https://github.com/JerryWiltz/np-rf-analysis/issues). Do not include private vault contents, credentials, or other sensitive information. Security reports and supported-version details are in [SECURITY.md](SECURITY.md).

The plugin settings page includes **Open documentation** and **Report an issue** buttons. They open GitHub only after you select them; the plugin makes no background network requests.
