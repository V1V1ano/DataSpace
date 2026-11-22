#!/usr/bin/env node
// Renders a p5.js sketch to SVG without a browser.
// The sketch runs unchanged inside a sandbox that provides a minimal p5 API
// (only the functions the sketches in this folder use). Each drawing call
// becomes an SVG element.
//
// Usage:
//   node scripts/export_p5js_svg.js [sketch.js] [output.svg]
// Defaults:
//   scripts/p5js_Planettemperatures.js -> output/p5js_Planettemperatures.svg

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sketchPath = path.resolve(
  process.argv[2] || path.join(__dirname, "p5js_rocky_temperatures.js")
);
const outPath = path.resolve(
  process.argv[3] ||
    path.join(__dirname, "..", "output", path.basename(sketchPath, ".js") + ".svg")
);

// ---- color handling -------------------------------------------------------
function toColor(args) {
  if (args.length === 1 && typeof args[0] === "string") return args[0];
  if (args.length === 1 || args.length === 2) {
    const g = args[0];
    const a = args.length === 2 ? args[1] / 255 : 1;
    return a === 1 ? `rgb(${g},${g},${g})` : `rgba(${g},${g},${g},${a})`;
  }
  const [r, g, b, a = 255] = args;
  return a === 255 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a / 255})`;
}

const r = (n) => Math.round(n * 1000) / 1000;

// ---- p5 shim --------------------------------------------------------------
const elements = [];
const state = { fill: "rgb(255,255,255)", stroke: "rgb(0,0,0)", strokeWeight: 1 };
let bg = null;

function styleAttrs() {
  const s = [`fill="${state.fill ?? "none"}"`];
  if (state.stroke) s.push(`stroke="${state.stroke}"`, `stroke-width="${state.strokeWeight}"`);
  else s.push(`stroke="none"`);
  return s.join(" ");
}

const p5 = {
  width: 100,
  height: 100,
  PI: Math.PI,
  TWO_PI: Math.PI * 2,
  createCanvas(w, h) {
    p5.width = w;
    p5.height = h;
  },
  background(...a) {
    bg = toColor(a);
    elements.length = 0;
  },
  fill(...a) { state.fill = toColor(a); },
  noFill() { state.fill = null; },
  stroke(...a) { state.stroke = toColor(a); },
  noStroke() { state.stroke = null; },
  strokeWeight(w) { state.strokeWeight = w; },
  rect(x, y, w, h = w) {
    elements.push(`<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" ${styleAttrs()}/>`);
  },
  square(x, y, s) { p5.rect(x, y, s, s); },
  circle(x, y, d) {
    elements.push(`<circle cx="${r(x)}" cy="${r(y)}" r="${r(d / 2)}" ${styleAttrs()}/>`);
  },
  ellipse(x, y, w, h = w) {
    elements.push(`<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(w / 2)}" ry="${r(h / 2)}" ${styleAttrs()}/>`);
  },
  line(x1, y1, x2, y2) {
    elements.push(`<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" stroke="${state.stroke ?? "none"}" stroke-width="${state.strokeWeight}"/>`);
  },
  map(v, a1, b1, a2, b2) { return a2 + ((v - a1) / (b1 - a1)) * (b2 - a2); },
  min(...a) { return Math.min(...(Array.isArray(a[0]) ? a[0] : a)); },
  max(...a) { return Math.max(...(Array.isArray(a[0]) ? a[0] : a)); },
  noLoop() {},
  loop() {},
};

// Sketch globals like `width` must read live values, so expose them as getters.
const sandbox = { console, Math };
for (const [k, v] of Object.entries(p5)) {
  if (k === "width" || k === "height") {
    Object.defineProperty(sandbox, k, { get: () => p5[k], enumerable: true });
  } else {
    sandbox[k] = v;
  }
}
vm.createContext(sandbox);

// Run the sketch (top-level code, then setup() and a single draw()).
const code = fs.readFileSync(sketchPath, "utf8");
vm.runInContext(code + "\n;this.__setup = typeof setup === 'function' ? setup : null; this.__draw = typeof draw === 'function' ? draw : null;", sandbox, { filename: sketchPath });
if (sandbox.__setup) sandbox.__setup();
if (sandbox.__draw) sandbox.__draw();

// ---- write SVG -------------------------------------------------------------
const { width: W, height: H } = p5;
const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  bg ? `<rect width="${W}" height="${H}" fill="${bg}"/>` : null,
  ...elements,
  `</svg>`,
].filter(Boolean).join("\n");

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, svg + "\n");
console.log(`Wrote ${outPath} (${W}x${H}, ${elements.length} shapes)`);
