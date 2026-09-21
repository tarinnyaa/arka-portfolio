// Page ending in four bounded parts:
//   A  One signal, five experiences. Cream, static, entrance only.
//   B  Convergence. The one cinematic scroll transition: cream → navy, phone
//      UIs fade to outlines, a light source appears, five thin paths extend
//      from it out to the phones, then resolve into the ARKA sunrise mark.
//      One sticky viewport, one bounded wrapper, about one viewport long.
//   C  Conclusion. Sticky released. Normal flow navy section.
//   D  Footer is rendered by the app shell.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { sunriseMark } from "../components/icons";
import { eightFourteenScreen, type Population } from "../components/screens";
import { clamp, h, lerp, s } from "../lib/dom";
import { pinnedSequence, seg } from "../lib/motion";

const POP_COLOUR: Record<Population, string> = {
  myopia: "#6BA368",
  healthy: "#4F7FB8",
  glaucoma: "#7C8AA0",
  depression: "#8B7FB5",
  stroke: "#4E9A9A",
};

export function endingScene() {
  const S = ABOUT.signal;
  const K = ABOUT.conclusion;

  // ── A: one signal, five experiences
  const phonesA = S.phones.map((p) => {
    const key = p.key as Population;
    const phone = phoneFrame(eightFourteenScreen(key, p.outcome), { scale: 0.36, label: `${p.name} phone at 8:14 AM: ${p.outcome}` });
    return h(
      "figure",
      { class: "sg-phone", "data-enter": true },
      phone,
      h("figcaption", null, h("span", { class: "sg-name" }, p.name), h("span", { class: "sg-outcome" }, p.outcome), h("span", { class: `sg-status mono-label${p.status === "live" ? " is-live" : ""}` }, p.status === "live" ? S.live : S.proposed)),
    );
  });
  const sectionA = h(
    "section",
    { class: "section sg-section", id: "signal" },
    h(
      "div",
      { class: "wrap" },
      h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, S.kicker), h("h2", null, S.heading), h("p", { class: "lede" }, S.body)),
      h("div", { class: "sg-row" }, ...phonesA),
      h("p", { class: "sg-closing display", "data-enter": true }, S.closing),
    ),
  );

  // ── B: convergence (one continuous sticky sequence)
  const sectionB = h("section", { class: "section section--flush cv-section", "aria-label": S.convergenceLabel });
  const seq = pinnedSequence({
    section: sectionB,
    states: 1,
    restVh: 160,
    continuous: true,
    dark: true,
    stepLabels: ["Five phones", "One light signal", "ARKA"],
    controlLabel: "Convergence",
    createStage: createConvergence,
  });

  function createConvergence() {
    const W = 1100;
    const H = 640;
    const svg = s("svg", { class: "cv-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": S.convergenceAlt });
    const xs = S.phones.map((_, i) => 130 + i * 210);
    const PH_W = 120;
    const PH_H = 240;
    const PH_Y = 60;
    const LIGHT = { x: W / 2, y: 520 };
    const outlines = xs.map((x) => s("rect", { x: x - PH_W / 2, y: PH_Y, width: PH_W, height: PH_H, rx: 18, fill: "none", stroke: "rgba(250,248,245,0.55)", "stroke-width": 1.5 }));
    const paths = xs.map((x, i) =>
      s("path", {
        d: `M ${LIGHT.x} ${LIGHT.y} C ${LIGHT.x} ${LIGHT.y - 120}, ${x} ${PH_Y + PH_H + 120}, ${x} ${PH_Y + PH_H + 4}`,
        fill: "none",
        stroke: POP_COLOUR[S.phones[i].key as Population],
        "stroke-width": 1.5,
        "stroke-linecap": "round",
      }),
    );
    const glow = s("circle", { cx: LIGHT.x, cy: LIGHT.y, r: 40, fill: "url(#cvGlow)" });
    const core = s("circle", { cx: LIGHT.x, cy: LIGHT.y, r: 6, fill: "#F3C766" });
    const defs = s("defs", null);
    const grad = s("radialGradient", { id: "cvGlow" });
    grad.append(s("stop", { offset: "0", "stop-color": "#E8A825", "stop-opacity": 0.55 }), s("stop", { offset: "1", "stop-color": "#E8A825", "stop-opacity": 0 }));
    defs.appendChild(grad);
    const label = s("text", { x: LIGHT.x, y: LIGHT.y + 48, "text-anchor": "middle", class: "cv-label" }, S.convergenceLabel.toUpperCase());
    svg.append(defs, ...outlines, ...paths, glow, core, label);

    // Phone UIs (HTML) laid over the outlines in the same geometry
    const uis = h(
      "div",
      { class: "cv-uis", "aria-hidden": "true" },
      ...S.phones.map((p, i) => {
        const phone = phoneFrame(eightFourteenScreen(p.key as Population, p.outcome), { scale: 0.28 });
        return h("div", { class: "cv-ui", style: `--x:${(xs[i] / W) * 100}%;--y:${(PH_Y / H) * 100}%` }, phone);
      }),
    );
    const mark = h("div", { class: "cv-mark", "aria-hidden": "true" }, sunriseMark(120, "#E8A825"));
    const canvas = h("div", { class: "cv-canvas" }, svg, uis, mark);
    const el = h("div", { class: "seq-stage cv-stage" }, canvas);

    let lens: number[] = [];
    const op = (e: Element, v: number) => ((e as HTMLElement).style.opacity = String(clamp(v, 0, 1)));

    function apply(_i: number, p: number) {
      if (!lens.length) {
        lens = paths.map((pa) => {
          const L = pa.getTotalLength();
          pa.style.strokeDasharray = `${L}`;
          return L;
        });
      }
      // 0.00–0.20 background cream → navy, UIs fade
      // 0.20–0.35 outlines remain; light appears
      // 0.35–0.65 paths extend from the light to the phones; label
      // 0.65–0.85 outlines and paths fade
      // 0.80–1.00 light resolves into the sunrise mark
      const bg = seg(p, 0, 0.2);
      el.style.setProperty("--bg", String(bg));
      op(uis, 1 - seg(p, 0.05, 0.22));
      const outl = seg(p, 0.1, 0.25) * (1 - seg(p, 0.65, 0.85));
      outlines.forEach((o) => op(o, outl));
      const light = seg(p, 0.22, 0.34) * (1 - seg(p, 0.85, 0.95));
      op(glow, light);
      op(core, light);
      paths.forEach((pa, i) => {
        const draw = seg(p, 0.35 + i * 0.03, 0.62 + i * 0.03);
        pa.style.strokeDashoffset = `${lens[i] * (1 - draw)}`;
        op(pa, (draw > 0 ? 1 : 0) * (1 - seg(p, 0.65, 0.82)));
      });
      op(label, seg(p, 0.5, 0.62) * (1 - seg(p, 0.7, 0.82)));
      const m = seg(p, 0.82, 1);
      op(mark, m);
      mark.style.transform = `translate(-50%, -50%) scale(${lerp(0.4, 1, m)})`;
    }
    return { el, apply };
  }

  // ── C: conclusion
  const sectionC = h(
    "section",
    { class: "section cc-section", "aria-labelledby": "conclusion-h" },
    h(
      "div",
      { class: "wrap narrow cc-inner", "data-enter": true },
      h("div", { class: "cc-mark" }, sunriseMark(64, "#E8A825")),
      h("p", { class: "cc-brand" }, K.brand.split("").join(" ")),
      h("h2", { id: "conclusion-h", class: "cc-line" }, K.line),
      h("p", { class: "cc-sub" }, K.sub),
      h("p", { class: "cc-status mono-label" }, K.status),
    ),
  );

  const el = h("div", { class: "ending" }, sectionA, sectionB, sectionC);
  return { el, mount: seq.mount };
}
