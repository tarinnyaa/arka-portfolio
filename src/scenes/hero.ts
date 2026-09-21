// Light reveal hero. Near-dark canvas: wordmark, subline and a sun at a
// horizon line. The headline stays at full contrast at all times. A soft
// amber aperture follows the cursor behind the type. On load the sun rises
// once and the product shot follows. Reduced motion: fully lit immediately.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img } from "../components/assets";
import { h, s } from "../lib/dom";
import { later, reducedMotion, tween } from "../lib/motion";

export function heroScene() {
  const C = ABOUT.hero;
  const sun = s("circle", { cx: 600, cy: 300, r: 26, fill: "var(--amber-bright)", class: "hero-sun" });
  const rays = s("g", { class: "hero-rays", opacity: 0 });
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI + (i / 8) * Math.PI;
    rays.appendChild(
      s("line", {
        x1: 600 + Math.cos(a) * 40,
        y1: 300 + Math.sin(a) * 40,
        x2: 600 + Math.cos(a) * 64,
        y2: 300 + Math.sin(a) * 64,
        stroke: "var(--amber-bright)",
        "stroke-width": 3,
        "stroke-linecap": "round",
        opacity: 0.5,
      }),
    );
  }
  const horizonSvg = s(
    "svg",
    { class: "hero-horizon", viewBox: "0 0 1200 320", "aria-hidden": "true", preserveAspectRatio: "xMidYMax slice" },
    s("defs", null, s("clipPath", { id: "hero-clip" }, s("rect", { x: 0, y: 0, width: 1200, height: 300 }))),
    s("g", { "clip-path": "url(#hero-clip)" }, rays, sun),
    s("line", { x1: 0, y1: 300, x2: 1200, y2: 300, stroke: "var(--amber-bright)", "stroke-width": 2, "stroke-opacity": 0.6 }),
  );

  const text = h(
    "div",
    { class: "hero-text" },
    h("p", { class: "hero-wordmark-line", "aria-hidden": "true" }, C.wordmark),
    h("p", { class: "hero-subline" }, C.subline),
  );

  const shot = h("div", { class: "hero-shot" }, img(ASSETS.heroEcosystem, C.productShotAlt, { w: "100%", h: "auto", eager: true }));

  const el = h(
    "section",
    { class: "hero on-dark is-lit", "aria-label": "Introduction" },
    h("div", { class: "hero-aperture", "aria-hidden": "true" }),
    horizonSvg,
    h("div", { class: "wrap hero-inner" }, h("h1", { class: "visually-hidden" }, C.wordmark), text),
    h("div", { class: "wrap hero-shot-wrap" }, shot),
  );

  const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function mount() {
    if (!reducedMotion() && pointerFine) {
      const move = (x: number, y: number) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
        el.classList.add("has-pointer");
      };
      el.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
      el.addEventListener("pointerleave", () => el.classList.remove("has-pointer"));
    }

    const setP = (p: number) => {
      const cy = 300 - p * 230;
      sun.setAttribute("cy", String(cy));
      rays.setAttribute("opacity", String(Math.min(1, p * 1.6)));
      rays.setAttribute("transform", `translate(0 ${-p * 230})`);
      shot.style.setProperty("--reveal", String(p));
    };
    if (reducedMotion()) {
      setP(1);
      return;
    }
    setP(0);
    later(() => tween(2200, setP), 400);
  }

  return { el, mount };
}
