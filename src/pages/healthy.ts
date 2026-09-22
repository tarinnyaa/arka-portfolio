import { HEALTHY } from "@content/healthy";
import { ASSETS } from "@content/shared";
import { evidence, resetEvidenceNumbering } from "../components/evidence";
import { callouts, phoneFrame } from "../components/frames";
import { pageHeader } from "../components/pageHeader";
import { healthyHome } from "../components/screens";
import { chartFrame, closingBand, configCard, designDecision, nudgeBanner, rationaleDrawer, sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { onEnter, playOnEnter, reducedMotion } from "../lib/motion";
import type { Page } from "../lib/router";

export default function healthy(): Page {
  resetEvidenceNumbering();
  const C = HEALTHY;

  const header = pageHeader({
    kind: "healthy",
    accent: "#5B9BD5",
    illustration: ASSETS.illustrations.healthy,
    illustrationAlt: C.header.illustrationAlt,
    title: C.header.title,
    cohort: C.header.cohort,
    lede: C.header.lede,
    goals: C.goals,
  });

  // Targets vs reality — three flipping columns
  const cols = C.reality.columns.map((c) =>
    h(
      "div",
      { class: "flip-col" },
      h("h3", null, c.title),
      h(
        "div",
        { class: "flip-inner" },
        h("div", { class: "flip-face flip-face--front card card--flat" }, h("span", { class: "kicker" }, "Reality"), h("p", null, c.problem, evidence(...c.refs))),
        h("div", { class: "flip-face flip-face--back card" }, h("span", { class: "kicker" }, "ARKA"), h("p", null, c.answer)),
      ),
    ),
  );
  const flipBtn = h("button", { type: "button", class: "btn btn--ghost", "aria-pressed": "false", onclick: () => flip() }, "Show ARKA's answer");
  let flipped = false;
  function flip(force?: boolean) {
    flipped = force ?? !flipped;
    cols.forEach((c, i) => setTimeout(() => c.classList.toggle("is-flipped", flipped), reducedMotion() ? 0 : i * 140));
    flipBtn.setAttribute("aria-pressed", String(flipped));
    flipBtn.textContent = flipped ? "Show reality" : "Show ARKA's answer";
  }
  const reality = h(
    "section",
    { class: "section", id: "reality" },
    h("div", { class: "wrap" }, sectionHead(C.reality.kicker, C.reality.heading), h("div", { class: "grid-3 flip-grid" }, ...cols), flipBtn),
  );

  // Score
  const screen = healthyHome();
  const phone = phoneFrame(screen, { scale: 0.52, label: "Healthy home: Light Balance Score 71 with day, evening and night arcs." });
  const co = callouts(phone, [
    { text: C.score.callouts[0], at: [0.28, 0.24], side: "left", y: 0.12 },
    { text: C.score.callouts[1], at: [0.72, 0.28], side: "right", y: 0.26 },
    { text: C.score.callouts[2], at: [0.72, 0.36], side: "right", y: 0.5 },
  ]);
  const score = h("section", { class: "section", id: "score" }, h("div", { class: "wrap" }, sectionHead(C.score.kicker, C.score.heading, C.score.body), co.stage));

  // A day of light — chart
  const day = dayChart();

  // Lumi
  const reply = h("p", { class: "chat-bubble chat-bubble--lumi chat-reply", hidden: true, "aria-live": "polite" });
  const chat = h(
    "div",
    { class: "chat", role: "log", "aria-label": "Conversation with Lumi" },
    ...C.lumi.turns.map((t) => {
      if (t.who === "options") {
        return h(
          "div",
          { class: "chat-options" },
          ...(t.options ?? []).map((o) =>
            h(
              "button",
              {
                type: "button",
                class: "btn btn--ghost",
                onclick: () => {
                  reply.textContent = (C.lumi.followups as Record<string, string>)[o];
                  reply.hidden = false;
                },
              },
              o,
            ),
          ),
        );
      }
      return h("p", { class: `chat-bubble chat-bubble--${t.who}` }, t.text);
    }),
    reply,
  );
  const lumi = h("section", { class: "section", id: "lumi" }, h("div", { class: "wrap two-col" }, h("div", null, sectionHead(C.lumi.kicker, C.lumi.heading, C.lumi.body)), chat));

  // Nudges
  const nudges = h(
    "section",
    { class: "section", id: "nudges" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.nudges.kicker, C.nudges.heading),
      h("ul", { class: "timeline", role: "list" }, ...C.nudges.items.map((n) => h("li", null, h("span", { class: "timeline-time" }, n.time), nudgeBanner(n.title, n.body, { time: n.time })))),
    ),
  );

  const config = h(
    "section",
    { class: "section", id: "config" },
    h("div", { class: "wrap decision-row" }, h("div", null, configCard(C.config), rationaleDrawer(C.rationale)), designDecision(C.decision)),
  );

  const el = h("div", { class: "page page--healthy", style: "--accent:var(--accent-healthy)" }, header, reality, score, day.el, lumi, nudges, config, closingBand("healthy", C.closing));

  return {
    title: C.title,
    el,
    mount: () => {
      onEnter(reality, () => flip(true), "top 45%");
      // Ring draws on scroll: arcs use dash offset
      const arcs = Array.from(screen.querySelectorAll<SVGPathElement>(".ring-arc"));
      const num = screen.querySelector(".ring-num") as SVGTextElement;
      const lens = arcs.map((a) => a.getTotalLength());
      const draw = (p: number) => {
        arcs.forEach((a, i) => {
          a.style.strokeDasharray = `${lens[i]}`;
          a.style.strokeDashoffset = `${lens[i] * (1 - p)}`;
        });
        num.textContent = String(Math.round(71 * p));
      };
      if (reducedMotion()) draw(1);
      else {
        draw(0);
        onEnter(score, () => {
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / 900);
            draw(1 - Math.pow(1 - p, 2));
            if (p < 1) requestAnimationFrame(step);
            else co.revealAll();
          };
          requestAnimationFrame(step);
        }, "top 55%");
      }
      if (reducedMotion()) co.revealAll();
      day.mount();
    },
  };
}

