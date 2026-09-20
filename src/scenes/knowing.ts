// "Knowing isn't doing" (spec §7, [B]). Maya (fictional) woke at 7:20; it's
// 11:45. Three buttons. The nudge sends a notification into a phone frame and
// the light trace rises; the others leave the trace flat.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { depressionHome } from "../components/screens";
import { chartFrame, fictionalNote, nudgeBanner, sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { reducedMotion } from "../lib/motion";

type Choice = "nothing" | "tonight" | "now";

export function knowingScene() {
  const C = ABOUT.knowing;
  const W = 560;
  const H = 200;
  const X = (hh: number) => 40 + ((hh - 7) / 15) * (W - 60);
  const Y = (lux: number) => H - 30 - (Math.log10(Math.max(1, lux)) / 4.2) * (H - 50);
  const base: [number, number][] = [[7.3, 60], [8, 120], [9, 180], [10, 150], [11, 200], [11.75, 180]];
  const flat: [number, number][] = [...base, [12.5, 160], [14, 170], [16, 150], [18, 90], [20, 30], [22, 8]];
  const walk: [number, number][] = [...base, [12.1, 200], [12.2, 8000], [12.5, 11000], [12.7, 6000], [12.75, 300], [14, 170], [16, 150], [18, 90], [20, 30], [22, 8]];
  const toD = (pts: [number, number][]) => pts.map(([hh, l], i) => `${i ? "L" : "M"} ${X(hh).toFixed(1)} ${Y(l).toFixed(1)}`).join(" ");
  const past = s("path", { d: toD(base), fill: "none", stroke: "var(--ink)", "stroke-width": 2 });
  const future = s("path", { d: "", fill: "none", stroke: "var(--ink)", "stroke-width": 2, "stroke-dasharray": "3 4", opacity: 0.8 });
  const nowLine = s("line", { x1: X(11.75), y1: 16, x2: X(11.75), y2: H - 26, stroke: "var(--terracotta)", "stroke-width": 1.5 });
  const nowText = s("text", { x: X(11.75) + 4, y: 14, class: "axis-text", fill: "var(--terracotta)" }, "now · 11:45");
  const thr = Y(1000);
  const svg = s(
    "svg",
    { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": "Maya's light trace across the day" },
    s("line", { x1: 40, y1: thr, x2: W - 20, y2: thr, stroke: "var(--muted)", "stroke-dasharray": "4 4" }),
    s("text", { x: W - 20, y: thr - 6, "text-anchor": "end", class: "axis-text" }, "bright light ≥ 1,000 lux"),
    s("text", { x: 40, y: H - 8, class: "axis-text" }, "7:20 wake"),
    ...[9, 12, 15, 18, 21].map((hh) => s("text", { x: X(hh), y: H - 8, "text-anchor": "middle", class: "axis-text" }, `${hh}:00`)),
    past,
    future,
    nowLine,
    nowText,
  );
  const chart = chartFrame("Maya's day", "Line chart of light across the day. Up to 11:45 the trace stays around 100–200 lux, below the bright-light threshold. What happens after depends on the choice made.", svg);

  const phoneScreen = depressionHome({ done: 9, target: 30, mood: false });
  const phone = phoneFrame(phoneScreen, { scale: 0.5, label: "Maya's phone" });
  const nudgeSlot = h("div", { class: "know-nudge-slot", "aria-live": "polite" });

  const outcomeTitle = h("p", { class: "know-outcome-title" });
  const outcomeBody = h("p", { class: "know-outcome-body" });
  const outcome = h("div", { class: "know-outcome", "aria-live": "polite" }, outcomeTitle, outcomeBody);

  const buttons = C.options.map((o) =>
    h("button", { type: "button", class: "btn btn--ghost know-btn", "aria-pressed": "false", onclick: () => choose(o.id as Choice) }, o.label),
  );
  const reset = h("button", { type: "button", class: "btn btn--ghost", hidden: true, onclick: () => choose(null) }, C.reset);

  const el = h(
    "section",
    { class: "section knowing-section" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.setup),
      fictionalNote(C.fictional),
      h(
        "div",
        { class: "know-grid" },
        h("div", { class: "know-left" }, chart, h("div", { class: "know-buttons", role: "group", "aria-label": "What should ARKA do?" }, ...buttons), reset, outcome),
        h("div", { class: "know-right" }, phone, nudgeSlot),
      ),
    ),
  );

  function choose(c: Choice | null) {
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(C.options[i].id === c)));
    nudgeSlot.replaceChildren();
    reset.hidden = c === null;
    if (c === null) {
      future.setAttribute("d", "");
      outcomeTitle.textContent = "";
      outcomeBody.textContent = "";
      return;
    }
    const o = C.outcomes[c];
    outcomeTitle.textContent = o.title;
    outcomeBody.textContent = o.body;
    const pts = c === "now" ? walk : flat;
    const d = toD(pts);
    future.setAttribute("d", d);
    if (c === "now") {
      const n = nudgeBanner(C.nudge.title, C.nudge.body, { time: "11:45", class: "know-nudge" });
      nudgeSlot.appendChild(n);
    }
    if (reducedMotion()) {
      future.style.strokeDasharray = "3 4";
      future.style.strokeDashoffset = "0";
      return;
    }
    const len = future.getTotalLength();
    future.style.strokeDasharray = `${len}`;
    future.style.strokeDashoffset = `${len}`;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 900);
      future.style.strokeDashoffset = `${len * (1 - (1 - Math.pow(1 - p, 2)))}`;
      if (p < 1) requestAnimationFrame(step);
      else future.style.strokeDasharray = "3 4";
    };
    requestAnimationFrame(step);
  }
  return { el, mount: () => {} };
}
