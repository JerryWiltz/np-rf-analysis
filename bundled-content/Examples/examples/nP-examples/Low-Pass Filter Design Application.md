<!-- Modified: 2026-08-17 -->

# Low-Pass Filter Design Application

This example preserves the archived one-page nP low-pass filter application as
a self-contained HTML document. In the browser page, the user enters filter
requirements, selects **Design** to calculate the filter, and selects **Test**
to plot its response.

> [!INFO] Source and provenance
> - **Archived HTML:** `nP/docs/_archive/examples/nP-examples/LC-lowpassApplication.html`
> - **Archive collection:** Archived nP-examples example collection
> - **Original HTML modification date:** 2026-06-27
> - **Archived implementation note:** `had to change from n to N`
> - **Original interface:** Maximum pass frequency, minimum rejection frequency,
>   frequency units, passband ripple, rejection level, Design button, normalized
>   frequency, section count, filter elements, sweep limits, data points, Test
>   button, and output plot.

> [!SUCCESS] Schematic maturity
> The application synthesizes a different ladder when its requirements change,
> so it has no single fixed component-level schematic. The block drawing below
> correctly represents the generated two-port network and reuses the canonical
> learning-guide SVG rather than creating a duplicate circuit drawing.

## Generated Filter Network

![[Images/1 Learning nP SVG/chebyshev-low-pass-network.svg|900]]

<a class="internal-link" data-href="Images/1 Learning nP SVG/chebyshev-low-pass-network.svg" href="Images/1 Learning nP SVG/chebyshev-low-pass-network.svg" style="display:inline-block;margin-top:0.75rem;padding:0.25rem 0.75rem;border:1px solid var(--background-modifier-border);border-radius:var(--button-radius);background:var(--interactive-normal);color:var(--text-normal);text-decoration:none;">Zoom</a>

## How It Relates to Lesson 19

[[19 Chebyshev Low-Pass Filter Design]] explains the four nP calculations used
by this application. The lesson's ordinary `npjs` analysis runs those
calculations and renders the response inside Obsidian. The current plugin does
not turn user-authored HTML into interactive note controls, so the complete
form-based application below runs as a standalone browser page instead.

## Standalone HTML Application

The following non-executing code block uses nP.js directly in an HTML page. The
external `nP_index.css` stylesheet has
been copied into the document between `<style>` tags so the example is
self-contained. A user can copy the entire block into a plain-text editor, give
the file a name ending in `.html`, and open it in a browser while connected to
the internet. The page loads nP.js directly from jsDelivr, so no separate
library download is required for this copy-and-run example.

Obsidian displays this block as source text; it does not create a live form or
run the script inside the note.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Low-pass filter design</title>
  <!-- Browser approach: load nP.js and connect form buttons to nP calls. -->
  <script src="https://cdn.jsdelivr.net/gh/JerryWiltz/nP@v0.0.47/dist/nP.js"></script>
  <style>
    /* Inlined from the original external nP_index.css stylesheet. */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --color-bg: #f4f4f4;
      --color-card: #ffffff;
      --color-text: #222222;
      --color-accent: #1e90ff;
      --radius: 0.75rem;
    }

    body {
      font-family: "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial,
        sans-serif;
      background-color: var(--color-bg);
      color: var(--color-text);
      -webkit-font-smoothing: antialiased;
      padding: 2rem;
      line-height: 1.6;
    }

    .items {
      display: grid;
      gap: 2rem;
      grid-template-columns: repeat(3, 1fr);
      max-width: 1200px;
      margin-inline: auto;
    }

    @media (max-width: 1024px) {
      .items {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .items {
        grid-template-columns: 1fr;
      }
    }

    .anchor-item {
      display: block;
      text-decoration: none;
      color: var(--color-text);
      height: 100%;
    }

    .anchor-item:visited,
    .anchor-item:active,
    .anchor-item:focus,
    .anchor-item:hover {
      color: var(--color-text);
    }

    .box {
      background-color: var(--color-card);
      border-radius: var(--radius);
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: border 0.2s ease, box-shadow 0.2s ease;
      border: 2px solid transparent;
    }

    .anchor-item:hover .box,
    .anchor-item:focus-visible .box {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.2);
      outline: none;
    }

    .icon {
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .details {
      font-size: 0.95rem;
      flex-grow: 1;
      margin-bottom: 1rem;
    }

    .link-text-value {
      font-size: 0.95rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .anchor-item:focus-visible .box {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.2);
    }

    /* Low-pass application form layout. */
    label {
      display: grid;
      grid-template-columns: minmax(14rem, 18rem) minmax(8rem, 12rem);
      gap: 1rem;
      align-items: center;
      max-width: 32rem;
      margin-bottom: 0.75rem;
    }

    input,
    select {
      width: 100%;
      padding: 0.4rem 0.6rem;
      font: inherit;
    }

    #design,
    #test {
      width: auto;
      min-width: 8rem;
      padding: 0.4rem 1rem;
      font: inherit;
      margin-block: 1rem;
      cursor: pointer;
    }

    #design:disabled,
    #test:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    #results {
      max-width: 32rem;
      margin-block: 1rem;
      padding: 1rem;
      overflow-x: auto;
      background-color: var(--color-card);
      white-space: pre-wrap;
    }

    #results:empty {
      display: none;
    }

    #chart {
      width: 100%;
      overflow-x: auto;
    }

    @media (max-width: 600px) {
      label {
        grid-template-columns: 1fr;
        gap: 0.25rem;
      }
    }
  </style>
