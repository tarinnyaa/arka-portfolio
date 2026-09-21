import { DEPRESSION } from "@content/depression";
import { ASSETS } from "@content/shared";
import { resetEvidenceNumbering } from "../components/evidence";
import { callouts, phoneFrame } from "../components/frames";
import { pageHeader } from "../components/pageHeader";
import { depressionHome } from "../components/screens";
import { closingBand, configCard, designDecision, loopDiagram, nudgeBanner, proposedTag, rationaleDrawer, sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { onEnter, playOnEnter, reducedMotion } from "../lib/motion";
import type { Page } from "../lib/router";

export default function depression(): Page {
  resetEvidenceNumbering();
  const C = DEPRESSION;

  const header = pageHeader({
    kind: "depression",
    accent: "#8B5FBF",
    illustration: ASSETS.illustrations.depression,
    illustrationAlt: C.header.illustrationAlt,
    title: C.header.title,
    cohort: C.header.cohort,
    status: C.header.status,
    lede: C.header.lede,
    goals: C.goals,
  });

  const loop = h(
    "section",
    { class: "section", id: "loop" },
    h("div", { class: "wrap" }, sectionHead(C.loop.kicker, C.loop.heading, C.loop.body), loopDiagram(C.loop.nodes, { accent: "#8B5FBF" })),
  );

  const phone = phoneFrame(depressionHome(), { scale: 0.52, label: "Depression home: Good morning. Morning light window 24 of 30 minutes, 6 min remaining, Continue morning light. How are you feeling, five faces. Tonight: wind-down starts at 9:30 PM. Need support? in the header." });
  const co = callouts(phone, [
    { text: "Need support?: permanently in the header of every screen.", at: [0.82, 0.08], side: "right", y: 0.02 },
    { text: "One window, one bar, one action.", at: [0.5, 0.3], side: "left", y: 0.28 },
    { text: "Five faces, one tap. No streaks, no missed-day language.", at: [0.5, 0.58], side: "right", y: 0.56 },
  ]);
  const rules = h("ul", { class: "goal-chips", role: "list", "aria-label": "Rules of this configuration" }, ...C.home.rules.map((r) => h("li", { class: "goal-chip" }, r)));
  const home = h(
    "section",
    { class: "section", id: "home" },
    h("div", { class: "wrap" }, sectionHead(C.home.kicker, C.home.heading, C.home.body), co.stage, rules),
  );

  const win = windowScene();
  const two = twoWays();

  const config = h(
    "section",
    { class: "section", id: "config" },
    h("div", { class: "wrap decision-row" }, h("div", null, configCard(C.config), rationaleDrawer(C.rationale)), designDecision(C.decision)),
  );

  const el = h("div", { class: "page page--depression depression-page", style: "--accent:var(--accent-depression)" }, header, loop, home, win.el, two.el, config, closingBand("depression", C.closing, { designed: true }));
  return {
    title: C.title,
    el,
    mount: () => {
      onEnter(home, () => co.revealAll(), "top 55%");
      win.mount();
    },
  };
}

/** The opportunity window (spec §11, [B]). A sunrise moves across a bar from
 * WAKE to +2 HOURS; three checks resolve in sequence; only then the
 * notification appears. */
/** Progress (0–1 across the 120-minute window) at which each check resolves: 7:27, 7:33, 7:40. */
const CHECK_AT = [7 / 120, 13 / 120, 20 / 120];

function windowScene() {
  const C = DEPRESSION.window;
  const W = 900;
  const H = 160;
  const x0 = 60;
  const x1 = W - 60;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "window-svg", role: "img", "aria-label": "A bar from wake to two hours after, with a softly lit morning window and a marker for the current time." });
  svg.appendChild(s("rect", { x: x0, y: 90, width: x1 - x0, height: 14, rx: 7, fill: "var(--line)" }));
  const lit = s("rect", { x: x0, y: 90, width: 0, height: 14, rx: 7, fill: "#8B5FBF", opacity: 0.35 });
  svg.appendChild(lit);
  const sun = s("g", null, s("circle", { r: 16, fill: "var(--amber)" }));
  svg.appendChild(sun);
  const marker = s("line", { x1: x0, y1: 70, x2: x0, y2: 124, stroke: "var(--ink)", "stroke-width": 2 });
  const markerT = s("text", { x: x0, y: 140, "text-anchor": "middle", class: "axis-text", "font-weight": 600, fill: "var(--ink)" }, "7:20");
  svg.append(marker, markerT);
  svg.appendChild(s("text", { x: x0, y: 40, "text-anchor": "start", class: "axis-text", "font-weight": 700 }, C.start));
  svg.appendChild(s("text", { x: x1, y: 40, "text-anchor": "end", class: "axis-text", "font-weight": 700 }, C.end));

  const checks = C.checks.map((c) => h("li", null, h("span", { class: "mark", "aria-hidden": "true" }, ""), h("div", null, h("p", null, h("strong", null, c.text)), h("p", { class: "muted small" }, c.detail))));
  const checkList = h("ol", { class: "window-checks" }, ...checks);
  const notif = h("div", { class: "window-notification" }, nudgeBanner(C.notification.title, C.notification.body, { time: "7:40" }));
  const stage = h("div", { class: "window-stage" }, svg, h("div", { class: "two-col" }, checkList, notif));
  const wrap = h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), stage);
  const el = h("section", { class: "section section--tight", id: "window" }, wrap);

  function set(p: number) {
    const x = x0 + (x1 - x0) * p;
    lit.setAttribute("width", String(Math.max(0, x - x0)));
    sun.setAttribute("transform", `translate(${x} ${70 - Math.sin(p * Math.PI) * 30})`);
    marker.setAttribute("x1", String(x));
    marker.setAttribute("x2", String(x));
    markerT.setAttribute("x", String(x));
    const mins = Math.round(p * 120);
    const hh = 7 + Math.floor((20 + mins) / 60);
    const mm = (20 + mins) % 60;
    markerT.textContent = `${hh}:${String(mm).padStart(2, "0")}`;
    // Checks resolve early in the window (7:27, 7:33, 7:40) so the prompt goes
    // out while most of the window is still ahead; the marker then travels on.
    const n = CHECK_AT.filter((a) => p >= a).length;
    checks.forEach((li, i) => {
      const on = i < n;
      li.classList.toggle("is-on", on);
      (li.querySelector(".mark") as HTMLElement).textContent = on ? "✓" : "";
    });
    notif.classList.toggle("is-on", n >= 3);
  }
  function mount() {
    // Normal flow. The morning plays once on entry, slowly, and the segmented
    // control lets the reader revisit any moment.
    playOnEnter(set, {
      trigger: stage,
      durationMs: 7000,
      steps: [
        { label: "Wake", p: 0.02 },
        { label: "Check 1", p: CHECK_AT[0] },
        { label: "Check 2", p: CHECK_AT[1] },
        { label: "Prompt", p: CHECK_AT[2] },
        { label: "Window closes", p: 1 },
      ],
      rmDefault: CHECK_AT[2],
      controlLabel: C.stepperLabel,
      controlMount: wrap,
    });
  }
  return { el, mount };
}

