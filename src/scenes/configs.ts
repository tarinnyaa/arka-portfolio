// "One platform. Different needs." Two column sticky layout: one stationary
// phone at left, one stationary text region at right whose contents change
// across five discrete states. The phone frame never moves; only the
// interface inside crossfades, and never with two complete screens visible.
// After state 05 the sticky container ends and a normal flow conclusion
// follows with generous whitespace.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { DEFAULT_CONFIG, participantScreen, type Population } from "../components/screens";
import { clamp, h, lerp } from "../lib/dom";
import { pinnedSequence, seg } from "../lib/motion";

export function configsScene() {
  const C = ABOUT.configs;
  const section = h(
    "section",
    { class: "section section--flush cf-section", id: "configs" },
    h(
      "div",
      { class: "wrap" },
      h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body)),
    ),
  );

  const seq = pinnedSequence({
    section,
    states: C.states.length,
    restVh: 80,
    transVh: 35,
    stepLabels: C.states.map((st) => st.who),
    stepDescribe: (i) => C.states[i].title,
    controlLabel: "Choose a configuration",
    stackCaption: () => null,
    createStage,
  });

  function createStage() {
    // One phone, five screens stacked in the same box. Only one is visible.
    const screens = C.states.map((st) => {
      const cfg = DEFAULT_CONFIG[st.key as Population];
      const scr = participantScreen(cfg);
      scr.classList.add("cf-screen");
      scr.style.setProperty("--ts", String(cfg.typeScale));
      return scr;
    });
    const stack = h("div", { class: "cf-screens" }, ...screens);
    const phone = phoneFrame(stack, { scale: 0.5, label: "The ARKA participant phone. The interface inside changes with the configuration." });
    const density = h("p", { class: "cf-density mono-label" }, h("span", null, `${C.densityLabel}: `), h("strong", { class: "cf-density-v" }, C.states[0].density));

    // One text region, five panels in the same box.
    const panels = C.states.map((st, i) =>
      h(
        "div",
        { class: "cf-panel" },
        h("p", { class: "cf-index mono-label" }, `${String(i + 1).padStart(2, "0")} / ${String(C.states.length).padStart(2, "0")}`, h("span", { class: "cf-who" }, st.who)),
        h("h3", { class: "cf-title" }, st.title),
        h("p", { class: "cf-body" }, st.body),
        h("ul", { class: "cf-tags", "aria-label": "Design principles" }, ...st.tags.map((t) => h("li", { class: "tag" }, t))),
      ),
    );
    const text = h("div", { class: "cf-text" }, ...panels);
    const dots = C.states.map((st) => h("span", { class: "cf-dot", "data-key": st.key }));
    const indicator = h("div", { class: "cf-indicator", "aria-hidden": "true" }, ...dots);
    const el = h("div", { class: "seq-stage cf-stage" }, h("div", { class: "cf-grid" }, h("div", { class: "cf-phone" }, phone, density), text), indicator);

    function apply(i: number, t: number) {
      // Crossfade: outgoing fully gone by t = 0.45, incoming starts at 0.55.
      const out = 1 - seg(t, 0, 0.45);
      const inn = seg(t, 0.55, 1);
      screens.forEach((scr, k) => {
        let o = 0;
        if (k === i) o = out;
        else if (k === i + 1) o = inn;
        scr.style.opacity = String(clamp(o, 0, 1));
        scr.style.visibility = o > 0.001 ? "visible" : "hidden";
      });
      panels.forEach((p, k) => {
        let o = 0;
        let y = 0;
        if (k === i) {
          o = out;
          y = lerp(0, -8, 1 - out);
        } else if (k === i + 1) {
          o = inn;
          y = lerp(8, 0, inn);
        }
        p.style.opacity = String(clamp(o, 0, 1));
        p.style.transform = `translateY(${y}px)`;
        p.style.visibility = o > 0.001 ? "visible" : "hidden";
        p.setAttribute("aria-hidden", String(o < 0.5));
      });
      const active = t > 0.5 ? i + 1 : i;
      dots.forEach((d, k) => d.classList.toggle("is-on", k === active));
      const dv = density.querySelector(".cf-density-v");
      if (dv) dv.textContent = C.states[Math.min(active, C.states.length - 1)].density;
    }
    return { el, apply };
  }

  const principle = h(
    "section",
    { class: "section cf-principle", "aria-labelledby": "principle-h" },
    h(
      "div",
      { class: "wrap narrow", "data-enter": true },
      h("span", { class: "kicker" }, C.principle.kicker),
      h("h2", { id: "principle-h" }, C.principle.heading),
      h("p", { class: "lede" }, C.principle.body),
    ),
  );

  const el = h("div", { class: "cf-block" }, section, principle);
  return { el, mount: seq.mount };
}
