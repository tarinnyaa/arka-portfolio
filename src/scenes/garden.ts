// Myopia "Twelve flowers, one garden" (spec §8, [B]). Phone pinned; a month
// strip advances Jan → Dec; the flower swaps; the My Garden row fills beneath
// — earned months as tiny whole plants, un-earned as faint silhouettes,
// future as dotted lock slots. Then all twelve as collectibles; click opens a
// specimen card. [C] one idiosyncratic hover per flower; "A year in bloom"
// after all twelve have been opened.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { MONTHLY_FLOWERS, MONTH_FULL, flowerHead, miniPlant, type MonthlyFlower } from "../components/plant";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import type { FlowerArt } from "../lib/flowerArtTypes";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { h } from "../lib/dom";
import { reducedMotion, scrub } from "../lib/motion";

type ArtMap = Record<string, FlowerArt>;

export function gardenScene() {
  const C = MYOPIA.garden;
  const { el: screen, plant, gardenRow } = myopiaPlantScreen({ fraction: 1, garden: true });
  const phone = phoneFrame(screen, { scale: 0.62, label: "The Plant tab with the My Garden row" });
  const row = gardenRow!.querySelector(".m-garden-row") as HTMLElement;
  const strip = h("div", { class: "month-strip", role: "img", "aria-label": "Month strip, January to December" }, ...C.months.map((m) => h("span", null, m)));
  const monthEls = Array.from(strip.children) as HTMLElement[];
  const caption = h("p", { class: "lede", "aria-live": "polite" });
  const side = h("div", { class: "plant-side" }, strip, caption);
  const pin = h("div", { class: "garden-pin" }, h("div", { class: "wrap garden-grid" }, h("div", null, phone), side));

  // Collection
  const collection = h("ul", { class: "collection", role: "list", "aria-label": "Twelve monthly flowers" });
  const yearBloom = h("div", { class: "year-bloom", role: "status" }, h("strong", null, C.yearInBloom), h("p", { style: "margin:0" }, C.yearInBloomBody));
  const dialog = h("dialog", { class: "specimen-dialog", "aria-labelledby": "specimen-title" }) as HTMLDialogElement;
  const reveal = h(
    "div",
    { class: "wrap", style: "margin-top:48px" },
    sectionHead(null, C.revealHeading, C.revealBody, 3),
    collection,
    yearBloom,
    dialog,
  );

  const el = h(
    "section",
    { class: "section section--tight", id: "garden" },
    h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body)),
    pin,
    reveal,
  );

  let arts: ArtMap = { sunflower: ART_SUNFLOWER };
  const opened = new Set<string>();

  function artFor(f: MonthlyFlower): FlowerArt {
    return arts[f.artKey] ?? ART_SUNFLOWER;
  }

  function fillRow(upToMonth: number) {
    // Show a 5-slot window ending at the current month (as the app does).
    row.replaceChildren();
    const start = Math.max(1, Math.min(upToMonth - 2, 8));
    for (let m = start; m < start + 5 && m <= 12; m++) {
      const f = MONTHLY_FLOWERS[m - 1];
      const label = C.months[m - 1];
      if (m > upToMonth) {
        row.appendChild(h("span", { class: "m-garden-cell m-garden-cell--lock" }, h("span", { class: "m-lock", "aria-hidden": "true" }), h("span", null, label)));
      } else if (C.earned[m - 1]) {
        row.appendChild(h("span", { class: "m-garden-cell" }, miniPlant(artFor(f), { size: 34, label: `${f.name}, earned` }), h("span", null, label)));
      } else {
        row.appendChild(h("span", { class: "m-garden-cell m-garden-cell--miss" }, miniPlant(artFor(f), { size: 34, silhouette: true, label: `${f.name}, not earned` }), h("span", null, label)));
      }
    }
  }

  let lastP = 0;
  function set(p: number) {
    lastP = p;
    const month = Math.min(12, 1 + Math.floor(p * 12));
    const f = MONTHLY_FLOWERS[month - 1];
    plant.setFlower(f, artFor(f));
    plant.set(1);
    monthEls.forEach((m, i) => {
      m.classList.toggle("is-on", i === month - 1);
      m.classList.toggle("is-past", i < month - 1);
    });
    caption.textContent = `${MONTH_FULL[month - 1]} · ${f.name}${C.earned[month - 1] ? " · earned" : month > C.currentMonth ? " · not yet" : " · missed"}`;
    fillRow(month);
  }

  function buildCollection() {
    collection.replaceChildren(
      ...MONTHLY_FLOWERS.map((f) => {
        const earned = C.earned[f.month - 1];
        const btn = h(
          "button",
          {
            type: "button",
            class: `specimen-btn${earned ? "" : " is-locked"}`,
            "data-key": f.artKey,
            "aria-haspopup": "dialog",
            onclick: () => openSpecimen(f),
          },
          h("span", { class: "personality" }, flowerHead(artFor(f), 64, `${f.name}`)),
          h("span", null, `${C.months[f.month - 1]} · ${f.name}`),
          h("span", { class: "muted", style: "font-weight:500" }, earned ? C.unlocked : C.locked),
        );
        return h("li", null, btn);
      }),
    );
  }

  function openSpecimen(f: MonthlyFlower) {
    const earned = C.earned[f.month - 1];
    dialog.replaceChildren(
      flowerHead(artFor(f), 200, `${MONTH_FULL[f.month - 1]} ${f.name}`),
      h("h3", { id: "specimen-title" }, `${MONTH_FULL[f.month - 1]} ${f.name}`),
      h("p", { class: "muted" }, earned ? C.unlocked : C.locked),
      h("button", { type: "button", class: "btn", onclick: () => dialog.close() }, C.specimenClose),
    );
    dialog.showModal();
    opened.add(f.id);
    if (opened.size === 12) yearBloom.classList.add("is-on");
  }

  async function mount() {
    fillRow(9);
    buildCollection();
    scrub(
      { set },
      {
        trigger: pin,
        pin,
        end: "+=300%",
        steps: [
          { label: "Jan", p: 0 },
          { label: "Apr", p: 0.27 },
          { label: "Jul", p: 0.52 },
          { label: "Sep", p: 0.7 },
          { label: "Dec", p: 1 },
        ],
        rmDefault: 0.7,
        controlLabel: "Step through the months",
      },
    );
    // Lazy-load the other eleven heads, then rebuild with real art.
    const mod = await import("../lib/flowerArt.extra.gen");
    arts = {
      sunflower: ART_SUNFLOWER,
      camellia: mod.ART_CAMELLIA,
      tulip: mod.ART_TULIP,
      daffodil: mod.ART_DAFFODIL,
      cherry: mod.ART_CHERRY,
      rose: mod.ART_ROSE,
      orchid: mod.ART_ORCHID,
      morningGlory: mod.ART_MORNINGGLORY,
      hibiscus: mod.ART_HIBISCUS,
      marigold: mod.ART_MARIGOLD,
      chrysanthemum: mod.ART_CHRYSANTHEMUM,
      poinsettia: mod.ART_POINSETTIA,
    };
    buildCollection();
    set(reducedMotion() ? 0.7 : lastP);
  }
  return { el, mount };
}
