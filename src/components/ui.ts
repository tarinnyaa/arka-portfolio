// Shared UI (spec §5): GoalChips, LoopDiagram, ConfigCard, NudgeBanner,
// ChartFrame, StatusRibbon, DesignDecision, RationaleDrawer, section heads.
import { CHART, NEXT_LINKS, STATUS } from "@content/shared";
import { h, id, s } from "../lib/dom";
import { onEnter, reducedMotion } from "../lib/motion";
import { href } from "../lib/router";
import { citeInline, evidence } from "./evidence";
import { arrowIcon, checkIcon, crossIcon, sunIcon } from "./icons";

export function sectionHead(kicker: string | null, heading: string, body?: string | null, level: 2 | 3 = 2): HTMLElement {
  const H = level === 2 ? "h2" : "h3";
  return h(
    "div",
    { class: "section-head" },
    kicker ? h("span", { class: "kicker" }, kicker) : null,
    h(H, null, heading),
    body ? h("p", { class: "lede" }, body) : null,
  );
}

export function goalChips(goals: { text: string; refs: string[] }[]): HTMLElement {
  return h(
    "ul",
    { class: "goal-chips", role: "list", "aria-label": "Research targets" },
    ...goals.map((g) => h("li", { class: "goal-chip" }, h("span", null, g.text), citeInline(...g.refs))),
  );
}

export function statusRibbon(status: "live" | "designed"): HTMLElement {
  const live = status === "live";
  return h(
    "p",
    { class: `status-ribbon status-ribbon--${status}` },
    h("span", { class: "status-dot", "aria-hidden": "true" }),
    h("strong", null, live ? STATUS.live : STATUS.designed),
    h("span", { class: "status-hint" }, live ? STATUS.liveHint : STATUS.designedHint),
  );
}

/**
 * LoopDiagram: 3–5 nodes in a cycle with arrows; nodes illuminate in
 * sequence on scroll (each illumination = the next link in the causal chain).
 */
export function loopDiagram(nodes: { label: string; refs?: string[] }[], opts: { accent?: string; label?: string } = {}): HTMLElement {
  const n = nodes.length;
  const W = 720;
  const H = n <= 3 ? 300 : 360;
  const cx = W / 2;
  const cy = H / 2;
  const rx = W / 2 - 110;
  const ry = H / 2 - 44;
  const pts = nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), a };
  });
  const svg = s("svg", {
    class: "loop-svg",
    viewBox: `0 0 ${W} ${H}`,
    role: "img",
    "aria-label": opts.label ?? `A cycle of ${n} linked states: ${nodes.map((x) => x.label).join("; ")}.`,
  });
  const defs = s("defs", null);
  const mid = id("arrow");
  defs.appendChild(
    s(
      "marker",
      { id: mid, viewBox: "0 0 10 10", refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" },
      s("path", { d: "M0 0L10 5 0 10z", fill: "var(--ink)" }),
    ),
  );
  svg.appendChild(defs);
  const arrows: SVGPathElement[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    // Shrink so arrows start/end just outside node pills.
    const t0 = 0.24;
    const t1 = 0.76;
    const sx = a.x + (b.x - a.x) * t0;
    const sy = a.y + (b.y - a.y) * t0;
    const ex = a.x + (b.x - a.x) * t1;
    const ey = a.y + (b.y - a.y) * t1;
    // Curve outward from the centre.
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const dx = mx - cx;
    const dy = my - cy;
    const len = Math.hypot(dx, dy) || 1;
    const qx = mx + (dx / len) * 26;
    const qy = my + (dy / len) * 26;
    const p = s("path", {
      class: "loop-arrow",
      d: `M ${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}`,
      fill: "none",
      stroke: "var(--ink)",
      "stroke-width": 1.6,
      "marker-end": `url(#${mid})`,
    });
    arrows.push(p);
    svg.appendChild(p);
  }
  const wrap = h("div", { class: "loop-diagram", style: opts.accent ? `--loop-accent:${opts.accent}` : undefined });
  wrap.appendChild(svg);
  const nodeEls = nodes.map((nd, i) => {
    const el = h(
      "div",
      { class: "loop-node", style: `left:${(pts[i].x / W) * 100}%;top:${(pts[i].y / H) * 100}%` },
      h("span", { class: "loop-node-num", "aria-hidden": "true" }, String(i + 1)),
      h("span", { class: "loop-node-text" }, nd.label, nd.refs?.length ? evidence(...nd.refs) : null),
    );
    wrap.appendChild(el);
    return el;
  });
  // Accessible text list (the SVG is summarised by aria-label; this is the readable order).
  const list = h(
    "ol",
    { class: "visually-hidden" },
    ...nodes.map((nd) => h("li", null, nd.label)),
  );
  wrap.appendChild(list);

  const light = (k: number) => {
    nodeEls.forEach((el, i) => el.classList.toggle("is-lit", i <= k));
    arrows.forEach((p, i) => p.classList.toggle("is-lit", i < k || (k >= n - 1 && i === n - 1)));
  };
  onEnter(wrap, () => {
    if (reducedMotion()) return light(n - 1);
    for (let k = 0; k < n; k++) setTimeout(() => light(k), k * 420);
  });
  return wrap;
}

