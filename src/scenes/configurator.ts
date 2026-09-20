// "Build an intervention" (spec §7, [B]) — the site's centrepiece. A
// researcher panel with live controls on the left; a participant phone that
// reconfigures live on the right. Fully keyboard-operable (native controls).
import { ABOUT } from "@content/about";
import { laptopFrame, phoneFrame } from "../components/frames";
import { DEFAULT_CONFIG, participantScreen, type Population, type ScreenConfig } from "../components/screens";
import { sectionHead } from "../components/ui";
import { h, id } from "../lib/dom";
import { reducedMotion } from "../lib/motion";

export function configuratorScene() {
  const C = ABOUT.configurator;
  let cfg: ScreenConfig = { ...DEFAULT_CONFIG.myopia };

  // Controls
  const popName = id("pop");
  const popGroup = h(
    "fieldset",
    { class: "cfgp-field" },
    h("legend", null, C.populationLabel),
    ...C.populations.map((p) => {
      const rid = id("popopt");
      return h(
        "div",
        { class: "cfgp-radio" },
        h("input", { type: "radio", name: popName, id: rid, value: p.id, checked: p.id === cfg.population, onchange: () => setPopulation(p.id as Population) }),
        h("label", { for: rid }, p.label),
      );
    }),
  );
  const behaviour = h("input", { type: "text", class: "cfgp-input", id: id("beh"), value: cfg.behaviour, readonly: true });
  const target = h("input", { type: "text", class: "cfgp-input", id: id("tgt"), value: cfg.target, readonly: true });
  const windowIn = h("input", { type: "text", class: "cfgp-input", id: id("win"), value: cfg.window, readonly: true });
  const fb: Record<string, HTMLInputElement> = {};
  const feedback = h(
    "fieldset",
    { class: "cfgp-field" },
    h("legend", null, C.feedbackLabel),
    ...C.feedback.map((f) => {
      const cid = id("fb");
      const input = h("input", { type: "checkbox", id: cid, onchange: () => update() }) as HTMLInputElement;
      fb[f.id] = input;
      return h("div", { class: "cfgp-check" }, input, h("label", { for: cid }, f.label));
    }),
  );
  const modeName = id("mode");
  const modeInputs: Record<string, HTMLInputElement> = {};
  const modeGroup = h(
    "fieldset",
    { class: "cfgp-field" },
    h("legend", null, C.modeLabel),
    ...C.modes.map((m) => {
      const rid = id("modeopt");
      const input = h("input", { type: "radio", name: modeName, id: rid, value: m.id, onchange: () => update() }) as HTMLInputElement;
      modeInputs[m.id] = input;
      return h("div", { class: "cfgp-radio" }, input, h("label", { for: rid }, m.label));
    }),
  );
  const log = h("ul", { class: "cfgp-log", "aria-live": "polite", "aria-label": C.changeLog });

  const panel = h(
    "form",
    { class: "cfgp-panel", onsubmit: (e: Event) => e.preventDefault() },
    h("p", { class: "cfgp-title" }, "Researcher portal · New study"),
    popGroup,
    h("div", { class: "cfgp-row" }, h("label", { for: behaviour.id }, C.behaviourLabel), behaviour),
    h("div", { class: "cfgp-row" }, h("label", { for: target.id }, C.targetLabel), target),
    h("div", { class: "cfgp-row" }, h("label", { for: windowIn.id }, C.windowLabel), windowIn),
    feedback,
    modeGroup,
  );
  const laptop = laptopFrame(panel, { class: "cfgp-laptop" });

  const phoneSlot = h("div", { class: "cfgp-phone" });
  let phone = phoneFrame(participantScreen(cfg), { scale: 0.62, label: "Participant phone" });
  phoneSlot.appendChild(phone);

  const el = h(
    "section",
    { class: "section configurator-section" },
    h("div", { class: "aperture aperture--arc" }),
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "cfgp-grid" }, h("div", { class: "cfgp-left" }, laptop, h("div", { class: "cfgp-log-wrap" }, h("p", { class: "kicker" }, C.changeLog), log)), phoneSlot),
      h("p", { class: "closing-line cfgp-closing" }, C.closing),
    ),
  );

  function syncControls() {
    fb.plant.checked = cfg.plant;
    fb.score.checked = cfg.score;
    fb.lumi.checked = cfg.lumi;
    fb.mood.checked = cfg.mood;
    fb.caregiver.checked = cfg.caregiver;
    behaviour.value = cfg.behaviour;
    target.value = cfg.target;
    windowIn.value = cfg.window;
    const mode = cfg.singleTask ? "single" : cfg.typeScale >= 1.4 ? "large" : "standard";
    Object.values(modeInputs).forEach((i) => (i.checked = i.value === mode));
  }

  function setPopulation(p: Population) {
    const prev = cfg;
    cfg = { ...DEFAULT_CONFIG[p] };
    syncControls();
    describe(prev, cfg, true);
    render();
  }

  function update() {
    const prev = cfg;
    const mode = Object.values(modeInputs).find((i) => i.checked)?.value ?? "standard";
    cfg = {
      ...cfg,
      plant: fb.plant.checked,
      score: fb.score.checked,
      lumi: fb.lumi.checked,
      mood: fb.mood.checked,
      caregiver: fb.caregiver.checked,
      singleTask: mode === "single",
      typeScale: mode === "large" ? 1.6 : mode === "single" ? 1.4 : 1.0,
    };
    describe(prev, cfg, false);
    render();
  }

  function describe(a: ScreenConfig, b: ScreenConfig, popChanged: boolean) {
    const lines: string[] = [];
    if (popChanged) lines.push(`Population → ${C.populations.find((p) => p.id === b.population)?.label}`);
    if (a.plant !== b.plant) lines.push(b.plant ? "Added the growing plant" : "Removed the plant");
    if (a.score !== b.score) lines.push(b.score ? "Added the light score" : "Removed the light score");
    if (a.lumi !== b.lumi) lines.push(b.lumi ? "Enabled Lumi" : "Removed Lumi");
    if (a.mood !== b.mood) lines.push(b.mood ? "Added the mood check-in" : "Removed the mood check-in");
    if (a.caregiver !== b.caregiver) lines.push(b.caregiver ? "Added caregiver sharing" : "Removed caregiver sharing");
    if (a.typeScale !== b.typeScale) lines.push(`Type scale ${a.typeScale.toFixed(1)} → ${b.typeScale.toFixed(1)}`);
    if (a.singleTask !== b.singleTask) lines.push(b.singleTask ? "Reduced the screen to one task" : "Restored the full home screen");
    if (a.target !== b.target) lines.push(`Daily target → ${b.target}`);
    if (b.population === "myopia" && popChanged) lines.push("Split parent and child views");
    log.replaceChildren(...lines.map((l) => h("li", null, l)));
  }

  function render() {
    const next = phoneFrame(participantScreen(cfg), { scale: 0.62, label: "Participant phone" });
    if (reducedMotion()) {
      phoneSlot.replaceChildren(next);
      phone = next;
      return;
    }
    next.classList.add("is-entering");
    phoneSlot.replaceChildren(next);
    requestAnimationFrame(() => next.classList.remove("is-entering"));
    phone = next;
  }

  return { el, mount: () => syncControls() };
}
