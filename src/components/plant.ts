// The growing plant — geometry, thresholds, colours and celebration tiers
// match the deployed Myopia app exactly (spec §8: do not redesign).
//
//   viewBox 240×262 (+20 top pad) · soil at y=204 · full stem 138 units
//   events at 15 / 40 / 65 % (leaves), 85 % (bud), 100 % (flower)
//   tier 1 at ≥100 % (glow r52, 7 sparkles), tier 2 at ≥150 % (glow r72,
//   13 sparkles, head rocks ±4°, headline AMAZING!)
import { clamp, h, id, s } from "../lib/dom";
import type { FlowerArt } from "../lib/flowerArtTypes";
import { ART_BUD, ART_LEAF, ART_POT, ART_SUNFLOWER } from "../lib/flowerArt.core.gen";

export type MonthlyFlower = { month: number; id: string; name: string; color: string; artKey: string };

export const MONTHLY_FLOWERS: readonly MonthlyFlower[] = [
  { month: 1, id: "camellia", name: "Camellia", color: "#D84858", artKey: "camellia" },
  { month: 2, id: "tulip", name: "Tulip", color: "#D83868", artKey: "tulip" },
  { month: 3, id: "daffodil", name: "Daffodil", color: "#F8D838", artKey: "daffodil" },
  { month: 4, id: "cherry", name: "Cherry Blossom", color: "#F8C8D8", artKey: "cherry" },
  { month: 5, id: "rose", name: "Rose", color: "#E84848", artKey: "rose" },
  { month: 6, id: "orchid", name: "Orchid", color: "#9868B8", artKey: "orchid" },
  { month: 7, id: "morning-glory", name: "Morning Glory", color: "#5898D8", artKey: "morningGlory" },
  { month: 8, id: "hibiscus", name: "Hibiscus", color: "#F85838", artKey: "hibiscus" },
  { month: 9, id: "sunflower", name: "Sunflower", color: "#F8A818", artKey: "sunflower" },
  { month: 10, id: "marigold", name: "Marigold", color: "#F87818", artKey: "marigold" },
  { month: 11, id: "chrysanthemum", name: "Chrysanthemum", color: "#982828", artKey: "chrysanthemum" },
  { month: 12, id: "poinsettia", name: "Poinsettia", color: "#D82828", artKey: "poinsettia" },
];
export const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** Rainbow headline colours — six, rotating with the month. */
const RAINBOW = ["#C81E1E", "#C24E00", "#1B7A2E", "#1558B0", "#7A1FA2", "#0B6F75"];
export function rainbowLetters(text: string, month: number): { char: string; color: string }[] {
  const off = (month - 1) % RAINBOW.length;
  return Array.from(text.toUpperCase()).map((char, i) => ({ char, color: RAINBOW[(i + off) % RAINBOW.length] }));
}

// Geometry
const VB_W = 240;
const VB_H = 262;
const PAD_TOP = 20;
const CX = VB_W / 2;
const SOIL_Y = 204;
const MAX_STEM_H = 138;
const POT_W = 74;
const POT_H = POT_W * (735 / 849);
const POT_TOP = 194;
const POT_CY = POT_TOP + POT_H / 2;
const POT_BOTTOM_Y = POT_TOP + POT_H;
const STEM_GREEN = "#6B9A44";
const STEM_OUTLINE = "#531d06";
const STEM_W = 6;
const STEM_OUTLINE_W = (31 * 32) / 824;
const SOIL_BROWN = "#5C3A21";
const STEM_SOIL_TUCK = 2;
const FLOWER_HEAD_SIZE = 74;
const FLOWER_ANCHOR_DY = 6;
const EVENTS = { leaf1: 0.15, leaf2: 0.4, leaf3: 0.65, bud: 0.85, flower: 1.0 };
const FADE = 0.06;

