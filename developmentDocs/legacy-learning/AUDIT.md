<!-- Modified: 2026-11-13 -->
# Learning-material relevance audit

Audit date: November 13, 2026. The baseline was plugin 0.3.3 and its pinned nP
0.49.0 bundle, not an assumption that all sibling-repository changes were
present in the plugin. The audit inspected 24 current lesson/reference notes,
16 legacy examples, 46 numbered examples, and the older `0.3.1/` revisions in
the former test vault.

## Retention decisions

| Material | Decision |
| --- | --- |
| Lessons 1–13 | Preserve their beginner progression and explanations of JavaScript, S-parameters, connection methods, displays, and mathematics. Refresh current UI/API claims before publication. |
| Lessons 14–20 | Preserve the physical-circuit teaching sequence. Migrate the incompatible constructors and validate all numerical and graphical results. |
| Lesson 21 | Preserve the circuit/debugging checklist. Keep its deliberately incorrect constructor example clearly labeled. |
| Lesson 22 | Preserve the circuit-to-code and independent-verification guidance. Repair the executable examples and plugin return-value assumptions. |
| Reference 100 | Retain as an optional manual-installation guide, alongside current Community directory installation instructions. |
| Reference 200 | Retain for historical coverage and rebuild from the current APIs. Its existing version and completeness claims are obsolete. |
| Selected applied examples | Preserve the 13 examples indexed in README.md for their circuits, source citations, explanatory prose, and comparisons. |
| Two GistHTMLs examples | Keep in the full archive. The parasitic attenuator overlaps the retained nP example; introductory complex/matrix operations are covered elsewhere. |
| Standalone low-pass HTML application | Keep in the full archive as a historical browser application, not an Obsidian plugin workflow. |
| 46 numbered examples | Use the exact current copies in `nPort-plugin-content/Examples/`. |
| `0.3.1/` and obsolete schematic infrastructure | Keep in the full archive as history rather than restoring a second active curriculum or canonical symbol library. |

## Corrections needed before reuse

### Physical-model call signatures

The pinned bundle explicitly rejects multiple arguments to `mlin()`,
`mclin()`, and `mtee()`; each now requires an options object. Eleven
incompatible calls occur across six notes:

- Lesson 14, **A single microstrip line**: positional `mlin()`.
- Lesson 16, **Multiport networks**: positional `mtee()`.
- Lesson 17, **Microstrip tee power divider**: three positional `mtee()`
  calls and one positional `mlin()` call.
- Lesson 18, **Coupled transmission lines**: positional `mclin()`.
- Gupta, **3 GHz rat-race divider**: one positional `mtee()` and two
  positional `mlin()` calls.
- Microwaves101, **Directional coupler**: positional `mclin()`.

API-name lint does not detect this argument-contract change. Match option
names, dimensions, defaults, and reference impedance to the pinned source,
then check the original intended numerical response after migration.

### Schematic examples and return values

Lesson 22's two examples use `javascript` fences, so the plugin does not give
them Run buttons. Its use of `drawing.detected` also differs from the plugin
adapter, which returns `svg`, `graph`, `topology`, and `error`. The same
return-value assumption occurs in the current bundled example 03; that is a
separate plugin/example issue, not changed by this preservation work.

The repeated-RLC, transformer, and Tee/nodal demonstration notes promise
runtime drawings but do not call `nP.schematic()`. The transmission-line/stub
comparison draws four stub cases but omits a runtime drawing of the bare-line
case. Existing claims that results or drawings were verified describe earlier
work; they are not evidence of a fresh run with the current plugin.

### Reference and display explanations

Reference 200 still identifies nP 0.0.48 and plugin 0.3.1, recommends positional
microstrip calls, and lacks coverage of newer APIs. Changing its version text
alone would not repair it.

Lesson 8 says an outer array around a single `inputTable` is mandatory. Its
examples remain valid, but current chart normalization accepts either a table
or an array of tables, so the categorical restriction should be updated.

### Source verification

Huelsman's second resistor example has opposing resistance-matrix entries of
`-4281` and `-4821`. Both entries are inherited from the archived HTML source.
This is a suspected transcription issue requiring comparison with the
published circuit/equations. Agreement between inversion and Gaussian solving
does not independently validate the coefficients supplied to both methods.

The archive-only HTML low-pass application loads nP 0.0.47 from jsDelivr and
uses an old `Images/1 Learning nP SVG/` path. It is disclosed as a standalone,
network-using browser example, not an executable `npjs` note.

## Verification limits

Static parsing found no syntax errors in the vault's 168 actual `npjs`
blocks. Exported API-name checks found only the deliberately incorrect
lowercase `nP.r()` exercises. Signature inspection found the incompatibilities
listed above. Intentional `notDefined()` demonstrations are also teaching
examples, not accidental failures.

No lesson code was executed during the audit, and no Obsidian Reading-view,
PDF, visual-layout, or numerical regression validation was performed. No
copied note was rewritten or marked as ready for publication. Any future
distributable examples must follow the repository's nP REPL promotion rules.
