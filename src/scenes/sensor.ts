// "The sensor": what ARKA sees. Real ActLumus cutout on the cream canvas;
// three restrained data streams (light, activity, time) leave the device and
// converge on a large ARKA phone whose gauge fills to 78 / 120.
// Entrance-only motion, time based, once.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img } from "../components/assets";
import { phoneFrame } from "../components/frames";
import { myopiaHome } from "../components/screens";
import { h, s } from "../lib/dom";
import { later, onEnter, preparePathDraw, reducedMotion, tween } from "../lib/motion";

const W = 420;
const H = 320;

export function sensorScene() {
  const C = ABOUT.sensor;

  const device = h("div", { class: "sen-device" }, h("div", { class: "sen-arc", "aria-hidden": "true" }), img(ASSETS.actlumus, C.alt, { h: 400, w: "auto", class: "sen-img" }));

  const svg = s("svg", { class: "sen-streams", viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
  const lanes = [
    { key: "light", y0: 70, y1: 130 },
    { key: "activity", y0: 160, y1: 160 },
    { key: "time", y0: 250, y1: 190 },
  ];
  const lanePath = (y0: number, y1: number) => `M 0 ${y0} C 150 ${y0}, 250 ${y1}, ${W} ${y1}`;
  const paths = lanes.map((l) => s("path", { d: lanePath(l.y0, l.y1), fill: "none", stroke: "#E8A825", "stroke-width": 1.5, "stroke-linecap": "round", opacity: 0.85 }));
  svg.append(...paths);
  const labelAt = (y: number, text: string) => s("text", { x: 0, y: y - 12, class: "sen-lane-label" }, text.toUpperCase());
  svg.append(labelAt(lanes[0].y0, C.streams.light.label), labelAt(lanes[1].y0, C.streams.activity.label), labelAt(lanes[2].y0, C.streams.time.label));
  const valueGroups: SVGGElement[] = [];
  const along = (l: (typeof lanes)[0], t: number) => {
    const p0 = { x: 0, y: l.y0 },
      p1 = { x: 150, y: l.y0 },
      p2 = { x: 250, y: l.y1 },
      p3 = { x: W, y: l.y1 };
    const u = 1 - t;
    return { x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x, y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y };
  };
  const chips = (l: (typeof lanes)[0], vals: string[], unit?: string) =>
    vals.map((v, i) => {
      const pt = along(l, 0.16 + i * 0.24);
      const g = s("g", { class: "sen-val", transform: `translate(${pt.x} ${pt.y})` });
      g.appendChild(s("rect", { x: -4, y: -20, width: v.length * 7.2 + 8 + (unit ? 22 : 0), height: 18, rx: 4, fill: "#FAF8F5" }));
      g.appendChild(s("text", { x: 0, y: -6, class: `sen-val-text${i === vals.length - 1 && unit ? " is-outdoor" : ""}` }, unit ? `${v} ${unit}` : v));
      valueGroups.push(g);
      return g;
    });
  svg.append(...chips(lanes[0], C.streams.light.values, C.streams.light.unit));
  const wave = s("path", { class: "sen-val", d: waveD(lanes[1]), fill: "none", stroke: "#1a1a1a", "stroke-width": 1.4, "stroke-linecap": "round", opacity: 0.8 });
  valueGroups.push(wave as unknown as SVGGElement);
  svg.appendChild(wave);
  svg.append(...chips(lanes[2], C.streams.time.values));
  const streamsWrap = h("div", { class: "sen-streams-wrap" }, h("span", { class: "mono-label sen-mbm" }, C.streamsLabel), svg);

  const screen = myopiaHome({ minutes: 78 });
  const phone = phoneFrame(screen, { scale: 0.4, label: C.phoneLabel });
  const gaugeFill = screen.querySelector<SVGPathElement>(".mgauge-fill");
  const needle = screen.querySelector<SVGLineElement>(".mgauge-needle");
  const gaugeValue = screen.querySelector<HTMLElement>(".m-gauge-value");
  const coachBig = screen.querySelector<HTMLElement>(".m-coach-big");

  const composition = h("div", { class: "sen-comp" }, device, streamsWrap, h("div", { class: "sen-phone" }, phone));

  const el = h(
    "section",
    { class: "section sen-section", id: "sensor" },
    h("div", { class: "wrap" }, h("div", { class: "section-head sen-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.sub)), composition),
  );

  function setGauge(p: number) {
    const minutes = Math.round(78 * p);
    if (gaugeFill) {
      const len = gaugeFill.getTotalLength();
      gaugeFill.style.strokeDasharray = `${len}`;
      gaugeFill.style.strokeDashoffset = `${len * (1 - p)}`;
    }
    if (needle) needle.style.transform = `rotate(${-(1 - p) * (78 / 120) * 180}deg)`;
    if (gaugeValue) gaugeValue.textContent = `${minutes} minutes`;
    if (coachBig) coachBig.textContent = `${minutes} minutes`;
  }

  function mount() {
    const draws = paths.map((p) => preparePathDraw(p));
    valueGroups.forEach((g) => g.classList.add("is-hidden"));
    phone.classList.add("sen-phone-frame");
    if (reducedMotion()) {
      draws.forEach((d) => d.set(1));
      valueGroups.forEach((g) => g.classList.remove("is-hidden"));
      setGauge(1);
      return;
    }
    setGauge(0);
    onEnter(composition, () => {
      device.classList.add("is-in");
      later(() => draws.forEach((d) => tween(700, (p) => d.set(p))), 300);
      later(() => valueGroups.forEach((g, i) => later(() => g.classList.remove("is-hidden"), i * 90)), 900);
      later(() => {
        phone.classList.add("is-active");
        tween(1100, setGauge);
      }, 1700);
    });
  }
  return { el, mount };
}

function waveD(l: { y0: number; y1: number }) {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = 0.14 + (i / 40) * 0.62;
    const x = t * W;
    const y = l.y0 + Math.sin(i * 0.9) * (i % 7 === 0 ? 11 : 5) * (i > 30 ? 0.5 : 1);
    pts.push(`${i ? "L" : "M"} ${x.toFixed(1)} ${(y - 12).toFixed(1)}`);
  }
  return pts.join(" ");
}
