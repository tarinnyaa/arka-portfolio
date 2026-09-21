// Motion helpers.
//
// Architecture (site-wide rules):
//   1. Normal document flow is the default. Sections enter once with
//      `entrance()` (opacity 0→1, translateY 16px→0, 500 ms) and never move
//      again. No parallax, no scroll-linked transforms.
//   2. Scroll-driven storytelling exists only through `pinnedSequence()`: one
//      outer scroll wrapper, one sticky viewport, fixed internal geometry,
//      discrete states with resting intervals and controlled transitions.
//      Never several independently sticky children inside one section.
//   3. Animate transform and opacity only.
//   4. Reduced motion: every sequence renders its end state with a segmented
//      control; entrances are instant; the route wipe is disabled.
//   5. Narrow screens (< 900 px): sequences render their states as stacked
//      normal-flow blocks instead of pinning.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, h } from "./dom";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "power2.out", duration: 0.45 });

export { gsap, ScrollTrigger };

const rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let forcedRM: boolean | null = null;

export function reducedMotion(): boolean {
  return forcedRM ?? rmQuery.matches;
}
/** Test hook: lets the verification harness flip reduced motion at runtime. */
export function forceReducedMotion(v: boolean | null) {
  forcedRM = v;
  syncRMClass();
}
function syncRMClass() {
  document.documentElement.classList.toggle("reduce-motion", reducedMotion());
}
rmQuery.addEventListener("change", syncRMClass);
syncRMClass();

/** Below this width pinned sequences stack as normal flow. */
export const STACK_BELOW = 900;
export function narrow(): boolean {
  return window.innerWidth < STACK_BELOW;
}

/** Kill every ScrollTrigger and tween: called on route change. */
export function killAllMotion() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  rafs.forEach((r) => cancelAnimationFrame(r));
  rafs.clear();
}

export function refreshTriggers() {
  ScrollTrigger.refresh();
}

// Timers owned by scenes, cleared on route change.
const timers = new Set<ReturnType<typeof setTimeout>>();
const rafs = new Set<number>();
export function later(fn: () => void, ms: number) {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
  return t;
}

/**
 * Time-based tween of a scalar 0→1 over `ms` with power2.out easing. Under
 * reduced motion it jumps to 1. Returns a cancel function.
 */
export function tween(ms: number, onUpdate: (p: number) => void, onDone?: () => void): () => void {
  if (reducedMotion() || ms <= 0) {
    onUpdate(1);
    onDone?.();
    return () => {};
  }
  const t0 = performance.now();
  let id = 0;
  const step = (t: number) => {
    rafs.delete(id);
    const p = clamp((t - t0) / ms, 0, 1);
    onUpdate(1 - Math.pow(1 - p, 2));
    if (p < 1) {
      id = requestAnimationFrame(step);
      rafs.add(id);
    } else onDone?.();
  };
  id = requestAnimationFrame(step);
  rafs.add(id);
  return () => {
    cancelAnimationFrame(id);
    rafs.delete(id);
  };
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

/**
 * Entrance animation for normal-flow content: opacity 0→1, translateY 16→0,
 * 500 ms, once. Instant under reduced motion.
 */
export function entrance(el: Element, start = "top 85%") {
  el.classList.add("enter");
  if (reducedMotion()) {
    el.classList.add("is-in");
    return;
  }
  // Already in view on mount (above the fold): reveal immediately.
  const r = el.getBoundingClientRect();
  if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
    el.classList.add("is-in");
    return;
  }
  ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => el.classList.add("is-in") });
}

/** Apply `entrance()` to every `[data-enter]` element in a page. */
export function autoEntrances(root: Element) {
  root.querySelectorAll<HTMLElement>("[data-enter]").forEach((el) => entrance(el));
}

export type Step = { label: string; p: number; describe?: string };

/** Segmented control that drives a `set(p)`; used under reduced motion and
 *  as the manual alternative wherever a sequence needs one. */
