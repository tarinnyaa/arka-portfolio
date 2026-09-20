// History router with lazy-loaded page modules and a 250 ms aperture wipe on
// route change (the one decorative exception, spec §4). The wipe is disabled
// under prefers-reduced-motion.
import { clear, h } from "./dom";
import { killAllMotion, reducedMotion, refreshTriggers } from "./motion";
import { resetAmbient } from "./ambient";
import { ASSETS } from "@content/shared";

export type Page = {
  title: string;
  el: HTMLElement;
  /** Called after `el` is in the document — start scenes here. */
  mount?: () => void;
  /** Called before the page is removed. */
  unmount?: () => void;
};

export type RouteKey = "about" | "healthy" | "myopia" | "glaucoma" | "depression" | "stroke";

export const ROUTES: { key: RouteKey; path: string; label: string }[] = [
  { key: "about", path: "/", label: "About" },
  { key: "healthy", path: "/healthy", label: "Healthy" },
  { key: "myopia", path: "/myopia", label: "Myopia" },
  { key: "glaucoma", path: "/glaucoma", label: "Glaucoma" },
  { key: "depression", path: "/depression", label: "Depression" },
  { key: "stroke", path: "/stroke", label: "Stroke" },
];

const loaders: Record<RouteKey, () => Promise<{ default: () => Page }>> = {
  about: () => import("../pages/about"),
  healthy: () => import("../pages/healthy"),
  myopia: () => import("../pages/myopia"),
  glaucoma: () => import("../pages/glaucoma"),
  depression: () => import("../pages/depression"),
  stroke: () => import("../pages/stroke"),
};

/** Above-the-fold image per route, preloaded before the page chunk arrives so
 *  the browser is not waiting on JS to discover the largest element. */
const HERO_IMAGE: Record<RouteKey, string> = {
  about: ASSETS.heroEcosystem,
  healthy: ASSETS.illustrations.healthy,
  myopia: ASSETS.illustrations.myopia,
  glaucoma: ASSETS.illustrations.glaucoma,
  depression: ASSETS.illustrations.depression,
  stroke: ASSETS.illustrations.stroke,
};

const preloaded = new Set<string>();
function preloadHero(key: RouteKey) {
  const url = `${import.meta.env.BASE_URL}${HERO_IMAGE[key]}`;
  if (preloaded.has(url)) return;
  preloaded.add(url);
  document.head.appendChild(h("link", { rel: "preload", as: "image", href: url, fetchpriority: "high" }));
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function href(path: string): string {
  return `${BASE}${path === "/" ? "/" : path}`;
}

export function currentKey(): RouteKey {
  let p = location.pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  p = p.replace(/\/+$/, "") || "/";
  const r = ROUTES.find((x) => x.path === p);
  return r ? r.key : "about";
}

const routeListeners = new Set<(k: RouteKey) => void>();
export function onRoute(fn: (k: RouteKey) => void) {
  routeListeners.add(fn);
}

let outlet: HTMLElement;
let current: Page | null = null;
let wipe: HTMLElement;

export function initRouter(mount: HTMLElement) {
  outlet = mount;
  wipe = h("div", { class: "route-wipe", "aria-hidden": "true" });
  document.body.appendChild(wipe);

  document.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a[data-link]") as HTMLAnchorElement | null;
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    navigate(url.pathname + url.hash);
  });
  window.addEventListener("popstate", () => void load(false));
  void load(false, true);
}

export function navigate(path: string) {
  if (path === location.pathname + location.hash) return;
  history.pushState(null, "", path);
  void load(true);
}

async function load(withWipe: boolean, initial = false) {
  const key = currentKey();
  const doWipe = withWipe && !reducedMotion();
  if (doWipe) {
    wipe.classList.add("route-wipe--in");
    await new Promise((r) => setTimeout(r, 250));
  }
  current?.unmount?.();
  killAllMotion();
  preloadHero(key);
  const mod = await loaders[key]();
  const page = mod.default();
  clear(outlet);
  outlet.appendChild(page.el);
  current = page;
  document.title = page.title;
  window.scrollTo({ top: 0, behavior: "auto" });
  routeListeners.forEach((fn) => fn(key));
  page.mount?.();
  requestAnimationFrame(() => {
    refreshTriggers();
    resetAmbient();
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      target?.scrollIntoView({ behavior: "auto" });
    }
  });
  // Move focus to the new page's heading on in-app navigation so screen
  // readers announce the change. Not on first load: keyboard users should
  // start at the skip link and nav, in document order.
  const heading = page.el.querySelector("h1");
  if (heading && !initial) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  if (doWipe) {
    wipe.classList.remove("route-wipe--in");
    wipe.classList.add("route-wipe--out");
    setTimeout(() => wipe.classList.remove("route-wipe--out"), 260);
  }
}
