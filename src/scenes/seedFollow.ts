// Myopia "A seed follows you" [C]. A small pot beside the heading; the plant
// grows as the reader descends: seed at the introduction, stem at the
// evidence, leaves at the parent dashboard, bud at the intervention, bloom at
// the plant section. Static (bloom) under reduced motion.
import { createPlant } from "../components/plant";
import { h } from "../lib/dom";
import { ScrollTrigger, reducedMotion } from "../lib/motion";

export function seedFollow(_header: HTMLElement, anchors: HTMLElement[]) {
  const plant = createPlant({ copy: false, label: "A small plant that grows as you read" });
  const el = h("div", { class: "seed-follow", "aria-hidden": "true" }, plant.el);
  const stages = [0, 0.15, 0.4, 0.85, 1];
  function mount() {
    if (reducedMotion() || window.innerWidth < 1400) {
      plant.set(1);
      el.classList.add("is-static");
      return;
    }
    plant.set(0);
    anchors.forEach((a, i) => {
      ScrollTrigger.create({
        trigger: a,
        start: "top 60%",
        end: "bottom 60%",
        onEnter: () => plant.set(stages[Math.min(i + 1, stages.length - 1)]),
        onLeaveBack: () => plant.set(stages[i]),
      });
    });
    ScrollTrigger.create({
      trigger: anchors[anchors.length - 1],
      start: "bottom 40%",
      onEnter: () => el.classList.add("is-hidden"),
      onLeaveBack: () => el.classList.remove("is-hidden"),
    });
  }
  return { el, mount };
}