/** The decision, two ways — same participant, same morning, toggled. */
function twoWays() {
  const C = DEPRESSION.decision2;
  const card = h("div", { class: "card two-ways-card", "aria-live": "polite" });
  const buttons = C.options.map((o, i) =>
    h("button", { type: "button", "aria-pressed": String(i === 0), onclick: () => show(o.id as "available" | "unavailable") }, o.label),
  );
  const toggle = h("div", { class: "segmented", role: "group", "aria-label": C.toggleLabel }, ...buttons);
  function show(id: "available" | "unavailable") {
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(C.options[i].id === id)));
    if (id === "available") {
      const A = C.available;
      card.replaceChildren(
        h("p", { class: "kicker" }, `${A.time} · ${A.state}`),
        nudgeBanner(A.notification.title, A.notification.body, { time: A.time }),
        h("p", { class: "muted", style: "margin-top:16px" }, A.note),
      );
    } else {
      const U = C.unavailable;
      card.replaceChildren(
        h("p", { class: "kicker" }, `${U.time} · ${U.state}`),
        h("p", { class: "pull" }, U.result),
        h("p", { class: "two-ways-rule" }, U.rule),
      );
    }
  }
  show("available");
  const el = h(
    "section",
    { class: "section", id: "two-ways" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading),
      h("div", { class: "two-ways" }, toggle, card),
      h("div", { class: "engine-proposed" }, proposedTag(C.proposed), h("p", { class: "small muted" }, C.proposedBody)),
    ),
  );
  return { el };
}

export { reducedMotion };
