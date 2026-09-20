// Motion helpers. The motion law (spec §4): motion must explain. Every
// helper here either scrubs a scene to scroll or reveals a relationship on
// entry — nothing decorative. Under prefers-reduced-motion every scrubbed
// scene renders its end state and exposes a segmented control instead.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { h } from "./dom";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power2.out", duration: 0.45 });

export { gsap, ScrollTrigger };

const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let forcedRM: boolean | null = null;

export function reducedMotion(): boolean {
  return forcedRM ?? rmQuery.matches;
}
/** Test hook — lets the verification harness flip reduced motion at runtime. */
export function forceReducedMotion(v: boolean | null) {
  forcedRM = v;
  syncRMClass();
}
function syncRMClass() {
  document.documentElement.classList.toggle("reduce-motion", reducedMotion());
}
rmQuery.addEventListener("change", syncRMClass);
syncRMClass();

/** Kill every ScrollTrigger and tween — called on route change. */
export function killAllMotion() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
}

export function refreshTriggers() {
  ScrollTrigger.refresh();
}

/**
 * Run `cb` once when `el` enters the viewport. Under reduced motion it runs
 * immediately so the end state is rendered without waiting for scroll.
 */
export function onEnter(el: Element, cb: () => void, start = "top 78%") {
  if (reducedMotion()) {
    cb();
    return;
  }
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: cb });
}

export type ScrubScene = {
  /** Set the scene to progress 0–1. Must be idempotent. */
  set: (p: number) => void;
};

export type ScrubOptions = {
  trigger: Element;
  /** Element to pin, or false. */
  pin?: Element | false;
  /** ScrollTrigger start/end, e.g. "top top" / "+=400%". */
  start?: string;
  end?: string;
  /** Named steps for the reduced-motion segmented control (label, progress). */
  steps: { label: string; p: number; describe?: string }[];
  /** Where to mount the segmented control. Defaults to before the trigger. */
  controlMount?: Element;
  /** Progress to show at rest under reduced motion. Defaults to the last step. */
  rmDefault?: number;
  controlLabel?: string;
  dark?: boolean;
};

/**
 * Scroll-scrubbed scene. Returns a `set(p)` you can also drive manually.
 * Reduced motion: renders the end state and mounts a segmented control that
 * steps through `steps`. The control is also rendered (hidden via CSS) in
 * the motion case so the DOM is identical either way.
 */
export function scrub(scene: ScrubScene, opts: ScrubOptions): ScrollTrigger | null {
  const control = buildStepper(scene, opts);
  (opts.controlMount ?? opts.trigger.parentElement ?? opts.trigger).insertBefore(
    control,
    opts.controlMount ? null : opts.trigger,
  );

  if (reducedMotion()) {
    const p = opts.rmDefault ?? opts.steps[opts.steps.length - 1].p;
    scene.set(p);
    control.querySelectorAll("button").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.p) === p));
    });
    return null;
  }

  scene.set(0);
  return ScrollTrigger.create({
    trigger: opts.trigger,
    start: opts.start ?? (opts.pin ? "top top" : "top 70%"),
    end: opts.end ?? "+=300%",
    pin: opts.pin ?? false,
    scrub: 0.6,
    anticipatePin: 1,
    onUpdate: (self) => scene.set(self.progress),
  });
}

export function buildStepper(scene: ScrubScene, opts: ScrubOptions): HTMLElement {
  const label = opts.controlLabel ?? "Step through the scene";
  const group = h("div", {
    class: `segmented${opts.dark ? " segmented--dark" : ""}`,
    role: "group",
    "aria-label": label,
  });
  const live = h("p", { class: "visually-hidden", "aria-live": "polite" });
  for (const st of opts.steps) {
    const b = h(
      "button",
      {
        type: "button",
        "aria-pressed": "false",
        "data-p": String(st.p),
        onclick: () => {
          scene.set(st.p);
          group.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
          if (st.describe) live.textContent = st.describe;
        },
      },
      st.label,
    );
    group.appendChild(b);
  }
  return h(
    "div",
    { class: "rm-stepper" },
    h("span", { class: "rm-label" }, "Reduced motion: step through manually"),
    group,
    live,
  );
}

/** Draw an SVG path (stroke-dasharray) as a tween, 0→1. */
export function preparePathDraw(path: SVGPathElement | SVGLineElement | SVGPolylineElement) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return {
    len,
    set(p: number) {
      path.style.strokeDashoffset = `${len * (1 - Math.min(1, Math.max(0, p)))}`;
    },
  };
}

/** Sequential illumination helper: returns index of active node for p. */
export function stepIndex(p: number, n: number): number {
  return Math.min(n - 1, Math.floor(p * n + 1e-6));
}
