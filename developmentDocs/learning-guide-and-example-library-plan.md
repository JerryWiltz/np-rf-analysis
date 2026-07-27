<!-- Modified: 2026-07-27 -->
# Learning guide and example library plan

## Purpose

This document records the proposed path forward for three coordinated
user-facing resources:

1. A short, progressive learning guide for new users.
2. A larger library of complete RF and microwave examples.
3. An improved public README that introduces the plugin and directs users to
   both collections.

The two collections serve different purposes and should remain visibly
separate. The learning guide teaches the plugin and the nP workflow in order.
The example library lets users browse and run practical circuits without
turning the introductory guide into a catalog of approximately 100 examples.
The README is the public entrance to both resources on GitHub and on the plugin
details page in the Community plugins browser.

All three resources should present nP as both an RF network-analysis library
and a useful mathematics library. Complex numbers, matrices, and method
chaining are therefore cross-cutting documentation requirements rather than a
single isolated reference topic.

This is a design plan, not a record of implemented behavior. The existing
**Create learning guide** feature is implemented. The example-library feature
and README revision are proposed.

## User-facing settings

The nPort RF Analysis settings should present two adjacent sections:

```text
Learning guide
Create introductory lessons, runnable examples, and diagrams in this vault.

[Create learning guide]


Example library
Create a categorized collection of complete RF and microwave examples in this
vault.

[Create example library]
```

The buttons create different top-level folders:

| Settings action | Folder created in the user's vault |
| --- | --- |
| **Create learning guide** | `Getting Started/` |
| **Create example library** | `nPort RF Examples/` |

`nPort RF Examples` is preferred over the generic name `Examples` because an
existing vault may already use `Examples` for unrelated material.

## Content flow

### Learning guide

```text
Test-vault authoring source
np-rf-analysis-test-vault/
├── 1 Learning nP/
└── Images/1 Learning nP SVG/
             │
             │ review and test in Obsidian Reading view
             ▼
Plugin distribution source
np-rf-analysis/learning-guide/
├── lesson Markdown files
└── Images/
             │
             │ production build
             ▼
main.js
             │
             │ user selects Create learning guide
             ▼
User's vault/Getting Started/
```

The test vault is the lesson-authoring source. Its generated `Getting Started/`
folder is user-facing test output, not the maintained source.

The learning guide should introduce the nP mathematics features progressively:

- create and inspect complex numbers;
- perform representative complex arithmetic;
- create and inspect matrices;
- perform representative matrix operations;
- explain how method chaining passes one returned value into the next method;
- connect the mathematics to practical RF quantities and S-parameter work; and
- retain the complete API inventory as a later reference rather than requiring
  beginners to absorb it at the start.

The inventory filename is
`200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md`.
Use the standard mathematical plural `matrices` consistently in prose,
headings, links, and filenames.

### Example library

The proposed plugin source is:

```text
np-rf-analysis/examples/
├── 00 Example Library Index.md
├── 01 Fundamentals/
├── 02 Components/
├── 03 Attenuators/
├── 04 Filters/
├── 05 Transmission Lines/
├── 06 Coupled Lines/
├── 07 Microstrip/
├── 08 Touchstone/
├── 09 Charts and Tables/
├── 10 nP Mathematics/
└── Images/
```

The distribution path would be:

```text
np-rf-analysis/examples/
             │
             │ production build
             ▼
main.js
             │
             │ user selects Create example library
             ▼
User's vault/nPort RF Examples/
```

The examples should be bundled with the plugin. **Create example library**
would therefore create files from already installed content; it would not
download files from GitHub. This keeps the feature available offline and avoids
adding network access to the plugin.

## Example organization

Approximately 100 examples should live under one `examples/` root, organized
by category rather than placed in one flat directory. The index should explain
the categories and link to every example.

Each example should normally contain:

- a concise purpose and expected result;
- circuit values and engineering units;
- visible, runnable `npjs` code or validated `np` JSON;
- a matching schematic when topology is relevant;
- the expected chart, table, or Smith chart;
- an explanation of the RF behavior; and
- links to related examples or prerequisite learning-guide lessons.

The example library should progress from small circuits to more specialized
networks, but it does not need to be read sequentially.

