// "From light to something you can act on." One full-viewport pinned
// narrative with a single central visual system and four discrete states:
//   01 SENSE       the real ActLumus, five readings appearing
//   02 SEE         the readings travel into a blank chart and become a day
//   03 UNDERSTAND  the amber regions detach, sum, and become 78 / 120
//   04 ACT         the gauge stroke flows into the real ARKA pot; the plant
//                  grows to its true 65 % state
// Every transition is exit → transform → enter. Two conceptual states never
// compete. Only transform and opacity animate.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img } from "../components/assets";
import { createPlant, plantGeometry } from "../components/plant";
import { arrowIcon } from "../components/icons";
import { clamp, fmt, h, lerp, s } from "../lib/dom";
import { phases, pinnedSequence, seg } from "../lib/motion";
import { href } from "../lib/router";

const CH_W = 900;
const CH_H = 400;
const CH_L = 54;
const CH_R = 24;
const CH_T = 36;
const CH_B = 44;
const X = (hh: number) => CH_L + ((hh - 6) / 16) * (CH_W - CH_L - CH_R);
const Y = (lux: number) => CH_T + (1 - Math.log10(Math.max(1, lux)) / 5) * (CH_H - CH_T - CH_B);

export function meaningScene() {
  const C = ABOUT.meaning;
  const section = h(
    "section",
    { class: "section section--flush mm-section", id: "meaning" },
    h(
      "div",
      { class: "wrap mm-header" },
      h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body)),
    ),
  );

  // Rail (upper right, inside the sticky viewport)
  const railItems = C.rail.map((r, i) => h("li", null, h("span", { class: "mm-rail-n" }, String(i + 1).padStart(2, "0")), h("span", null, r)));
  const rail = h("ol", { class: "mm-rail", "aria-label": "Stage" }, ...railItems);
  const setRail = (i: number, t: number) => railItems.forEach((li, k) => li.classList.toggle("is-on", k === (t > 0.6 ? i + 1 : i)));

  const seq = pinnedSequence({
    section,
    states: 4,
    restVh: 100,
    transVh: 45,
    stepLabels: C.rail,
    stepDescribe: (i) => C.captions[i],
    controlLabel: "Step through: sense, see, understand, act",
    rail: { el: rail, set: setRail },
    stackCaption: (i) => h("p", { class: "mono-label" }, `${String(i + 1).padStart(2, "0")} ${C.rail[i]}`),
    createStage,
  });

  function createStage() {
    // ── L1: sense
    const device = h("div", { class: "mm-device" }, img(ASSETS.actlumus, "The ActLumus sensor", { h: 340, w: "auto" }));
    const readings = C.readings.map((r) =>
      h(
        "div",
        { class: `mm-reading${r.lux >= C.threshold ? " is-outdoor" : ""}` },
        h("span", { class: "mm-reading-t" }, r.t),
        h("span", { class: "mm-reading-v" }, `${fmt(r.lux)} lux`),
      ),
    );
    const readingsCol = h("div", { class: "mm-readings" }, ...readings);
    const l1 = h("div", { class: "mm-layer mm-l1" }, device, readingsCol);

    // ── L2: chart
    const chart = buildChart(C);
    const l2 = h("div", { class: "mm-layer mm-l2" }, chart.svg);

    // ── L3: blocks (sum)
    const blocks = C.periods.map((p, i) =>
      h(
        "div",
        { class: "mm-block", style: `--w:${p.minutes * 5}px` },
        h("span", { class: "mm-block-bar" }),
        h("span", { class: "mm-block-min" }, `${p.minutes} min`),
        h("span", { class: "mm-block-lab" }, ["school", "lunch", "play"][i]),
      ),
    );
    const blocksRow = h("div", { class: "mm-blocks" }, ...blocks);
    const l3 = h("div", { class: "mm-layer mm-l3" }, blocksRow);

    // ── Shared metric (78 / minutes outdoors / gauge)
    const big = h("p", { class: "display-num mm-big" }, String(C.minutes));
    const bigLabel = h("p", { class: "mm-big-label" }, C.minutesLabel);
    const ratio = h("p", { class: "mm-ratio mono-label" }, `${C.minutes} / ${C.target} min`);
    const gauge = buildGauge(C.minutes / C.target);
    const metric = h("div", { class: "mm-metric" }, big, bigLabel, ratio, h("div", { class: "mm-gauge" }, gauge.svg));

    // ── L4: act
    const plant = createPlant({ copy: false, still: true, label: "The ARKA plant at 78 of 120 minutes: stem and three leaves" });
    const today = h("p", { class: "mono-label mm-today" }, C.today);
    const metricSlot = h("div", { class: "mm-metric-slot", "aria-hidden": "true" });
    const bloom = h("p", { class: "mm-bloom" }, C.toBloom);
    const support = h("p", { class: "mm-support" }, C.captions[3]);
    const link = h("a", { href: href("/myopia"), "data-link": true, class: "mm-link" }, C.link, arrowIcon(14));
    const plantWrap = h("div", { class: "mm-plant" }, plant.el);
    const l4 = h("div", { class: "mm-layer mm-l4" }, today, metricSlot, plantWrap, bloom, support, link);
    // Amber path overlay (gauge → soil)
    const overlay = s("svg", { class: "mm-overlay", "aria-hidden": "true" });
    const flow = s("path", { fill: "none", stroke: "#E8A825", "stroke-width": 2.5, "stroke-linecap": "round" });
    overlay.appendChild(flow);

    const caption = h("p", { class: "mm-caption", "aria-live": "polite" });
    const canvas = h("div", { class: "mm-canvas" }, l1, l2, l3, metric, l4, overlay);
    const el = h("div", { class: "seq-stage mm-stage" }, canvas, caption);

    // Geometry measured at layout time (pixels within canvas)
    let geo = { readingTargets: [] as { dx: number; dy: number }[], blockStarts: [] as { dx: number; dy: number }[], metricSlotDelta: { dx: 0, dy: 0 }, flowLen: 0 };
    function layout() {
      const cr = canvas.getBoundingClientRect();
      if (cr.width === 0) return;
      const sr = chart.svg.getBoundingClientRect();
      const sx = sr.width / CH_W;
      const sy = sr.height / CH_H;
      // Readings → their chart points
      geo.readingTargets = readings.map((rd, i) => {
        const rr = rd.getBoundingClientRect();
        const pt = chart.readingPoints[i];
        const tx = sr.left + pt.x * sx;
        const ty = sr.top + pt.y * sy;
        return { dx: tx - (rr.left + rr.width / 2), dy: ty - (rr.top + rr.height / 2) };
      });
      // Blocks: start at the amber regions' centres
      geo.blockStarts = blocks.map((b, i) => {
        const br = b.getBoundingClientRect();
        const c = chart.regionCentres[i];
        const tx = sr.left + c.x * sx;
        const ty = sr.top + c.y * sy;
        return { dx: tx - (br.left + br.width / 2), dy: ty - (br.top + br.height / 2) };
      });
      // Metric → its slot in the final composition
      // Measured with the metric's own transform cleared so the delta is stable.
      const prevTf = metric.style.transform;
      metric.style.transform = "none";
      const mr = metric.getBoundingClientRect();
      metric.style.transform = prevTf;
      const slot = metricSlot.getBoundingClientRect();
      geo.metricSlotDelta = { dx: slot.left + slot.width / 2 - (mr.left + mr.width / 2), dy: slot.top - mr.top };
      // Flow path: from the metric slot bottom to the soil of the pot
      const pr = plant.svg.getBoundingClientRect();
      const g = plantGeometry();
      const soilY = pr.top + ((g.PAD_TOP + g.SOIL_Y) / (g.VB_H + g.PAD_TOP)) * pr.height;
      const x = pr.left + pr.width / 2 - cr.left;
      const y0 = slot.bottom - cr.top - 6;
      const y1 = soilY - cr.top;
      overlay.setAttribute("viewBox", `0 0 ${cr.width} ${cr.height}`);
      flow.setAttribute("d", `M ${x} ${y0} C ${x - 24} ${lerp(y0, y1, 0.35)}, ${x + 18} ${lerp(y0, y1, 0.7)}, ${x} ${y1}`);
      geo.flowLen = flow.getTotalLength();
      flow.style.strokeDasharray = `${geo.flowLen}`;
    }
    const ro = new ResizeObserver(() => {
      layout();
      apply(last.i, last.t, last.r);
    });
    ro.observe(canvas);

    const op = (e: HTMLElement | SVGElement, v: number) => (e.style.opacity = String(clamp(v, 0, 1)));
    const tf = (e: HTMLElement | SVGElement, v: string) => (e.style.transform = v);

    let last = { i: 0, t: 0, r: 0 };
    function apply(i: number, t: number, r: number) {
      last = { i, t, r };
      if (!geo.readingTargets.length) layout();
      const ph = phases(t);

      // ── Defaults: everything hidden; each state turns on what it owns.
      op(device, 0);
      readings.forEach((rd) => {
        op(rd, 0);
        tf(rd, "none");
      });
      chart.setVisible(0, 0, 0);
      chart.resetDots();
      blocks.forEach((b) => {
        op(b, 0);
        tf(b, "none");
      });
      op(metric, 0);
      tf(metric, "none");
      gauge.set(0);
      op(today, 0);
      op(plantWrap, 0);
      op(bloom, 0);
      op(support, 0);
      op(link, 0);
      link.tabIndex = -1;
      flow.style.strokeDashoffset = `${geo.flowLen}`;
      op(flow, 0);

      if (i === 0) {
        // SENSE. Readings appear across the first 60 % of the rest interval.
        op(device, 1 - ph.out);
        tf(device, `translateX(${-40 * ph.out}px)`);
        readings.forEach((rd, k) => {
          const appear = seg(r, 0.05 + k * 0.12, 0.2 + k * 0.12);
          const tgt = geo.readingTargets[k] ?? { dx: 0, dy: 0 };
          // travel: staggered within mid
          const tr = seg(ph.mid, k * 0.1, 0.6 + k * 0.1);
          const sc = lerp(1, 0.12, tr);
          op(rd, Math.min(appear, 1 - seg(tr, 0.85, 1)));
          tf(rd, `translate(${tgt.dx * tr}px, ${tgt.dy * tr}px) scale(${sc})`);
          if (t > 0) chart.dotOpacity(k, seg(tr, 0.8, 1) * (1 - ph.in));
        });
        // Blank chart enters as the readings travel; trace draws on entry.
        chart.setVisible(seg(ph.mid, 0.1, 0.6), ph.in, seg(ph.in, 0.4, 1));
        setCaption(t < 0.5 ? 0 : 1, t < 0.5 ? 1 - seg(t, 0.15, 0.4) : seg(t, 0.75, 1));
      } else if (i === 1) {
        // SEE. Full chart at rest. On transition: chart fades to 15 %, amber
        // regions stay, detach into blocks, sum; chart gone before 78 grows.
        const dim = lerp(1, 0.15, ph.out);
        const gone = 1 - seg(t, 0.45, 0.6);
        chart.setVisible(dim * gone, dim * gone, (1 - seg(t, 0.1, 0.42)) * gone);
        chart.setRegions((1 - seg(t, 0.3, 0.55)) * gone);
        blocks.forEach((b, k) => {
          const st = geo.blockStarts[k] ?? { dx: 0, dy: 0 };
          const travel = seg(t, 0.3, 0.6);
          const gather = seg(t, 0.62, 0.78);
          // gather: slide toward the middle block
          const gx = (1 - k) * 0.5; // -0.5, 0, 0.5 of block spacing sign
          const bw = b.getBoundingClientRect().width || 120;
          op(b, seg(t, 0.28, 0.4) * (1 - seg(t, 0.82, 0.9)));
          tf(b, `translate(${st.dx * (1 - travel) + gx * (bw + 24) * gather}px, ${st.dy * (1 - travel)}px)`);
        });
        op(metric, seg(t, 0.86, 1));
        tf(metric, `scale(${lerp(0.85, 1, seg(t, 0.86, 1))})`);
        gauge.set(seg(t, 0.9, 1) * (C.minutes / C.target));
        setCaption(t < 0.5 ? 1 : 2, t < 0.5 ? 1 - seg(t, 0.1, 0.35) : seg(t, 0.85, 1));
      } else if (i === 2) {
        // UNDERSTAND. Metric at rest. Transition: gauge contracts; the amber
        // stroke becomes a path to the soil; the plant grows.
        op(metric, 1);
        const d = geo.metricSlotDelta;
        const mv = ph.out;
        tf(metric, `translate(${d.dx * mv}px, ${d.dy * mv}px) scale(${lerp(1, 0.6, mv)})`);
        gauge.set((C.minutes / C.target) * (1 - seg(t, 0.15, 0.4)));
        gauge.contract(seg(t, 0.15, 0.4));
        op(today, seg(t, 0.3, 0.5));
        op(plantWrap, seg(t, 0.25, 0.45));
        plant.set(0.65 * seg(t, 0.55, 1));
        flow.style.strokeDashoffset = `${geo.flowLen * (1 - seg(t, 0.32, 0.62))}`;
        op(flow, seg(t, 0.3, 0.4) * (1 - seg(t, 0.8, 1)));
        op(bloom, seg(t, 0.85, 1));
        setCaption(t < 0.5 ? 2 : 3, t < 0.5 ? 1 - seg(t, 0.1, 0.35) : 0);
        op(support, seg(t, 0.88, 1));
      } else {
        // ACT. Final composition; the metric rests in its slot.
        const d = geo.metricSlotDelta;
        op(metric, 1);
        tf(metric, `translate(${d.dx}px, ${d.dy}px) scale(0.6)`);
        gauge.set(0);
        gauge.contract(1);
        op(today, 1);
        op(plantWrap, 1);
        plant.set(0.65);
        op(bloom, 1);
        op(support, 1);
        op(link, seg(r, 0.05, 0.35));
        link.tabIndex = 0;
        setCaption(3, 0);
      }
    }

    function setCaption(idx: number, o: number) {
      if (caption.textContent !== C.captions[idx]) caption.textContent = idx === 3 ? "" : C.captions[idx];
      op(caption, idx === 3 ? 0 : o);
    }

    return { el, apply };
  }

  return { el: section, mount: seq.mount };
}

