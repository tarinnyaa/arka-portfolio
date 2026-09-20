// EvidenceMarker (spec §5/§6): a superscript number visible only in Research
// mode. Click opens a source card with claim, source, year and link.
// Two registries feed it: light-health references (content/references.ts)
// and verified interface/accessibility references (content/design-references.ts).
import { VERIFIED_DESIGN_REFERENCES } from "@content/design-references";
import { REFERENCES } from "@content/references";
import { h, id } from "../lib/dom";

type Card = { claim: string; source: string; year: string; url: string | null; kind: "light" | "design" };

const order: string[] = [];
function numberFor(refId: string): number {
  let i = order.indexOf(refId);
  if (i < 0) {
    order.push(refId);
    i = order.length - 1;
  }
  return i + 1;
}

/** Reset numbering when a page mounts so markers start at 1 on each route. */
export function resetEvidenceNumbering() {
  order.length = 0;
}

function lookup(refId: string): Card | null {
  const r = REFERENCES[refId];
  if (r) return { claim: r.claim, source: r.source, year: String(r.year), url: r.url, kind: "light" };
  const d = VERIFIED_DESIGN_REFERENCES.find((x) => x.id === refId);
  if (d) {
    const y = d.source.match(/(19|20)\d{2}/)?.[0] ?? "";
    return { claim: d.claim, source: d.source, year: y, url: d.url, kind: "design" };
  }
  return null;
}

let openCard: HTMLElement | null = null;
function closeCard() {
  if (openCard) {
    const trigger = openCard.dataset.trigger ? document.getElementById(openCard.dataset.trigger) : null;
    openCard.remove();
    openCard = null;
    trigger?.focus();
  }
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCard();
});
document.addEventListener("click", (e) => {
  if (openCard && !openCard.contains(e.target as Node) && !(e.target as Element).closest(".evidence")) closeCard();
});

/** One or more markers for the given reference ids. */
export function evidence(...refIds: string[]): HTMLElement {
  const wrap = h("span", { class: "evidence-group" });
  for (const rid of refIds) {
    const card = lookup(rid);
    if (!card) continue;
    const n = numberFor(rid);
    const btnId = id("ev");
    const btn = h(
      "button",
      {
        type: "button",
        class: "evidence",
        id: btnId,
        "aria-label": `Evidence ${n}: ${card.source.split(".")[0]}`,
        "aria-haspopup": "dialog",
        onclick: (e) => {
          e.stopPropagation();
          if (openCard?.dataset.trigger === btnId) return closeCard();
          closeCard();
          showCard(btn, card, n);
        },
      },
      h("sup", null, String(n)),
    );
    wrap.appendChild(btn);
  }
  return wrap;
}

function showCard(anchor: HTMLElement, card: Card, n: number) {
  const link = card.url
    ? h("a", { href: card.url, target: "_blank", rel: "noopener" }, "Open source ↗")
    : h("span", { class: "muted" }, "Link not supplied in the source deck");
  const el = h(
    "div",
    { class: "evidence-card", role: "dialog", "aria-label": `Evidence ${n}`, "data-trigger": anchor.id },
    h("p", { class: "evidence-kind" }, card.kind === "light" ? "Light-health reference" : "Interface / accessibility reference"),
    h("p", { class: "evidence-claim" }, card.claim),
    h("p", { class: "evidence-source" }, card.source),
    h("p", { class: "evidence-meta" }, card.year ? `${card.year} · ` : "", link),
    h("button", { type: "button", class: "evidence-close", onclick: closeCard, "aria-label": "Close" }, "×"),
  );
  anchor.insertAdjacentElement("afterend", el);
  openCard = el;
  const r = el.getBoundingClientRect();
  if (r.right > window.innerWidth - 12) el.style.left = `${window.innerWidth - 12 - r.right}px`;
  (el.querySelector("a,button") as HTMLElement | null)?.focus();
}

/** "(He et al., 2015)" style inline citation — always visible, for GoalChips
 * and figure captions; in Research mode a marker is appended too. */
export function citeInline(...refIds: string[]): HTMLElement {
  const names = refIds
    .map((rid) => REFERENCES[rid]?.short ?? VERIFIED_DESIGN_REFERENCES.find((d) => d.id === rid)?.source.split(",")[0] ?? rid)
    .join("; ");
  return h("span", { class: "cite" }, `(${names})`, evidence(...refIds));
}
