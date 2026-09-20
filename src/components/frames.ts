// PhoneFrame, LaptopFrame, Callout (spec §5).
import { h, s } from "../lib/dom";
import { preparePathDraw, reducedMotion } from "../lib/motion";

export const PHONE_W = 390;
export const PHONE_H = 844;

export type PhoneOpts = {
  scale?: number;
  label?: string;
  /** Per-screen type scale applied as a CSS variable. */
  typeScale?: number;
  class?: string;
  /** Skip the status bar (rare). */
  noStatus?: boolean;
};

/**
 * 390×844 logical phone. The screen content is authored at logical size and
 * the whole frame is scaled with CSS transform so text metrics stay exact.
 */
export function phoneFrame(screen: HTMLElement, opts: PhoneOpts = {}): HTMLElement {
  const scale = opts.scale ?? 0.6;
  const status = opts.noStatus
    ? null
    : h(
        "div",
        { class: "phone-status", "aria-hidden": "true" },
        h("span", { class: "phone-time" }, "9:41"),
        h(
          "span",
          { class: "phone-status-right" },
          s(
            "svg",
            { width: 18, height: 12, viewBox: "0 0 18 12", "aria-hidden": "true" },
            s("rect", { x: 0, y: 8, width: 3, height: 4, rx: 0.8, fill: "currentColor" }),
            s("rect", { x: 5, y: 5, width: 3, height: 7, rx: 0.8, fill: "currentColor" }),
            s("rect", { x: 10, y: 2, width: 3, height: 10, rx: 0.8, fill: "currentColor" }),
            s("rect", { x: 15, y: 0, width: 3, height: 12, rx: 0.8, fill: "currentColor" }),
          ),
          s(
            "svg",
            { width: 27, height: 12, viewBox: "0 0 27 12", "aria-hidden": "true" },
            s("rect", { x: 0.5, y: 0.5, width: 23, height: 11, rx: 3, fill: "none", stroke: "currentColor" }),
            s("rect", { x: 2, y: 2, width: 20, height: 8, rx: 1.6, fill: "currentColor" }),
            s("rect", { x: 25, y: 3.5, width: 1.6, height: 5, rx: 0.8, fill: "currentColor" }),
          ),
        ),
      );
  const inner = h("div", { class: "phone-screen", style: opts.typeScale ? `--ts:${opts.typeScale}` : undefined }, status, screen);
  const frame = h(
    "div",
    {
      class: `phone${opts.class ? " " + opts.class : ""}`,
      role: opts.label ? "img" : undefined,
      "aria-label": opts.label,
      style: `--scale:${scale}`,
    },
    h("div", { class: "phone-bezel" }, inner),
  );
  return h("div", { class: "phone-slot", style: `--scale:${scale}` }, frame);
}

export function laptopFrame(content: HTMLElement, opts: { label?: string; class?: string } = {}): HTMLElement {
  return h(
    "div",
    { class: `laptop${opts.class ? " " + opts.class : ""}`, role: opts.label ? "img" : undefined, "aria-label": opts.label },
    h("div", { class: "laptop-bezel" }, h("div", { class: "laptop-screen" }, content)),
    h("div", { class: "laptop-base", "aria-hidden": "true" }),
  );
}

export type CalloutSpec = {
  text: string;
  /** Anchor point on the frame as fractions of its box, 0–1. */
  at: [number, number];
  /** Which side the label sits on. */
  side?: "left" | "right";
  /** Vertical position of the label (fraction of the stage height). */
  y?: number;
};

/**
 * Callouts: labels connected to points on a frame by curved SVG lines that
 * draw, then the labels fade in. Never more than three. Returns the stage
 * and a `reveal(i)` to draw callout i.
 */
export function callouts(frame: HTMLElement, specs: CalloutSpec[], opts: { width?: number } = {}) {
  const list = specs.slice(0, 3);
  const stage = h("div", { class: "callout-stage" });
  const svg = s("svg", { class: "callout-lines", "aria-hidden": "true", preserveAspectRatio: "none" });
  const labels: HTMLElement[] = [];
  const paths: SVGPathElement[] = [];
  stage.append(frame, svg);
  list.forEach((c, i) => {
    const side = c.side ?? (i % 2 ? "left" : "right");
    const label = h("p", { class: `callout-label callout--${side}`, style: `top:${(c.y ?? 0.2 + i * 0.28) * 100}%` }, c.text);
    labels.push(label);
    stage.appendChild(label);
    const p = s("path", { class: "callout-path", fill: "none", stroke: "var(--ink)", "stroke-width": 1.5, "stroke-dasharray": "0" });
    paths.push(p);
    svg.appendChild(p);
  });
  if (opts.width) stage.style.maxWidth = `${opts.width}px`;

  const draws: ReturnType<typeof preparePathDraw>[] = [];
  function layout() {
    const sr = stage.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${sr.width} ${sr.height}`);
    list.forEach((c, i) => {
      const ax = fr.left - sr.left + c.at[0] * fr.width;
      const ay = fr.top - sr.top + c.at[1] * fr.height;
      const lr = labels[i].getBoundingClientRect();
      const side = c.side ?? (i % 2 ? "left" : "right");
      const lx = side === "right" ? lr.left - sr.left : lr.right - sr.left;
      const ly = lr.top - sr.top + lr.height / 2;
      const mx = (ax + lx) / 2;
      paths[i].setAttribute("d", `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${ly}, ${lx} ${ly}`);
      draws[i] = preparePathDraw(paths[i]);
      if (labels[i].classList.contains("is-on")) draws[i].set(1);
    });
  }
  const ro = new ResizeObserver(layout);
  ro.observe(stage);
  requestAnimationFrame(layout);

  function reveal(i: number, on = true) {
    if (!draws[i]) layout();
    if (reducedMotion() || !on) {
      draws[i]?.set(on ? 1 : 0);
      labels[i].classList.toggle("is-on", on);
      return;
    }
    const d = draws[i];
    const start = performance.now();
    const dur = 500;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      d.set(1 - Math.pow(1 - p, 2));
      if (p < 1) requestAnimationFrame(step);
      else labels[i].classList.add("is-on");
    };
    requestAnimationFrame(step);
  }
  function revealAll() {
    list.forEach((_, i) => setTimeout(() => reveal(i), reducedMotion() ? 0 : i * 350));
  }
  /** Draw point marker circles too. */
  list.forEach((c) => {
    const dot = h("span", { class: "callout-dot", "aria-hidden": "true", style: `left:${c.at[0] * 100}%;top:${c.at[1] * 100}%` });
    frame.style.position = frame.style.position || "relative";
    frame.appendChild(dot);
  });
  return { stage, reveal, revealAll, labels };
}
