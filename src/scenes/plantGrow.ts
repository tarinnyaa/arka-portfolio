// Myopia "The plant" (spec §8, [B]). The one scroll driven sequence on the
// Myopia page: a pinned viewport in which scroll scrubs minutes 0 → 180 with
// the real traced art. A side column updates its explanation at each
// threshold. Narrow screens stack the thresholds; reduced motion gets the
// segmented control 0 · 15 · 40 · 65 · 85 · 100 · 150.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import { h } from "../lib/dom";
import { pinnedSequence } from "../lib/motion";

export function plantScene() {
  const C = MYOPIA.plant;
  const el = h("section", { class: "section section--flush", id: "plant" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body)));

  const seq = pinnedSequence({
    section: el,
    states: C.thresholds.length,
    restVh: 320,
    continuous: true,
    stepLabels: C.thresholds.map((t) => `${t.label}%`),
    stepPositions: C.thresholds.map((t) => t.p / 1.5),
    rmDefault: 1 / 1.5,
    stepDescribe: (i) => `${C.thresholds[i].title}. ${C.thresholds[i].text}`,
    controlLabel: C.stepperLabel,
    stackCaption: () => null,
    createStage,
  });

  let rafs: number[] = [];
  function createStage() {
    const { el: screen, plant } = myopiaPlantScreen({ fraction: 0 });
    const phone = phoneFrame(screen, { scale: 0.48, label: "The deployed Plant tab" });
    const steps = C.thresholds.map((t) =>
      h(
        "div",
        { class: "plant-step" },
        h("p", { class: "plant-step-title" }, h("span", { class: "plant-step-pct" }, `${t.label}%`), t.title),
        h("p", { class: "muted" }, t.text),
      ),
    );
    const side = h("div", { class: "plant-side" }, ...steps);
    const stage = h("div", { class: "seq-stage plant-stage" }, h("div", { class: "wrap plant-grid" }, h("div", { class: "plant-phone" }, phone), side));

    let lastP = 0;
    function apply(_i: number, p: number) {
      lastP = p;
      const fraction = p * 1.5; // 0 → 150 %
      plant.set(fraction);
      let idx = 0;
      C.thresholds.forEach((t, i) => {
        if (fraction + 1e-6 >= t.p) idx = i;
      });
      steps.forEach((st, i) => st.classList.toggle("is-on", i === idx));
    }
    // Tier-2 head rock is time based; keep it moving while at ≥150 % (motion only).
    if (!document.documentElement.classList.contains("reduce-motion")) {
      const tick = () => {
        if (lastP * 1.5 >= 1.5 - 1e-9) plant.set(lastP * 1.5);
        rafs.push(requestAnimationFrame(tick));
      };
      rafs.push(requestAnimationFrame(tick));
    }
    return { el: stage, apply };
  }

  return {
    el,
    mount: seq.mount,
    unmount: () => rafs.forEach((r) => cancelAnimationFrame(r)),
  };
}
