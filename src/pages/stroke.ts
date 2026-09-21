import { ASSETS } from "@content/shared";
import { STROKE } from "@content/stroke";
import { evidence, resetEvidenceNumbering } from "../components/evidence";
import { phoneFrame } from "../components/frames";
import { pageHeader } from "../components/pageHeader";
import { caregiverScreen, strokeHome, type StrokeMode } from "../components/screens";
import { chartFrame, closingBand, configCard, designDecision, loopDiagram, rationaleDrawer, sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { playOnEnter, reducedMotion } from "../lib/motion";
import type { Page } from "../lib/router";

export default function stroke(): Page {
  resetEvidenceNumbering();
  const C = STROKE;

  const header = pageHeader({
    kind: "stroke",
    accent: "#0B6F75",
    illustration: ASSETS.illustrations.stroke,
    illustrationAlt: C.header.illustrationAlt,
    title: C.header.title,
    cohort: C.header.cohort,
    status: C.header.status,
    ribbonLabel: C.header.ribbonLabel,
    lede: C.header.lede,
    goals: C.goals,
  });

  const loop = h(
    "section",
    { class: "section", id: "loop" },
    h("div", { class: "wrap" }, sectionHead(C.loop.kicker, C.loop.heading, C.loop.body), loopDiagram(C.loop.nodes, { accent: "#0B6F75" })),
  );

  // Patient home is one task — with a completion toggle
  const homeSlot = h("div", { class: "phone-center" });
  let done = false;
  const renderHome = () => homeSlot.replaceChildren(phoneFrame(strokeHome({ done }), { scale: 0.62, label: done ? "Done. Morning light finished. Next: Rest." : "Good morning. Morning light, 30 minutes, START, Listen." }));
  renderHome();
  const doneBtn = h("button", { type: "button", class: "btn btn--ghost", "aria-pressed": "false", onclick: () => { done = !done; doneBtn.setAttribute("aria-pressed", String(done)); doneBtn.textContent = done ? C.home.reset : C.home.simulate; renderHome(); } }, C.home.simulate);
  const home = h(
    "section",
    { class: "section", id: "home" },
    h("div", { class: "wrap two-col" }, h("div", null, sectionHead(C.home.kicker, C.home.heading, C.home.body), doneBtn), homeSlot),
  );

  const modes = modesScene();

  // Two people, one participant
  const two = h(
    "section",
    { class: "section", id: "two" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.two.kicker, C.two.heading, C.two.body),
      h(
        "div",
        { class: "split-grid" },
        h("figure", null, phoneFrame(strokeHome({ mode: "motor", caregiver: false }), { scale: 0.5, label: "Patient side: one task, very large START." }), h("figcaption", null, C.two.patient.title)),
        h("figure", null, phoneFrame(caregiverScreen(), { scale: 0.5, label: "Caregiver side: today's checklist, week adherence 6 of 7, message research team." }), h("figcaption", null, C.two.caregiver.title)),
      ),
      h("p", { class: "closing-line", style: "margin-top:32px" }, C.two.closing),
    ),
  );

  const acto = actogram();
  const anchor = anchorChart();

  const config = h(
    "section",
    { class: "section", id: "config" },
    h("div", { class: "wrap decision-row" }, h("div", null, configCard(C.config), rationaleDrawer(C.rationale)), designDecision(C.decision)),
  );

  const el = h("div", { class: "page page--stroke", style: "--accent:var(--accent-stroke)" }, header, loop, home, modes.el, two, acto.el, anchor.el, config, closingBand("stroke", C.closing));
  return {
    title: C.title,
    el,
    mount: () => {
      modes.mount();
      acto.mount();
    },
  };
}

/** Accessibility modes (spec §12, [B]): Standard · Motor support ·
 * Communication support. Switching transforms the same screen. */
function modesScene() {
  const C = STROKE.modes;
  const slot = h("div", null);
  const desc = h("div", { class: "mode-desc", "aria-live": "polite" });
  const buttons = C.items.map((m, i) => h("button", { type: "button", "aria-pressed": String(i === 0), onclick: () => setMode(m.id as StrokeMode) }, m.label));
  const group = h("div", { class: "segmented", role: "group", "aria-label": C.label }, ...buttons);
  function setMode(mode: StrokeMode) {
    const m = C.items.find((x) => x.id === mode)!;
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(C.items[i].id === mode)));
    slot.replaceChildren(phoneFrame(strokeHome({ mode }), { scale: 0.62, label: m.describe }));
    desc.replaceChildren(h("p", null, m.describe), h("ul", { class: "mode-points" }, ...m.points.map((p) => h("li", null, p))));
  }
  const el = h(
    "section",
    { class: "section", id: "modes" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "mode-grid" }, slot, h("div", null, group, desc, h("p", { class: "cite", style: "margin-top:16px" }, "Informed by published recommendations for stroke survivors and people with aphasia.", evidence(...C.designRefs)))),
      h("p", { class: "closing-line", style: "margin-top:32px" }, C.closing),
    ),
  );
  return { el, mount: () => setMode("standard") };
}

