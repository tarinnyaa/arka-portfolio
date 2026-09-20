// Myopia "The unlock moment" — three static frames: wiggle, pop, and the
// "You did it!" overlay with one amber button. Static by design.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { flowerHead } from "../components/plant";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { h } from "../lib/dom";

export function unlockFrames() {
  const C = MYOPIA.unlock;
  // Frame 1 — wiggle: bud at 99 %, rotated
  const f1 = myopiaPlantScreen({ fraction: 0.93 });
  f1.plant.bud.setAttribute("transform", `${f1.plant.bud.getAttribute("transform") ?? ""} rotate(9)`);
  // Frame 2 — pop: flower at 100 %, head scaled 1.08
  const f2 = myopiaPlantScreen({ fraction: 1 });
  f2.plant.head.setAttribute("transform", `${f2.plant.head.getAttribute("transform") ?? ""} scale(1.08)`);
  // Frame 3 — overlay
  const f3 = myopiaPlantScreen({ fraction: 1 });
  f3.el.style.position = "relative";
  f3.el.appendChild(
    h(
      "div",
      { class: "unlock-overlay" },
      h(
        "div",
        { class: "unlock-card" },
        flowerHead(ART_SUNFLOWER, 120, "September sunflower"),
        h("h3", null, C.overlay.title),
        h("p", null, C.overlay.sub),
        h("span", { class: "unlock-btn" }, C.overlay.button),
      ),
    ),
  );
  const frames = [f1, f2, f3].map((f, i) =>
    h(
      "figure",
      { class: "unlock-frame" },
      phoneFrame(f.el, { scale: 0.5, label: `${C.frames[i].label}: ${C.frames[i].text}` }),
      h("figcaption", null, h("strong", null, C.frames[i].label), h("p", { class: "muted" }, C.frames[i].text)),
    ),
  );
  const el = h(
    "section",
    { class: "section", id: "unlock" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), h("div", { class: "unlock-frames" }, ...frames)),
  );
  return { el, mount: () => {} };
}
