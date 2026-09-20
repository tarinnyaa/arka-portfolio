// "The decision engine" (spec §7, [B]). Inputs Light · Activity · Time ·
// Study rules feed ARKA; output asks "Should we act?" and branches. Then
// interactive: controls for time, light so far, target and remaining minutes;
// the verdict flips live and shows which rule decided. Labelled Proposed.
import { ABOUT } from "@content/about";
import { proposedTag, sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { onEnter, preparePathDraw, reducedMotion } from "../lib/motion";

export function engineScene() {
  const C = ABOUT.engine;
  const W = 1000;
  const H = 380;
  const cx = 465;
  const cy = 190;
  const inputs = C.inputs.map((label, i) => ({ label, x: 90, y: 60 + i * 86 }));
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "engine-svg", role: "img", "aria-label": `Decision engine: ${C.inputs.join(", ")} feed ARKA, which asks "${C.question}" and branches to "${C.yes}" or "${C.no}".` });
  const paths: SVGPathElement[] = [];
  inputs.forEach((inp) => {
    const p = s("path", { d: `M ${inp.x + 70} ${inp.y} C ${cx - 200} ${inp.y}, ${cx - 200} ${cy}, ${cx - 72} ${cy}`, fill: "none", stroke: "var(--ink)", "stroke-width": 1.6, class: "engine-link" });
    paths.push(p);
    svg.appendChild(p);
    svg.appendChild(s("rect", { x: inp.x - 60, y: inp.y - 20, width: 130, height: 40, rx: 20, fill: "var(--card)", stroke: "var(--line)" }));
    svg.appendChild(s("text", { x: inp.x + 5, y: inp.y + 5, "text-anchor": "middle", class: "engine-text" }, inp.label));
  });
  // Centre aperture
  svg.appendChild(s("circle", { cx, cy, r: 70, fill: "var(--aperture-tint)", opacity: 0.25 }));
  svg.appendChild(s("circle", { cx, cy, r: 52, fill: "var(--card)", stroke: "var(--ink)", "stroke-width": 1.5 }));
  svg.appendChild(s("text", { x: cx, y: cy + 6, "text-anchor": "middle", class: "engine-centre" }, C.centre));
  // Question
  const qx = cx + 190;
  const pq = s("path", { d: `M ${cx + 52} ${cy} L ${qx - 90} ${cy}`, fill: "none", stroke: "var(--ink)", "stroke-width": 1.6 });
  paths.push(pq);
  svg.appendChild(pq);
  svg.appendChild(s("path", { d: `M ${qx} ${cy - 34} L ${qx + 90} ${cy} L ${qx} ${cy + 34} L ${qx - 90} ${cy} Z`, fill: "var(--card)", stroke: "var(--ink)", "stroke-width": 1.5 }));
  svg.appendChild(s("text", { x: qx, y: cy + 5, "text-anchor": "middle", class: "engine-text" }, C.question));
  // Branches
  const yesY = cy - 90;
  const noY = cy + 90;
  const pYes = s("path", { d: `M ${qx + 90} ${cy} C ${qx + 130} ${cy}, ${qx + 130} ${yesY}, ${qx + 160} ${yesY}`, fill: "none", stroke: "var(--sage)", "stroke-width": 2, class: "engine-branch engine-branch--yes" });
  const pNo = s("path", { d: `M ${qx + 90} ${cy} C ${qx + 130} ${cy}, ${qx + 130} ${noY}, ${qx + 160} ${noY}`, fill: "none", stroke: "var(--muted)", "stroke-width": 2, class: "engine-branch engine-branch--no" });
  paths.push(pYes, pNo);
  svg.append(pYes, pNo);
  const yesBox = s("g", { class: "engine-out engine-out--yes" }, s("rect", { x: qx + 160, y: yesY - 22, width: 170, height: 44, rx: 22, fill: "#E4F0E3", stroke: "var(--sage)" }), s("text", { x: qx + 245, y: yesY + 5, "text-anchor": "middle", class: "engine-text" }, C.yes));
  const noBox = s("g", { class: "engine-out engine-out--no" }, s("rect", { x: qx + 160, y: noY - 22, width: 170, height: 44, rx: 22, fill: "#F0EDE8", stroke: "var(--line)" }), s("text", { x: qx + 245, y: noY + 5, "text-anchor": "middle", class: "engine-text" }, C.no));
  svg.append(yesBox, noBox);

  // Interactive controls
  const time = range("eng-time", C.controls.time, 6, 20, 11.75, 0.25, (v) => fmtTime(v));
  const light = range("eng-light", C.controls.light, 0, 120, 9, 1, (v) => `${v} min`);
  const target = range("eng-target", C.controls.target, 30, 120, 60, 10, (v) => `${v} min`);
  const windowEnd = range("eng-window", "Window closes at", 12, 20, 14, 0.5, (v) => fmtTime(v));
  const verdict = h("p", { class: "engine-verdict", "aria-live": "polite" });
  const rule = h("p", { class: "engine-rule" });
  const remaining = h("p", { class: "muted small engine-remaining" });

  function evaluate() {
    const t = Number(time.input.value);
    const l = Number(light.input.value);
    const tg = Number(target.input.value);
    const we = Number(windowEnd.input.value);
    const remainMin = Math.max(0, Math.round((we - t) * 60));
    remaining.textContent = `${C.controls.remaining}: ${remainMin}`;
    let go = false;
    let why = "";
    if (l >= tg) why = C.rules.met;
    else if (t >= we) why = C.rules.closed;
    else if (t < 8.5) why = C.rules.early;
    else if (remainMin < tg - l) why = C.rules.short;
    else {
      go = true;
      why = C.rules.go;
    }
    verdict.textContent = go ? C.verdicts.nudge : C.verdicts.wait;
    verdict.className = `engine-verdict ${go ? "is-go" : "is-wait"}`;
    rule.textContent = why;
    yesBox.setAttribute("opacity", go ? "1" : "0.35");
    noBox.setAttribute("opacity", go ? "0.35" : "1");
    pYes.setAttribute("opacity", go ? "1" : "0.3");
    pNo.setAttribute("opacity", go ? "0.3" : "1");
  }
  [time, light, target, windowEnd].forEach((r) => r.input.addEventListener("input", evaluate));

  const el = h(
    "section",
    { class: "section engine-section" },
    h("div", { class: "aperture aperture--low" }),
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "engine-stage card" }, svg),
      h(
        "div",
        { class: "engine-interactive" },
        h("div", { class: "engine-controls" }, time.el, light.el, target.el, windowEnd.el, remaining),
        h("div", { class: "engine-result card" }, verdict, rule),
      ),
      h("div", { class: "engine-proposed" }, proposedTag(C.proposed), h("p", { class: "small muted" }, C.proposedBody)),
    ),
  );

  function mount() {
    evaluate();
    const draws = paths.map((p) => preparePathDraw(p));
    onEnter(el, () => {
      if (reducedMotion()) return draws.forEach((d) => d.set(1));
      draws.forEach((d, i) => {
        const t0 = performance.now() + i * 120;
        const step = (t: number) => {
          const p = Math.min(1, Math.max(0, (t - t0) / 500));
          d.set(1 - Math.pow(1 - p, 2));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  }
  return { el, mount };
}

function fmtTime(v: number) {
  const hh = Math.floor(v);
  const mm = Math.round((v - hh) * 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function range(id: string, label: string, min: number, max: number, value: number, step: number, fmt: (v: number) => string) {
  const out = h("output", { for: id, class: "range-out" }, fmt(value));
  const input = h("input", { type: "range", id, min: String(min), max: String(max), value: String(value), step: String(step), class: "range" }) as HTMLInputElement;
  input.addEventListener("input", () => {
    out.textContent = fmt(Number(input.value));
    input.setAttribute("aria-valuetext", fmt(Number(input.value)));
  });
  input.setAttribute("aria-valuetext", fmt(value));
  const el = h("div", { class: "range-row" }, h("label", { for: id }, label), input, out);
  return { el, input };
}