/** Double-plotted actogram, 14 rows × 48 h. Rows draw on scroll. */
function actogram() {
  const C = STROKE.actogram;
  const rows = 14;
  const cols = 96; // 30-min cells over 48 h
  const W = 900;
  const rowH = 18;
  const L = 50;
  const H = rows * rowH + 60;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "acto-svg" });
  const cellW = (W - L - 10) / cols;
  // Deterministic pseudo-random
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  function dayProfile(day: number): number[] {
    // 48 half-hour cells for one day: light level 0..1, sleep = -1
    const post = day >= 7;
    const wake = post ? 7 + (rnd() - 0.5) * 0.4 : 5.5 + rnd() * 4.2;
    const bed = post ? 22.5 + (rnd() - 0.5) * 0.6 : 21 + rnd() * 3.5;
    const cells: number[] = [];
    for (let c = 0; c < 48; c++) {
      const hh = c / 2;
      let v: number;
      if (hh < wake || hh >= bed) v = -1;
      else if (post && hh >= wake && hh < wake + 0.6) v = 0.95;
      else v = post ? 0.35 + rnd() * 0.35 : 0.12 + rnd() * 0.25;
      // fragmented sleep pre: random wake bouts at night
      if (!post && v === -1 && rnd() < 0.12) v = 0.3;
      cells.push(v);
    }
    return cells;
  }
  const days = Array.from({ length: rows + 1 }, (_, d) => dayProfile(d));
  const rowEls: SVGGElement[] = [];
  for (let r = 0; r < rows; r++) {
    const g = s("g", { class: "acto-row", opacity: 0 });
    const cells = [...days[r], ...days[r + 1]];
    cells.forEach((v, c) => {
      const fill = v < 0 ? "#1F3A5F" : `rgba(232,168,37,${(0.15 + v * 0.85).toFixed(2)})`;
      g.appendChild(s("rect", { x: L + c * cellW, y: 30 + r * rowH, width: cellW, height: rowH - 2, fill }));
    });
    g.appendChild(s("text", { x: L - 8, y: 30 + r * rowH + 13, "text-anchor": "end", class: "axis-text" }, `D${r + 1}`));
    svg.appendChild(g);
    rowEls.push(g);
  }
  // divider
  const divY = 30 + 7 * rowH - 1;
  svg.appendChild(s("line", { x1: L, y1: divY, x2: W - 10, y2: divY, stroke: "var(--terracotta)", "stroke-width": 2 }));
  svg.appendChild(s("text", { x: W - 10, y: divY - 4, "text-anchor": "end", class: "axis-text", fill: "var(--terracotta)", "font-weight": 700 }, C.divider));
  [0, 6, 12, 18, 24, 30, 36, 42, 48].forEach((hh) =>
    svg.appendChild(s("text", { x: L + hh * 2 * cellW, y: 20, "text-anchor": hh === 0 ? "start" : hh === 48 ? "end" : "middle", class: "axis-text" }, `${hh % 24}:00`)),
  );
  svg.appendChild(s("text", { x: L, y: H - 10, class: "axis-text" }, "Dark band = sleep · brighter = more light"));
  const frame = chartFrame(C.chartTitle, C.summary, svg, { caption: C.caption });
  const el = h("section", { class: "section", id: "actogram" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), frame));
  function set(p: number) {
    rowEls.forEach((g, i) => g.setAttribute("opacity", p * rows >= i + 0.5 ? "1" : "0"));
  }
  function mount() {
    playOnEnter(set, {
      trigger: frame,
      durationMs: 2600,
      steps: [
        { label: "Before", p: 0.5 },
        { label: "After", p: 1 },
      ],
      controlLabel: C.stepperLabel,
      controlMount: frame,
    });
  }
  return { el, mount };
}

function anchorChart() {
  const C = STROKE.anchor;
  const W = 900;
  const H = 240;
  const L = 60;
  const wakes = [5.6, 8.9, 6.4, 9.7, 5.5, 7.9, 8.6, 7.3, 6.9, 7.1, 7.05, 6.95, 7.0, 7.02];
  const X = (d: number) => L + (d / 13) * (W - L - 30);
  const Y = (hh: number) => 20 + ((10 - hh) / 5) * (H - 60);
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}` });
  [5, 6, 7, 8, 9, 10].forEach((hh) => {
    svg.appendChild(s("line", { x1: L, y1: Y(hh), x2: W - 30, y2: Y(hh), stroke: hh === 7 ? "var(--accent-stroke)" : "var(--line)", "stroke-width": hh === 7 ? 2 : 1 }));
    svg.appendChild(s("text", { x: L - 8, y: Y(hh) + 4, "text-anchor": "end", class: "axis-text" }, `${String(hh).padStart(2, "0")}:00`));
  });
  svg.appendChild(s("text", { x: W - 30, y: Y(7) - 6, "text-anchor": "end", class: "axis-text", fill: "var(--accent-stroke)", "font-weight": 700 }, `target ${C.target}`));
  svg.appendChild(s("line", { x1: X(6.5), y1: 10, x2: X(6.5), y2: H - 30, stroke: "var(--terracotta)", "stroke-dasharray": "4 4" }));
  wakes.forEach((w, d) => {
    svg.appendChild(s("circle", { cx: X(d), cy: Y(w), r: 6, fill: d < 7 ? "var(--muted)" : "var(--accent-stroke)" }));
    svg.appendChild(s("text", { x: X(d), y: H - 12, "text-anchor": "middle", class: "axis-text" }, `D${d + 1}`));
  });
  const frame = chartFrame(C.chartTitle, C.summary, svg);
  const el = h("section", { class: "section", id: "anchor" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading), frame));
  return { el };
}

export { reducedMotion };
