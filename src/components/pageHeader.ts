// Demographic page header: illustration, title, cohort, StatusRibbon, light
// ribbon, lede and GoalChips.
import { h } from "../lib/dom";
import { img } from "./assets";
import { lightRibbon, type RibbonKind } from "./lightRibbon";
import { goalChips, statusRibbon } from "./ui";

export function pageHeader(opts: {
  kind: RibbonKind;
  accent: string;
  illustration: string;
  illustrationAlt: string;
  title: string;
  cohort: string;
  status: "live" | "designed";
  ribbonLabel: string;
  lede: string;
  goals: { text: string; refs: string[] }[];
}): HTMLElement {
  return h(
    "header",
    { class: `page-header page-header--${opts.kind}`, style: `--accent:${opts.accent}` },
    h("div", { class: "aperture aperture--right" }),
    h(
      "div",
      { class: "wrap page-header-grid" },
      h(
        "div",
        { class: "page-header-text" },
        statusRibbon(opts.status),
        h("h1", null, opts.title, h("span", { class: "cohort" }, " · ", opts.cohort)),
        h("p", { class: "lede" }, opts.lede),
        h("div", { class: "ribbon-wrap" }, lightRibbon(opts.kind, opts.ribbonLabel, opts.accent)),
        goalChips(opts.goals),
      ),
      h(
        "div",
        { class: "page-header-art" },
        img(opts.illustration, opts.illustrationAlt, { w: "100%", h: "auto", class: "header-illustration", eager: true }),
      ),
    ),
  );
}
