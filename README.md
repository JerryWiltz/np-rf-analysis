<!-- Modified: 2026-07-13 -->
# nP RF Analysis

nP RF Analysis embeds RF and microwave network analysis in Obsidian Markdown notes. Declarative `np` code blocks are evaluated by the [nP](https://github.com/JerryWiltz/nP) JavaScript engine and rendered as inline SVG line charts, Smith charts, or tables.

This repository is an early local prototype and has not been submitted to the Obsidian Community Plugin directory.

## Example

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

## Supported prototype features

- Frequency ranges, reference impedance, and temperature.
- `R`, `L`, `C`, `seR`, `seL`, `seC`, `paR`, `paL`, `paC`, `Tee`, `Open`, `Short`, `Load`, and `Tlin` components.
- Explicit `nP.nodal()` topology.
- All `.out(...)` suffixes: `mag`, `dB`, `ang`, `Re`, and `Im`.
- Line charts, Smith charts, and SVG tables.
- Light and dark theme-aware containers.
- Isolated nP global analysis settings for every block.
- JSON validation without arbitrary JavaScript execution.

For a Smith chart, request paired real and imaginary outputs and set `view.type` to `smith`:

```json
"output": ["s11Re", "s11Im"],
"view": { "type": "smith", "title": "Input match" }
```

## Local development

The prototype includes a pinned, generated nP ESM bundle under `vendor/` so releases and CI are self-contained. The vendored bundle is generated from nP `0.0.47` and remains covered by nP's MIT license.

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
