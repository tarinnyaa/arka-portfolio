// Participant phone screens — real HTML/SVG for each configuration.
// Parameterised so the About page morph / configurator can reconfigure them
// live. Myopia screens mirror the deployed app; the others are designed
// configurations.
import { h, s } from "../lib/dom";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { checkIcon, sunIcon, tabGlyph } from "./icons";
import { createPlant, miniPlant } from "./plant";

export type Population = "myopia" | "healthy" | "glaucoma" | "depression" | "stroke";

export type ScreenConfig = {
  population: Population;
  typeScale: number;
  singleTask: boolean;
  plant: boolean;
  score: boolean;
  lumi: boolean;
  mood: boolean;
  caregiver: boolean;
  target: string;
  window: string;
  behaviour: string;
};

export const DEFAULT_CONFIG: Record<Population, ScreenConfig> = {
  myopia: {
    population: "myopia", typeScale: 1.0, singleTask: false, plant: true, score: false, lumi: false, mood: false, caregiver: false,
    target: "120 min outdoors", window: "Afternoon, while daylight remains", behaviour: "Time outdoors",
  },
  healthy: {
    population: "healthy", typeScale: 1.0, singleTask: false, plant: false, score: true, lumi: true, mood: false, caregiver: false,
    target: "Day ≥ 250 · Evening ≤ 10 · Night ≤ 1 mEDI", window: "2 h after wake · 3 h before bed", behaviour: "Light balance across the day",
  },
  glaucoma: {
    population: "glaucoma", typeScale: 1.6, singleTask: false, plant: false, score: false, lumi: true, mood: false, caregiver: false,
    target: "Daytime bright light 60 min · drops ×2", window: "Morning drops · bright light · evening drops", behaviour: "Daytime bright light, drops, appointments",
  },
  depression: {
    population: "depression", typeScale: 1.0, singleTask: false, plant: false, score: false, lumi: true, mood: true, caregiver: false,
    target: "30 min bright light within 2 h of wake", window: "Wake → +2 h", behaviour: "Morning light routine",
  },
  stroke: {
    population: "stroke", typeScale: 1.4, singleTask: true, plant: false, score: false, lumi: false, mood: false, caregiver: true,
    target: "Morning light 30 min · wake anchor 07:00", window: "Morning, after the wake anchor", behaviour: "Morning light, wake anchor, night protection",
  },
};

export function tabBar(tabs: string[], active = 0, opts: { dark?: boolean; labels?: boolean; large?: boolean } = {}): HTMLElement {
  return h(
    "div",
    { class: `ptabs${opts.dark ? " ptabs--dark" : ""}${opts.large ? " ptabs--large" : ""}` },
    ...tabs.map((t, i) =>
      h(
        "span",
        { class: `ptab${i === active ? " is-active" : ""}`, "aria-current": i === active ? "page" : undefined },
        tabGlyph(t, opts.large ? 26 : 22),
        h("span", { class: "ptab-label" }, t),
      ),
    ),
  );
}

// ───────────────────────── Myopia (deployed) ─────────────────────────

