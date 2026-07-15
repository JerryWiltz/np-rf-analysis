<!-- Modified: 2026-07-15 -->
# Security policy

## Supported versions

Security fixes are provided for the latest published version of nPort RF Analysis.

## Reporting a vulnerability

Report suspected vulnerabilities through the repository's GitHub issues. Describe the affected plugin version, the steps needed to reproduce the behavior, and the security boundary you expected the plugin to preserve. Do not attach private vault contents, credentials, or other sensitive data.

## JavaScript execution boundary

The `npjs` code block deliberately executes JavaScript only after the user selects **Run**. Code does not run when a note opens or when saved results are restored.

Execution occurs in a disposable Web Worker inside a sandboxed iframe with network connections and remote resources denied by Content Security Policy. The executed program is not given Obsidian's `app`, the vault, the real document, Node.js, Electron, `require`, or `process`. Stop, Reset, completion, block unloading, and plugin unloading destroy the execution context.

Saved results contain validated rendering instructions rather than executable JavaScript. Restoring a saved result does not rerun the source block.