The **nP Mathematics** category should include focused, runnable examples for:

- complex-number construction, properties, arithmetic, magnitude, phase, and
  conjugation;
- matrix construction, indexing, addition, multiplication, inversion, and
  other supported operations;
- method chaining with intermediate equivalents shown for learners;
- complex and matrix operations used in RF calculations; and
- examples that clearly distinguish JavaScript values, nP complex objects, nP
  matrix objects, and n-port network objects.

Mathematics examples should remain small enough to teach one central operation
at a time before combining operations into longer chains.

## Image organization

The generated example library should be self-contained. Its images should live
below:

```text
nPort RF Examples/Images/
```

The plugin source should mirror that layout under:

```text
np-rf-analysis/examples/Images/
```

Use category subfolders when helpful:

```text
Images/
├── Fundamentals/
├── Components/
├── Attenuators/
├── Filters/
└── Microstrip/
```

Use descriptive, unique, lowercase, hyphen-separated SVG filenames. Do not
create a separate image folder for every example by default. An example-specific
subfolder is appropriate only when one example has several related assets, such
as a schematic, physical layout, and port-numbering diagram.

All SVG files must remain self-contained and follow the established schematic
standards. They must not contain scripts, external resources, remote fonts,
embedded HTML, or network requests.

## Creation and file-preservation behavior

Both settings actions should follow the same safety rules:

1. Create the top-level collection folder only when needed.
2. Create required category and image folders only when needed.
3. Create only missing files.
4. Never overwrite an existing user file.
5. Report how many files were created.
6. Open the first lesson or collection index after creation.
7. Explain that the resulting Markdown and SVG files are ordinary user-owned
   vault files.

The current learning-guide implementation already preserves existing files.
The example library should use the same principle.

This preservation rule has an important consequence: a plugin update does not
silently replace an existing `Getting Started` or `nPort RF Examples` file.
Safe updating of previously created collections is a separate feature that
would require version tracking, conflict handling, and an explicit user action.
It is outside the initial two-button design.

## Proposed build design

The existing learning guide imports every Markdown lesson explicitly in
`src/learning-guide.ts`. The build treats `.md` imports as text. A custom
esbuild plugin collects the SVG files under `learning-guide/Images/` and embeds
them as strings.

Manually registering approximately 100 example files would be cumbersome and
error-prone. The example library should use a build-time collector that:

1. Recursively reads the approved files under `examples/`.
2. Sorts paths deterministically.
3. Embeds Markdown and SVG content as a path-to-content map.
4. Watches the collected files during development builds.
5. Rejects unsupported file types or paths outside the approved source root.

At runtime, a dedicated creation function should write that map below
`nPort RF Examples/` through the Obsidian Vault API while preserving existing
files.

The implementation should keep the learning-guide and example-library
constants, creation logic, and tests separated enough that one collection
cannot accidentally write into the other.

## Discoverability

Users should learn about the example library without having to discover the
GitHub directory independently.

The initial implementation should expose it through:

- the **Example library** section in plugin settings;
- the **Create example library** button;
- a short explanation in the public `README.md`, which appears on the plugin
  details page in the Community plugins browser; and
- links from the generated Getting Started guide where examples naturally
  extend a lesson.

An optional **Browse examples online** link could open the GitHub `examples/`
directory. It should supplement, not replace, the offline bundled collection.

## Public README

The root `README.md` is the third user-facing part of this plan. GitHub displays
it on the repository home page, and Obsidian renders it on the plugin details
page in the Community plugins browser.

The README should be a concise public introduction rather than a duplicate of
the learning guide or example library. It should answer:

- What does nPort RF Analysis do?
- Why would an Obsidian user install it?
- How does the user run a first analysis?
- What nP mathematics capabilities are available?
- Where does the user create the Getting Started guide?
- Where does the user create the example library?
- What security boundaries protect the vault when `npjs` runs?
- Where can the user find installation instructions, documentation, and help?

A proposed README outline is:

```text
# nPort RF Analysis

Short description and representative screenshot

## What it does

## nP mathematics
Complex numbers, matrices, and method chaining

## Quick start

## Learning guide
Settings → Community plugins → nPort RF Analysis → Create learning guide
Creates Getting Started/

## Example library
Settings → Community plugins → nPort RF Analysis → Create example library
Creates nPort RF Examples/

## How npjs works

## Installation

## Security and privacy

## Documentation and support
```

