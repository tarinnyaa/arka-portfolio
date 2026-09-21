// Asset helpers. An image that fails to load is hidden (never a filename or a
// path as fallback text). Layout reserves the intended box so nothing shifts.
import { ASSETS, BRAND } from "@content/shared";
import { h } from "../lib/dom";

const BASE = import.meta.env.BASE_URL;

export function assetUrl(path: string): string {
  return `${BASE}${path}`;
}

/** Image; hidden on error. `w`/`h` are the intended rendered size. */
export function img(
  path: string,
  alt: string,
  opts: { w?: number | string; h?: number | string; class?: string; eager?: boolean } = {},
): HTMLElement {
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
    wrap.hidden = true;
  });
  wrap.appendChild(el);
  return wrap;
}

/** Lab logo lockup used in nav, hero and footer. Logos are never recoloured
 *  or filtered. Sizes preserve each file's aspect ratio (NUS 1024×253,
 *  Eye N' Brain 1024×299). */
export function labLogos(height: number, opts: { link?: boolean; class?: string } = {}): HTMLElement {
  const nus = img(ASSETS.nusMedicine, "NUS Yong Loo Lin School of Medicine", { h: height, w: Math.round(height * (1024 / 253)) });
  const enb = img(ASSETS.eyeNBrain, "Eye N' Brain research group", { h: height, w: Math.round(height * (1024 / 299)) });
  const inner = h("span", { class: "lab-logos-inner", style: `gap:${Math.round(height * 0.45)}px` }, nus, enb);
  if (opts.link) {
    return h(
      "a",
      { class: `lab-logos${opts.class ? " " + opts.class : ""}`, href: BRAND.labSiteUrl, target: "_blank", rel: "noopener" },
      inner,
      h("span", { class: "visually-hidden" }, ", Eye N' Brain lab website (opens in a new tab)"),
    );
  }
  return h("div", { class: `lab-logos${opts.class ? " " + opts.class : ""}` }, inner);
}