export type ConfigSpec = {
  study: string;
  cohort: string;
  tabs: { label: string; on: boolean; note?: string }[];
  targets: string[];
  windows: string[];
  lumi: boolean;
  typeScale: string;
  arms: string[];
  extra?: string;
};

/** Researcher-portal panel. */
export function configCard(c: ConfigSpec): HTMLElement {
  const row = (label: string, value: Node | string) =>
    h("div", { class: "cfg-row" }, h("dt", null, label), h("dd", null, value));
  const toggles = h(
    "ul",
    { class: "cfg-toggles", role: "list" },
    ...c.tabs.map((t) =>
      h(
        "li",
        { class: `cfg-toggle${t.on ? " is-on" : ""}` },
        h(
          "span",
          { class: "cfg-switch", role: "img", "aria-label": t.on ? "enabled" : "disabled" },
          h("span", { class: "cfg-knob" }),
        ),
        h("span", { class: "cfg-toggle-label" }, t.label, t.note ? h("span", { class: "muted" }, ` · ${t.note}`) : null),
        h("span", { class: "cfg-state" }, t.on ? "✓" : "✗"),
      ),
    ),
  );
  return h(
    "section",
    { class: "config-card card", "aria-label": `Researcher portal configuration for ${c.study}` },
    h(
      "header",
      { class: "cfg-head" },
      h("span", { class: "kicker" }, "Researcher portal · configuration"),
      h("h3", null, c.study),
      h("p", { class: "muted" }, c.cohort),
    ),
    h(
      "dl",
      { class: "cfg-body" },
      row("Enabled tabs", toggles),
      row("Targets", h("ul", { role: "list", class: "cfg-list" }, ...c.targets.map((t) => h("li", null, t)))),
      row("Nudge windows", h("ul", { role: "list", class: "cfg-list" }, ...c.windows.map((t) => h("li", null, t)))),
      row("Lumi", h("span", { class: `cfg-pill ${c.lumi ? "on" : "off"}` }, c.lumi ? checkIcon(14) : crossIcon(14), c.lumi ? "On" : "Off")),
      row("Type scale", c.typeScale),
      row("Arms", h("ul", { role: "list", class: "cfg-list" }, ...c.arms.map((t) => h("li", null, t)))),
      c.extra ? row("Also", c.extra) : null,
    ),
  );
}

/** iOS-style notification. */
export function nudgeBanner(title: string, body: string, opts: { time?: string; class?: string } = {}): HTMLElement {
  return h(
    "div",
    { class: `nudge${opts.class ? " " + opts.class : ""}`, role: "group", "aria-label": `Notification: ${title}. ${body}` },
    h("span", { class: "nudge-icon", "aria-hidden": "true" }, sunIcon(18, "#fff")),
    h(
      "div",
      { class: "nudge-text" },
      h("p", { class: "nudge-app" }, h("span", null, "ARKA"), h("span", { class: "nudge-time" }, opts.time ?? "now")),
      h("p", { class: "nudge-title" }, title),
      h("p", { class: "nudge-body" }, body),
    ),
  );
}