</head>
<body>
  <label>
    Maximum pass frequency, GHz
    <input id="maxPassFrequency" type="number" value="1.2" step="any">
  </label>

  <label>
    Minimum rejection frequency, GHz
    <input id="minRejectionFrequency" type="number" value="1.5" step="any">
  </label>

  <label>
    Passband ripple, dB
    <input id="passbandRipple" type="number" value="0.1" step="any">
  </label>

  <label>
    Rejection, dB
    <input id="rejection" type="number" value="30" step="any">
  </label>

  <button id="design" type="button">Design</button>
  <pre id="results"></pre>

  <h2>Response sweep</h2>

  <label>
    Start frequency, GHz
    <input id="startFrequency" type="number" value="0.05" step="any">
  </label>

  <label>
    Stop frequency, GHz
    <input id="stopFrequency" type="number" value="10" step="any">
  </label>

  <label>
    Data points
    <input id="dataPoints" type="number" value="101" step="1">
  </label>

  <button id="test" type="button" disabled>Test</button>
  <div id="chart" style="display:none"></div>

  <script>
    var designedComponents = null;
    var designInputIds = [
      'maxPassFrequency',
      'minRejectionFrequency',
      'passbandRipple',
      'rejection'
    ];
    var responseInputIds = [
      'startFrequency',
      'stopFrequency',
      'dataPoints'
    ];
    var results = document.getElementById('results');
    var chart = document.getElementById('chart');
    var testButton = document.getElementById('test');

    function clearChart() {
      chart.replaceChildren();
      chart.style.display = 'none';
    }

    function invalidateDesign() {
      designedComponents = null;
      results.textContent = '';
      clearChart();
      testButton.disabled = true;
    }

    designInputIds.forEach(function (id) {
      document.getElementById(id).addEventListener('input', invalidateDesign);
    });

    responseInputIds.forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        clearChart();
      });
    });

    document.getElementById('design').addEventListener('click', function () {
      var passFrequency = Number(
        document.getElementById('maxPassFrequency').value
      ) * 1e9;
      var rejectionFrequency = Number(
        document.getElementById('minRejectionFrequency').value
      ) * 1e9;
      var ripple = Number(document.getElementById('passbandRipple').value);
      var rejection = Number(document.getElementById('rejection').value);

      var sections = nP.chebyLPNsec(
        passFrequency,      // Maximum pass frequency in hertz
        rejectionFrequency, // Minimum rejection frequency in hertz
        ripple,             // Passband ripple in dB
        rejection,          // Minimum rejection in dB
      );
      var prototype = nP.chebyLPgk(
        sections, // Number of sections
        ripple,   // Passband ripple in dB
      );
      var components = nP.chebyLPLCs(
        prototype,     // Low-pass prototype values
        passFrequency, // Maximum pass frequency in hertz
        50,            // Reference impedance in ohms
      );
      var componentLines = components.map(function (value, index) {
        var lastIndex = components.length - 1;
        var label;

        if (index === 0) {
          label = 'Source termination';
        } else if (index === lastIndex) {
          label = 'Load termination';
        } else {
          var elementIndex = index - 1;
          var isCapacitor = elementIndex % 2 === 0;
          var elementNumber = Math.floor(elementIndex / 2) + 1;
          label = (isCapacitor ? 'C' : 'L') + elementNumber;
        }

        return label + ': ' + value.toExponential(6);
      });

      document.getElementById('results').textContent =
        'Sections: ' + sections + '\n\nComponents:\n' +
        componentLines.join('\n');

      designedComponents = components;
      clearChart();
      testButton.disabled = false;
    });

    testButton.addEventListener('click', function () {
      if (!designedComponents) return;

      var startFrequency = Number(
        document.getElementById('startFrequency').value
      ) * 1e9;
      var stopFrequency = Number(
        document.getElementById('stopFrequency').value
      ) * 1e9;
      var dataPoints = Number(document.getElementById('dataPoints').value);

      nP.global.fList = nP.global.fGen(
        startFrequency, // Start frequency in hertz
        stopFrequency,  // Stop frequency in hertz
        dataPoints,     // Number of frequency points
      );
      var filter = nP.lpfGen(designedComponents.slice());
      var output = filter.out(
        's11dB', // Input reflection
        's21dB', // Forward transmission
      );

      // Replace the previous response instead of appending another chart.
      clearChart();
      chart.style.display = 'block';

      nP.lineChart({
        mount: chart,
        inputTable: [output],
        title: 'Low-pass filter response',
        width: 700,
        height: 450,
      });
    });
  </script>
</body>
</html>
```
