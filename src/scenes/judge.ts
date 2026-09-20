// "And we're bad at judging it" (spec §7, [B]). Two scenes side by side; the
// visitor drags a guess slider; the answer reveals with the second circle
// expanding to twenty times the area. Keyboard-operable (range input);
// reduced motion shows the answer with a reveal button.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img } from "../components/assets";
import { sectionHead } from "../components/ui";
import { fmt, h, s } from "../lib/dom";
import { reducedMotion } from "../lib/motion";

export function judgeScene() {
  const C = ABOUT.judge;
  const ratio = C.right.lux / C.left.lux; // 20
  const rSmall = 22;
  const rLarge = rSmall * Math.sqrt(ratio); // 20× area

  const slider = h("input", {
    type: "range",
    min: "0",
    max: "100",
    value: "50",
    class: "judge-slider",
    id: "judge-slider",
    "aria-valuetext": "Equal",
  }) as HTMLInputElement;
  const sliderLabel = h("label", { for: "judge-slider", class: "judge-slider-label" }, C.sliderLabel);
  const ends = h("div", { class: "judge-ends", "aria-hidden": "true" }, h("span", null, C.left.name), h("span", null, "Equal"), h("span", null, C.right.name));

  const circleL = s("circle", { cx: 100, cy: 100, r: rSmall, fill: "var(--amber)", class: "judge-circle" });
  const circleR = s("circle", { cx: 100, cy: 100, r: rSmall, fill: "var(--amber)", class: "judge-circle" });
  const luxL = s("text", { x: 100, y: 185, "text-anchor": "middle", class: "judge-lux" }, `~${fmt(C.left.lux)} lux`);
  const luxR = s("text", { x: 100, y: 185, "text-anchor": "middle", class: "judge-lux" }, `~${fmt(C.right.lux)} lux`);
  const svgL = s("svg", { viewBox: "0 0 200 200", class: "judge-svg", role: "img", "aria-label": `${C.left.name}: about ${fmt(C.left.lux)} lux` }, circleL, luxL);
  const svgR = s("svg", { viewBox: "0 0 200 200", class: "judge-svg", role: "img", "aria-label": `${C.right.name}: about ${fmt(C.right.lux)} lux` }, circleR, luxR);

  const result = h("p", { class: "judge-result", "aria-live": "polite" });
  const resultBody = h("p", { class: "judge-result-body" });
  const punch = h("p", { class: "pull judge-punch" }, C.punch);
  const revealBtn = h("button", { type: "button", class: "btn", onclick: () => reveal() }, C.reveal);
  const note = h("p", { class: "note" }, C.note);

  const scene = (side: "left" | "right", svg: SVGSVGElement) =>
    h(
      "figure",
      { class: `judge-scene judge-scene--${side}` },
      img(side === "left" ? ASSETS.illustrations.luxOffice : ASSETS.illustrations.luxOutdoors, side === "left" ? C.left.alt : C.right.alt, { w: "100%", h: "auto", class: "judge-img" }),
      h("figcaption", null, side === "left" ? C.left.name : C.right.name),
      h("div", { class: "judge-measure" }, svg),
    );

  const el = h(
    "section",
    { class: "section judge-section" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "judge-grid" }, scene("left", svgL), scene("right", svgR)),
      h("div", { class: "judge-controls" }, sliderLabel, slider, ends, revealBtn),
      result,
      resultBody,
      punch,
      note,
    ),
  );

  let revealed = false;
  function reveal() {
    if (revealed) return;
    revealed = true;
    el.classList.add("is-revealed");
    const guess = Number(slider.value) / 100;
    result.textContent = `${C.result} ${C.guessFeedback(guess)}`;
    resultBody.textContent = C.resultBody;
    slider.disabled = true;
    revealBtn.disabled = true;
    circleL.setAttribute("r", String(rSmall));
    const from = Number(circleR.getAttribute("r")) || rSmall;
    const grow = (p: number) => circleR.setAttribute("r", String(from + (rLarge - from) * p));
    if (reducedMotion()) return grow(1);
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 600);
      grow(1 - Math.pow(1 - p, 2));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function mount() {
    slider.addEventListener("input", () => {
      const v = Number(slider.value);
      slider.setAttribute("aria-valuetext", v < 40 ? `Leaning ${C.left.name}` : v > 60 ? `Leaning ${C.right.name}` : "Equal");
      // Live preview of the guess: the two circles share a fixed total area.
      const t = v / 100;
      const areaL = 1 - t;
      const areaR = t;
      circleL.setAttribute("r", String(10 + Math.sqrt(areaL) * 40));
      circleR.setAttribute("r", String(10 + Math.sqrt(areaR) * 40));
    });
    slider.addEventListener("change", () => {
      // A committed drag reveals the answer after a beat (still available via the button).
      if (!reducedMotion()) setTimeout(reveal, 400);
    });
    if (reducedMotion()) {
      // Show the answer geometry immediately; the button re-announces it.
      circleR.setAttribute("r", String(rLarge));
    }
  }
  return { el, mount };
}