/** Semicircular gauge, 0–120, matching the deployed Home tab. */
export function myopiaGauge(minutes: number, target = 120): SVGSVGElement {
  const W = 300;
  const H = 170;
  const cx = 150;
  const cy = 150;
  const r = 112;
  const toXY = (v: number, rad = r) => {
    const a = Math.PI - (v / target) * Math.PI;
    return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)] as const;
  };
  const arc = (from: number, to: number, rad: number) => {
    const [x0, y0] = toXY(from, rad);
    const [x1, y1] = toXY(to, rad);
    return `M ${x0} ${y0} A ${rad} ${rad} 0 0 1 ${x1} ${y1}`;
  };
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "mgauge", role: "img", "aria-label": `Outdoor time gauge: ${minutes} of ${target} minutes` });
  svg.appendChild(s("path", { d: arc(0, target, r), fill: "none", stroke: "#EBE7E2", "stroke-width": 22 }));
  if (minutes > 0) svg.appendChild(s("path", { class: "mgauge-fill", d: arc(0, Math.min(minutes, target), r), fill: "none", stroke: "#6BA368", "stroke-width": 22 }));
  // ticks every 12
  for (let v = 0; v <= target; v += 12) {
    const major = v % 24 === 0;
    const [x0, y0] = toXY(v, r + 11);
    const [x1, y1] = toXY(v, r - (major ? 11 : 6));
    svg.appendChild(s("line", { x1: x0, y1: y0, x2: x1, y2: y1, stroke: v <= minutes ? "#4E7F4B" : "#B8B1A6", "stroke-width": major ? 2 : 1.2 }));
    if (major) {
      const [tx, ty] = toXY(v, r + 26);
      svg.appendChild(s("text", { x: tx, y: ty + 4, "text-anchor": "middle", class: "mgauge-tick", fill: v === target ? "#3F7B3C" : "#6E695F" }, String(v)));
    }
  }
  // needle
  const [nx, ny] = toXY(Math.min(minutes, target), r - 30);
  svg.appendChild(s("line", { class: "mgauge-needle", x1: cx, y1: cy, x2: nx, y2: ny, stroke: "#2C2825", "stroke-width": 2.5, "stroke-linecap": "round", style: `transform-origin:${cx}px ${cy}px` }));
  svg.appendChild(s("circle", { cx, cy, r: 7, fill: "#fff", stroke: "#2C2825", "stroke-width": 3 }));
  return svg;
}

export function myopiaHome(opts: { minutes?: number; target?: number; comparison?: boolean } = {}): HTMLElement {
  const minutes = opts.minutes ?? 78;
  const target = opts.target ?? 120;
  const remaining = target - minutes;
  const goal = minutes >= target;
  return h(
    "div",
    { class: "scr scr--myopia" },
    h(
      "div",
      { class: "scr-body" },
      h("div", { class: "m-banner" }, checkIcon(16, "#2F6B2C"), h("span", null, "We've received today's watch data.")),
      h("h2", { class: "m-title" }, "Summary"),
      h("p", { class: "m-sub" }, "Progress in daily light exposure"),
      h("p", { class: "m-asof" }, "Watch data as of 18 Sep 2026, 2:22 PM"),
      // Comparison arm (deployed "placebo" home): raw minutes only — no gauge,
      // no target, no coaching line.
      opts.comparison
        ? null
        : h(
            "div",
            { class: "m-card m-gauge-card" },
            myopiaGauge(minutes, target),
            h("p", { class: "m-gauge-label" }, "OUTDOOR"),
            h("p", { class: "m-gauge-value" }, `${minutes} minutes`),
          ),
      h(
        "div",
        { class: "m-card m-coach" },
        h("p", { class: "m-coach-lead" }, "As of 18 Sep 2026, 2:22 PM, your child's outdoor time is:"),
        h("p", { class: "m-coach-big" }, `${minutes} minutes`),
        opts.comparison
          ? null
          : h("p", { class: "m-coach-line" }, goal ? "Goal reached!" : `Take your child outside for ${remaining} minutes to hit today's goal of ${target} minutes!`),
        opts.comparison ? null : h("p", { class: "m-coach-sub" }, `For optimal myopia protection aim for ${target} minutes outdoors per day.`),
      ),
      h("div", { class: "m-card m-wear" }, h("p", { class: "m-wear-title" }, "Monthly Wear Time (days)")),
    ),
    tabBar(opts.comparison ? ["Home", "Insights", "Inbox"] : ["Home", "Insights", "Plant", "Inbox"], 0, { dark: true }),
  );
}

