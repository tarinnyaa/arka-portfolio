// "The sensor" — the ActLumus photograph (placeholder if missing), three
// restrained labels, measurement dots travelling from sensor to phone, then
// "No location." Parallax on pointer is [C] and disabled under reduced motion.
import { ABOUT } from "@content/about";
import { ASSETS } from "@content/shared";
import { img } from "../components/assets";
import { phoneFrame } from "../components/frames";
import { myopiaHome } from "../components/screens";
import { sectionHead } from "../components/ui";
import { h, s } from "../lib/dom";
import { onEnter, reducedMotion } from "../lib/motion";

export function sensorScene() {
  const C = ABOUT.sensor;
  const photo = h(
    "div",
    { class: "sensor-photo" },
    img(ASSETS.actlumus, C.alt, { w: 320, h: 320, label: C.missingLabel, class: "sensor-img" }),
  );
  const labels = h(
    "ul",
    { class: "sensor-labels", role: "list" },
    ...C.labels.map((l) => h("li", null, l)),
  );
  // Measurement dots path: sensor → phone
  const dotsSvg = s("svg", { class: "sensor-dots", viewBox: "0 0 300 60", "aria-hidden": "true", preserveAspectRatio: "none" });
  const path = s("path", { d: "M 0 30 C 100 10, 200 50, 300 30", fill: "none", stroke: "var(--line)", "stroke-width": 2, "stroke-dasharray": "4 6" });
  dotsSvg.appendChild(path);
  const dots = [0, 1, 2, 3].map(() => s("circle", { r: 5, fill: "var(--amber)", opacity: 0 }));
  dots.forEach((d) => dotsSvg.appendChild(d));

  const phone = phoneFrame(myopiaHome(), { scale: 0.42, label: "Phone showing the parent's Home tab" });

  const el = h(
    "section",
    { class: "section sensor-section" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading, C.body),
      h("div", { class: "sensor-stage" }, photo, labels, dotsSvg, phone),
      h(
        "div",
        { class: "sensor-nolocation" },
        h("p", { class: "pull" }, C.noLocation),
        h("p", { class: "lede" }, C.noLocationBody),
      ),
    ),
  );

  function mount() {
    const rm = reducedMotion();
    if (!rm && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      el.addEventListener("pointermove", (e) => {
        const r = photo.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        photo.style.transform = `translate(${dx * -10}px, ${dy * -10}px)`;
      });
      el.addEventListener("pointerleave", () => (photo.style.transform = ""));
    }
    // Dots travel sensor → phone once on entry (a transfer, not decoration).
    onEnter(el, () => {
      const len = path.getTotalLength();
      if (rm) {
        dots.forEach((d, i) => {
          const pt = path.getPointAtLength((len * (i + 1)) / 5);
          d.setAttribute("cx", String(pt.x));
          d.setAttribute("cy", String(pt.y));
          d.setAttribute("opacity", "1");
        });
        return;
      }
      const t0 = performance.now();
      const step = (t: number) => {
        const e = (t - t0) / 1800;
        dots.forEach((d, i) => {
          const p = e - i * 0.18;
          if (p < 0 || p > 1) {
            d.setAttribute("opacity", "0");
            return;
          }
          const pt = path.getPointAtLength(len * p);
          d.setAttribute("cx", String(pt.x));
          d.setAttribute("cy", String(pt.y));
          d.setAttribute("opacity", "1");
        });
        if (e < 1.6) requestAnimationFrame(step);
        else
          dots.forEach((d, i) => {
            const pt = path.getPointAtLength((len * (i + 1)) / 5);
            d.setAttribute("cx", String(pt.x));
            d.setAttribute("cy", String(pt.y));
            d.setAttribute("opacity", "1");
          });
      };
      requestAnimationFrame(step);
    });
  }
  return { el, mount };
}
