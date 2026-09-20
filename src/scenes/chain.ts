// "Light is the body's strongest time cue" — a chain that draws on scroll:
// Eye → ipRGC → SCN → Mood / Sleep / Alertness. The draw reveals the causal
// order, so it stays under the motion law.
import { ABOUT } from "@content/about";
import { evidence } from "../components/evidence";
import { sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { onEnter, preparePathDraw, reducedMotion } from "../lib/motion";

export function chainScene() {
  const C = ABOUT.timeCue;
  const n = C.chain.length;
  const W = 1000;
  const H = 200;
  const xs = C.chain.map((_, i) => 90 + (i * (W - 180)) / (n - 1));
  const svg = s("svg", { class: "chain-svg", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  const links: SVGPathElement[] = [];
  for (let i = 0; i < n - 1; i++) {
    const x0 = xs[i] + 40;
    const x1 = xs[i + 1] - 40;
    const p = s("path", {
      d: `M ${x0} 100 C ${x0 + 40} 100, ${x1 - 40} 100, ${x1} 100`,
      fill: "none",
      stroke: "var(--amber)",
      "stroke-width": 3,
      "stroke-linecap": "round",
    });
    links.push(p);
    svg.appendChild(p);
  }
  const nodes = C.chain.map((_c, i) => {
    const g = s("g", { class: "chain-node", transform: `translate(${xs[i]} 100)`, opacity: 0.25 });
    g.appendChild(s("circle", { r: 34, fill: "var(--card)", stroke: "var(--ink)", "stroke-width": 1.5 }));
    g.appendChild(chainGlyph(i));
    svg.appendChild(g);
    return g;
  });

  const labels = h(
    "ol",
    { class: "chain-labels" },
    ...C.chain.map((c) => h("li", null, h("strong", null, c.label), h("span", { class: "muted" }, c.sub))),
  );

  const el = h(
    "section",
    { class: "section chain-section" },
    h("div", { class: "aperture aperture--arc" }),
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "chain-stage" }, svg, labels),
      h("p", { class: "cite" }, "Sources: ", evidence(...C.refs), " Münch & Bromundt, 2012; Hannibal, 2021; Berson et al., 2002."),
    ),
  );

  function mount() {
    const draws = links.map((l) => preparePathDraw(l));
    const items = Array.from(labels.children) as HTMLElement[];
    const light = (k: number) => {
      nodes.forEach((g, i) => g.setAttribute("opacity", i <= k ? "1" : "0.25"));
      items.forEach((li, i) => li.classList.toggle("is-lit", i <= k));
    };
    onEnter(el, () => {
      if (reducedMotion()) {
        draws.forEach((d) => d.set(1));
        light(n - 1);
        return;
      }
      light(0);
      draws.forEach((d, i) => {
        setTimeout(() => {
          const t0 = performance.now();
          const step = (t: number) => {
            const p = Math.min(1, (t - t0) / 500);
            d.set(1 - Math.pow(1 - p, 2));
            if (p < 1) requestAnimationFrame(step);
            else light(i + 1);
          };
          requestAnimationFrame(step);
        }, i * 550);
      });
    });
  }
  return { el, mount };
}

function chainGlyph(i: number): SVGElement {
  const stroke = { fill: "none", stroke: "var(--ink)", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
  switch (i) {
    case 0: // eye
      return s("g", null, s("path", { d: "M-20 0q20-16 40 0q-20 16-40 0z", ...stroke }), s("circle", { r: 6, fill: "var(--ink)" }));
    case 1: // ipRGC — a cell with dendrites
      return s(
        "g",
        null,
        s("circle", { r: 7, fill: "var(--amber)", stroke: "var(--ink)", "stroke-width": 2 }),
        s("path", { d: "M-6-4l-12-10M6-4l12-10M-6 4l-12 10M6 4l12 10M0 7v14", ...stroke }),
      );
    case 2: // SCN — clock
      return s("g", null, s("circle", { r: 16, ...stroke }), s("path", { d: "M0-10v10l7 5", ...stroke }));
    default: // mood/sleep/alertness — sun/moon pair
      return s(
        "g",
        null,
        s("circle", { cx: -9, cy: -2, r: 7, fill: "var(--amber)" }),
        s("path", { d: "M12-8a9 9 0 1 0 6 14a7 7 0 0 1-6-14z", fill: "var(--ink)" }),
      );
  }
}