export function buildStepper(
  set: (p: number) => void,
  steps: Step[],
  opts: { label?: string; dark?: boolean; note?: string; alwaysVisible?: boolean } = {},
): HTMLElement {
  const group = h("div", { class: `segmented${opts.dark ? " segmented--dark" : ""}`, role: "group", "aria-label": opts.label ?? "Step through the scene" });
  const live = h("p", { class: "visually-hidden", "aria-live": "polite" });
  const buttons = steps.map((st) => {
    const b = h(
      "button",
      {
        type: "button",
        "aria-pressed": "false",
        "data-p": String(st.p),
        onclick: () => {
          set(st.p);
          buttons.forEach((x) => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
          if (st.describe) live.textContent = st.describe;
        },
      },
      st.label,
    );
    group.appendChild(b);
    return b;
  });
  const wrap = h(
    "div",
    { class: `rm-stepper${opts.alwaysVisible ? " rm-stepper--always" : ""}` },
    opts.note === "" ? null : h("span", { class: "rm-label" }, opts.note ?? "Reduced motion: step through manually"),
    group,
    live,
  );
  (wrap as unknown as { select: (p: number) => void }).select = (p: number) => {
    let best = 0;
    steps.forEach((st, i) => {
      if (Math.abs(st.p - p) < Math.abs(steps[best].p - p)) best = i;
    });
    buttons.forEach((b, i) => b.setAttribute("aria-pressed", String(i === best)));
  };
  return wrap;
}

/** Progress helpers for transitions. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);
/** exit → transform → enter phases of a transition t∈[0,1]. */
export const phases = (t: number) => ({ out: seg(t, 0, 0.38), mid: seg(t, 0.3, 0.72), in: seg(t, 0.62, 1) });

export type SequenceStage = {
  el: HTMLElement;
  /** Render state `i` at rest (t = 0, r = progress through the rest interval)
   *  or transitioning to `i + 1` (t ∈ (0, 1], r = 1). */
  apply: (i: number, t: number, r: number) => void;
};

export type SequenceOptions = {
  /** Section element that owns the sequence (becomes the scroll wrapper). */
  section: HTMLElement;
  /** Number of discrete states. */
  states: number;
  /** vh per resting state and per transition. */
  restVh?: number;
  transVh?: number;
  /** Build one stage. Called once for the sticky viewport; on narrow screens
   *  once per state (stacked). */
  createStage: () => SequenceStage;
  /** Optional per-state caption for the stacked (mobile) layout. */
  stackCaption?: (i: number) => HTMLElement | null;
  /** Optional element rendered inside the sticky viewport above the stage
   *  (e.g. a progress rail). Receives the active state index. */
  rail?: { el: HTMLElement; set: (i: number, t: number) => void };
  /** Segmented-control labels for reduced motion. */
  stepLabels: string[];
  stepDescribe?: (i: number) => string;
  dark?: boolean;
  controlLabel?: string;
  /** Continuous mode: `apply(0, p)` with p ∈ [0, 1] across the whole range. */
  continuous?: boolean;
  /** Continuous mode: explicit progress for each step (defaults to even spacing). */
  stepPositions?: number[];
  /** Continuous mode: progress selected under reduced motion (defaults to the last step). */
  rmDefault?: number;
  /** Called after the sticky viewport is built (desktop/RM). */
  onBuilt?: (stage: SequenceStage, viewport: HTMLElement) => void;
};

/**
 * The one sticky architecture. Returns a mount() to call once the section is
 * in the document and the DOM element for the sequence body (already appended
 * into `section`).
 */
export function pinnedSequence(opts: SequenceOptions) {
  const n = opts.states;
  const R = opts.restVh ?? 100;
  const T = opts.transVh ?? 40;
  const total = opts.continuous ? (opts.restVh ?? 300) : n * R + (n - 1) * T;
  const body = h("div", { class: `seq${opts.dark ? " seq--dark" : ""}` });
  opts.section.appendChild(body);

  let stage: SequenceStage | null = null;
  let stepper: HTMLElement | null = null;

  function setProgress(p: number) {
    if (!stage) return;
    if (opts.continuous) {
      stage.apply(0, clamp(p, 0, 1), 1);
      opts.rail?.set(0, p);
      return;
    }
    const u = clamp(p, 0, 1) * total;
    const segLen = R + T;
    const i = Math.min(n - 1, Math.floor(u / segLen));
    const local = u - i * segLen;
    let t = 0;
    let r = clamp(local / R, 0, 1);
    if (i < n - 1 && local > R) {
      t = clamp((local - R) / T, 0, 1);
      r = 1;
    }
    if (i === n - 1) t = 0;
    stage.apply(i, t, r);
    opts.rail?.set(i, t);
  }

  /** Progress at which state i rests (its midpoint). */
  const restP = (i: number) => (opts.continuous ? opts.stepPositions?.[i] ?? i / Math.max(1, n - 1) : (i * (R + T) + R / 2) / total);

  function buildSticky() {
    stage = opts.createStage();
    const viewport = h("div", { class: "seq-viewport" }, opts.rail?.el ?? null, stage.el);
    const wrapper = h("div", { class: "seq-wrapper", style: `--seq-total:${total}vh` }, viewport);
    body.appendChild(wrapper);
    opts.onBuilt?.(stage, viewport);
    return { wrapper, viewport };
  }

  function mount() {
    const steps: Step[] = opts.stepLabels.map((label, i) => ({ label, p: restP(i), describe: opts.stepDescribe?.(i) }));

    if (narrow() && !reducedMotion()) {
      // Stacked: one static stage per state, normal flow.
      const stack = h("div", { class: "seq-stack" });
      for (let i = 0; i < n; i++) {
        const st = opts.createStage();
        st.apply(opts.continuous ? 0 : i, opts.continuous ? restP(i) : 0, 1);
        const cap = opts.stackCaption?.(i);
        const block = h("div", { class: "seq-stack-item", "data-enter": true }, cap, st.el);
        stack.appendChild(block);
      }
      body.appendChild(stack);
      autoEntrances(stack);
      return;
    }

    const { wrapper } = buildSticky();
    stepper = buildStepper(
      (p) => {
        setProgress(p);
      },
      steps,
      { label: opts.controlLabel, dark: opts.dark },
    );
    body.insertBefore(stepper, wrapper);

    if (reducedMotion()) {
      wrapper.classList.add("seq-wrapper--static");
      const last = opts.rmDefault ?? steps[steps.length - 1].p;
      setProgress(last);
      (stepper as unknown as { select: (p: number) => void }).select(last);
      return;
    }
    setProgress(0);
    const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 0;
    // Pre-roll: the stage fades in (opacity only) as the wrapper approaches
    // the pin, so no stage content is visible under the preceding header.
    const viewport = wrapper.querySelector<HTMLElement>(".seq-viewport");
    if (viewport) {
      viewport.style.opacity = "0";
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top 85%",
        end: () => `top ${navH()}px`,
        onUpdate: (self) => {
          viewport.style.opacity = String(clamp(self.progress, 0, 1));
        },
        onLeave: () => (viewport.style.opacity = "1"),
        onEnterBack: () => (viewport.style.opacity = "1"),
      });
    }
    ScrollTrigger.create({
      trigger: wrapper,
      start: () => `top ${navH()}px`,
      end: () => `bottom ${window.innerHeight}px`,
      scrub: 0.6,
      onUpdate: (self) => setProgress(self.progress),
    });
  }

  return { el: body, mount, setProgress };
}