const GLOW = { 1: { r: 52, gold: "#E8B84B", opacity: 0.5 }, 2: { r: 72, gold: "#F09A24", opacity: 0.62 } };
type Sparkle = { dx: number; dy: number; r: number; kind: "star" | "dot" };
const SPARKLES: Sparkle[] = [
  { dx: -46, dy: -26, r: 7, kind: "star" },
  { dx: 41, dy: -38, r: 5.5, kind: "star" },
  { dx: 52, dy: 2, r: 3.5, kind: "star" },
  { dx: -38, dy: 14, r: 2.6, kind: "dot" },
  { dx: 24, dy: -55, r: 2.2, kind: "dot" },
  { dx: -22, dy: -52, r: 4.5, kind: "star" },
  { dx: 47, dy: 26, r: 2.4, kind: "dot" },
];
const SPARKLES_T2: Sparkle[] = [
  { dx: -72, dy: -14, r: 5, kind: "star" },
  { dx: 74, dy: -28, r: 4.2, kind: "star" },
  { dx: -62, dy: 38, r: 3.2, kind: "dot" },
  { dx: 68, dy: 22, r: 5.5, kind: "star" },
  { dx: 10, dy: -74, r: 3.6, kind: "star" },
  { dx: -18, dy: 56, r: 2.8, kind: "dot" },
];
function starD(cx: number, cy: number, r: number) {
  const w = r * 0.22;
  return `M ${cx} ${cy - r} Q ${cx + w} ${cy - w} ${cx + r} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + r} Q ${cx - w} ${cy + w} ${cx - r} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - r} Z`;
}

const stemTipY = (f: number) => SOIL_Y - MAX_STEM_H * f;
function stemPath(f: number) {
  const tip = stemTipY(f);
  const baseY = SOIL_Y + STEM_SOIL_TUCK;
  const hgt = baseY - tip;
  if (hgt <= 0.5) return "";
  return `M ${CX} ${baseY} C ${CX - 4} ${baseY - hgt * 0.35}, ${CX + 4} ${baseY - hgt * 0.7}, ${CX} ${tip}`;
}

/** Lighten a #rrggbb by mixing toward white (bud highlight when tinted). */
function mixWhite(hex: string, t: number) {
  const hh = hex.replace("#", "");
  return `#${hexPart(hh, 0, t)}${hexPart(hh, 2, t)}${hexPart(hh, 4, t)}`;
}
function hexPart(hh: string, i: number, t: number) {
  const v = parseInt(hh.slice(i, i + 2), 16);
  return Math.round(v + (255 - v) * t).toString(16).padStart(2, "0");
}
function lum(hex: string) {
  const hh = hex.replace("#", "");
  return (0.2126 * parseInt(hh.slice(0, 2), 16) + 0.7152 * parseInt(hh.slice(2, 4), 16) + 0.0722 * parseInt(hh.slice(4, 6), 16)) / 255;
}

/** Traced asset normalised: content-box centre → (cx, cy), longest side → size. */
export function artGroup(
  art: FlowerArt,
  cx: number,
  cy: number,
  size: number,
  opts: { rotate?: number; mirrorX?: boolean; tint?: string; silhouette?: boolean } = {},
): SVGGElement {
  const [bx, by, bw, bh] = art.box;
  const k = size / Math.max(bw, bh);
  const t = `translate(${cx} ${cy}) rotate(${opts.rotate ?? 0}) scale(${opts.mirrorX ? -k : k} ${k}) translate(${-(bx + bw / 2)} ${-(by + bh / 2)})`;
  const g = s("g", { transform: t });
  for (const p of art.paths) {
    let fill = p.fill;
    if (opts.silhouette) fill = "#B8B1A6";
    else if (p.tint && opts.tint) fill = lum(p.fill) > 0.62 ? mixWhite(opts.tint, 0.35) : opts.tint;
    g.appendChild(s("path", { d: p.d, fill }));
  }
  return g;
}

export type PlantHandle = {
  el: HTMLElement;
  svg: SVGSVGElement;
  bud: SVGGElement;
  head: SVGGElement;
  /** fraction of target, 0–1.5+ */
  set: (fraction: number) => void;
  setFlower: (flower: MonthlyFlower, art: FlowerArt) => void;
  minutes: () => number;
};

