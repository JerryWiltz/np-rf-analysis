// Modified: 2026-07-25
export const DOCUMENTATION_URL = 'https://github.com/JerryWiltz/np-rf-analysis#readme';
export const ISSUE_TRACKER_URL = 'https://github.com/JerryWiltz/np-rf-analysis/issues';

export const NPJS_EXAMPLE = `\`\`\`npjs
var g = nP.global;
g.fList = g.fGen(100e6, 1000e6, 51);

var r1 = nP.R(25);
var l1 = nP.L(2e-9);

var network = nP.nodal(
    [r1, 1, 2],
    [l1, 2, 3],
    ['out', 1, 3]
);

var output = network.out('s11dB', 's21dB');
nP.lineChart({
    inputTable: [output],
    title: 'Network response',
    mount: '#chartDiv',
    backgroundColor: 'white'
});
\`\`\``;

export const NP_EXAMPLE = `\`\`\`np
{
  "frequencies": {
    "start": 100000000,
    "stop": 6000000000,
    "points": 101,
    "referenceImpedance": 50
  },
  "components": {
    "r1": { "type": "R", "value": 25 },
    "l1": { "type": "L", "value": 2e-9 }
  },
  "nodal": [
    ["r1", 1, 2],
    ["l1", 2, 3],
    ["out", 1, 3]
  ],
  "output": ["s11dB", "s21dB"],
  "view": {
    "type": "line",
    "title": "Series R-L response",
    "metricPrefix": "giga"
  }
}
\`\`\``;