// ─────────────────────────── chart ───────────────────────────
function buildChart(C: typeof ABOUT.meaning) {
  const svg = s("svg", { class: "mm-chart", viewBox: `0 0 ${CH_W} ${CH_H}`, role: "img", "aria-label": C.chartAlt });
  const axes = s("g", { class: "mm-axes" });
  // x ticks 06:00..22:00 every 4 h
  for (let hh = 6; hh <= 22; hh += 4) {
    axes.appendChild(s("line", { x1: X(hh), y1: CH_H - CH_B, x2: X(hh), y2: CH_H - CH_B + 6, stroke: "#B8B1A6" }));
    axes.appendChild(s("text", { x: X(hh), y: CH_H - 16, "text-anchor": "middle", class: "mm-axis" }, `${String(hh).padStart(2, "0")}:00`));
  }
  axes.appendChild(s("line", { x1: CH_L, y1: CH_H - CH_B, x2: CH_W - CH_R, y2: CH_H - CH_B, stroke: "#B8B1A6" }));
  [10, 100, 1000, 100000].forEach((v) => axes.appendChild(s("text", { x: CH_L - 8, y: Y(v) + 4, "text-anchor": "end", class: "mm-axis" }, v >= 1000 ? `${v / 1000}k` : String(v))));
  axes.appendChild(s("text", { x: CH_L - 8, y: CH_T - 14, "text-anchor": "end", class: "mm-axis" }, "lux"));
  // threshold
  const thY = Y(C.threshold);
  axes.appendChild(s("line", { x1: CH_L, y1: thY, x2: CH_W - CH_R, y2: thY, stroke: "#C48A1A", "stroke-width": 1.2, "stroke-dasharray": "5 5" }));
  axes.appendChild(s("text", { x: CH_W - CH_R, y: thY - 8, "text-anchor": "end", class: "mm-axis mm-axis--amber" }, C.thresholdLabel));
  svg.appendChild(axes);

  // Synthetic day trace, 5 minute resolution
  const pts: [number, number][] = [];
  for (let m = 6 * 60; m <= 22 * 60; m += 1) {
    const hh = m / 60;
    let lux = 40 + 60 * Math.sin(((hh - 6) / 16) * Math.PI); // indoor baseline 40..100
    if (hh < 8.04) lux = 12 + 3 * (hh - 6); // dim indoors at home: 12..18 lux
    else if (hh < 8.06) lux = 421; // at the door
    if (hh >= 8.4 && hh < 15) lux = 250 + 120 * Math.sin(hh * 2.3); // classroom
    if (hh > 18.5) lux = 30 - (hh - 18.5) * 6;
    for (const p of C.periods) {
      if (hh >= p.from && hh <= p.to) {
        const u = (hh - p.from) / (p.to - p.from);
        lux = 10000 * (1.2 + 3.2 * Math.sin(u * Math.PI) + 0.4 * Math.sin(u * 17));
      }
    }
    pts.push([hh, Math.max(1, lux)]);
  }
  const d = pts.map(([hh, l], i) => `${i ? "L" : "M"} ${X(hh).toFixed(1)} ${Y(l).toFixed(1)}`).join(" ");
  // Amber regions above threshold
  const regions = s("g", { class: "mm-regions" });
  const regionCentres: { x: number; y: number }[] = [];
  const annos = s("g", { class: "mm-annos" });
  for (const p of C.periods) {
    const inside = pts.filter(([hh]) => hh >= p.from - 0.05 && hh <= p.to + 0.05);
    const poly = inside.map(([hh, l]) => `${X(hh).toFixed(1)},${Math.min(thY, Y(l)).toFixed(1)}`).join(" ");
    const x0 = X(inside[0][0]);
    const x1 = X(inside[inside.length - 1][0]);
    regions.appendChild(s("polygon", { points: `${x0},${thY} ${poly} ${x1},${thY}`, fill: "#F3C766", opacity: 0.55 }));
    const top = Math.min(...inside.map(([, l]) => Y(l)));
    regionCentres.push({ x: (x0 + x1) / 2, y: (top + thY) / 2 });
    annos.appendChild(s("text", { x: (x0 + x1) / 2, y: top - 12, "text-anchor": "middle", class: "mm-anno" }, p.label));
  }
  svg.appendChild(regions);
  const trace = s("path", { d, fill: "none", stroke: "#1a1a1a", "stroke-width": 1.8, "stroke-linejoin": "round", class: "mm-trace" });
  svg.appendChild(trace);
  svg.appendChild(annos);
  // Points where the five readings land (08:01..08:05)
  const readingPoints = C.readings.map((r) => {
    const [hh, mm] = r.t.split(":").map(Number);
    const x = hh + mm / 60;
    return { x: X(x), y: Y(r.lux) };
  });
  const dots = readingPoints.map((p) => s("circle", { cx: p.x, cy: p.y, r: 4, fill: "#1a1a1a", opacity: 0 }));
  svg.append(...dots);

  let traceLen = 0;
  const ensureLen = () => {
    if (!traceLen) {
      traceLen = trace.getTotalLength();
      trace.style.strokeDasharray = `${traceLen}`;
    }
  };
  return {
    svg,
    readingPoints,
    regionCentres,
    /** axes opacity, trace draw, regions+annotations opacity */
    setVisible(axesO: number, draw: number, detail: number) {
      ensureLen();
      axes.style.opacity = String(axesO);
      trace.style.opacity = String(axesO > 0 ? 1 : 0);
      trace.style.strokeDashoffset = `${traceLen * (1 - clamp(draw, 0, 1))}`;
      regions.style.opacity = String(detail);
      annos.style.opacity = String(detail);
    },
    setRegions(o: number) {
      regions.style.opacity = String(o);
    },
    dotOpacity(k: number, o: number) {
      dots[k].setAttribute("opacity", String(clamp(o, 0, 1)));
    },
    resetDots() {
      dots.forEach((d) => d.setAttribute("opacity", "0"));
    },
  };
}

