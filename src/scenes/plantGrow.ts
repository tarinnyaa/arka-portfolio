// Myopia "The plant" (spec §8, [B]). Pinned ~400vh. Scroll scrubs minutes
// 0 → 180 with the real traced art. A side column updates its explanation at
// each threshold. Reduced motion: segmented control 0 · 15 · 40 · 65 · 85 ·
// 100 · 150.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import { h } from "../lib/dom";
import { scrub } from "../lib/motion";

export function plantScene() {
  const C = MYOPIA.plant;
  const { el: screen, plant } = myopiaPlantScreen({ fraction: 0 });
  const phone = phoneFrame(screen, { scale: 0.62, label: "The deployed Plant tab" });
  const steps = C.thresholds.map((t) =>
    h(
      "div",
      { class: "plant-step" },
      h("p", { class: "plant-step-title" }, h("span", { class: "plant-step-pct" }, `${t.label}%`), t.title),
      h("p", { class: "muted" }, t.text),
    ),
  );
  const side = h("div", { class: "plant-side" }, ...steps);
  const pin = h("div", { class: "plant-pin" }, h("div", { class: "wrap plant-grid" }, h("div", { class: "plant-phone" }, phone), side));
  const el = h(
    "section",
    { class: "section section--tight", id: "plant" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body)),
    pin,
  );

  function set(p: number) {
    const fraction = p * 1.5; // 0 → 150 %
    plant.set(fraction);
    let idx = 0;
    C.thresholds.forEach((t, i) => {
      if (fraction + 1e-6 >= t.p) idx = i;
    });
    steps.forEach((st, i) => st.classList.toggle("is-on", i === idx));
  }

  // Tier-2 head rock is time-based; keep it moving while at ≥150 % (motion only).
  let raf = 0;
  let lastP = 0;
  function tick() {
    if (lastP * 1.5 >= 1.5 - 1e-9 && !document.documentElement.classList.contains("reduce-motion")) plant.set(lastP * 1.5);
    raf = requestAnimationFrame(tick);
  }

  function mount() {
    scrub(
      {
        set: (p) => {
          lastP = p;
          set(p);
        },
      },
      {
        trigger: pin,
        pin,
        end: "+=400%",
        steps: C.thresholds.map((t) => ({ label: t.label, p: t.p / 1.5, describe: `${t.title}. ${t.text}` })),
        rmDefault: 1,
        controlLabel: C.stepperLabel,
      },
    );
    if (!document.documentElement.classList.contains("reduce-motion")) raf = requestAnimationFrame(tick);
  }
  return {
    el,
    mount,
    unmount: () => cancelAnimationFrame(raf),
  };
}