/** Every chart lives here: title, screen-reader summary, "Illustrative data". */
export function chartFrame(title: string, summary: string, chart: Element, opts: { caption?: string; class?: string } = {}): HTMLElement {
  const sid = id("chart-sum");
  chart.setAttribute("aria-describedby", sid);
  return h(
    "figure",
    { class: `chart-frame card${opts.class ? " " + opts.class : ""}` },
    h("figcaption", { class: "chart-title" }, title),
    h("p", { id: sid, class: "visually-hidden" }, summary),
    h("div", { class: "chart-body" }, chart),
    opts.caption ? h("p", { class: "chart-caption" }, opts.caption) : null,
    h("p", { class: "chart-illustrative" }, CHART.illustrative),
  );
}

export function designDecision(d: { n: number; label: string; title: string; lines: string[]; designRefs?: string[] }): HTMLElement {
  return h(
    "aside",
    { class: "design-decision", "aria-label": `${d.label} ${d.n}` },
    h("span", { class: "dd-num", "aria-hidden": "true" }, String(d.n).padStart(2, "0")),
    h(
      "div",
      null,
      h("span", { class: "kicker" }, d.label),
      h("h3", null, d.title, d.designRefs?.length ? evidence(...d.designRefs) : null),
      ...d.lines.map((l) => h("p", null, l)),
    ),
  );
}

/** Slim side panel. Keyboard-operable, focus-trapped, Escape closes. */
export function rationaleDrawer(r: { button: string; title: string; paragraphs: string[]; designRefs?: string[] }): HTMLElement {
  const did = id("drawer");
  const closeBtn = h("button", { type: "button", class: "btn btn--ghost drawer-close", onclick: close }, "Close");
  const panel = h(
    "div",
    { class: "drawer", id: did, role: "dialog", "aria-modal": "true", "aria-labelledby": `${did}-title`, hidden: true },
    h("div", { class: "drawer-scrim", onclick: close }),
    h(
      "div",
      { class: "drawer-panel" },
      h("span", { class: "kicker" }, "Design rationale"),
      h("h3", { id: `${did}-title` }, r.title, r.designRefs?.length ? evidence(...r.designRefs) : null),
      ...r.paragraphs.map((p) => h("p", null, p)),
      closeBtn,
    ),
  );
  const open = h(
    "button",
    { type: "button", class: "btn btn--ghost rationale-btn", "aria-haspopup": "dialog", "aria-controls": did, onclick: show },
    r.button,
  );
  let lastFocus: HTMLElement | null = null;
  function show() {
    lastFocus = document.activeElement as HTMLElement;
    panel.hidden = false;
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => panel.classList.add("is-open"));
    (panel.querySelector(".drawer-panel h3") as HTMLElement).setAttribute("tabindex", "-1");
    (panel.querySelector(".drawer-panel h3") as HTMLElement).focus();
    document.addEventListener("keydown", onKey);
  }
  function close() {
    panel.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    document.removeEventListener("keydown", onKey);
    const finish = () => {
      panel.hidden = true;
      lastFocus?.focus();
    };
    if (reducedMotion()) finish();
    else setTimeout(finish, 260);
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.querySelector("h3"))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  return h("div", { class: "rationale" }, open, panel);
}

/** Dark closing band at the foot of every page (the day's dusk). */
export function closingBand(routeKey: string, line: string): HTMLElement {
  const next = NEXT_LINKS[routeKey];
  return h(
    "section",
    { class: "section closing-band on-dark", "aria-label": "Closing" },
    h("div", { class: "aperture aperture--low" }),
    h(
      "div",
      { class: "wrap" },
      h("p", { class: "closing-line" }, line),
      next ? h("a", { href: href(next.path), "data-link": true, class: "btn btn--amber" }, next.label, arrowIcon(16)) : null,
    ),
  );
}

/** Proposed tag — untested design hypothesis. */
export function proposedTag(text = "Proposed"): HTMLElement {
  return h("span", { class: "tag tag--proposed" }, text);
}

export function fictionalNote(text: string): HTMLElement {
  return h("p", { class: "note" }, text);
}
