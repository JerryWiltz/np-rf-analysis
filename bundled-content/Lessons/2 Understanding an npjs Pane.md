<!-- Modified: 2026-08-17 -->

# Understanding an `npjs` Pane

An `npjs` code block lets nPort RF Analysis run JavaScript inside an Obsidian note. In Reading view, the plugin presents the code and its controls, console messages, and errors together.

## The Four Panes

Each `npjs` block has four panes:

1. **Controls Pane** — **Run**, **Stop**, and **Reset** control the code, while **Status** reports its current state.
2. **JavaScript Pane** — the visible source code written between the opening and closing `npjs` fences.
3. **Console Pane** — messages produced by calls such as `console.log()`.
4. **Errors Pane** — JavaScript errors and execution failures that help identify problems in the code.

![[nPort RF Analysis/Lessons/Images/npjs-four-panes.svg]]

## What the Controls Do

- **Run** starts the JavaScript in that `npjs` block.
- **Stop** terminates code that is currently running.
- **Reset** stops the run and clears its displayed results, console messages, and errors.
- **Status** indicates whether the block is ready, running, complete, stopped, or in an error state.

Each `npjs` block operates independently. Its controls act only on the code and results belonging to that block.

## One Sandbox per `npjs` Pane

A **sandbox** is an isolated workspace where JavaScript can run without direct
access to your vault, filesystem, network, Node.js, Electron, or unrestricted
Obsidian APIs.

Every `npjs` Pane receives its own sandbox and worker. It also receives its own:

- **Run**, **Stop**, and **Reset** buttons.
- Status indicator.
- JavaScript global scope.
- nP library state, including `nP.global.fList`.
- Console messages and errors.
- Charts, tables, and other rendered results.

Two `npjs` blocks in the same note do not share live variables or a common JavaScript scope. A variable declared in one block does not exist in another block.

For example, if the first block runs:

```javascript
var r1 = nP.R(75);
```

a second block cannot use `r1`. It would report a `ReferenceError` because that second sandbox has no variable named `r1`.

Changes to the nP global settings are also local to the block. If two separate blocks construct frequency-dependent components, each block should set its own frequency list before constructing them:

```javascript
var g = nP.global;
g.fList = g.fGen(
    1e9,                                    // Start frequency in hertz
    10e9,                                   // Stop frequency in hertz
    11,                                     // Number of frequency points
);
```

Keep code that must share variables in the same `npjs` block. Separate blocks are best treated as separate, independently runnable analyses.

## Try the Console

1. Switch this note to **Reading view**.
2. Click **Run** above the following code.
3. Look in the console pane.

```npjs
console.log("Hello from the console.");
```

The console pane should display:

```text
[log] Hello from the console.
```

## Try the Error Pane

The next example deliberately calls a function that does not exist. This is a harmless way to see how nPort RF Analysis reports a coding error.

1. Click **Run** above the following code.
2. Read the message in the error pane.

```npjs
notDefined();
```

The error pane should report a `ReferenceError` because `notDefined` has not been declared. An error in an `npjs` block does not damage the note.

Click **Reset** above either example to clear that example's displayed output.

Return to [[1 "Hello, nPort"|Hello, nPort!]], or continue to [[3 Series RC Example|the series RC example]].
