<!-- Modified: 2026-08-11 -->

# Hello, nPort!

This introductory example explains what nPort RF Analysis is and verifies that the plugin is installed, enabled, and able to run JavaScript in an Obsidian note.

## Circuits You Can Analyze with nP

nP can analyze individual RF components, connected lumped-element circuits, and physical transmission-line structures. These are some of the schematics included in this learning guide:

| Lumped two-port networks | Connected RF networks |
| --- | --- |
| <span style="display:flex;flex-direction:column;align-items:flex-start;min-height:27rem;">**Series RC**<br>Resistive and capacitive behavior versus frequency.<br><br>![[nPort RF Analysis/Lessons/Images/series-rc.svg\|320]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rc.svg" href="nPort RF Analysis/Lessons/Images/series-rc.svg" style="display:inline-block;margin-top:auto;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> | <span style="display:flex;flex-direction:column;align-items:flex-start;min-height:27rem;">**3 dB pi attenuator**<br>Multiple components connected into one two-port network.<br><br>![[nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg\|320]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg" href="nPort RF Analysis/Lessons/Images/3-db-pi-attenuator.svg" style="display:inline-block;margin-top:auto;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |
| <span style="display:flex;flex-direction:column;align-items:flex-start;min-height:27rem;">**Series RL**<br>Resistive and inductive behavior versus frequency.<br><br>![[nPort RF Analysis/Lessons/Images/series-rl.svg\|320]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rl.svg" href="nPort RF Analysis/Lessons/Images/series-rl.svg" style="display:inline-block;margin-top:auto;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> | <span style="display:flex;flex-direction:column;align-items:flex-start;min-height:27rem;">**Microstrip tee power divider**<br>A physical three-port structure built from microstrip models.<br><br>![[nPort RF Analysis/Lessons/Images/microstrip-tee-power-divider.svg\|320]]<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/microstrip-tee-power-divider.svg" href="nPort RF Analysis/Lessons/Images/microstrip-tee-power-divider.svg" style="display:inline-block;margin-top:auto;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a></span> |

The same nP workflow scales from a single component to filters, transformers, transmission lines, coupled lines, junctions, and larger networks assembled from them.

## Math Functions You Can Solve with nP

nP also includes math tools used in RF analysis. You can work with complex numbers and solve real or complex matrix problems.

| Math capability | What nP can do |
| --- | --- |
| **Complex numbers** | Perform arithmetic and find magnitude or phase with `nP.complex()`.<br><br>$z=x+jy,\qquad \lvert z\rvert=\sqrt{x^2+y^2}$ |
| **Real matrices** | Multiply, invert, and solve systems of real equations with `nP.matrix()`.<br><br>$\boldsymbol{y}=\boldsymbol{A}\boldsymbol{x},\qquad \boldsymbol{x}=\boldsymbol{A}^{-1}\boldsymbol{y}$ |
| **Complex matrices** | Apply matrix operations when every entry is a complex number.<br><br>$\boldsymbol{C}=\boldsymbol{A}\boldsymbol{B},\qquad a_{mn}\in\mathbb{C}$ |
| **S-parameter matrices** | ***b*** = ***s*** × ***a***, where ***a***, ***s***, and ***b*** are matrices.<br><br>$\displaystyle \begin{bmatrix} b_1 \\ b_2 \\ b_3 \end{bmatrix} = \begin{bmatrix} s_{11} & s_{12} & s_{13} \\ s_{21} & s_{22} & s_{23} \\ s_{31} & s_{32} & s_{33} \end{bmatrix} \begin{bmatrix} a_1 \\ a_2 \\ a_3 \end{bmatrix}$ |

Many nP math operations support **method chaining**, so several calculations can be written as one readable sequence. The complete API and runnable examples appear in [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices#Method Chaining|Method Chaining]], [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices#Complex Numbers|Complex Numbers]], and [[200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices#Matrices|Matrices]].

Complex-number method chain:

$$
\texttt{z1.add(z2).mul(z3)}
\quad\Longleftrightarrow\quad
(z_1+z_2)z_3
$$

Matrix method chain:

$$
\texttt{A.mul(B).add(C).invert()}
\quad\Longleftrightarrow\quad
(\boldsymbol{A}\boldsymbol{B}+\boldsymbol{C})^{-1}
$$

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

You are now ready to continue to [[2 Understanding an npjs Pane|the next example]].
