// Light reveal hero (spec §7, [B]). Near-dark: wordmark and a small sun at a
// horizon line. An aperture of light follows the cursor/touch and reveals the
// subline. Scrolling raises the sun and reveals the product shot. Reduced
// motion or no pointer: fully lit immediately.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img, labLogos } from "../components/assets";
import { h, s } from "../lib/dom";
import { ScrollTrigger, reducedMotion } from "../lib/motion";

export function heroScene() {
  const C = ABOUT.hero;
  const sun = s("circle", { cx: 600, cy: 300, r: 26, fill: "var(--amber)", class: "hero-sun" });
  const rays = s("g", { class: "hero-rays", opacity: 0 });
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI + (i / 8) * Math.PI;
    rays.appendChild(
      s("line", {
        x1: 600 + Math.cos(a) * 40,
        y1: 300 + Math.sin(a) * 40,
        x2: 600 + Math.cos(a) * 64,
        y2: 300 + Math.sin(a) * 64,
        stroke: "var(--amber)",
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
    s("line", { x1: 0, y1: 300, x2: 1200, y2: 300, stroke: "var(--amber)", "stroke-width": 2, "stroke-opacity": 0.6 }),
  );

  const subline = h("p", { class: "hero-subline" }, C.subline);
  const projectOf = h(
    "div",
    { class: "hero-project" },
    h("span", { class: "hero-project-label" }, C.projectOf),
    h("div", { class: "hero-logo-card" }, labLogos(36, { link: true })),
  );
  const reveal = h("div", { class: "hero-reveal" }, subline, projectOf);
  const hint = h("p", { class: "hero-hint muted small" }, C.hint);

  const shot = h(
    "div",
    { class: "hero-shot" },
    img(ASSETS.heroEcosystem, C.productShotAlt, { w: "100%", h: "auto", eager: true, label: "brand/hero-ecosystem.png" }),
  );

  const el = h(
    "section",
    { class: "hero on-dark", "aria-label": "Introduction" },
    h("div", { class: "hero-aperture", "aria-hidden": "true" }),
    horizonSvg,
    h(
      "div",
      { class: "wrap hero-inner" },
      h("h1", { class: "hero-wordmark" }, C.wordmark),
      reveal,
      hint,
    ),
    h("div", { class: "wrap hero-shot-wrap" }, shot),
  );

  const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function mount() {
    const lit = reducedMotion() || !pointerFine;
    if (lit) {
      el.classList.add("is-lit");
      hint.remove();
    } else {
      // Aperture follows the cursor; the subline is masked to the aperture.
      const move = (x: number, y: number) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${x - r.left}px`);
        el.style.setProperty("--my", `${y - r.top}px`);
        el.classList.add("has-pointer");
      };
      el.addEventListener("pointermove", (e) => move(e.clientX, e.clientY));
      el.addEventListener("pointerleave", () => el.classList.remove("has-pointer"));
      // Keyboard users: focusing into the hero lights it fully.
      el.addEventListener("focusin", () => el.classList.add("is-lit"));
    }

    // Scroll raises the sun and reveals the product shot.
    const setP = (p: number) => {
      const cy = 300 - p * 230;
      sun.setAttribute("cy", String(cy));
      rays.setAttribute("opacity", String(Math.min(1, p * 1.6)));
      rays.setAttribute("transform", `translate(0 ${-p * 230})`);
      shot.style.setProperty("--reveal", String(p));
      el.style.setProperty("--sun-p", String(p));
      if (p > 0.35) el.classList.add("is-lit");
    };
    if (reducedMotion()) {
      setP(1);
      return;
    }
    setP(0);
    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom 60%",
      scrub: 0.6,
      onUpdate: (self) => setP(self.progress),
    });
  }

  return { el, mount };
}
