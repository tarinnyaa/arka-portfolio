// Circadian ambient (spec §3). The page background shifts subtly with scroll
// depth through a day. Body content stays on light backgrounds: the light
// scale below runs sunrise → midday → late afternoon and never drops below a
// luminance that keeps Ink text at ≥ 4.5:1. The hero and closing sections
// carry their own solid pre-dawn / dusk navy, so the dark ends of the day
// are exactly where the dark sections are.
import { clamp, lerp } from "./dom";

type RGB = [number, number, number];
const hex = (c: string): RGB => [
  parseInt(c.slice(1, 3), 16),
  parseInt(c.slice(3, 5), 16),
  parseInt(c.slice(5, 7), 16),
];
const toCss = (c: RGB) => `rgb(${c.map(Math.round).join(",")})`;

function mix(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

// Background stops (position through the page, colour)
const BG: [number, RGB][] = [
  [0.0, hex("#F7E9D9")], // sunrise — warm peach cream
  [0.22, hex("#F8F5F0")], // morning — cream
  [0.45, hex("#F3F6F9")], // midday — near-white blue
  [0.68, hex("#F8F5EE")], // afternoon — cream
  [0.88, hex("#F7E6CC")], // late — warm amber
  [1.0, hex("#F1DDC2")], // dusk approaches
];
// Aperture tint through the day
const AP: [number, RGB][] = [
  [0.0, hex("#E8A825")], // sunrise amber
  [0.3, hex("#F3C766")], // late morning gold
  [0.5, hex("#9DBFE0")], // midday sky
  [0.75, hex("#E8A825")], // afternoon amber
  [1.0, hex("#D97742")], // dusk terracotta
];

function sample(stops: [number, RGB][], p: number): RGB {
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i][0]) {
      const [p0, c0] = stops[i - 1];
      const [p1, c1] = stops[i];
      return mix(c0, c1, (p - p0) / (p1 - p0));
    }
  }
  return stops[stops.length - 1][1];
}

let raf = 0;
function update() {
  raf = 0;
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  const p = clamp(window.scrollY / max, 0, 1);
  doc.style.setProperty("--ambient-bg", toCss(sample(BG, p)));
  doc.style.setProperty("--aperture-tint", toCss(sample(AP, p)));
  doc.style.setProperty("--day-progress", p.toFixed(3));
}

export function startAmbient() {
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/** Re-sample after a route change (page height differs). */
export function resetAmbient() {
  update();
}
