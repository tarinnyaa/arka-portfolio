import { ABOUT } from "@content/about";
import { resetEvidenceNumbering } from "../components/evidence";
import { h } from "../lib/dom";
import type { Page } from "../lib/router";
import { chainScene } from "../scenes/chain";
import { closingScene } from "../scenes/closing";
import { configuratorScene } from "../scenes/configurator";
import { deliveryScene } from "../scenes/delivery";
import { eightFourteenScene } from "../scenes/eightFourteen";
import { engineScene } from "../scenes/engine";
import { heroScene } from "../scenes/hero";
import { judgeScene } from "../scenes/judge";
import { knowingScene } from "../scenes/knowing";
import { morphScene } from "../scenes/morph";
import { sensorScene } from "../scenes/sensor";
import { signalScene } from "../scenes/signal";

export default function about(): Page {
  resetEvidenceNumbering();
  const scenes = [
    heroScene(),
    chainScene(),
    judgeScene(),
    signalScene(),
    sensorScene(),
    deliveryScene(),
    knowingScene(),
    engineScene(),
    morphScene(),
    configuratorScene(),
    eightFourteenScene(),
    closingScene(),
  ];
  const el = h("div", { class: "page page--about" }, ...scenes.map((sc) => sc.el));
  return {
    title: ABOUT.title,
    el,
    mount: () => scenes.forEach((sc) => sc.mount()),
  };
}