// ─────────────────────────── gauge ───────────────────────────
function buildGauge(fraction: number) {
  const W = 260;
  const H = 140;
  const cx = 130;
  const cy = 130;
  const r = 110;
  const arc = (from: number, to: number) => {
    const a0 = Math.PI - from * Math.PI;
    const a1 = Math.PI - to * Math.PI;
    return `M ${cx + r * Math.cos(a0)} ${cy - r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a1)} ${cy - r * Math.sin(a1)}`;
  };
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "mm-gauge-svg", "aria-hidden": "true" });
  svg.appendChild(s("path", { d: arc(0, 1), fill: "none", stroke: "#E5E0DA", "stroke-width": 3 }));
  const fill = s("path", { d: arc(0, 1), fill: "none", stroke: "#E8A825", "stroke-width": 3, "stroke-linecap": "round" });
  svg.appendChild(fill);
  const g = s("g", null);
  let len = 0;
  const ensure = () => {
    if (!len) {
      len = fill.getTotalLength();
      fill.style.strokeDasharray = `${len}`;
    }
  };
  return {
    svg,
    set(f: number) {
      ensure();
      fill.style.strokeDashoffset = `${len * (1 - clamp(f, 0, 1))}`;
    },
    contract(c: number) {
      svg.style.opacity = String(1 - c);
      svg.style.transform = `scale(${lerp(1, 0.4, c)})`;
    },
    fraction,
    g,
  };
}
