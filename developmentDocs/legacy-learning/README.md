<!-- Modified: 2026-11-13 -->
# Preserved learning material

This collection preserves educational source material from the retired
`/home/jerrywiltz/cad-development/np-rf-analysis-test-vault`. It contains 24
lesson/reference notes, 13 selected applied examples, and 37 SVG illustrations.
The copied files are unchanged, including their original modification comments,
links, code, and historical version statements.

These are candidates for future documentation work. They are not current API
documentation, bundled plugin content, or another test vault. The plugin
repository root remains the canonical development/test vault. Do not promote
these notes into `nPort-plugin-content/` or use old authoring instructions to
override the current nP source and repository instructions.

Read [the audit](AUDIT.md) before reusing a note. The original vault paths in
the preserved notes have not been rewritten for this directory. Images can be
found beside the preserved note collections, but links and runtime behavior
need review before republishing or using the material as a course.

## Preserved material

| Collection | Location | Intended use |
| --- | --- | --- |
| Lessons 1–22 | `nPort RF Analysis/Lessons/` | Beginner explanations, RF concepts, circuit assembly, displays, diagnosis, and schematic workflow. |
| Reference 100 | `nPort RF Analysis/Lessons/100 Hand-loading the plugin into Obsidian.md` | Optional manual-installation reference. |
| Reference 200 | `nPort RF Analysis/Lessons/200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md` | Historical API inventory; must be rebuilt before being called a current complete reference. |
| COMPACT | `nPort RF Analysis/Examples/examples/Compact/` | Diplexer analysis and source explanation. |
| Gupta | `nPort RF Analysis/Examples/examples/Gupta/` | Rat-race divider and repeated RLC sections. |
| Huelsman | `nPort RF Analysis/Examples/examples/Huelsman/` | Two applied resistor/matrix analyses; verify the second example's coefficients. |
| Microwaves101 | `nPort RF Analysis/Examples/examples/MWs101/` | Branchline and directional coupler examples. |
| Medley | `nPort RF Analysis/Examples/examples/Medley/` | Coupled filter, RLC constructors, transmission-line stubs, and transformers. |
| nP examples | `nPort RF Analysis/Examples/examples/nP-examples/` | Parasitic attenuator and Tee/nodal topology demonstrations. |
| Illustrations | The two collections' `Images/` folders | Original explanatory drawings, retained as historical assets. nP remains the authority for current schematic symbols and generation. |

`preservation-manifest.json` records the source revision and SHA-256 of every
copied file. The collection includes all 10 modified lesson/reference notes
and all 11 modified legacy example notes identified during the audit.

## Full local archive

The complete original vault was archived separately, including its `.git/`
directory, 12 local commits, all uncommitted and untracked files, Obsidian
configuration, installed plugin, and saved results:

```text
.local-archives/np-rf-analysis-test-vault-2026-11-13.tar.gz
.local-archives/np-rf-analysis-test-vault-2026-11-13.inventory.json
```

Those paths are relative to the plugin repository root. The inventory records
all 1,012 files and the source Git status, plus directory metadata. Every file
in the compressed archive was checked against the original vault before
removal. The archive checksum is also recorded in
`preservation-manifest.json`.

**The full archive is local only and ignored by Git.** A checkout or clone of
the plugin repository will not include it. Keep it separately if the full
history, saved results, or archive-only material must survive loss of this
working directory. Nothing was uploaded as part of preservation.

The full archive also retains material omitted from the reviewable collection:

- All older revisions and development notes under `0.3.1/`.
- Original `AGENTS.md` files and schematic-authoring infrastructure, kept as
  historical records rather than active instructions in this collection.
- The redundant GistHTMLs examples and standalone HTML low-pass application.
- `schematicTest.md`, the old examples index, and the 46 numbered examples.

The 46 numbered examples already have exact copies in the current
`nPort-plugin-content/Examples/`; they were not copied into this collection.

For recovery, verify the archive checksum and inspect its inventory, then
extract into an explicitly chosen recovery directory. Do not automatically
recreate the retired vault path or adopt its obsolete authoring rules.

## Retirement follow-up

The old vault directory is retired after archive and copy verification.
Obsidian may retain its saved vault-list entry until **Manage vaults** is
opened; remove that stale entry if it remains. The external `plugintest` shell
alias and workspace-admin inventory/registry records may still refer to the
former path. This preservation operation does not rewrite those external
configuration and administration files.
