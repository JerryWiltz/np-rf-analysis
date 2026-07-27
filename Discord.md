# Discord review notes
<!-- Modified: 2026-07-19 -->

This file tracks communication related to the nPort RF Analysis submission in the Obsidian Discord community-directory support area.

## Submission thread

- Thread: <https://discord.com/channels/686053708261228577/1514299829474558013/threads/1527299520507936890>
- Plugin release under review: `0.3.0`
- Repository: <https://github.com/JerryWiltz/np-rf-analysis>

## Prepared reply: `npjs` execution and the runner `<script>`

Status: Prepared but not sent.

### Follow-up reminder

> Hi, just checking in on the status of the manual review for np-rf-analysis. The automated review flagged the intentional sandboxed script creation, and I wanted to see if any additional information would help with the review. Thanks!

### Technical explanation

Send this separately if the reviewers request more detail:

> Before the user presses **Run**, the plugin displays only the security warning, Run/Stop/Reset controls, the source as escaped text, and any previously validated saved-output snapshot. No runner iframe, runner `<script>`, or worker exists at that point.
>
> Pressing **Run** creates a new iframe with `sandbox="allow-scripts"` and without `allow-same-origin`. The iframe receives a fixed runner document with a restrictive Content Security Policy, including `default-src 'none'` and `connect-src 'none'`. The `<script>` in that document is fixed plugin bootstrap code; it is not the JavaScript written in the note.
>
> The note's JavaScript is sent to the iframe as `postMessage` data only after the iframe loads. The runner then creates a disposable Web Worker and forwards the source to it. The worker exposes the nP API, a captured console, chart/table proxies, and a text-only `document.getElementById(...).textContent` compatibility object. It does not expose Obsidian's `app`, vault APIs, the actual DOM, Node.js, Electron, `require`, `process`, browser storage, network APIs, or nested workers.
>
> Worker messages are schema-validated before their results are applied. The worker and its object URL are destroyed after completion or error, and when the user selects **Stop** or **Reset** or the rendered block unloads.
>
> Relevant source:
>
> - [`src/npjs-render-child.ts`](src/npjs-render-child.ts): renders the controls and creates the sandboxed iframe only inside the Run handler.
> - [`src/npjs-runner-document.ts`](src/npjs-runner-document.ts): defines the fixed runner document, CSP, message checks, and disposable worker lifecycle.
> - [`src/npjs-worker.ts`](src/npjs-worker.ts): provides the restricted execution environment and blocks network, storage, and nested-worker APIs.
> - [`src/npjs-protocol.ts`](src/npjs-protocol.ts): validates messages accepted from the worker.

### Short version

Use this version when a brief Discord reply is more appropriate:

> The `npjs` source does not run when a note is displayed. At that stage, the plugin renders only the warning, buttons, escaped source text, and any saved result. Pressing **Run** creates a new opaque-origin sandboxed iframe containing fixed runner code, which then creates a disposable Web Worker and sends the note's JavaScript to it as message data. The worker has nP and restricted output proxies, but no Obsidian app/vault access, actual DOM, Node.js, Electron, storage, network, or nested-worker access. It is destroyed after completion/error, Stop, Reset, or block unload.

## Accuracy note

The Run button is the explicit user-consent boundary, but it is not the only security control. The isolation depends on the combined iframe sandbox, Content Security Policy, disposable worker, restricted execution arguments, blocked APIs, validated messages, and cleanup lifecycle. Do not describe the runner `<script>` as already present before the user presses **Run**.
