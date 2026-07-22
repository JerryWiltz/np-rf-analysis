# AGENTS.md
<!-- Modified: 2026-07-22 -->

Repository guide for agents working in the `np-rf-analysis` Obsidian plugin repository.

## Scope

These instructions apply to the entire repository rooted at `/home/jerrywiltz/np-rf-analysis`.

## Project Summary

`nPort RF Analysis` is an Obsidian desktop plugin for RF and microwave analysis in Markdown notes. It provides two fenced-code workflows:

- `npjs` runs verbatim nP JavaScript only after the user selects **Run**.
- `np` validates and automatically renders the plugin's optional declarative JSON format.

The plugin bundles a pinned nP ESM build from the sibling `/home/jerrywiltz/nP` repository. Obsidian loads the generated `main.js`, `manifest.json`, and `styles.css` from a vault-specific plugin directory.

## Obsidian Policies

Before changing submission, security, release, manifest, settings, or user-interface behavior, read the current official documentation. These pages can change, so do not rely only on this file or prior conversation:

- [Developer policies](https://docs.obsidian.md/Developer+policies)
- [Submission requirements for plugins](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)
- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin)
- [Manifest reference](https://docs.obsidian.md/Reference/Manifest)

Treat the developer policies and submission requirements as mandatory. Treat plugin guidelines as expected review guidance; reviewers may require recommendations to be addressed depending on severity.

Preserve these submission rules:

- Keep `README.md`, `LICENSE`, `manifest.json`, and reviewable source code in the repository.
- Keep `main.js` out of source control. Generate it as a production build and attach it, `manifest.json`, and `styles.css` to each GitHub release.
- Keep the release tag and `manifest.json` version identical, using `x.y.z` without a `v` prefix.
- Keep `package.json` and `manifest.json` plugin versions synchronized.
- Update `versions.json` when a release changes `minAppVersion`. Extra historical entries may remain.
- Keep the plugin ID lowercase with hyphens and do not include `obsidian` or end it with `plugin`.
- Keep the display name short and descriptive; do not include `Obsidian` or end it with `Plugin`.
- Keep the manifest description at most 250 characters, end it with a period, and use correct capitalization for terms such as Markdown and PDF.
- Do not add telemetry, advertisements, self-update mechanisms, obfuscated code, or undisclosed network or external-file access.
- Clearly disclose any future payments, account requirements, network use, external-vault access, server-side telemetry, advertisements, or closed-source portions in `README.md` before release.
- Preserve license notices and attribution for vendored nP code and any other incorporated code.

The initial 0.3.0 release was submitted for Obsidian Community directory review. The automated review reported an unused legacy nP helper that dynamically created a script element. Obsidian clarified that the sandboxed `npjs` execution is not currently a blocking reported error, although a future user-gated API or disclosure system may require another update. Version 0.3.1 removes the reported legacy helper from the plugin's generated nP bundle while preserving the sandboxed `npjs` workflow. Do not publish a release, create a tag, or push without explicit user approval.

## Security Model

The `npjs` feature intentionally executes user-authored JavaScript. Preserve all of its security boundaries unless the user explicitly authorizes a reviewed redesign:

- Never execute an `npjs` block automatically. Execution requires the block's **Run** button.
- Run code in a disposable Web Worker inside a sandboxed iframe.
- Keep the iframe Content Security Policy closed to network connections and remote resources.
- Do not expose the Obsidian `app`, vault APIs, the real DOM, Node.js, Electron, `require`, `process`, browser storage, network APIs, or nested workers to user code.
- Keep worker messages schema-validated and accept only the defined protocol.
- Destroy the execution context when a run completes or the user selects **Stop** or **Reset**, and when the render child unloads.
- Render user-controlled text with safe DOM APIs such as `createEl(..., { text })` or `textContent`; do not introduce `innerHTML`, `outerHTML`, or `insertAdjacentHTML` with user data.
- Keep the `np` JSON path validated and non-executable.
- Keep saved PDF results as validated render instructions in plugin data, not as executable source or hidden Markdown content.
- Continue using `Plugin.loadData()` and `Plugin.saveData()` for settings and saved-result storage.
- Retain bounded snapshot age and size, cleanup for edited/deleted/renamed notes, manual clearing, and optional best-effort quit cleanup.
- Keep `README.md` and `SECURITY.md` aligned with actual behavior.

The plugin is currently declared desktop-only. Do not declare mobile compatibility without testing it in Obsidian Mobile and auditing all APIs against the current mobile requirements.

## Obsidian API And UI Practices

- Use `this.app`, not the debugging-only global `app` or `window.app`.
- Use `registerEvent()`, `registerDomEvent()`, `registerInterval()`, `addCommand()`, and other Obsidian registration helpers so resources are cleaned up on unload.
- Prefer the Vault API over the Adapter API. Use `Vault.process()` for background note edits and the Editor API for active-note edits if such features are added.
- Use `normalizePath()` for paths derived from user input.
- Use `instanceof` checks before treating abstract vault entries as `TFile` or `TFolder`.
- Do not assign presentation styles in TypeScript. Use plugin-scoped classes in `styles.css` and Obsidian CSS variables.
- Keep all CSS selectors scoped to the plugin where practical; do not override Obsidian core styling globally.
- Use sentence case for commands, settings, buttons, notices, status text, and other UI labels.
- Do not include the plugin name or ID in command names or command IDs; Obsidian adds the plugin identity.
- Do not define default hotkeys.
- Avoid unnecessary console logging. Error logging for unexpected failures is acceptable when it helps diagnosis and does not expose vault contents.
- Prefer `const` and `let` in plugin source. Verbatim `npjs` examples may retain the nP library's established `var` style.
- Prefer `async`/`await` where it improves clarity.
- Keep initial user-interface work out of plugin construction. Use `workspace.onLayoutReady()` for startup work that requires the completed layout.
- Keep accessibility, keyboard use, focus visibility, and theme compatibility in mind for every interactive control.

The Obsidian ESLint plugin may introduce new recommendations. Treat warnings as items to evaluate and report, not as silent successes. As of 0.3.x, the settings tab uses the imperative API; migration to the declarative settings API is a future compatibility improvement for settings search in Obsidian 1.13 and later.

## Repository Layout

- `src/main.ts`: plugin lifecycle, code-block registration, snapshot ownership, and cleanup.
- `src/npjs-render-child.ts`: visible `npjs` controls, source, result panes, and iframe lifecycle.
- `src/npjs-runner-document.ts`: sandboxed iframe document and security policy.
- `src/npjs-worker.ts`: isolated nP execution worker.
- `src/npjs-protocol.ts`: validated worker/render message protocol.
- `src/npjs-snapshot.ts`: saved-result schema, persistence, identity, and limits.
- `src/npjs-paste.ts`: plain-text paste behavior inside `npjs` fences.
- `src/analysis.ts`, `src/schema.ts`, and `src/render-child.ts`: validated declarative `np` analysis path.
- `src/settings.ts`: plugin settings interface.
- `vendor/nP.esm.js`: pinned generated nP bundle included in the plugin build.
- `vendor/nP.esm.d.ts`: declarations for the vendored nP bundle.
- `styles.css`: plugin-scoped presentation.
- `test/`: Node tests for analysis, sandbox protocol, editor behavior, and snapshot lifecycle.
- `.github/workflows/ci.yml`: continuous lint, type, test, and build verification.
- `.github/workflows/release.yml`: tagged production build and release-asset publication.
- `developmentDocs/release-and-community-directory.md`: acceptance history, security safeguards, automated checks, and the release checklist.
- `scripts/verify-release.mjs`: production-bundle, version-alignment, and `npjs` security-boundary regression checks.
- `main.js`: ignored generated production bundle; never commit it.

## Working Rules

- Inspect `git status --short --branch` and recent commits before editing.
- Preserve existing user changes and do not reformat unrelated files.
- Read the relevant source and tests before changing behavior.
- Make small, reviewable changes and update tests with behavior changes.
- Correct spelling and maintain consistent terminology in files being edited. Use `nPort RF Analysis`, `nP`, `npjs`, `Markdown`, `JavaScript`, `S-parameters`, and `Smith chart` consistently.
- Add or update a `Modified: YYYY-MM-DD` comment in intentionally edited hand-maintained files, using the file's native comment syntax. Do not add dates to generated files.
- Do not edit the vendored nP bundle by hand. Make library changes in `/home/jerrywiltz/nP`, verify them there, intentionally regenerate the ESM bundle, then rebuild and test the plugin.
- Do not assume a new nP source change is present in the plugin merely because the repositories are siblings; the plugin runs its pinned vendored bundle.
- Do not run deployment, publish releases, create tags, or push without explicit user approval.

## Verification

For a normal plugin change, run from the repository root:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:release
```

Requirements:

- Report ESLint warnings as well as errors.
- If `tsx` cannot create its local IPC socket in the sandbox, rerun `npm test` with the required permission rather than treating it as a test failure.
- Confirm `git status --short` after building. `main.js` should remain ignored and untracked.
- For rendering, iframe, CodeMirror, lifecycle, or CSS changes, also test the built plugin in the dedicated vault at `/home/jerrywiltz/np-rf-analysis-test-vault` using Obsidian Reading view and, where relevant, PDF export.
- Never develop or test against an important user vault.

Before a release, additionally verify:

1. The current official Obsidian policies and submission requirements have been reread.
2. `manifest.json`, `package.json`, the release tag, and compatibility information agree.
3. `README.md` accurately describes installation, security, persistence, network behavior, desktop/mobile support, and user controls.
4. The production `main.js`, root `manifest.json`, and `styles.css` are the release attachments.
5. The default branch contains the manifest and reviewable source but not `main.js`.
6. CI succeeds from a clean checkout.
7. `npm run verify:release` passes against the production bundle.
