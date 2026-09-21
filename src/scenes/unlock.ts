// Myopia unlock moment — three frames. Show the animation; do not describe it.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { flowerHead } from "../components/plant";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { h } from "../lib/dom";

export function unlockFrames() {
  const C = MYOPIA.unlock;
  const f1 = myopiaPlantScreen({ fraction: 0.93 });
  f1.plant.bud.setAttribute("transform", `${f1.plant.bud.getAttribute("transform") ?? ""} rotate(9)`);
  const f2 = myopiaPlantScreen({ fraction: 1 });
  f2.plant.head.setAttribute("transform", `${f2.plant.head.getAttribute("transform") ?? ""} scale(1.08)`);
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
    h("figure", { class: "unlock-frame" }, phoneFrame(f.el, { scale: 0.48, label: C.frames[i].label })),
  );
  const el = h(
    "section",
    { class: "section", id: "unlock" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body), h("div", { class: "unlock-frames" }, ...frames)),
  );
  return { el, mount: () => {} };
}
