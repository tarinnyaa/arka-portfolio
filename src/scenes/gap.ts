// "The gap": light health advice should not end at advice.
// A pinned three stage editorial scene. Each stage begins as a muted
// limitation and morphs into ARKA's answer. When all three have turned,
// one amber path connects measure → personalise → deliver and curves back
// underneath. Then THE LOOP CLOSES. Lightweight SVG, generous negative space.
import { ABOUT } from "@content/about";
import { evidence } from "../components/evidence";
import { clamp, h, lerp, s } from "../lib/dom";
import { phases, pinnedSequence, seg } from "../lib/motion";

const W = 1000;
const H = 360;
const COLS = [170, 500, 830];
const AMBER = "#C48A1A";
const AMBER_BRIGHT = "#E8A825";
const GREY = "#B8B1A6";
const INK = "#1a1a1a";

export function gapScene() {
  const C = ABOUT.gap;
  const section = h(
    "section",
    { class: "section section--flush gp-section", id: "gap" },
    h(
      "div",
      { class: "wrap" },
      h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body, " ", evidence(C.deliverRef))),
    ),
  );

  const labels = ["Where interventions break down", ...C.stages.map((st) => st.title), C.loop.kicker];
  const seq = pinnedSequence({
    section,
    states: 5,
    restVh: 70,
    transVh: 45,
    stepLabels: labels,
    stepDescribe: (i) => (i === 0 ? "The three limitations" : i < 4 ? `${C.stages[i - 1].title}: ${C.stages[i - 1].after}` : C.loop.heading),
    controlLabel: "Step through the gap",
    stackCaption: (i) => (i === 0 || i === 4 ? null : h("p", { class: "mono-label" }, `${C.stages[i - 1].n} ${C.stages[i - 1].title}`)),
    createStage,
  });

  function createStage() {
    const svg = s("svg", { class: "gp-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Measure, personalise and deliver: each limitation becomes ARKA's answer, then one loop connects them." });

    // Column titles above the drawing; before/after labels beneath it. Both
    // are normal-flow rows so nothing can collide with the SVG.
    const titles = h("div", { class: "gp-titles" }, ...C.stages.map((st) => h("p", { class: "gp-n mono-label" }, `${st.n} ${st.title}`)));
    const cols = C.stages.map((st) =>
      h(
        "div",
        { class: "gp-col" },
        h("p", { class: "gp-before" }, st.before),
        h("p", { class: "gp-before-sub" }, st.beforeSub),
        h("p", { class: "gp-after" }, st.after),
        h("p", { class: "gp-after-sub" }, st.afterSub),
      ),
    );
    const labelsRow = h("div", { class: "gp-labels" }, ...cols);

    // ── 01 Measure: diary → trace
    const m = s("g", { transform: `translate(${COLS[0]} 150)` });
    const diary = s("g", { class: "gp-diary" });
    diary.appendChild(s("rect", { x: -46, y: -56, width: 92, height: 112, rx: 8, fill: "none", stroke: GREY, "stroke-width": 1.5 }));
    diary.appendChild(s("line", { x1: -46, y1: -30, x2: 46, y2: -30, stroke: GREY, "stroke-width": 1.5 }));
    [-12, 4, 20, 36].forEach((y) => diary.appendChild(s("line", { x1: -30, y1: y, x2: 30 - (y === 36 ? 24 : 0), y2: y, stroke: GREY, "stroke-width": 1.5, "stroke-linecap": "round" })));
    diary.appendChild(s("text", { x: 0, y: -40, "text-anchor": "middle", class: "gp-mono", fill: GREY }, "?"));
    m.appendChild(diary);
    const trace = s("g", { class: "gp-trace" });
    const tracePts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = -110 + i * 3.7;
      const base = i < 22 ? 30 : i < 44 ? -34 : -26;
      const y = base + Math.sin(i * 1.7) * 4 + (i >= 22 && i < 44 ? Math.sin(i * 0.7) * 6 : 0);
      tracePts.push(`${i ? "L" : "M"} ${x} ${y}`);
    }
    const tracePath = s("path", { d: tracePts.join(" "), fill: "none", stroke: AMBER_BRIGHT, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" });
    trace.appendChild(tracePath);
    C.stages[0].readings?.forEach((r, i) => {
      trace.appendChild(s("text", { x: -150 + i * 110, y: 66, class: "gp-mono", fill: INK, opacity: 0.6 }, r.t));
      trace.appendChild(s("text", { x: -150 + i * 110, y: 82, class: "gp-mono gp-mono--strong", fill: i ? AMBER : INK }, `${r.lux} lux`));
    });
    m.appendChild(trace);
    svg.appendChild(m);

    // ── 02 Personalise: one fixed window → three moving windows
    const p = s("g", { transform: `translate(${COLS[1]} 150)` });
    const fixed = s("g", { class: "gp-fixed" });
    fixed.appendChild(s("line", { x1: -120, y1: 0, x2: 120, y2: 0, stroke: GREY, "stroke-width": 1.5 }));
    fixed.appendChild(s("rect", { x: -40, y: -9, width: 60, height: 18, rx: 4, fill: GREY, opacity: 0.6 }));
    fixed.appendChild(s("text", { x: -10, y: -20, "text-anchor": "middle", class: "gp-mono", fill: GREY }, "TARGET"));
    fixed.appendChild(s("text", { x: -120, y: 22, class: "gp-mono", fill: GREY }, "06:00"));
    fixed.appendChild(s("text", { x: 120, y: 22, "text-anchor": "end", class: "gp-mono", fill: GREY }, "12:00"));
    p.appendChild(fixed);
    const rows = s("g", { class: "gp-rows" });
    const rowWins: SVGRectElement[] = [];
    const rowDots: SVGCircleElement[] = [];
    const wakeX = [-100, -40, 20];
    C.stages[1].wakes?.forEach((w, i) => {
      const y = -44 + i * 44;
      rows.appendChild(s("line", { x1: -120, y1: y, x2: 120, y2: y, stroke: "#E5E0DA", "stroke-width": 1.5 }));
      const dot = s("circle", { cx: wakeX[i], cy: y, r: 4, fill: INK });
      rowDots.push(dot);
      rows.appendChild(dot);
      const win = s("rect", { x: wakeX[i] + 10, y: y - 8, width: 60, height: 16, rx: 4, fill: AMBER_BRIGHT, opacity: 0.85 });
      rowWins.push(win);
      rows.appendChild(win);
      rows.appendChild(s("text", { x: -120, y: y - 10, class: "gp-mono", fill: INK, opacity: 0.6 }, w));
    });
    p.appendChild(rows);
    svg.appendChild(p);

    // ── 03 Deliver: sparse timeline → intervention point + notification
    const d = s("g", { transform: `translate(${COLS[2]} 150)` });
    const tl = s("g", null);
    tl.appendChild(s("line", { x1: -120, y1: 0, x2: 120, y2: 0, stroke: GREY, "stroke-width": 1.5 }));
    tl.appendChild(s("circle", { cx: -120, cy: 0, r: 5, fill: GREY }));
    tl.appendChild(s("circle", { cx: 120, cy: 0, r: 5, fill: GREY }));
    tl.appendChild(s("text", { x: -120, y: 24, "text-anchor": "middle", class: "gp-mono", fill: INK, opacity: 0.6 }, C.stages[2].enrolment?.toUpperCase() ?? ""));
    tl.appendChild(s("text", { x: 120, y: 24, "text-anchor": "middle", class: "gp-mono", fill: INK, opacity: 0.6 }, C.stages[2].followUp?.toUpperCase() ?? ""));
    const nothing = s("line", { x1: -60, y1: -16, x2: 60, y2: -16, stroke: GREY, "stroke-width": 1, "stroke-dasharray": "2 4" });
    tl.appendChild(nothing);
    d.appendChild(tl);
    const point = s("g", { class: "gp-point" });
    point.appendChild(s("circle", { cx: -22, cy: 0, r: 6, fill: AMBER_BRIGHT }));
    point.appendChild(s("line", { x1: -22, y1: -8, x2: -22, y2: -34, stroke: AMBER_BRIGHT, "stroke-width": 1.5 }));
    d.appendChild(point);
    svg.appendChild(d);
    const notif = h(
      "div",
      { class: "gp-notif", style: `--x:${(COLS[2] / W) * 100}%` },
      h("span", { class: "gp-notif-app" }, "ARKA"),
      h("span", { class: "gp-notif-title" }, C.stages[2].notification?.title ?? ""),
      h("span", { class: "gp-notif-body" }, C.stages[2].notification?.body ?? ""),
    );

    // ── Loop path
    const loop = s("path", {
      class: "gp-loop",
      fill: "none",
      stroke: AMBER,
      "stroke-width": 2,
      "stroke-linecap": "round",
      d: `M ${COLS[0] + 130} 150 L ${COLS[1] - 130} 150 M ${COLS[1] + 130} 150 L ${COLS[2] - 130} 150 M ${COLS[2] + 20} 250 C ${COLS[2] + 20} 320, ${COLS[0] - 20} 320, ${COLS[0] - 20} 250`,
    });
    const loopHead = s("path", { d: `M ${COLS[0] - 30} 262 L ${COLS[0] - 20} 250 L ${COLS[0] - 10} 262`, fill: "none", stroke: AMBER, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const loopLabel = s("text", { x: W / 2, y: 340, "text-anchor": "middle", class: "gp-mono", fill: AMBER }, "feedback returns");
    svg.append(loop, loopHead, loopLabel);

    const loopBlock = h(
      "div",
      { class: "gp-loop-block" },
      h("span", { class: "kicker" }, C.loop.kicker),
      h("h3", null, C.loop.heading),
      h("p", { class: "lede" }, C.loop.body),
    );
    const eyebrow = h("p", { class: "mono-label gp-eyebrow" }, labels[0]);
    const canvas = h("div", { class: "gp-canvas" }, eyebrow, titles, h("div", { class: "gp-svg-wrap" }, svg, notif), labelsRow);
    const el = h("div", { class: "seq-stage gp-stage" }, canvas, loopBlock);

    let loopLen = 0;
    const op = (e: Element, v: number) => ((e as HTMLElement).style.opacity = String(clamp(v, 0, 1)));
    const tf = (e: Element, v: string) => ((e as HTMLElement).style.transform = v);

    /** 0 = limitation, 1 = ARKA's answer. */
    function setMeasure(v: number) {
      op(diary, 1 - seg(v, 0, 0.5));
      tf(diary, `scale(${lerp(1, 0.9, v)})`);
      op(trace, seg(v, 0.4, 1));
      if (!tracePath.style.strokeDasharray) {
        const L = tracePath.getTotalLength();
        tracePath.style.strokeDasharray = `${L}`;
      }
      const L = parseFloat(tracePath.style.strokeDasharray);
      tracePath.style.strokeDashoffset = `${L * (1 - seg(v, 0.45, 1))}`;
    }
    function setPersonalise(v: number) {
      op(fixed, 1 - seg(v, 0, 0.45));
      op(rows, seg(v, 0.35, 0.7));
      rowWins.forEach((w, i) => {
        // Start aligned (all at the fixed window x), slide to each wake
        const from = -40;
        const to = wakeX[i] + 10;
        const x = lerp(from, to, seg(v, 0.55, 1));
        w.setAttribute("x", String(x));
      });
    }
    function setDeliver(v: number) {
      op(nothing, 1 - seg(v, 0, 0.4));
      op(point, seg(v, 0.35, 0.6));
      tf(point, `translateY(${lerp(8, 0, seg(v, 0.35, 0.6))}px)`);
      op(notif, seg(v, 0.6, 1));
      tf(notif, `translate(-50%, ${lerp(10, 0, seg(v, 0.6, 1))}px)`);
    }
    function setCol(k: number, v: number) {
      const c = cols[k];
      c.classList.toggle("is-after", v > 0.5);
      const bef = c.querySelectorAll<HTMLElement>(".gp-before, .gp-before-sub");
      const aft = c.querySelectorAll<HTMLElement>(".gp-after, .gp-after-sub");
      bef.forEach((e) => op(e, 1 - seg(v, 0.2, 0.6)));
      aft.forEach((e) => op(e, seg(v, 0.55, 1)));
    }

    function apply(i: number, t: number, r: number) {
      const ph = phases(t);
      // Column states: k < i-1 done; k === i-1 transforming during r of this state... simpler:
      // state 0: all limitations. state k (1..3): stage k-1 becomes answer during t of state k-1→k.
      const v = [0, 1, 2].map((k) => {
        if (i > k + 1) return 1;
        if (i === k + 1) return 1;
        if (i === k) return t; // transitioning into state k+1 transforms stage k
        return 0;
      });
      setMeasure(v[0]);
      setPersonalise(v[1]);
      setDeliver(v[2]);
      v.forEach((x, k) => setCol(k, x));
      op(eyebrow, i === 0 ? 1 - ph.out : 0);

      // Loop: draws during transition 3 → 4 and rests in state 4
      if (!loopLen) {
        loopLen = loop.getTotalLength();
        loop.style.strokeDasharray = `${loopLen}`;
      }
      const draw = i === 3 ? seg(t, 0.1, 0.85) : i === 4 ? 1 : 0;
      loop.style.strokeDashoffset = `${loopLen * (1 - draw)}`;
      op(loop, draw > 0 ? 1 : 0);
      op(loopHead, seg(draw, 0.9, 1));
      op(loopLabel, seg(draw, 0.8, 1));
      // Dim columns slightly and reveal the loop block
      const settle = i === 3 ? seg(t, 0.7, 1) : i === 4 ? 1 : 0;
      canvas.style.setProperty("--dim", String(lerp(1, 0.55, settle)));
      op(loopBlock, i === 4 ? seg(r, 0, 0.35) : i === 3 ? seg(t, 0.85, 1) : 0);
      tf(loopBlock, `translateY(${lerp(16, 0, i === 4 ? 1 : seg(t, 0.85, 1))}px)`);
    }
    return { el, apply };
  }

  return { el: section, mount: seq.mount };
}
