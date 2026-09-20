// Top bar and footer (spec §6).
import { BRAND, FOOTER, NAV } from "@content/shared";
import { h } from "../lib/dom";
import { getMode, onModeChange, setMode, type Mode } from "../lib/mode";
import { reducedMotion } from "../lib/motion";
import { ROUTES, currentKey, href, onRoute, type RouteKey } from "../lib/router";
import { labLogos } from "./assets";
import { sunIcon, wordmark } from "./icons";

export function topBar(): HTMLElement {
  const tabs = ROUTES.map((r) =>
    h(
      "li",
      null,
      h(
        "a",
        { href: href(r.path), "data-link": true, "data-key": r.key, class: "tab" },
        r.label,
      ),
    ),
  );
  const sun = h("span", { class: "tab-sun", "aria-hidden": "true" }, sunIcon(14));
  const list = h("ul", { class: "tabs", role: "list" }, ...tabs, sun);
  const nav = h("nav", { class: "tabs-nav", "aria-label": "Site" }, list);

  const modeToggle = buildModeToggle();
  const logos = labLogos(40, { link: true, class: "nav-logos" });

  const menuBtn = h(
    "button",
    {
      type: "button",
      class: "menu-btn",
      "aria-expanded": "false",
      "aria-controls": "nav-panel",
      onclick: () => {
        const open = header.classList.toggle("menu-open");
        menuBtn.setAttribute("aria-expanded", String(open));
      },
    },
    h("span", { class: "menu-bars", "aria-hidden": "true" }),
    h("span", { class: "visually-hidden" }, NAV.menu),
  );

  const panel = h(
    "div",
    { class: "nav-panel", id: "nav-panel" },
    nav,
    h("div", { class: "nav-right" }, modeToggle, h("span", { class: "nav-rule", "aria-hidden": "true" }), logos),
  );

  const header = h(
    "header",
    { class: "topbar" },
    h(
      "div",
      { class: "wrap topbar-inner" },
      h("a", { href: href("/"), "data-link": true, class: "wordmark", "aria-label": "ARKA — About" }, wordmark()),
      panel,
      menuBtn,
    ),
  );

  function setActive(key: RouteKey) {
    let active: HTMLElement | null = null;
    list.querySelectorAll<HTMLAnchorElement>("a.tab").forEach((a) => {
      const is = a.dataset.key === key;
      if (is) {
        a.setAttribute("aria-current", "page");
        active = a;
      } else a.removeAttribute("aria-current");
    });
    header.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
    positionSun(active);
  }

  function positionSun(active: HTMLElement | null) {
    if (!active) return;
    const lr = list.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    const x = ar.left - lr.left + ar.width / 2;
    sun.style.transition = reducedMotion() ? "none" : "transform 400ms cubic-bezier(.22,.61,.36,1)";
    sun.style.transform = `translateX(${x}px)`;
    sun.style.opacity = "1";
  }

  onRoute(setActive);
  window.addEventListener("resize", () => positionSun(list.querySelector("a[aria-current]")));
  // Fonts can shift tab widths after first paint.
  if (document.fonts?.ready) {
    void document.fonts.ready.then(() => positionSun(list.querySelector("a[aria-current]")));
  }
  requestAnimationFrame(() => setActive(currentKey()));
  return header;
}

function buildModeToggle(): HTMLElement {
  const mk = (m: Mode, label: string, hint: string) =>
    h(
      "button",
      {
        type: "button",
        "aria-pressed": String(getMode() === m),
        title: hint,
        onclick: () => setMode(m),
      },
      label,
    );
  const explore = mk("explore", NAV.explore, NAV.exploreHint);
  const research = mk("research", NAV.research, NAV.researchHint);
  const group = h(
    "div",
    { class: "segmented mode-toggle", role: "group", "aria-label": NAV.modeToggleLabel },
    explore,
    research,
  );
  onModeChange((m) => {
    explore.setAttribute("aria-pressed", String(m === "explore"));
    research.setAttribute("aria-pressed", String(m === "research"));
  });
  return group;
}

export function footer(): HTMLElement {
  return h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "wrap footer-inner" },
      labLogos(64, { link: true, class: "footer-logos" }),
      h(
        "div",
        { class: "footer-text" },
        h("p", { class: "footer-line" }, FOOTER.line1),
        h("p", { class: "footer-line" }, FOOTER.line2),
        h("p", { class: "footer-line muted small" }, FOOTER.illustrative),
        h("p", { class: "footer-line muted small" }, `© ${BRAND.year} ${BRAND.lab}`),
      ),
    ),
  );
}
