<!-- Modified: 2026-11-12 -->
# nPort plugin content

This folder holds the reviewable Markdown source for the content bundled with
nPort RF Analysis. It is separate from the plugin's TypeScript source and is
embedded in the generated `main.js` at build time. The folder itself is not
copied wholesale into a user's vault.

## Current distributable content

- `Examples/` contains the ordered 46-example nP REPL sequence and its
  `Examples Home.md` index. Each numbered note preserves its REPL JavaScript
  and links back to the corresponding REPL example.
- `What's new in version 0.3.3/` contains release notes for plugin version
  0.3.3. This version is independent of the bundled nP library version.
- `content-manifest.json` records the REPL source checksum and the checksums of
  every Markdown file that is part of the payload.

The build embeds only the files explicitly listed in `content-manifest.json`.
This `README.md` is maintainer documentation and must not be added to that
manifest or installed as user-facing plugin content.

## Updating examples

The nP REPL is the source of truth for the examples. Its ordered list is in the
sibling repository at `../nP/docs/.vitepress/theme/replExamples.js`. After that
list changes, run these commands from the plugin repository root:

```sh
npm run content:promote
npm run content:check
```

Promotion preserves example order, titles, links, and JavaScript, and refreshes
the checksum manifest. Do not hand-edit generated example notes or their copied
code. Release notes are maintained separately and must match the plugin
version, not nP's version.

## Repository vault and historical notes

The plugin repository root is also the canonical Obsidian development/test
vault. Install the local build into
`.obsidian/plugins/np-rf-analysis/` and test it in Reading view here. The
installed vault copies live under `nPort RF Analysis/`; they are tracked in Git
as test and historical records, not used as build inputs.

Preserve notes installed by earlier plugin bundles. Installation adds missing
files but does not overwrite existing notes, so an older file at a destination
may prevent a newer copy from being installed. Inspect and report such a path
collision; do not silently replace or delete the older note. The local
`.obsidian/` configuration and generated `main.js` are ignored by Git.

For plugin changes, test with:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:release
```

For content changes, also run all 46 bundled `npjs` examples in this repository
vault's Reading view. Do not use the other test vaults for routine plugin tests.