/** The deployed Plant tab (Luckiest Guy / Baloo 2). Returns the screen plus the plant handle. */
export function myopiaPlantScreen(opts: { fraction?: number; garden?: boolean } = {}) {
  const plant = createPlant({ label: undefined });
  plant.set(opts.fraction ?? 0.65);
  const gardenRow = opts.garden
    ? h(
        "div",
        { class: "m-garden" },
        h("p", { class: "m-garden-title" }, "My Garden · 2026"),
        h("div", { class: "m-garden-row" }),
      )
    : null;
  const el = h(
    "div",
    { class: "scr scr--myopia scr--plant" },
    h(
      "div",
      { class: "scr-body" },
      h("h2", { class: "mp-title" }, "Your plant"),
      h("p", { class: "mp-sub" }, "Grows with today's time outside"),
      h("div", { class: "m-card mp-card" }, plant.el),
      gardenRow,
    ),
    tabBar(["Home", "Insights", "Plant", "Inbox"], 2, { dark: true }),
  );
  return { el, plant, gardenRow };
}

// ───────────────────────── Healthy (designed) ─────────────────────────

export function scoreRing(score: number, segments: { key: string; label: string; status: string; score: number; max: number }[], size = 200) {
  const r = 78;
  const cx = 100;
  const cy = 100;
  const gap = 6; // degrees
  const total = segments.reduce((a, b) => a + b.max, 0);
  const svg = s("svg", { viewBox: "0 0 200 200", width: size, height: size, class: "ring", role: "img", "aria-label": `Light Balance Score ${score} of 100. ${segments.map((sg) => `${sg.label}: ${sg.status}`).join(". ")}.` });
  let start = -90;
  const colors: Record<string, string> = { day: "#E8A825", evening: "#8B5FBF", night: "#1F3A5F" };
  const arcs: SVGPathElement[] = [];
  const polar = (deg: number, rad: number) => [cx + rad * Math.cos((deg * Math.PI) / 180), cy + rad * Math.sin((deg * Math.PI) / 180)];
  for (const sg of segments) {
    const span = (sg.max / total) * 360 - gap;
    const a0 = start + gap / 2;
    const a1 = a0 + span;
    const [x0, y0] = polar(a0, r);
    const [x1, y1] = polar(a1, r);
    svg.appendChild(s("path", { d: `M ${x0} ${y0} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x1} ${y1}`, fill: "none", stroke: "#EBE7E2", "stroke-width": 14, "stroke-linecap": "round" }));
    const fillSpan = span * (sg.score / sg.max);
    const [fx, fy] = polar(a0 + fillSpan, r);
    const p = s("path", { d: `M ${x0} ${y0} A ${r} ${r} 0 ${fillSpan > 180 ? 1 : 0} 1 ${fx} ${fy}`, fill: "none", stroke: colors[sg.key] ?? "#6BA368", "stroke-width": 14, "stroke-linecap": "round", class: "ring-arc", "data-key": sg.key });
    arcs.push(p);
    svg.appendChild(p);
    start += (sg.max / total) * 360;
  }
  const num = s("text", { x: cx, y: cy + 8, "text-anchor": "middle", class: "ring-num" }, String(score));
  svg.appendChild(num);
  svg.appendChild(s("text", { x: cx, y: cy + 30, "text-anchor": "middle", class: "ring-cap" }, "Light Balance"));
  return { svg, arcs, num };
}

export const HEALTHY_SEGMENTS = [
  { key: "day", label: "Day", status: "On track", value: "312 mEDI avg", score: 32, max: 40 },
  { key: "evening", label: "Evening", status: "Needs attention", value: "40 mEDI at 23:10", score: 19, max: 35 },
  { key: "night", label: "Night", status: "On track", value: "< 1 mEDI", score: 20, max: 25 },
];

