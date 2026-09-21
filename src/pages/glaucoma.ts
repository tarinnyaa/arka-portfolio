import { GLAUCOMA } from "@content/glaucoma";
import { ASSETS } from "@content/shared";
import { evidence, resetEvidenceNumbering } from "../components/evidence";
import { callouts, phoneFrame } from "../components/frames";
import { pageHeader } from "../components/pageHeader";
import { HEALTHY_SEGMENTS, glaucomaHome, scoreRing } from "../components/screens";
import { closingBand, configCard, designDecision, loopDiagram, nudgeBanner, rationaleDrawer, sectionHead } from "../components/ui";
import { h } from "../lib/dom";
import { onEnter, reducedMotion } from "../lib/motion";
import type { Page } from "../lib/router";

export default function glaucoma(): Page {
  resetEvidenceNumbering();
  const C = GLAUCOMA;

  const header = pageHeader({
    kind: "glaucoma",
    accent: "#1F3A5F",
    illustration: ASSETS.illustrations.glaucoma,
    illustrationAlt: C.header.illustrationAlt,
    title: C.header.title,
    cohort: C.header.cohort,
    status: C.header.status,
    lede: C.header.lede,
    goals: C.goals,
  });

  const why = h(
    "section",
    { class: "section", id: "why" },
    h("div", { class: "wrap" }, sectionHead(C.why.kicker, C.why.heading, C.why.body), loopDiagram(C.why.nodes, { accent: "#1F3A5F" })),
  );

  // Home is three things
  const phone = phoneFrame(glaucomaHome(), { scale: 0.52, label: "Glaucoma home: 84 min bright light today, 36 min remaining, eye drops at 8:00 PM with a Mark as done button, next appointment 12 Oct 10:30 AM." });
  const co = callouts(phone, [
    { text: "One large number, a plain bar, the remainder in words.", at: [0.5, 0.22], side: "right", y: 0.12 },
    { text: "A 64-pixel button for the evening drops.", at: [0.5, 0.52], side: "left", y: 0.42 },
    { text: "The next appointment. Nothing else above the fold.", at: [0.5, 0.7], side: "right", y: 0.66 },
  ]);
  const redundancy = h(
    "div",
    { class: "card" },
    h("h3", null, C.home.redundancy.heading),
    h("p", null, C.home.redundancy.body, evidence("wcag22")),
    h(
      "div",
      { class: "redundancy" },
      ...C.home.redundancy.pairs.map((p) => h("div", { class: "redundancy-pair" }, h("span", { class: "bad" }, p.bad), h("span", { "aria-hidden": "true" }, "→"), h("span", { class: "good" }, p.good))),
    ),
  );
  const home = h(
    "section",
    { class: "section", id: "home" },
    h("div", { class: "wrap" }, sectionHead(C.home.kicker, C.home.heading, C.home.body), co.stage, redundancy),
  );

  const slider = adaptiveSlider();

  const day = h(
    "section",
    { class: "section", id: "day" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.day.kicker, C.day.heading),
      h("ul", { class: "timeline", role: "list" }, ...C.day.items.map((n) => h("li", null, h("span", { class: "timeline-time" }, n.time), nudgeBanner(n.title, n.body, { time: n.time })))),
    ),
  );

  const config = h(
    "section",
    { class: "section", id: "config" },
    h("div", { class: "wrap decision-row" }, h("div", null, configCard(C.config), rationaleDrawer(C.rationale)), designDecision(C.decision)),
  );

  const el = h("div", { class: "page page--glaucoma", style: "--accent:var(--accent-glaucoma)" }, header, why, home, slider.el, day, config, closingBand("glaucoma", C.closing, { designed: true }));
  return {
    title: C.title,
    el,
    mount: () => {
      onEnter(home, () => co.revealAll(), "top 55%");
      slider.mount();
    },
  };
}

/** The adaptive slider (spec §10, [B]): drag from Healthy home to Glaucoma
 * home; CSS custom properties morph type scale, contrast, spacing and target
 * size continuously; structure crossfades at the midpoint. Arrow-key operable
 * via the native range; reduced motion gets a two-position toggle. */