function dayChart() {
  const C = HEALTHY.day;
  const W = 900;
  const H = 340;
  const L = 56;
  const R = 20;
  const T = 20;
  const B = 40;
  const X = (hh: number) => L + ((hh - 5) / 26) * (W - L - R); // 5:00 → 31:00 (7 am next day)
  const Y = (lux: number) => T + (1 - (Math.log10(Math.max(0.1, lux)) + 1) / 6) * (H - T - B); // 0.1 → 100000
  const pts: [number, number][] = [
    [5, 0.3], [6.5, 0.5], [7, 30], [7.5, 120], [8, 150], [9, 180], [10, 160], [11, 200], [12, 220], [12.5, 3000], [13, 5200], [13.5, 4000], [13.8, 300], [15, 220], [17, 180], [18, 90], [19, 40], [20, 18], [21, 15], [22, 12], [22.8, 12], [23, 40], [23.2, 42], [23.6, 8], [24, 0.6], [26, 0.3], [30, 0.3], [31, 0.4],
  ];
  const d = pts.map(([hh, l], i) => `${i ? "L" : "M"} ${X(hh).toFixed(1)} ${Y(l).toFixed(1)}`).join(" ");
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "day-svg" });
  // bands
  const bands = [
    { x0: 7, x1: 19, y0: Y(100000), y1: Y(250), fill: "#E8A825", label: "Day ≥ 250" },
    { x0: 20, x1: 23, y0: Y(10), y1: Y(0.1), fill: "#8B5FBF", label: "Evening ≤ 10" },
    { x0: 23, x1: 31, y0: Y(1), y1: Y(0.1), fill: "#1F3A5F", label: "Night ≤ 1" },
  ];
  bands.forEach((b) => {
    svg.appendChild(s("rect", { x: X(b.x0), y: b.y0, width: X(b.x1) - X(b.x0), height: b.y1 - b.y0, fill: b.fill, opacity: 0.12 }));
    // Label at the band's lower edge so it never sits on the trace.
    svg.appendChild(s("text", { x: X(b.x0) + 6, y: b.y1 - 5, class: "axis-text" }, b.label));
  });
  // axes
  [0.1, 1, 10, 100, 1000, 10000, 100000].forEach((v) => {
    svg.appendChild(s("line", { x1: L, y1: Y(v), x2: W - R, y2: Y(v), stroke: "var(--line)" }));
    svg.appendChild(s("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end", class: "axis-text" }, v >= 1000 ? `${v / 1000}k` : String(v)));
  });
  [6, 9, 12, 15, 18, 21, 24, 27, 30].forEach((hh) => svg.appendChild(s("text", { x: X(hh), y: H - 10, "text-anchor": "middle", class: "axis-text" }, `${String(hh % 24).padStart(2, "0")}:00`)));
  svg.appendChild(s("text", { x: L - 6, y: 12, "text-anchor": "end", class: "axis-text" }, "mEDI"));
  const trace = s("path", { d, fill: "none", stroke: "var(--ink)", "stroke-width": 2.2, "stroke-linejoin": "round" });
  svg.appendChild(trace);
  // annotation at 23:00
  const ann = s("g", { class: "day-ann", opacity: 0 });
  ann.appendChild(s("circle", { cx: X(23.1), cy: Y(41), r: 6, fill: "var(--terracotta)" }));
  ann.appendChild(s("line", { x1: X(23.1), y1: Y(41) - 8, x2: X(23.1), y2: Y(41) - 50, stroke: "var(--terracotta)" }));
  ann.appendChild(s("text", { x: X(23.1), y: Y(41) - 56, "text-anchor": "middle", class: "axis-text", fill: "var(--terracotta)", "font-weight": 600 }, C.annotation));
  svg.appendChild(ann);
  // follow line [C]
  const follow = s("g", { class: "day-follow", opacity: 0 });
  const fl = s("line", { x1: 0, y1: T, x2: 0, y2: H - B, stroke: "var(--ink)", "stroke-dasharray": "3 3" });
  const ft = s("text", { x: 0, y: T + 12, class: "axis-text", "font-weight": 600, fill: "var(--ink)" });
  follow.append(fl, ft);
  svg.appendChild(follow);

  const frame = chartFrame(C.chartTitle, C.summary, svg, { caption: C.followLabel, class: "day-chart" });
  const el = h("section", { class: "section", id: "day" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), frame));

  function luxAt(hh: number) {
    for (let i = 1; i < pts.length; i++) {
      if (hh <= pts[i][0]) {
        const [h0, l0] = pts[i - 1];
        const [h1, l1] = pts[i];
        const t = (hh - h0) / (h1 - h0);
        return Math.pow(10, Math.log10(l0) + (Math.log10(l1) - Math.log10(l0)) * t);
      }
    }
    return pts[pts.length - 1][1];
  }

  function mount() {
    const len = trace.getTotalLength();
    const set = (p: number) => {
      trace.style.strokeDasharray = `${len}`;
      trace.style.strokeDashoffset = `${len * (1 - p)}`;
      ann.setAttribute("opacity", p > 0.72 ? "1" : "0");
    };
    playOnEnter(set, {
      trigger: frame,
      durationMs: 3200,
      steps: [
        { label: "Morning", p: 0.3 },
        { label: "Lunch", p: 0.45 },
        { label: "Evening", p: 0.7 },
        { label: "Night", p: 1 },
      ],
      controlLabel: "Draw the day's trace",
      controlMount: frame,
    });
    if (!reducedMotion()) {
      svg.addEventListener("pointermove", (e) => {
        const r = svg.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * W;
        if (x < L || x > W - R) return (follow.setAttribute("opacity", "0"), undefined);
        const hh = 5 + ((x - L) / (W - L - R)) * 26;
        fl.setAttribute("x1", String(x));
        fl.setAttribute("x2", String(x));
        ft.setAttribute("x", String(x + 6));
        const lux = luxAt(hh);
        ft.textContent = `${String(Math.floor(hh) % 24).padStart(2, "0")}:${String(Math.floor((hh % 1) * 60)).padStart(2, "0")} · ${lux >= 100 ? Math.round(lux) : lux.toFixed(1)} mEDI`;
        follow.setAttribute("opacity", "1");
      });
      svg.addEventListener("pointerleave", () => follow.setAttribute("opacity", "0"));
    }
  }
  return { el, mount };
}