export function healthyHome(opts: { score?: number; lumi?: boolean; dense?: boolean } = {}): HTMLElement {
  const score = opts.score ?? 71;
  const ring = scoreRing(score, HEALTHY_SEGMENTS, 180);
  const tabs = ["Home", "Insights", ...(opts.lumi === false ? [] : ["Lumi"]), "Inbox", "Diary"];
  return h(
    "div",
    { class: "scr scr--healthy" },
    h(
      "div",
      { class: "scr-body" },
      h("p", { class: "h-date" }, "Thursday 17 Sep"),
      h("h2", { class: "h-greet" }, "Good afternoon, Sam"),
      h(
        "div",
        { class: "h-card h-ring-card" },
        ring.svg,
        h(
          "ul",
          { class: "h-segs", role: "list" },
          ...HEALTHY_SEGMENTS.map((sg) =>
            h(
              "li",
              { class: `h-seg h-seg--${sg.key}` },
              h("span", { class: "h-seg-dot", "aria-hidden": "true" }),
              h("span", { class: "h-seg-label" }, sg.label),
              h("span", { class: "h-seg-status" }, sg.status),
              h("span", { class: "h-seg-val" }, sg.value),
            ),
          ),
        ),
      ),
      opts.dense === false
        ? null
        : h(
            "div",
            { class: "h-stats" },
            stat("Bright light", "34 min", "since 7:10"),
            stat("Evening peak", "40 lx", "at 23:10"),
            stat("Bedtime", "23:40", "avg this week"),
          ),
      h(
        "div",
        { class: "h-card h-nudge" },
        h("p", { class: "h-nudge-title" }, "Next up"),
        h("p", null, "Two hours to bed at 21:40: time to dim the lights."),
      ),
    ),
    tabBar(tabs, 0),
  );
  function stat(label: string, value: string, sub: string) {
    return h("div", { class: "h-stat" }, h("span", { class: "h-stat-val" }, value), h("span", { class: "h-stat-label" }, label), h("span", { class: "h-stat-sub" }, sub));
  }
}

// ───────────────────────── Glaucoma (designed) ─────────────────────────

export function glaucomaHome(opts: { minutes?: number; target?: number; dropsDone?: boolean; lumi?: boolean } = {}): HTMLElement {
  const minutes = opts.minutes ?? 84;
  const target = opts.target ?? 120;
  const pct = Math.min(100, Math.round((minutes / target) * 100));
  const tabs = ["Home", "Insights", "Inbox", ...(opts.lumi === false ? [] : ["Lumi"])];
  return h(
    "div",
    { class: "scr scr--glaucoma" },
    h(
      "div",
      { class: "scr-body" },
      h("h2", { class: "g-greet" }, "Good morning, Mrs Tan"),
      h(
        "div",
        { class: "g-card" },
        h("p", { class: "g-big" }, `${minutes} min`),
        h("p", { class: "g-label" }, "Bright light today"),
        h("div", { class: "g-bar", role: "img", "aria-label": `${pct}% of today's target` }, h("span", { class: "g-bar-fill", style: `width:${pct}%` })),
        h("p", { class: "g-remaining" }, `${target - minutes} min remaining`),
      ),
      h(
        "div",
        { class: "g-card" },
        h("p", { class: "g-row-label" }, "Eye drops · 8:00 PM"),
        h("span", { class: `g-btn${opts.dropsDone ? " is-done" : ""}` }, opts.dropsDone ? "✓ Done" : "Mark as done"),
      ),
      h("div", { class: "g-card g-card--appt" }, h("p", { class: "g-row-label" }, "Next appointment"), h("p", { class: "g-appt" }, "12 Oct · 10:30 AM")),
    ),
    tabBar(tabs, 0, { large: true }),
  );
}

// ───────────────────────── Depression (designed) ─────────────────────────

