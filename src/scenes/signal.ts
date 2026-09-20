// "Raw signal to human meaning" (spec §7, [B]). A vertical stream of readings
// collapses on scroll into a day's trace, which collapses into "78 min
// outside", which for the child becomes a seedling, a stem, a sunflower.
// Four beats: sensor → signal → interpretation → behaviour.
import { ABOUT } from "@content/about";
import { createPlant } from "../components/plant";
import { sectionHead } from "../components/ui";
import { clamp, fmt, h, s } from "../lib/dom";
import { scrub } from "../lib/motion";

export function signalScene() {
  const C = ABOUT.signal;

  // Beat 1 — the stream
  const stream = h(
    "ol",
    { class: "sig-stream", "aria-label": "Sensor readings, one per minute" },
    ...C.readings.map((r) => h("li", null, h("span", { class: "sig-t" }, r.t), h("span", { class: "sig-v" }, `${fmt(r.lux)} lux`))),
  );

  // Beat 2 — a day's trace (log lux)
  const W = 480;
  const H = 180;
  const pts: [number, number][] = [
    [6, 5], [7, 40], [7.5, 300], [8, 9800], [8.3, 11000], [8.6, 600], [9, 250], [12, 300], [12.3, 9000], [12.8, 12000], [13.1, 8000], [13.4, 400], [16, 350], [16.5, 8000], [17.4, 9000], [17.8, 2000], [18.2, 200], [19, 60], [21, 20], [22.5, 5],
  ];
  const X = (hh: number) => ((hh - 5) / 18) * (W - 40) + 30;
  const Y = (lux: number) => H - 20 - (Math.log10(Math.max(1, lux)) / 4.2) * (H - 40);
  const d = pts.map(([hh, l], i) => `${i ? "L" : "M"} ${X(hh).toFixed(1)} ${Y(l).toFixed(1)}`).join(" ");
  const thresholdY = Y(1000);
  const trace = s("path", { d, fill: "none", stroke: "var(--ink)", "stroke-width": 2, class: "sig-trace" });
  const above = s("path", { d: `${d} L ${X(22.5)} ${thresholdY} L ${X(6)} ${thresholdY} Z`, fill: "var(--amber)", opacity: 0.25, "clip-path": "url(#sig-clip)" });
  const traceSvg = s(
    "svg",
    { viewBox: `0 0 ${W} ${H}`, class: "sig-trace-svg", role: "img", "aria-label": "One day's light trace: dim indoors, bright on the walk to school, at lunchtime and in the late afternoon." },
    s("defs", null, s("clipPath", { id: "sig-clip" }, s("rect", { x: 0, y: 0, width: W, height: thresholdY }))),
    s("line", { x1: 30, y1: thresholdY, x2: W - 10, y2: thresholdY, stroke: "var(--muted)", "stroke-dasharray": "4 4" }),
    s("text", { x: W - 10, y: thresholdY - 6, "text-anchor": "end", class: "axis-text" }, "outdoor threshold ~1,000 lux"),
    above,
    trace,
    ...[6, 9, 12, 15, 18, 21].map((hh) => s("text", { x: X(hh), y: H - 4, "text-anchor": "middle", class: "axis-text" }, `${hh}:00`)),
  );

  // Beat 3 — minutes
  const minutes = h("p", { class: "sig-minutes" }, h("span", { class: "sig-minutes-num" }, "78"), h("span", null, " min outside"));

  // Beat 4 — plant
  const plant = createPlant({ copy: false, label: "Sunflower growing with minutes outside" });

  const stage = h(
    "div",
    { class: "sig-stage" },
    h("div", { class: "sig-beat sig-beat--1" }, stream),
    h("div", { class: "sig-beat sig-beat--2" }, traceSvg),
    h("div", { class: "sig-beat sig-beat--3" }, minutes),
    h("div", { class: "sig-beat sig-beat--4" }, plant.el),
  );
  const beatList = h(
    "ol",
    { class: "sig-beats" },
    ...C.beats.map((b) => h("li", { class: "sig-beat-label" }, h("strong", null, b.label), h("span", null, b.text))),
  );
  const pin = h("div", { class: "sig-pin" }, h("div", { class: "wrap sig-grid" }, stage, beatList));
  const el = h(
    "section",
    { class: "section section--tight signal-section" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body)),
    pin,
  );

  function set(p: number) {
    // 4 beats across 0–1, each with a transition band.
    const beat = clamp(p * 4, 0, 4);
    stage.style.setProperty("--beat", beat.toFixed(3));
    const idx = Math.min(3, Math.floor(beat));
    stage.querySelectorAll<HTMLElement>(".sig-beat").forEach((b, i) => {
      const dist = Math.abs(i + 0.5 - beat);
      const o = clamp(1.6 - dist * 1.2, 0, 1); // fully opaque at the beat's centre
      b.style.opacity = String(o);
      b.style.transform = `translateY(${(i + 0.5 - beat) * -30}px) scale(${0.85 + 0.15 * o})`;
      b.style.pointerEvents = o > 0.5 ? "auto" : "none";
    });
    beatList.querySelectorAll("li").forEach((li, i) => li.classList.toggle("is-on", i === idx));
    // Beat 2: trace draws in; Beat 4: plant grows to 65 % (78 / 120)
    const t2 = clamp((beat - 1) / 0.8, 0, 1);
    trace.style.strokeDasharray = "2000";
    trace.style.strokeDashoffset = String(2000 * (1 - t2));
    const t4 = clamp((beat - 3) / 0.9, 0, 1);
    plant.set(t4 * 0.65);
  }

  function mount() {
    scrub(
      { set },
      {
        trigger: pin,
        pin,
        end: "+=280%",
        steps: [
          { label: "Sensor", p: 0.12, describe: C.beats[0].text },
          { label: "Signal", p: 0.45, describe: C.beats[1].text },
          { label: "Interpretation", p: 0.62, describe: C.beats[2].text },
          { label: "Behaviour", p: 1, describe: C.beats[3].text },
        ],
        controlLabel: "Step through sensor, signal, interpretation, behaviour",
      },
    );
  }
  return { el, mount };
}
