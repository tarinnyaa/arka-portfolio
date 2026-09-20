// Asset helpers. Any image that fails to load is replaced by a clearly
// labelled placeholder of the same size, so the layout is correct and the
// gap is obvious (spec §13/§17).
import { ASSETS, BRAND } from "@content/shared";
import { h } from "../lib/dom";

const BASE = import.meta.env.BASE_URL;

export function assetUrl(path: string): string {
  return `${BASE}${path}`;
}

export function placeholder(label: string, w: number | string, h_: number | string): HTMLElement {
  const wcss = typeof w === "number" ? `${w}px` : w;
  const hcss = typeof h_ === "number" ? `${h_}px` : h_;
  return h(
    "div",
    {
      class: "placeholder-asset",
      style: `width:${wcss};height:${hcss};flex:0 0 auto;`,
      role: "img",
      "aria-label": `Missing asset: ${label}`,
    },
    label,
  );
}

/** Image with placeholder fallback. `w`/`h` are the intended rendered size. */
export function img(
  path: string,
  alt: string,
  opts: { w?: number | string; h?: number | string; class?: string; label?: string; eager?: boolean } = {},
): HTMLElement {
  const label = opts.label ?? path.replace(/^assets\//, "");
  const wrap = h("span", { class: `asset${opts.class ? " " + opts.class : ""}`, style: "display:inline-flex;" });
  const el = h("img", {
    src: assetUrl(path),
    alt,
    loading: opts.eager ? "eager" : "lazy",
    fetchpriority: opts.eager ? "high" : "auto",
    decoding: "async",
    style: [
      opts.w != null ? `width:${typeof opts.w === "number" ? opts.w + "px" : opts.w};` : "",
      opts.h != null ? `height:${typeof opts.h === "number" ? opts.h + "px" : opts.h};` : "",
      "object-fit:contain;",
    ].join(""),
  });
  el.addEventListener("error", () => {
    const ph = placeholder(label, opts.w ?? 160, opts.h ?? 52);
    if (opts.class) ph.classList.add(opts.class);
    wrap.replaceChildren(ph);
  });
  wrap.appendChild(el);
  return wrap;
}

/** Lab logo lockup used in nav, hero and footer. Sizes are fixed so the real
 * files drop in with no layout change. Logos are never recoloured or filtered. */
export function labLogos(height: number, opts: { link?: boolean; class?: string } = {}): HTMLElement {
  const nus = img(ASSETS.nusMedicine, "NUS Yong Loo Lin School of Medicine", {
    h: height,
    w: Math.round(height * 3.1),
    label: "brand/nus-medicine.png",
  });
  const enb = img(ASSETS.eyeNBrain, "Eye N' Brain research group", {
    h: height,
    w: Math.round(height * 2.4),
    label: "brand/eye-n-brain.png",
  });
  const inner = h("span", { class: "lab-logos-inner", style: `gap:${Math.round(height * 0.35)}px` }, nus, enb);
  if (opts.link) {
    return h(
      "a",
      {
        class: `lab-logos${opts.class ? " " + opts.class : ""}`,
        href: BRAND.labSiteUrl,
        target: "_blank",
        rel: "noopener",
      },
      inner,
      // Named by the logo alt texts (or placeholder labels) plus this suffix,
      // so the accessible name always contains the visible content.
      h("span", { class: "visually-hidden" }, " — Eye N' Brain lab website (opens in a new tab)"),
    );
  }
  return h("div", { class: `lab-logos${opts.class ? " " + opts.class : ""}` }, inner);
}