export function depressionHome(opts: { done?: number; target?: number; mood?: boolean; lumi?: boolean } = {}): HTMLElement {
  const done = opts.done ?? 24;
  const target = opts.target ?? 30;
  const tabs = ["Home", "Insights", ...(opts.lumi === false ? [] : ["Lumi"]), "Inbox", "Diary"];
  const faces = ["Very low", "Low", "Okay", "Good", "Very good"];
  return h(
    "div",
    { class: "scr scr--depression" },
    h(
      "div",
      { class: "scr-body" },
      h("div", { class: "d-top" }, h("span", { class: "d-support" }, "Need support?")),
      h("h2", { class: "d-greet" }, "Good morning."),
      h(
        "div",
        { class: "d-card" },
        h("p", { class: "d-label" }, "Your morning light window"),
        h("p", { class: "d-mins" }, h("strong", null, `${done}`), ` / ${target} min`),
        h("div", { class: "d-bar", role: "img", "aria-label": `${done} of ${target} minutes` }, h("span", { class: "d-bar-fill", style: `width:${(done / target) * 100}%` })),
        h("p", { class: "d-remaining" }, `${target - done} min remaining`),
        h("span", { class: "d-primary" }, "Continue morning light"),
      ),
      opts.mood === false
        ? null
        : h(
            "div",
            { class: "d-card d-mood" },
            h("p", { class: "d-label" }, "How are you feeling?"),
            h(
              "div",
              { class: "d-faces", role: "img", "aria-label": "Five mood faces, from very low to very good" },
              ...faces.map((f, i) => face(i, f)),
            ),
          ),
      h("div", { class: "d-card d-tonight" }, h("p", { class: "d-label" }, "Tonight"), h("p", null, "Wind-down starts at 9:30 PM")),
    ),
    tabBar(tabs, 0),
  );
  function face(i: number, label: string) {
    const mouth = ["M8 16q4-3 8 0", "M8 15.5q4-1.5 8 0", "M8 15h8", "M8 14.5q4 1.5 8 0", "M8 14q4 3 8 0"][i];
    return h(
      "span",
      { class: "d-face", title: label },
      s(
        "svg",
        { viewBox: "0 0 24 24", width: 36, height: 36, "aria-hidden": "true" },
        s("circle", { cx: 12, cy: 12, r: 10, fill: "#F3EEF9", stroke: "#8B5FBF", "stroke-width": 1.4 }),
        s("circle", { cx: 9, cy: 10, r: 1.2, fill: "#5B3A85" }),
        s("circle", { cx: 15, cy: 10, r: 1.2, fill: "#5B3A85" }),
        s("path", { d: mouth, fill: "none", stroke: "#5B3A85", "stroke-width": 1.4, "stroke-linecap": "round" }),
      ),
    );
  }
}

// ───────────────────────── Stroke (designed) ─────────────────────────

export type StrokeMode = "standard" | "motor" | "communication";

export function bigSun(size = 140): SVGSVGElement {
  const svg = s("svg", { viewBox: "0 0 120 120", width: size, height: size, "aria-hidden": "true" });
  for (let i = 0; i < 12; i++) {
    svg.appendChild(s("line", { x1: 60, y1: 8, x2: 60, y2: 22, stroke: "#E8A825", "stroke-width": 5, "stroke-linecap": "round", transform: `rotate(${i * 30} 60 60)` }));
  }
  svg.appendChild(s("circle", { cx: 60, cy: 60, r: 28, fill: "#E8A825" }));
  return svg;
}

export function strokeHome(opts: { mode?: StrokeMode; done?: boolean; caregiver?: boolean } = {}): HTMLElement {
  const mode = opts.mode ?? "standard";
  const body =
    opts.done
      ? h(
          "div",
          { class: "s-done" },
          h("p", { class: "s-check" }, "✓ Done"),
          h("p", { class: "s-done-title" }, "Morning light finished"),
          h("p", { class: "s-next" }, "Next: Rest"),
        )
      : mode === "communication"
        ? h(
            "div",
            { class: "s-task s-task--comm" },
            h("div", { class: "s-comm-row" }, bigSun(96), h("p", { class: "s-instruction" }, "Go to the light.")),
            h("div", { class: "s-listen s-listen--on" }, tabGlyph("listen", 22), h("span", null, "Reading aloud")),
            h("div", { class: "s-yesno" }, h("span", { class: "s-yes" }, "YES"), h("span", { class: "s-later" }, "LATER")),
          )
        : h(
            "div",
            { class: "s-task" },
            bigSun(mode === "motor" ? 110 : 140),
            h("p", { class: "s-title" }, "Morning light"),
            h("p", { class: "s-dur" }, "30 minutes"),
            h("span", { class: "s-start" }, "START"),
            h("div", { class: "s-listen" }, tabGlyph("listen", 22), h("span", null, "Listen")),
          );
  return h(
    "div",
    { class: `scr scr--stroke scr--stroke-${mode}${opts.done ? " is-done" : ""}` },
    h("div", { class: "scr-body" }, h("h2", { class: "s-greet" }, "Good morning."), body),
    opts.caregiver === false ? null : h("p", { class: "s-share" }, "Shared with: Mei (caregiver)"),
  );
}

