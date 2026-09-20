// Small inline SVG icons. All decorative unless given a label.
import { h, s } from "../lib/dom";

export function sunIcon(size = 16, color = "var(--amber)"): SVGSVGElement {
  return s(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" },
    s("circle", { cx: 12, cy: 12, r: 5, fill: color }),
    ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
      s("line", {
        x1: 12,
        y1: 2.5,
        x2: 12,
        y2: 5,
        stroke: color,
        "stroke-width": 2,
        "stroke-linecap": "round",
        transform: `rotate(${a} 12 12)`,
      }),
    ),
  );
}

/** ARKA sunrise mark — geometry reduced from brand/logo.svg. */
export function sunriseMark(size = 28, color = "#D4A043"): SVGSVGElement {
  return s(
    "svg",
    { width: size, height: size, viewBox: "0 0 64 64", "aria-hidden": "true", focusable: "false" },
    s("line", { x1: 32, y1: 40, x2: 20, y2: 19, stroke: color, "stroke-width": 2.4, "stroke-opacity": 0.35, "stroke-linecap": "round" }),
    s("line", { x1: 32, y1: 40, x2: 32, y2: 16, stroke: color, "stroke-width": 2.4, "stroke-opacity": 0.5, "stroke-linecap": "round" }),
    s("line", { x1: 32, y1: 40, x2: 44, y2: 19, stroke: color, "stroke-width": 2.4, "stroke-opacity": 0.35, "stroke-linecap": "round" }),
    s("path", { d: "M18 42 A14 14 0 0 1 46 42 Z", fill: color }),
    s("line", { x1: 8, y1: 42, x2: 56, y2: 42, stroke: color, "stroke-width": 3, "stroke-opacity": 0.6, "stroke-linecap": "round" }),
  );
}

export function wordmark(): HTMLElement {
  return h("span", { class: "wordmark-inner" }, sunriseMark(30), h("span", { class: "wordmark-text" }, "ARKA"));
}

export function checkIcon(size = 16, color = "currentColor"): SVGSVGElement {
  return s(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" },
    s("path", { d: "M5 12.5l4.2 4.2L19 7", fill: "none", stroke: color, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }),
  );
}

export function crossIcon(size = 16, color = "currentColor"): SVGSVGElement {
  return s(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" },
    s("path", { d: "M6 6l12 12M18 6L6 18", fill: "none", stroke: color, "stroke-width": 2.4, "stroke-linecap": "round" }),
  );
}

export function arrowIcon(size = 16, color = "currentColor"): SVGSVGElement {
  return s(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" },
    s("path", { d: "M4 12h15M13 6l6 6-6 6", fill: "none", stroke: color, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-linejoin": "round" }),
  );
}

/** Simple tab-bar glyphs for phone mockups. */
export function tabGlyph(name: string, size = 22, color = "currentColor"): SVGSVGElement {
  const common = { fill: "none", stroke: color, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" };
  const svg = s("svg", { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" });
  switch (name.toLowerCase()) {
    case "home":
      svg.append(s("path", { d: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z", ...common }));
      break;
    case "insights":
      svg.append(s("path", { d: "M5 19V13M12 19V6M19 19v-9", ...common }));
      break;
    case "plant":
      svg.append(s("path", { d: "M12 21v-8M12 13c-5 0-7-4-7-8 4 0 7 2 7 8zm0 0c5 0 7-4 7-8-4 0-7 2-7 8z", ...common }));
      break;
    case "inbox":
      svg.append(s("path", { d: "M4 13h4l2 3h4l2-3h4M4 13V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M4 13v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4", ...common }));
      break;
    case "lumi":
      svg.append(s("path", { d: "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", ...common }));
      break;
    case "diary":
      svg.append(s("path", { d: "M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM6 3v18M9 8h6M9 12h6", ...common }));
      break;
    case "caregiver view":
    case "caregiver":
      svg.append(s("path", { d: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM3 20a5 5 0 0 1 10 0M13 20a4 4 0 0 1 8 0", ...common }));
      break;
    case "listen":
      svg.append(s("path", { d: "M4 10v4h3l4 4V6L7 10zM15 9a4 4 0 0 1 0 6M17.5 6.5a8 8 0 0 1 0 11", ...common }));
      break;
    default:
      svg.append(s("circle", { cx: 12, cy: 12, r: 6, ...common }));
  }
  return svg;
}