The README should state that both collections are bundled with the plugin,
created locally, available offline, and written as ordinary user-owned Markdown
and SVG files. It should also explain that existing files are preserved.

The README's mathematics section should briefly demonstrate that nP supports
complex numbers, matrices, and method chaining, then direct readers to the
Getting Started guide and example library for complete instruction. It should
not reproduce the full API inventory.

The README must remain aligned with the plugin's actual behavior. Documentation
for the example-library button should not be presented as released behavior
until the feature has been implemented and verified.

## Authoring and promotion workflow

Learning-guide changes should continue to use the dedicated test vault:

1. Edit existing lesson files under `1 Learning nP/`.
2. Edit corresponding SVG sources under `Images/1 Learning nP SVG/`.
3. Test every changed lesson in Obsidian Reading view.
4. Report the exact files ready for promotion.
5. Promote only approved files into `np-rf-analysis/learning-guide/`.
6. Build the plugin and regenerate a clean `Getting Started/` test copy.
7. Re-test the generated files in Reading view.

Before example-library implementation begins, create and approve an equivalent
authoring location in the test vault. A proposed name is:

```text
2 nPort RF Examples/
```

Its final image-source location and promotion mapping should be documented in
the test vault's applicable `AGENTS.md` instructions before large-scale example
authoring begins.

## Implementation stages

### Stage 1: Approve structure and terminology

- Confirm the `nPort RF Examples` generated folder name.
- Confirm the initial category list.
- Confirm the scope and progression of complex-number, matrix, and
  method-chaining instruction.
- Confirm the test-vault authoring folder and image-source location.
- Decide which examples belong in the initial release.

### Stage 2: Build a small vertical slice

- Create the index and three representative examples.
- Include examples with no image, one image, and several images.
- Add the recursive build-time collector.
- Add **Create example library** to plugin settings.
- Add unit tests for path collection and file-preservation behavior.
- Build and test the generated library in the dedicated test vault.

### Stage 3: Expand the library

- Add examples category by category.
- Verify every circuit, code block, diagram, and expected result.
- Maintain the index and cross-links as examples are added.
- Keep the introductory Getting Started guide concise.
- Draft the revised README around the verified learning-guide and
  example-library behavior.

### Stage 4: Release preparation

- Complete `README.md` and relevant security or architecture documentation.
- Verify the README as rendered on GitHub and, when available, on the plugin
  details page in the Community plugins browser.
- Run lint, type checking, tests, the production build, and release
  verification.
- Test both settings buttons in a clean test vault.
- Confirm that neither action overwrites existing files.
- Review the generated `main.js` size and Obsidian startup behavior.
- Follow the repository's release checklist; do not publish without explicit
  user approval.

## Initial acceptance criteria

The proposed feature is complete when:

- plugin settings display separate learning-guide and example-library actions;
- **Create learning guide** creates or opens `Getting Started/`;
- **Create example library** creates or opens `nPort RF Examples/`;
- both collections work without network access;
- both actions preserve existing user files;
- the example index links to every included example;
- every included example has been tested in Obsidian Reading view;
- the learning guide, example library, and README all introduce nP complex
  numbers, matrices, and method chaining at an appropriate level;
- mathematics examples use supported nP APIs and produce verified results;
- every schematic agrees with its code and follows the SVG standards;
- automated tests cover collection paths, creation, and preservation behavior;
- the public README clearly introduces the plugin and both collections;
- the README's installation, offline-operation, file-preservation, security,
  and support statements match the implemented plugin; and
- the README renders cleanly on GitHub and in the Community plugins browser.

## Decisions still requiring approval

The following details remain proposals:

- the exact test-vault authoring folder for examples;
- the final category names and ordering;
- whether all examples ship at once or in staged releases;
- whether an optional **Browse examples online** button is desirable;
- which representative screenshot or rendered result should lead the README;
- whether safe updating of previously created collections should be designed
  later; and
- whether bundle-size growth warrants a different distribution mechanism in
  the future.
