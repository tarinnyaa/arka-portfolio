import { MYOPIA } from "@content/myopia";
import { ASSETS } from "@content/shared";
import { resetEvidenceNumbering } from "../components/evidence";
import { callouts, phoneFrame } from "../components/frames";
import { pageHeader } from "../components/pageHeader";
import { myopiaHome, myopiaPlantScreen } from "../components/screens";
import { closingBand, configCard, designDecision, loopDiagram, rationaleDrawer, sectionHead } from "../components/ui";
import { h } from "../lib/dom";
import { onEnter } from "../lib/motion";
import type { Page } from "../lib/router";
import { gardenScene } from "../scenes/garden";
import { plantScene } from "../scenes/plantGrow";
import { seedFollow } from "../scenes/seedFollow";
import { unlockFrames } from "../scenes/unlock";

export default function myopia(): Page {
  resetEvidenceNumbering();
  const C = MYOPIA;
  const accent = "var(--accent-myopia)";

  const header = pageHeader({
    kind: "myopia",
    accent: "#6BA368",
    illustration: ASSETS.illustrations.myopia,
    illustrationAlt: C.header.illustrationAlt,
    title: C.header.title,
    cohort: C.header.cohort,
    status: C.header.status,
    ribbonLabel: C.header.ribbonLabel,
    lede: C.header.lede,
    goals: C.goals,
  });

  // The loop
  const loop = h(
    "section",
    { class: "section", id: "loop" },
    h("div", { class: "wrap" }, sectionHead(C.loop.kicker, C.loop.heading, C.loop.body), loopDiagram(C.loop.nodes, { accent: "#6BA368" })),
  );

  // Parent's view
  const parentPhone = phoneFrame(myopiaHome(), { scale: 0.62, label: "The deployed Home tab: sync banner, gauge at 78 of 120, coaching line." });
  const parentCallouts = callouts(parentPhone, [
    { text: C.parent.callouts[0], at: [0.5, 0.12], side: "right", y: 0.06 },
    { text: C.parent.callouts[1], at: [0.5, 0.36], side: "left", y: 0.3 },
    { text: C.parent.callouts[2], at: [0.5, 0.62], side: "right", y: 0.58 },
  ]);
  const parent = h(
    "section",
    { class: "section", id: "parent" },
    h("div", { class: "wrap" }, sectionHead(C.parent.kicker, C.parent.heading, C.parent.body), parentCallouts.stage),
  );

  const plant = plantScene();
  const garden = gardenScene();
  const unlock = unlockFrames();

  const arms = h(
    "section",
    { class: "section", id: "arms" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.arms.kicker, C.arms.heading, C.arms.body),
      h(
        "div",
        { class: "arms-grid" },
        h(
          "div",
          { class: "card" },
          h("h3", null, C.arms.intervention.title),
          h("ul", null, ...C.arms.intervention.items.map((i) => h("li", null, i))),
          h("div", { class: "phone-center", style: "margin-top:16px" }, phoneFrame(myopiaHome(), { scale: 0.42, label: "Intervention arm home screen" })),
        ),
        h(
          "div",
          { class: "card card--flat" },
          h("h3", null, C.arms.comparison.title),
          h("ul", null, ...C.arms.comparison.items.map((i) => h("li", null, i))),
          h("div", { class: "phone-center", style: "margin-top:16px" }, phoneFrame(myopiaHome({ comparison: true }), { scale: 0.42, label: "Comparison arm home screen: minutes only" })),
        ),
      ),
    ),
  );

  const config = h(
    "section",
    { class: "section", id: "config" },
    h(
      "div",
      { class: "wrap decision-row" },
      h("div", null, configCard(C.config), rationaleDrawer(C.rationale)),
      designDecision(C.decision),
    ),
  );

  const seed = seedFollow(header, [loop, parent, plant.el, garden.el]);

  const el = h(
    "div",
    { class: "page page--myopia", style: `--accent:${accent}` },
    header,
    seed.el,
    loop,
    parent,
    plant.el,
    garden.el,
    unlock.el,
    arms,
    config,
    closingBand("myopia", C.closing),
  );

  return {
    title: C.title,
    el,
    mount: () => {
      onEnter(parent, () => parentCallouts.revealAll(), "top 60%");
      plant.mount();
      garden.mount();
      unlock.mount();
      seed.mount();
    },
  };
}

export { myopiaPlantScreen };