export function caregiverScreen(): HTMLElement {
  const item = (label: string, state: "done" | "pending") =>
    h("li", { class: `c-item c-item--${state}` }, h("span", { class: "c-mark", "aria-hidden": "true" }, state === "done" ? "✓" : ""), h("span", null, label), h("span", { class: "c-state" }, state === "done" ? "done" : "pending"));
  return h(
    "div",
    { class: "scr scr--caregiver" },
    h(
      "div",
      { class: "scr-body" },
      h("p", { class: "c-kicker" }, "Caregiver view · Mr Lim"),
      h("h2", { class: "c-title" }, "Today"),
      h("ul", { class: "c-list", role: "list" }, item("Wake anchor", "done"), item("Morning light", "done"), item("Night protection", "pending")),
      h("div", { class: "c-card" }, h("p", { class: "c-label" }, "This week"), h("p", { class: "c-adh" }, "6 of 7 days")),
      h("span", { class: "c-msg" }, "Message research team"),
    ),
    tabBar(["Home", "Insights", "Inbox", "Caregiver"], 3),
  );
}

// ───────────────────────── Configurable participant screen ─────────────────────────

/** Builds the participant phone for a configuration. Used by the About page
 * configurator and the "8:14" row. */
export function participantScreen(cfg: ScreenConfig): HTMLElement {
  switch (cfg.population) {
    case "myopia": {
      if (cfg.plant) {
        const { el } = myopiaPlantScreen({ fraction: 0.65, garden: true });
        const row = el.querySelector(".m-garden-row");
        if (row) {
          for (let i = 0; i < 3; i++) row.appendChild(h("span", { class: "m-garden-cell" }, miniPlant(ART_SUNFLOWER, { size: 34, label: "flower" }), h("span", null, ["Jul", "Aug", "Sep"][i])));
          for (const m of ["Oct", "Nov"]) row.appendChild(h("span", { class: "m-garden-cell m-garden-cell--lock" }, h("span", { class: "m-lock", "aria-hidden": "true" }), h("span", null, m)));
        }
        return el;
      }
      return myopiaHome({ comparison: true });
    }
    case "healthy":
      return healthyHome({ lumi: cfg.lumi, dense: !cfg.singleTask });
    case "glaucoma":
      return glaucomaHome({ lumi: cfg.lumi });
    case "depression":
      return depressionHome({ mood: cfg.mood, lumi: cfg.lumi });
    case "stroke":
      return strokeHome({ mode: cfg.singleTask ? "standard" : "standard", caregiver: cfg.caregiver });
  }
}

/** Small "8:14 AM" status lines as compact screens. */
export function eightFourteenScreen(key: Population, line: string): HTMLElement {
  const cls = `scr scr--${key} scr--mini`;
  let art: Node;
  switch (key) {
    case "myopia":
      art = miniPlant(ART_SUNFLOWER, { size: 64, label: "sunflower" });
      break;
    case "healthy": {
      art = scoreRing(71, HEALTHY_SEGMENTS, 110).svg;
      break;
    }
    case "glaucoma":
      art = h("p", { class: "g-big" }, "34 min");
      break;
    case "depression":
      art = h("div", { class: "d-bar", style: "width:80%" }, h("span", { class: "d-bar-fill", style: "width:40%" }));
      break;
    default:
      art = bigSun(90);
  }
  return h(
    "div",
    { class: cls },
    h("div", { class: "scr-body mini-body" }, h("p", { class: "mini-time" }, "8:14 AM"), h("div", { class: "mini-art" }, art), h("p", { class: "mini-line" }, line)),
  );
}

export { sunIcon };
