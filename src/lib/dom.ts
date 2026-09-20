// Tiny DOM builder. No framework — every phone screen, chart and diagram on
// the site is real HTML/SVG built through these helpers.

type Child = Node | string | number | null | undefined | false | Child[];
type Attrs = Record<string, string | number | boolean | null | undefined | ((e: Event) => void)>;

const SVG_NS = "http://www.w3.org/2000/svg";

function apply(el: Element, attrs?: Attrs) {
  if (!attrs) return;
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (k === "class") {
      el.setAttribute("class", String(v));
    } else if (k === "style" && el instanceof HTMLElement) {
      el.style.cssText = String(v);
    } else if (k === "html") {
      el.innerHTML = String(v);
    } else if (v === true) {
      el.setAttribute(k, "");
    } else {
      el.setAttribute(k, String(v));
    }
  }
}

function append(el: Element, children: Child[]) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

/** HTML element. `h("div", { class: "x" }, "text", child)` */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  apply(el, attrs ?? undefined);
  append(el, children);
  return el;
}

/** SVG element. */
export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  apply(el, attrs ?? undefined);
  append(el, children);
  return el;
}

/** Fragment from an HTML string (trusted, site-authored content only). */
export function raw(html: string): DocumentFragment {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

export function clear(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let uid = 0;
export function id(prefix = "id"): string {
  uid += 1;
  return `${prefix}-${uid}`;
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fmt = (n: number) => n.toLocaleString("en-US");
