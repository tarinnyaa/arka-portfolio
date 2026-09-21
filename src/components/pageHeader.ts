// Demographic page header: illustration, title with status tag, lede and goal spec.
import { h } from "../lib/dom";
import type { RibbonKind } from "./lightRibbon";
import { img } from "./assets";
import { goalSpec, statusTag, type GoalRow } from "./ui";

export function pageHeader(opts: {
  kind: RibbonKind;
  accent: string;
  illustration: string;
  illustrationAlt: string;
  title: string;
  cohort: string;
  status: "live" | "designed";
  lede: string;
  goals: GoalRow[];
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
        h(
          "h1",
          { class: "page-title-line" },
          h("span", { class: "page-title" }, opts.title),
          h("span", { class: "page-title-meta" }, h("span", { class: "cohort" }, opts.cohort), statusTag(opts.status)),
        ),
        h("p", { class: "lede" }, opts.lede),
        goalSpec(opts.goals),
      ),
      h(
        "div",
        { class: "page-header-art" },
        img(opts.illustration, opts.illustrationAlt, { w: "100%", h: "auto", class: "header-illustration", eager: true }),
      ),
    ),
  );
}
