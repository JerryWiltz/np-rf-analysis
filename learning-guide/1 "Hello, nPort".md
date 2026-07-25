<!-- Modified: 2026-07-17 -->

# Hello, nPort!

This introductory example explains what nPort RF Analysis is and verifies that the plugin is installed, enabled, and able to run JavaScript in an Obsidian note.

## What Is an n-Port?

An RF **port** is a place where a signal can enter or leave a circuit. An **n-port** is a mathematical model of a circuit with any number, `n`, of those ports.

Examples include:

- A resistor, capacitor, or transmission line represented as a two-port.
- A tee junction represented as a three-port.
- A coupled transmission line represented as a four-port.
- A filter assembled from smaller n-ports and returned as a new n-port.

nP describes RF behavior with S-parameters. For example, `s11` describes the signal reflected at port 1, while `s21` describes transmission from port 1 to port 2.

## What Are nP and nPort RF Analysis?

**nP** is a JavaScript library for RF and microwave circuit analysis. It constructs components, connects them into larger networks, calculates S-parameters, and produces data for charts and tables.

**nPort RF Analysis** is the Obsidian plugin that makes nP available inside fenced `npjs` blocks. The plugin supplies the Run, Stop, and Reset controls and displays console messages, errors, line charts, tables, and Smith charts in the note.

The code inside an `npjs` block is ordinary JavaScript using the nP library. It is not JSON and it is not a separate nP programming language.

## Skill Level Assumed Without Codex

You do not need to be an expert JavaScript programmer or an RF engineer to begin. To work through these lessons without Codex writing the code, it helps to know or learn:

### Basic JavaScript

- How to type and edit a fenced code block in an Obsidian note.
- How a variable stores a value, such as `var r1 = nP.R(75);`.
- How a function call uses parentheses, such as `nP.R(75)`.
- How arrays use brackets, such as `[r1, 1, 2]`.
- How an options object uses braces, such as `{ inputTable: [output] }`.
- How commas, quotes, capitalization, and closing punctuation affect the code.
- How scientific notation expresses values such as `1e9` for 1 GHz and `1e-12` for 1 pF.
- How to read the console and error panes when code does not run.

You do not need advanced JavaScript concepts such as classes, package management, bundling, browser internals, or asynchronous programming for the introductory lessons.

### Basic RF Concepts

- Resistance, inductance, and capacitance, including their units.
- Frequency expressed in hertz, megahertz, or gigahertz.
- The idea that a circuit can have an input port and an output port.
- The basic meanings of `s11` as reflection and `s21` as forward transmission.
- Decibels as a way of expressing RF magnitude and loss.

Later lessons introduce node numbers, `nP.nodal()`, Smith charts, and multiport circuits gradually. You can begin before mastering those subjects.

### Working With Codex

Codex can translate a circuit description into an `npjs` block, explain unfamiliar JavaScript or RF mathematics, diagnose errors, and update an analysis when component values or topology change. The resulting analysis remains ordinary, visible JavaScript that you can inspect, run offline, and revise yourself.

Even when Codex writes the first version, check the schematic, component values, units, node connections, frequency range, and plotted S-parameters before relying on the result.

## Before You Begin

Make sure nPort RF Analysis is installed and enabled for this vault:

1. Open **Settings** using the gear icon in the lower-left corner of Obsidian.
2. Select **Community plugins**.
3. Find **nPort RF Analysis** in the installed plugins list.
4. Enable the plugin if it is not already enabled.

## Run the Example

1. Switch this note to **Reading view**.
2. Find the nP JavaScript block below.
3. Click **Run** above the code block.

```npjs
console.log("Hello, nPort!");
```

## Expected Result

The result area below the code should display:

```text
[log] Hello, nPort!
```

This message appears in the console pane and confirms that the plugin recognized the `npjs` code block and ran its JavaScript.

## Reset the Example

Click **Reset** to stop the current run and clear its displayed output.

You are now ready to continue to [[2 Understanding an npjs Block|the next example]].
