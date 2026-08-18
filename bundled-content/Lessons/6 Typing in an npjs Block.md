<!-- Modified: 2026-08-17 -->

# Typing in an `npjs` Block

In this exercise, you will type an nP analysis into an `npjs` block. The circuit is a 75 Ω resistor and a 5 nH inductor connected in series.

## What `npjs` Does

Obsidian normally treats a fenced code block as text to display. The language name immediately after the opening fence tells Obsidian how that block should be handled:

````markdown
```npjs
// nP JavaScript goes here.
```
````

When nPort RF Analysis is enabled, it recognizes the `npjs` language name. In Reading view, the plugin adds the controls, runs the block's JavaScript in its isolated worker, and displays the resulting console messages, errors, charts, and tables.

The opening fence must be exactly three backticks followed by `npjs`. The closing fence is three backticks by itself.

## Why This Exercise Uses Typing

Manual typing is a requirement of this exercise, not a requirement of the plugin. Typing the short analysis helps you learn:

- The spelling and capitalization of nP constructors.
- The difference between parentheses `()`, brackets `[]`, and braces `{}`.
- How component ports are assigned to node numbers.
- The normal order of an nP analysis: frequencies, components, connections, output, and display.

In ordinary work, you may paste JavaScript into an `npjs` block. Use **Ctrl+Shift+V** to paste as plain text if a normal paste introduces unwanted blank lines or rich-text formatting.

## Circuit

![[nPort RF Analysis/Lessons/Images/series-rl.svg]]<br>
<a class="internal-link" data-href="nPort RF Analysis/Lessons/Images/series-rl.svg" href="nPort RF Analysis/Lessons/Images/series-rl.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

The analysis uses 11 frequency points from 1 GHz through 10 GHz, the same range used in [[3 Series RC Example|the series RC example]].

## Type the Analysis

1. Switch this note to **Editing view**.
2. Find the starter `npjs` block under **Your Code Block**.
3. Delete its comment, and type the JavaScript shown below.
4. Keep the opening and closing `npjs` fences in place.
5. Switch to **Reading view** and click **Run**.

Type this code rather than copying and pasting it:

```javascript
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);

var r1 = nP.R(75);
var l1 = nP.L(5e-9);

var seriesRL = nP.nodal(
    [r1, 1, 2],
    [l1, 2, 3],
    ['out', 1, 3]
);

var lineOut = seriesRL.out(
    's21dB',                                // Forward transmission
    's11dB',                                // Input reflection
);

nP.lineChart({
    inputTable: [lineOut],
});
```

## Your Code Block

```npjs
// Delete this comment, and type the series RL analysis here.
```

## Expected Result

The line chart should contain two traces:

- `s21dB` shows transmission through the series RL network.
- `s11dB` shows reflection from the input of the network.

The `lineChart` options object is intentionally minimal. Only `inputTable` is required; nP supplies the other chart options from its defaults.

If the error pane reports a problem, compare the typed code with the reference one line at a time. Check capitalization, parentheses, brackets, commas, quotes, and semicolons.

Return to [[5 Nodal Analysis of the Series RC Circuit|the nodal analysis]], or continue to [[7 The Basic Analysis Blocks|the basic analysis blocks]].
