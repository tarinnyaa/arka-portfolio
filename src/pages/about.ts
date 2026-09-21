import { ABOUT } from "@content/about";
import { bottomNav } from "../components/chrome";
import { resetEvidenceNumbering } from "../components/evidence";
import { h } from "../lib/dom";
import type { Page } from "../lib/router";
import { buildScene } from "../scenes/build";
import { chainScene } from "../scenes/chain";
import { configsScene } from "../scenes/configs";
import { endingScene } from "../scenes/ending";
import { gapScene } from "../scenes/gap";
import { heroScene } from "../scenes/hero";
import { meaningScene } from "../scenes/meaning";
import { sensorScene } from "../scenes/sensor";
import { timingScene } from "../scenes/timing";

// Narrative order: why light matters → how ARKA measures it → how it makes
// sense of it → the gap it closes → why timing matters → one platform,
// different people → the researcher configures → five experiences → ARKA.
export default function about(): Page {
  resetEvidenceNumbering();
  const scenes = [heroScene(), chainScene(), sensorScene(), meaningScene(), gapScene(), timingScene(), configsScene(), buildScene(), endingScene()];
  const el = h("div", { class: "page page--about" }, ...scenes.map((sc) => sc.el), bottomNav("about"));
  return {
    title: ABOUT.title,
    el,
    mount: () => scenes.forEach((sc) => sc.mount()),
  };
}