export type PlantOpts = {
  target?: number;
  flower?: MonthlyFlower;
  art?: FlowerArt;
  /** Show the copy block beneath (count / headline / subline). */
  copy?: boolean;
  /** Static: no head rock. */
  still?: boolean;
  label?: string;
};

export function createPlant(opts: PlantOpts = {}): PlantHandle {
  const target = opts.target ?? 120;
  let flower = opts.flower ?? MONTHLY_FLOWERS[8];
  let art: FlowerArt = opts.art ?? ART_SUNFLOWER;
  let fraction = 0;

  const svg = s("svg", {
    viewBox: `0 ${-PAD_TOP} ${VB_W} ${VB_H + PAD_TOP}`,
    class: "plant-svg",
    role: "img",
    "aria-label": opts.label ?? "Growing plant",
  });
  const gid = id("glow");
  const defs = s("defs", null);
  const grad = s("radialGradient", { id: gid, cx: "50%", cy: "50%", r: "50%" });
  const stop0 = s("stop", { offset: "0" });
  const stop1 = s("stop", { offset: "0.6" });
  const stop2 = s("stop", { offset: "1", "stop-opacity": 0 });
  grad.append(stop0, stop1, stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  svg.appendChild(s("line", { x1: CX - 80, y1: POT_BOTTOM_Y + 3, x2: CX + 80, y2: POT_BOTTOM_Y + 3, stroke: "#E8E4DF", "stroke-width": 2, "stroke-linecap": "round" }));
  svg.appendChild(artGroup(ART_POT, CX, POT_CY, POT_W));
  svg.appendChild(s("ellipse", { cx: CX, cy: SOIL_Y, rx: 22, ry: 5.5, fill: SOIL_BROWN }));
  const stemOutline = s("path", { fill: "none", stroke: STEM_OUTLINE, "stroke-width": STEM_W + 2 * STEM_OUTLINE_W, "stroke-linecap": "round" });
  const stemFill = s("path", { fill: "none", stroke: STEM_GREEN, "stroke-width": STEM_W, "stroke-linecap": "round" });
  svg.append(stemOutline, stemFill);
  const collar = s("ellipse", { cx: CX, cy: SOIL_Y + 2.2, rx: 7, ry: 3.2, fill: SOIL_BROWN });
  svg.appendChild(collar);
  const seed = s("ellipse", { cx: CX, cy: SOIL_Y - 2, rx: 7, ry: 4.5, fill: "#C4873B", stroke: "#2C2825", "stroke-width": 1.5, transform: `rotate(-22 ${CX} ${SOIL_Y - 2})` });
  svg.appendChild(seed);

  const leaf1 = artGroup(ART_LEAF, CX - 19, stemTipY(EVENTS.leaf1) - 8, 31, { rotate: -38, mirrorX: true });
  const leaf2 = artGroup(ART_LEAF, CX + 19, stemTipY(EVENTS.leaf2) - 8, 31, { rotate: 38 });
  const leaf3 = artGroup(ART_LEAF, CX - 16, stemTipY(EVENTS.leaf3) - 7, 26, { rotate: -38, mirrorX: true });
  svg.append(leaf1, leaf2, leaf3);

  const budWrap = s("g", null);
  svg.appendChild(budWrap);
  const glow = s("circle", { fill: `url(#${gid})` });
  svg.appendChild(glow);
  const headWrap = s("g", null);
  svg.appendChild(headWrap);
  const sparkWrap = s("g", null);
  svg.appendChild(sparkWrap);

  // Copy block
  const count = h("p", { class: "plant-count" });
  const countLabel = h("p", { class: "plant-count-label" });
  // role="img": the letters are individually coloured spans, so the label
  // gives screen readers the word rather than a spelled-out string.
  const headline = h("p", { class: "plant-headline", role: "img", "aria-label": "Goal reached" });
  const subline = h("p", { class: "plant-subline" });
  const copy = h("div", { class: "plant-copy" }, count, countLabel, headline, subline);

  const el = h("div", { class: "plant" }, svg, opts.copy === false ? null : copy);

  function rebuildBud() {
    budWrap.replaceChildren(artGroup(ART_BUD, 0, 0, 38, { tint: flower.color }));
  }
  function rebuildHead() {
    headWrap.replaceChildren(artGroup(art, 0, 0, FLOWER_HEAD_SIZE));
  }
  rebuildBud();
  rebuildHead();

  function eventOpacity(ev: number, f: number) {
    if (f < ev) return 0;
    return clamp((f - ev) / FADE, 0, 1);
  }

  function set(fr: number) {
    fraction = Math.max(0, fr);
    const drawn = Math.min(1, fraction);
    const tipY = stemTipY(drawn);
    const showStem = fraction > 0.004;
    seed.style.display = fraction <= 0 ? "" : "none";
    stemOutline.setAttribute("d", showStem ? stemPath(drawn) : "");
    stemFill.setAttribute("d", showStem ? stemPath(drawn) : "");
    collar.style.display = showStem ? "" : "none";

    leaf1.setAttribute("opacity", String(eventOpacity(EVENTS.leaf1, drawn)));
    leaf2.setAttribute("opacity", String(eventOpacity(EVENTS.leaf2, drawn)));
    leaf3.setAttribute("opacity", String(eventOpacity(EVENTS.leaf3, drawn)));

    // Flower fades in over the last 6 % before target; bud hands over.
    const flowerO = drawn >= 1 ? 1 : drawn > 1 - FADE ? (drawn - (1 - FADE)) / FADE : 0;
    const budO = eventOpacity(EVENTS.bud, drawn) * (1 - flowerO);
    budWrap.setAttribute("opacity", String(budO));
    budWrap.setAttribute("transform", `translate(${CX} ${tipY - 12})`);
    budWrap.style.display = budO > 0 ? "" : "none";

    const headY = tipY - FLOWER_ANCHOR_DY;
    const petalScale = 0.4 + 0.6 * flowerO;
    const tier: 0 | 1 | 2 = fraction >= 1.5 - 1e-9 ? 2 : fraction >= 1 ? 1 : 0;
    const rock = tier === 2 && !opts.still ? Math.sin(performance.now() / 540) * 4 : 0;
    headWrap.setAttribute("opacity", String(flowerO));
    headWrap.style.display = flowerO > 0 ? "" : "none";
    headWrap.setAttribute("transform", `translate(${CX} ${headY}) rotate(${rock}) scale(${petalScale})`);

    if (tier > 0) {
      const g = GLOW[tier as 1 | 2];
      stop0.setAttribute("stop-color", g.gold);
      stop0.setAttribute("stop-opacity", String(g.opacity));
      stop1.setAttribute("stop-color", g.gold);
      stop1.setAttribute("stop-opacity", String(g.opacity * 0.45));
      stop2.setAttribute("stop-color", g.gold);
      glow.setAttribute("cx", String(CX));
      glow.setAttribute("cy", String(headY));
      glow.setAttribute("r", String(g.r));
      glow.style.display = "";
      const list = tier === 2 ? [...SPARKLES, ...SPARKLES_T2] : SPARKLES;
      sparkWrap.replaceChildren(
        ...list.map((sp) =>
          sp.kind === "star"
            ? s("path", { d: starD(CX + sp.dx, headY + sp.dy, sp.r), fill: g.gold })
            : s("circle", { cx: CX + sp.dx, cy: headY + sp.dy, r: sp.r, fill: g.gold }),
        ),
      );
      sparkWrap.style.display = "";
    } else {
      glow.style.display = "none";
      sparkWrap.style.display = "none";
    }

    // Copy
    const minutes = Math.round(fraction * target);
    if (tier === 0) {
      count.textContent = String(minutes);
      countLabel.textContent = "minutes outside today";
      count.style.display = "";
      countLabel.style.display = "";
      headline.style.display = "none";
      subline.textContent =
        minutes <= 0 ? "Time outdoors will get it growing." : `${target - minutes} more minutes to today's goal of ${target}.`;
    } else {
      count.style.display = "none";
      countLabel.style.display = "none";
      headline.style.display = "";
      const text = tier === 2 ? "Amazing!" : "Goal reached!";
      headline.setAttribute("aria-label", tier === 2 ? "Amazing" : "Goal reached");
      headline.replaceChildren(
        ...rainbowLetters(text, flower.month).map((l) => h("span", { style: `color:${l.color}`, "aria-hidden": "true" }, l.char)),
      );
      subline.textContent = tier === 2 ? `${minutes} minutes outside today!` : "Your plant is in full bloom for today.";
    }
    svg.setAttribute(
      "aria-label",
      opts.label ??
        (tier === 0
          ? `Growing plant, ${minutes} minutes outside today, target ${target}.`
          : `${MONTH_FULL[flower.month - 1]} ${flower.name.toLowerCase()} in full bloom, ${minutes} minutes outside today.`),
    );
  }

  function setFlower(f: MonthlyFlower, a: FlowerArt) {
    flower = f;
    art = a;
    rebuildBud();
    rebuildHead();
    set(fraction);
  }

  set(0);
  return { el, svg, bud: budWrap, head: headWrap, set, setFlower, minutes: () => Math.round(fraction * target) };
}

/** A small whole plant in bloom (garden thumbnails, 8:14 phones). */
export function miniPlant(art: FlowerArt, opts: { silhouette?: boolean; size?: number; label?: string } = {}): SVGSVGElement {
  const size = opts.size ?? 56;
  const svg = s("svg", { viewBox: "40 40 160 200", width: size, height: size * 1.25, role: "img", "aria-label": opts.label ?? "flower" });
  svg.appendChild(artGroup(ART_POT, CX, POT_CY, POT_W, { silhouette: opts.silhouette }));
  svg.appendChild(s("ellipse", { cx: CX, cy: SOIL_Y, rx: 22, ry: 5.5, fill: opts.silhouette ? "#B8B1A6" : SOIL_BROWN }));
  const d = stemPath(1);
  svg.appendChild(s("path", { d, fill: "none", stroke: opts.silhouette ? "#B8B1A6" : STEM_OUTLINE, "stroke-width": STEM_W + 2 * STEM_OUTLINE_W, "stroke-linecap": "round" }));
  svg.appendChild(s("path", { d, fill: "none", stroke: opts.silhouette ? "#CFC9BF" : STEM_GREEN, "stroke-width": STEM_W, "stroke-linecap": "round" }));
  svg.appendChild(artGroup(ART_LEAF, CX - 19, stemTipY(EVENTS.leaf1) - 8, 31, { rotate: -38, mirrorX: true, silhouette: opts.silhouette }));
  svg.appendChild(artGroup(ART_LEAF, CX + 19, stemTipY(EVENTS.leaf2) - 8, 31, { rotate: 38, silhouette: opts.silhouette }));
  svg.appendChild(artGroup(art, CX, stemTipY(1) - FLOWER_ANCHOR_DY, FLOWER_HEAD_SIZE, { silhouette: opts.silhouette }));
  if (opts.silhouette) svg.setAttribute("opacity", "0.55");
  return svg;
}

/** Flower head alone (specimen cards, unlock overlay). */
export function flowerHead(art: FlowerArt, size = 120, label = "flower"): SVGSVGElement {
  const svg = s("svg", { viewBox: "0 0 100 100", width: size, height: size, role: "img", "aria-label": label });
  svg.appendChild(artGroup(art, 50, 50, 96));
  return svg;
}

export function plantGeometry() {
  return { VB_W, VB_H, PAD_TOP, CX, SOIL_Y, stemTipY, POT_BOTTOM_Y };
}