/**
 * Normal-flow alternative to a pinned sequence: the scene plays once, time
 * based, when it enters the viewport, and a visible segmented control lets
 * the reader step through it manually (also the reduced motion path).
 */
export function playOnEnter(
  set: (p: number) => void,
  opts: { trigger: Element; steps: Step[]; durationMs?: number; controlMount: Element; controlLabel?: string; rmDefault?: number; dark?: boolean; start?: string },
) {
  const stepper = buildStepper(
    (p) => {
      stop?.();
      set(p);
    },
    opts.steps,
    { label: opts.controlLabel, dark: opts.dark, note: "", alwaysVisible: true },
  );
  opts.controlMount.appendChild(stepper);
  const select = (stepper as unknown as { select: (p: number) => void }).select;
  let stop: (() => void) | null = null;
  const last = opts.steps[opts.steps.length - 1].p;
  if (reducedMotion()) {
    const p = opts.rmDefault ?? last;
    set(p);
    select(p);
    return;
  }
  set(0);
  select(0);
  onEnter(
    opts.trigger,
    () => {
      stop = tween(opts.durationMs ?? 4000, (p) => {
        set(p * last);
        select(p * last);
      });
    },
    opts.start ?? "top 60%",
  );
}

/** Draw an SVG path (stroke-dasharray) as a tween, 0→1. */
export function preparePathDraw(path: SVGPathElement | SVGLineElement | SVGPolylineElement | SVGCircleElement) {
  const len = (path as SVGGeometryElement).getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  return {
    len,
    set(p: number) {
      path.style.strokeDashoffset = `${len * (1 - clamp(p, 0, 1))}`;
    },
  };
}

/** Sequential illumination helper: returns index of active node for p. */
export function stepIndex(p: number, n: number): number {
  return Math.min(n - 1, Math.floor(p * n + 1e-6));
}
