// The light ribbon (spec §3): a thin 24-hour ribbon in every page header,
// reinterpreted per configuration. Same object, different meaning.
import { s } from "../lib/dom";

export type RibbonKind = "healthy" | "myopia" | "glaucoma" | "depression" | "stroke" | "about";

const W = 960;
const H = 56;
const PAD = 8;
const x = (hour: number) => PAD + ((W - 2 * PAD) * hour) / 24;

export function lightRibbon(kind: RibbonKind, label: string, accent: string): SVGSVGElement {
  const svg = s("svg", {
    class: `light-ribbon light-ribbon--${kind}`,
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": label,
    preserveAspectRatio: "none",
  });
  // Base track
  svg.appendChild(s("rect", { x: PAD, y: 22, width: W - 2 * PAD, height: 12, rx: 6, fill: "var(--line)" }));
  // Night shading 0–6 and 20–24
  svg.appendChild(s("rect", { x: x(0), y: 22, width: x(6) - x(0), height: 12, rx: 6, fill: "#CFD6E2", opacity: 0.9 }));
  svg.appendChild(s("rect", { x: x(20), y: 22, width: x(24) - x(20), height: 12, rx: 6, fill: "#CFD6E2", opacity: 0.9 }));

  switch (kind) {
    case "healthy": {
      // lux profile: curve on a log-ish scale drawn above the track
      const pts: [number, number][] = [
        [0, 0.02], [5, 0.02], [6.5, 0.2], [8, 0.3], [9, 0.32], [12, 0.55], [13, 0.95], [14, 0.6], [17, 0.4], [19, 0.15], [21, 0.1], [23, 0.18], [23.5, 0.03], [24, 0.02],
      ];
      const d = pts.map(([hh, v], i) => `${i ? "L" : "M"} ${x(hh)} ${34 - v * 26}`).join(" ");
      svg.appendChild(s("path", { d: `${d} L ${x(24)} 34 L ${x(0)} 34 Z`, fill: accent, opacity: 0.22 }));
      svg.appendChild(s("path", { d, fill: "none", stroke: accent, "stroke-width": 2 }));
      break;
    }
    case "myopia": {
      // outdoor minutes as afternoon/morning blocks
      const blocks: [number, number][] = [[7.4, 7.9], [12.2, 12.6], [15.5, 16.7], [17.2, 17.6]];
      for (const [a, b] of blocks) svg.appendChild(s("rect", { x: x(a), y: 20, width: x(b) - x(a), height: 16, rx: 4, fill: accent }));
      svg.appendChild(s("text", { x: x(16.1), y: 14, "text-anchor": "middle", class: "ribbon-text", fill: "var(--ink)" }, "78 min outdoors"));
      break;
    }
    case "glaucoma": {
      // one daytime target
      svg.appendChild(s("rect", { x: x(9), y: 18, width: x(17) - x(9), height: 20, rx: 6, fill: accent, opacity: 0.85 }));
      svg.appendChild(s("text", { x: x(13), y: 14, "text-anchor": "middle", class: "ribbon-text", fill: "var(--ink)" }, "Daytime bright light · 60 min"));
      break;
    }
    case "depression": {
      // morning window — wake +2h softly lit
      svg.appendChild(s("rect", { x: x(7), y: 18, width: x(9) - x(7), height: 20, rx: 6, fill: accent, opacity: 0.35 }));
      svg.appendChild(s("line", { x1: x(7), y1: 12, x2: x(7), y2: 44, stroke: accent, "stroke-width": 2 }));
      svg.appendChild(s("text", { x: x(8), y: 10, "text-anchor": "middle", class: "ribbon-text", fill: "var(--ink)" }, "Wake → +2 h"));
      break;
    }
    case "stroke": {
      // wake anchor
      svg.appendChild(s("line", { x1: x(7), y1: 8, x2: x(7), y2: 48, stroke: accent, "stroke-width": 3, "stroke-linecap": "round" }));
      svg.appendChild(s("rect", { x: x(7.5), y: 22, width: x(8) - x(7.5), height: 12, rx: 6, fill: accent, opacity: 0.6 }));
      svg.appendChild(s("text", { x: x(7) + 8, y: 12, class: "ribbon-text", fill: "var(--ink)" }, "Wake anchor 07:00"));
      break;
    }
    case "about":
      break;
  }
  // Hour ticks
  for (const hh of [0, 6, 12, 18, 24]) {
    svg.appendChild(s("line", { x1: x(hh), y1: 40, x2: x(hh), y2: 46, stroke: "var(--muted)", "stroke-width": 1 }));
    svg.appendChild(
      s("text", { x: x(hh), y: 55, "text-anchor": hh === 0 ? "start" : hh === 24 ? "end" : "middle", class: "ribbon-tick", fill: "var(--muted)" }, `${String(hh % 24).padStart(2, "0")}:00`),
    );
  }
  return svg;
}
