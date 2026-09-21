// "Light is the body's strongest time cue". Editorial diagram after the
// reference: a soft sun at the left, eye and ipRGC nodes on an amber path,
// a head silhouette with the SCN, and three downstream outcomes branching to
// the right (alertness, mood, sleep). Soft hills close the composition.
// The path draws once on entry; nothing is scroll-linked.
import { ABOUT } from "@content/about";
import { evidence } from "../components/evidence";
import { h, s } from "../lib/dom";
import { later, onEnter, preparePathDraw, reducedMotion, tween } from "../lib/motion";

const W = 1000;
const H = 470;

export function chainScene() {
  const C = ABOUT.timeCue;
  const svg = s("svg", { class: "cue-svg", viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": C.diagramAlt });
  const defs = s("defs", null);
  const glow = s("radialGradient", { id: "cue-glow", cx: "50%", cy: "50%", r: "50%" });
  glow.append(s("stop", { offset: "0", "stop-color": "#F3C766", "stop-opacity": 0.9 }), s("stop", { offset: "0.55", "stop-color": "#F3C766", "stop-opacity": 0.35 }), s("stop", { offset: "1", "stop-color": "#F3C766", "stop-opacity": 0 }));
  defs.appendChild(glow);
  svg.appendChild(defs);

  // Hills (decoration)
  const hills = s("g", { class: "cue-hills", "aria-hidden": "true" });
  hills.appendChild(s("circle", { cx: 690, cy: 420, r: 62, fill: "#F3C766", opacity: 0.55 }));
  hills.appendChild(s("path", { d: `M0 430 C 180 380, 300 440, 470 405 S 760 380, 1000 425 L 1000 ${H} L 0 ${H} Z`, fill: "#C8CFC0", opacity: 0.7 }));
  hills.appendChild(s("path", { d: `M0 455 C 220 410, 420 470, 640 440 S 860 420, 1000 450 L 1000 ${H} L 0 ${H} Z`, fill: "#9DAA96", opacity: 0.75 }));
  svg.appendChild(hills);

  // Sun glow at the left edge
  svg.appendChild(s("circle", { cx: 40, cy: 250, r: 110, fill: "url(#cue-glow)" }));

  // Node positions
  const eye = { x: 190, y: 250 };
  const ip = { x: 370, y: 250 };
  const scn = { x: 606, y: 232 };
  const outs = [
    { x: 838, y: 150, color: "#E8A825", fill: "#FBEBC6", key: "alert" },
    { x: 838, y: 250, color: "#6E8F6B", fill: "#DCE6D8", key: "mood" },
    { x: 838, y: 350, color: "#1F3A5F", fill: "#1F3A5F", key: "sleep" },
  ];

  // Head silhouette (profile facing left), soft cream fill with brain outline
  const head = s("g", { class: "cue-head", "aria-hidden": "true" });
  head.appendChild(
    s("path", {
      d: "M 560 120 C 610 110, 700 130, 715 205 C 722 245, 705 262, 712 290 C 716 306, 730 316, 728 332 C 722 352, 700 350, 690 360 C 680 372, 686 400, 670 412 C 650 424, 610 420, 598 410 L 598 470 L 690 470 L 690 470 L 520 470 C 512 430, 505 380, 512 350 C 496 330, 488 300, 492 268 C 470 262, 470 240, 484 232 C 486 190, 510 132, 560 120 Z",
      fill: "#E8D8C4",
      opacity: 1,
    }),
  );
  // Brain outline
  head.appendChild(
    s("path", {
      d: "M 560 170 C 545 150, 585 130, 600 150 C 615 128, 655 132, 660 158 C 690 152, 705 190, 690 210 C 706 232, 690 262, 665 258 C 660 284, 620 290, 606 268 C 590 288, 550 280, 550 255 C 526 250, 520 218, 540 208 C 524 190, 540 168, 560 170 Z",
      fill: "none",
      stroke: "#C9A985",
      "stroke-width": 1.6,
      opacity: 0.8,
    }),
  );
  head.appendChild(s("path", { d: "M 575 185 C 590 200, 615 200, 630 190 M 560 225 C 585 238, 630 236, 655 222 M 600 160 C 605 175, 606 195, 602 215", fill: "none", stroke: "#C9A985", "stroke-width": 1.2, opacity: 0.6 }));
  svg.appendChild(head);

  // Amber path: sun → eye → ipRGC → SCN
  const stroke = { fill: "none", stroke: "#E8A825", "stroke-width": 2.2, "stroke-linecap": "round" };
  const seg1 = s("path", { d: `M 120 250 L ${eye.x - 38} 250`, ...stroke });
  const seg2 = s("path", { d: `M ${eye.x + 38} 250 L ${ip.x - 40} 250`, ...stroke });
  const seg3 = s("path", { d: `M ${ip.x + 40} 250 C 460 250, 520 250, 560 250 C 585 250, 598 245, ${scn.x} ${scn.y}`, ...stroke });
  // Downstream: from SCN to each outcome
  const branches = outs.map((o) =>
    s("path", { d: `M ${scn.x} ${scn.y} C 700 ${scn.y}, 720 ${o.y}, ${o.x - 40} ${o.y}`, fill: "none", stroke: o.color, "stroke-width": 2, "stroke-linecap": "round" }),
  );
  svg.append(seg1, seg2, seg3, ...branches);

  // Eye node
  const eyeG = s("g", { class: "cue-node", transform: `translate(${eye.x} ${eye.y})` });
  eyeG.appendChild(s("circle", { r: 36, fill: "#F5EBDD" }));
  eyeG.appendChild(s("path", { d: "M-22 0 Q 0 -16 22 0 Q 0 16 -22 0 Z", fill: "#fff", stroke: "#4A3A2A", "stroke-width": 1.6 }));
  eyeG.appendChild(s("circle", { r: 7.5, fill: "#7A5230" }));
  eyeG.appendChild(s("circle", { r: 3.4, fill: "#1a1a1a" }));
  // ipRGC node: cell with dendrites
  const ipG = s("g", { class: "cue-node", transform: `translate(${ip.x} ${ip.y})` });
  ipG.appendChild(s("circle", { r: 36, fill: "#F5EBDD" }));
  ipG.appendChild(s("path", { d: "M-6 0 L-20 -14 M-6 0 L-22 4 M-6 0 L-16 16 M4 -4 L 14 -20 M4 -4 L 20 -8 M 4 4 L 18 14 M 4 4 L 8 22", fill: "none", stroke: "#D89A2A", "stroke-width": 1.8, "stroke-linecap": "round" }));
  ipG.appendChild(s("circle", { r: 6.5, fill: "#E8A825" }));
  // SCN node
  const scnG = s("g", { class: "cue-node", transform: `translate(${scn.x} ${scn.y})` });
  scnG.appendChild(s("circle", { r: 9, fill: "#E8A825" }));
  scnG.appendChild(s("circle", { r: 14, fill: "none", stroke: "#E8A825", "stroke-width": 1.2, opacity: 0.6 }));
  svg.append(eyeG, ipG, scnG);

  // Outcome nodes
  const outG = outs.map((o, i) => {
    const g = s("g", { class: "cue-node", transform: `translate(${o.x} ${o.y})` });
    g.appendChild(s("circle", { r: 34, fill: o.fill }));
    const ink = o.key === "sleep" ? "#F3EFE8" : o.key === "mood" ? "#3F5C3D" : "#B8791A";
    if (o.key === "alert") {
      g.appendChild(s("circle", { r: 9, fill: ink }));
      for (let k = 0; k < 8; k++) g.appendChild(s("line", { x1: 0, y1: -14, x2: 0, y2: -20, stroke: ink, "stroke-width": 2, "stroke-linecap": "round", transform: `rotate(${k * 45})` }));
    } else if (o.key === "mood") {
      g.appendChild(s("circle", { r: 15, fill: "none", stroke: ink, "stroke-width": 1.8 }));
      g.appendChild(s("circle", { cx: -5, cy: -4, r: 1.8, fill: ink }));
      g.appendChild(s("circle", { cx: 5, cy: -4, r: 1.8, fill: ink }));
      g.appendChild(s("path", { d: "M-7 4 Q 0 11 7 4", fill: "none", stroke: ink, "stroke-width": 1.8, "stroke-linecap": "round" }));
    } else {
      g.appendChild(s("path", { d: "M 4 -15 A 15 15 0 1 0 12 10 A 11 11 0 0 1 4 -15 Z", fill: ink }));
    }
    // Labels
    g.appendChild(s("text", { x: 50, y: -2, class: "cue-t-label" }, C.outcomes[i].label));
    const sub = C.outcomes[i].sub;
    const words = sub.split(" ");
    const mid = Math.ceil(words.length / 2);
    g.appendChild(s("text", { x: 50, y: 16, class: "cue-t-sub" }, words.slice(0, mid).join(" ")));
    g.appendChild(s("text", { x: 50, y: 31, class: "cue-t-sub" }, words.slice(mid).join(" ")));
    return g;
  });
  svg.append(...outG);

  // Labels under the chain nodes
  const under = (x: number, y: number, label: string, sub: string, maxChars = 24) => {
    const g = s("g", { class: "cue-caption" });
    g.appendChild(s("text", { x, y, "text-anchor": "middle", class: "cue-t-label" }, label));
    const lines = wrap(sub, maxChars);
    lines.forEach((ln, i) => g.appendChild(s("text", { x, y: y + 18 + i * 15, "text-anchor": "middle", class: "cue-t-sub" }, ln)));
    return g;
  };
  svg.append(under(eye.x, eye.y + 66, C.chain[0].label, C.chain[0].sub, 18), under(ip.x, ip.y + 66, C.chain[1].label, C.chain[1].sub, 26), under(scn.x, scn.y + 92, C.chain[2].label, C.chain[2].sub, 26));

  // Readable version for narrow screens and screen readers
  const list = h(
    "ol",
    { class: "cue-list" },
    ...C.chain.map((c) => h("li", null, h("strong", null, c.label), h("span", null, c.sub))),
    h("li", { class: "cue-list-branch" }, h("strong", null, "Downstream"), h("span", null, C.outcomes.map((o) => `${o.label}: ${o.sub.toLowerCase()}`).join(". ") + ".")),
  );

  const el = h(
    "section",
    { class: "section cue-section", id: "why-light" },
    h(
      "div",
      { class: "wrap" },
      h("div", { class: "section-head cue-head-text", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body)),
      h("div", { class: "cue-stage", "data-enter": true }, svg, list),
      h("p", { class: "cite cue-sources", "data-enter": true }, C.sources, " ", evidence(...C.refs)),
    ),
  );

  function mount() {
    const draws = [seg1, seg2, seg3].map((p) => preparePathDraw(p));
    const bdraws = branches.map((p) => preparePathDraw(p));
    const nodes = [eyeG, ipG, scnG];
    nodes.forEach((n) => n.setAttribute("opacity", "0.3"));
    outG.forEach((n) => n.setAttribute("opacity", "0.3"));
    onEnter(svg, () => {
      if (reducedMotion()) {
        draws.forEach((d) => d.set(1));
        bdraws.forEach((d) => d.set(1));
        [...nodes, ...outG].forEach((n) => n.setAttribute("opacity", "1"));
        return;
      }
      draws.forEach((d, i) => later(() => tween(420, (p) => d.set(p), () => nodes[i].setAttribute("opacity", "1")), i * 460));
      later(() => {
        bdraws.forEach((d, i) => tween(520, (p) => d.set(p), () => outG[i].setAttribute("opacity", "1")));
      }, 3 * 460);
    });
  }
  return { el, mount };
}

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    if ((line + " " + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + " " + w).trim();
  }
  if (line) out.push(line);
  return out;
}
