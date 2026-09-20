// Closing (spec §7, [B]). Five phones shrink; their interfaces dissolve; five
// light traces remain and merge into the ARKA sunrise. Then the statement,
// the status line, and the lab logos.
import { ABOUT } from "@content/about";
import { labLogos } from "../components/assets";
import { h, s } from "../lib/dom";
import { clamp, lerp } from "../lib/dom";
import { scrub } from "../lib/motion";

const ACCENTS = ["#5B9BD5", "#6BA368", "#8FB3D9", "#B79BD8", "#3FA3A8"];

export function closingScene() {
  const C = ABOUT.closing;
  const W = 1000;
  const H = 420;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "close-svg", role: "img", "aria-label": "Five light traces merge into the ARKA sunrise." });
  // Five small phone outlines
  const phones = ACCENTS.map((c, i) => {
    const x = 100 + i * 200;
    const g = s("g", { class: "close-phone", transform: `translate(${x} 60)` });
    g.appendChild(s("rect", { x: -40, y: 0, width: 80, height: 160, rx: 12, fill: "#22304d", stroke: c, "stroke-width": 1.5 }));
    // interface fragments
    for (let k = 0; k < 4; k++) g.appendChild(s("rect", { x: -28, y: 18 + k * 30, width: 56 - (k % 2) * 20, height: 12, rx: 4, fill: c, opacity: 0.6, class: "close-ui" }));
    svg.appendChild(g);
    return g;
  });
  // Five traces (start under phones, converge to the sun)
  const sunX = W / 2;
  const sunY = 300;
  const traces = ACCENTS.map((c, i) => {
    const x = 100 + i * 200;
    const wob = [0, 22, -18, 14, -26][i];
    const d = `M ${x} 230 C ${x + wob} 260, ${lerp(x, sunX, 0.4)} ${290 + wob}, ${sunX} ${sunY}`;
    const p = s("path", { d, fill: "none", stroke: c, "stroke-width": 2.5, "stroke-linecap": "round", class: "close-trace" });
    svg.appendChild(p);
    return p;
  });
  // Sunrise mark
  const sun = s("g", { class: "close-sun", transform: `translate(${sunX} ${sunY})` });
  sun.appendChild(s("path", { d: "M-60 0 A60 60 0 0 1 60 0 Z", fill: "var(--amber)" }));
  sun.appendChild(s("line", { x1: -220, y1: 0, x2: 220, y2: 0, stroke: "var(--amber)", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.6 }));
  [[-90, -150], [0, -170], [90, -150]].forEach(([x, y]) => sun.appendChild(s("line", { x1: 0, y1: 0, x2: x, y2: y, stroke: "var(--amber)", "stroke-width": 3, opacity: 0.3, "stroke-linecap": "round" })));
  svg.appendChild(sun);

  const statement = h(
    "div",
    { class: "close-statement" },
    h("p", { class: "close-brand" }, C.heading),
    h("p", { class: "closing-line" }, C.line),
    h("p", { class: "lede close-sub" }, C.sub),
    h("p", { class: "close-status" }, C.status),
    h("div", { class: "hero-logo-card close-logos" }, labLogos(44, { link: true })),
  );

  const pin = h("div", { class: "close-pin" }, h("div", { class: "wrap close-inner" }, svg, statement));
  const el = h("section", { class: "section section--tight closing-section on-dark", "aria-label": "Closing" }, h("div", { class: "aperture aperture--low" }), pin);

  function set(p: number) {
    // 0–0.35 phones shrink & UI dissolves; 0.3–0.7 traces draw; 0.6–1 sun rises + statement
    const t1 = clamp(p / 0.35, 0, 1);
    phones.forEach((g, i) => {
      const x = 100 + i * 200;
      const sc = lerp(1, 0.55, t1);
      g.setAttribute("transform", `translate(${x} ${lerp(60, 120, t1)}) scale(${sc})`);
      g.querySelectorAll(".close-ui").forEach((r) => r.setAttribute("opacity", String(0.6 * (1 - t1))));
      g.setAttribute("opacity", String(1 - clamp((p - 0.5) / 0.3, 0, 1)));
    });
    const t2 = clamp((p - 0.3) / 0.4, 0, 1);
    traces.forEach((tr) => {
      const len = 600;
      tr.style.strokeDasharray = `${len}`;
      tr.style.strokeDashoffset = `${len * (1 - t2)}`;
      tr.setAttribute("opacity", String(1 - clamp((p - 0.85) / 0.15, 0, 1) * 0.6));
    });
    const t3 = clamp((p - 0.6) / 0.4, 0, 1);
    sun.setAttribute("opacity", String(t3));
    sun.setAttribute("transform", `translate(${sunX} ${lerp(sunY + 40, sunY, t3)})`);
    statement.style.opacity = String(clamp((p - 0.7) / 0.3, 0, 1));
    statement.style.transform = `translateY(${lerp(16, 0, clamp((p - 0.7) / 0.3, 0, 1))}px)`;
  }

  function mount() {
    scrub(
      { set },
      {
        trigger: pin,
        pin,
        end: "+=220%",
        steps: [
          { label: "Phones", p: 0, describe: "Five phones with their interfaces." },
          { label: "Traces", p: 0.6, describe: "The interfaces dissolve; five light traces remain." },
          { label: "Sunrise", p: 1, describe: "The traces merge into the ARKA sunrise." },
        ],
        dark: true,
        controlLabel: "Step through the closing sequence",
      },
    );
  }
  return { el, mount };
}
