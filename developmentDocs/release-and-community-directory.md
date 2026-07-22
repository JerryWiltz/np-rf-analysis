<!-- Modified: 2026-07-22 -->
# Release and Community directory safeguards

This document preserves the release lessons learned while publishing nPort RF Analysis in the Obsidian Community Plugin directory. It supplements the mandatory rules in `AGENTS.md`; current Obsidian policies remain authoritative.

## What is automated after acceptance

Once a correctly versioned GitHub release is published, Obsidian normally detects it, scans its release assets, and makes a passing update available through the Community Plugins browser. Routine releases do not normally require manually queuing a scan or requesting another review.

Manual attention may still be required when a scan reports an error, release assets or versions disagree, a new capability changes the security model, or Obsidian changes its policies.

## Initial review history

Version 0.3.0 contained an unused legacy nP browser helper that dynamically created a script element. Obsidian's automated review reported that construct. Version 0.3.1 replaced the full browser-oriented nP bundle with the host-safe plugin bundle, removing that helper while preserving the intentional, sandboxed `npjs` workflow. The 0.3.1 automated scan completed without a blocking error, manual review was requested, and the plugin was accepted into the Community directory on 2026-07-22.

This history matters because a harmless unused helper was still a release blocker. Code included in `main.js` is reviewable behavior even when the plugin never calls it.

## Security boundary that must remain intact

An `npjs` block displays its source and controls without executing when a note opens or renders. Only its **Run** button starts execution. User JavaScript runs in a disposable Web Worker inside an iframe sandboxed with `allow-scripts` and a restrictive Content Security Policy.

User code must not receive access to:

- the Obsidian application or Vault API;
- Node.js, Electron, `require`, or `process`;
- the real document or window;
- network APIs;
- browser storage; or
- nested workers.

The message protocol must remain validated, and the execution context must be destroyed after completion, error, **Stop**, **Reset**, or unload. The declarative `np` JSON workflow must remain validated and non-executable.

Any proposal that relaxes one of these constraints is a security-model change, not a routine feature. It requires an explicit design review, updated tests and disclosures, and a rereading of current Obsidian policy before implementation or release.

## Checks enforced by the repository

`npm run verify:release` examines the production `main.js` and relevant source files. It fails when:

- package, manifest, and compatibility versions disagree;
- desktop-only status is removed without an intentional audit;
- known legacy dynamic-script patterns reappear in the generated bundle; or
- key Run gating, iframe sandbox, CSP, worker cleanup, and API-blocking safeguards disappear.

Both CI and the tagged-release workflow build the production bundle and run this verification. These checks are deliberately narrow guardrails, not proof that arbitrary code is safe and not a substitute for review.

## Release checklist

Before creating a release:

1. Read the current Obsidian developer policies, submission requirements, plugin guidelines, release instructions, and manifest reference linked from `AGENTS.md`.
2. Review security-sensitive dependency and generated-bundle changes. Do not assume unused bundled code is irrelevant.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run verify:release`.
4. Manually test representative `npjs` and `np` blocks in the dedicated test vault, including Run, Stop, Reset, line chart, Smith chart, table, and saved PDF output when those areas are affected.
5. Confirm `package.json` and `manifest.json` versions match and `versions.json` maps that version to the current `minAppVersion`.
6. Confirm `README.md` and `SECURITY.md` describe the actual execution, persistence, network, and platform behavior.
7. Confirm `main.js` remains ignored and is not committed. The release assets must be exactly `main.js`, `manifest.json`, and `styles.css`.
8. Commit and push only with the user's approval. Create a matching tag without a `v` prefix only with explicit release approval.
9. Verify the GitHub Actions release succeeds, its three assets are downloadable, and the Obsidian automated scan recognizes the new version without a blocking error.
10. Do not submit repeated manual-review requests. Request review only when the directory asks for it or a blocking/manual-review condition actually requires it.

## Responding to a future scan failure

Do not work around the scanner or conceal behavior. Preserve the failed report, identify the exact source and generated code responsible, compare it with current policy, and remove unnecessary behavior. If the behavior is essential, document its user benefit and containment clearly and ask Obsidian for guidance before releasing a bypass or weakening the sandbox.