function adaptiveSlider() {
  const C = GLAUCOMA.slider;
  const ring = scoreRing(71, HEALTHY_SEGMENTS, 110);
  const screen = h(
    "div",
    { class: "scr adapt-screen" },
    h(
      "div",
      { class: "scr-body" },
      h("h2", { class: "adapt-greet" }, "Good morning, Mrs Tan"),
      h(
        "div",
        { class: "adapt-card adapt-hero" },
        h("div", { class: "adapt-ring" }, ring.svg, h("div", null, h("p", { class: "adapt-row" }, "Day · On track"), h("p", { class: "adapt-row" }, "Evening · Needs attention"), h("p", { class: "adapt-row" }, "Night · On track"))),
        h("div", { class: "adapt-num" }, h("p", { class: "g-big" }, "84 min"), h("p", { class: "g-label" }, "Bright light today"), h("div", { class: "adapt-bar" }, h("span", null)), h("p", { class: "adapt-remaining" }, "36 min remaining")),
      ),
      h(
        "div",
        { class: "adapt-small" },
        h("div", { class: "h-stat" }, h("span", { class: "h-stat-val" }, "34 min"), h("span", { class: "h-stat-label" }, "Bright light")),
        h("div", { class: "h-stat" }, h("span", { class: "h-stat-val" }, "23:40"), h("span", { class: "h-stat-label" }, "Bedtime")),
      ),
      h("div", { class: "adapt-card" }, h("p", { class: "adapt-row adapt-c1" }, "Next up · dim the lights at 21:40"), h("span", { class: "adapt-btn adapt-c1b" }, "Open Insights")),
      h("div", { class: "adapt-card" }, h("p", { class: "adapt-row adapt-c2" }, "Lumi · Why was my evening score low?")),
    ),
    h("div", { class: "adapt-tabs" }, ...["Home", "Insights", "Inbox", "Lumi"].map((t) => h("span", null, h("span", { class: "mo-tab-dot", style: "width:18px;height:18px;border-radius:6px;background:currentColor;opacity:.35;display:block" }), h("span", { class: "ptab-label" }, t)))),
  );
  const phone = phoneFrame(screen, { scale: 0.52, label: "A phone screen adapting from the Healthy home to the Glaucoma home" });
  const range = h("input", { type: "range", min: "0", max: "100", value: "0", class: "adapt-range", id: "adapt-range", "aria-label": C.label, "aria-valuetext": C.left }) as HTMLInputElement;
  const callList = h("ul", { class: "adapt-callouts" }, ...C.callouts.map((c) => h("li", null, c.text)));
  const items = Array.from(callList.children) as HTMLElement[];
  const toggle = h(
    "div",
    { class: "segmented rm-toggle", role: "group", "aria-label": C.rmToggleLabel },
    h("button", { type: "button", "aria-pressed": "true", onclick: () => setT(0, true) }, C.left),
    h("button", { type: "button", "aria-pressed": "false", onclick: () => setT(1, true) }, C.right),
  );
  const stage = h(
    "div",
    { class: "adapt-stage" },
    h("div", { class: "adapt-grid" }, phone, h("div", null, callList)),
    h("div", { class: "adapt-track" }, h("span", { class: "muted", "aria-hidden": "true" }, C.left), range, h("span", { class: "muted", "aria-hidden": "true" }, C.right)),
    toggle,
  );
  const el = h(
    "section",
    { class: "section", id: "adapt" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), stage, h("p", { class: "closing-line", style: "margin-top:32px" }, C.closing)),
  );

  const c1 = screen.querySelector(".adapt-c1") as HTMLElement;
  const c1b = screen.querySelector(".adapt-c1b") as HTMLElement;
  const c2 = screen.querySelector(".adapt-c2") as HTMLElement;
  function setT(t: number, fromToggle = false) {
    screen.style.setProperty("--t", t.toFixed(3));
    // Structure crossfades at the midpoint: the two lower cards change from
    // Healthy content (next-up, Lumi) to the Glaucoma tasks (drops, appointment).
    const g = t >= 0.5;
    c1.textContent = g ? "Eye drops · 8:00 PM" : "Next up · dim the lights at 21:40";
    c1b.textContent = g ? "Mark as done" : "Open Insights";
    c2.textContent = g ? "Next appointment · 12 Oct · 10:30 AM" : "Lumi · Why was my evening score low?";
    items.forEach((li, i) => li.classList.toggle("is-on", t >= C.callouts[i].at));
    range.value = String(Math.round(t * 100));
    range.setAttribute("aria-valuetext", t < 0.5 ? `${C.left} (${Math.round(t * 100)}%)` : `${C.right} (${Math.round(t * 100)}%)`);
    if (fromToggle) {
      toggle.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(i === Math.round(t))));
    }
  }
  function mount() {
    range.addEventListener("input", () => setT(Number(range.value) / 100));
    if (reducedMotion()) {
      range.hidden = true;
      (range.parentElement as HTMLElement).hidden = true;
      setT(1, true);
      return;
    }
    toggle.hidden = true;
    setT(0);
  }
  return { el, mount };
}
