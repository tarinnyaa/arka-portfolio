// Twelve flowers, one garden. Scroll-driven: phone pinned left, calendar
// pinned right. Each month's bloom drops into the garden row as its page
// turns. Reduced motion and narrow screens: a static specimen grid only.
import { MYOPIA } from "@content/myopia";
import { phoneFrame } from "../components/frames";
import { MONTHLY_FLOWERS, MONTH_FULL, flowerHead, miniPlant, type MonthlyFlower } from "../components/plant";
import { myopiaPlantScreen } from "../components/screens";
import { sectionHead } from "../components/ui";
import type { FlowerArt } from "../lib/flowerArtTypes";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { h } from "../lib/dom";
import { narrow, pinnedSequence, reducedMotion, seg } from "../lib/motion";

type ArtMap = Record<string, FlowerArt>;

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const DIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function artFor(arts: ArtMap, f: MonthlyFlower): FlowerArt {
  return arts[f.artKey] ?? ART_SUNFLOWER;
}

function calendarPage(month: number, art: FlowerArt): HTMLElement {
  const first = new Date(2026, month, 1).getDay();
  const days = DIM[month];
  const cells: HTMLElement[] = [];
  for (let i = 0; i < first; i++) cells.push(h("span", { class: "cal-day is-empty" }));
  for (let d = 1; d <= days; d++) {
    const bloom = d === 15;
    cells.push(h("span", { class: bloom ? "cal-day is-bloom" : "cal-day" }, bloom ? flowerHead(art, 20, MONTHLY_FLOWERS[month].name) : String(d)));
  }
  return h(
    "div",
    { class: "cal-page" },
    h("p", { class: "cal-year" }, "2026"),
    h("p", { class: "cal-month" }, MONTH_FULL[month]),
    h("div", { class: "cal-week", "aria-hidden": "true" }, ...WEEK.map((w) => h("span", null, w))),
    h("div", { class: "cal-grid" }, ...cells),
  );
}

export function gardenScene() {
  const C = MYOPIA.garden;
  const section = h("section", { class: "section section--flush", id: "garden" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading, C.body)));

  const cards = h("ul", { class: "specimen-grid", role: "list", "aria-label": "Twelve monthly flowers" });
  const cardsWrap = h("div", { class: "wrap specimen-wrap" }, cards);

  let arts: ArtMap = { sunflower: ART_SUNFLOWER };
  const usePin = !reducedMotion() && !narrow();

  function emptyCell(label: string) {
    return h("span", { class: "m-garden-cell m-garden-cell--empty" }, h("span", { class: "m-garden-slot", "aria-hidden": "true" }), h("span", null, label));
  }
  function filledCell(f: MonthlyFlower) {
    return h("span", { class: "m-garden-cell" }, miniPlant(artFor(arts, f), { size: 22, label: `${f.name}, earned` }), h("span", null, C.months[f.month - 1]));
  }

  function paintRow(row: HTMLElement, filled: number) {
    row.replaceChildren(
      ...MONTHLY_FLOWERS.map((f, i) => (i < filled ? filledCell(f) : emptyCell(C.months[i]))),
    );
  }

  function buildCards() {
    cards.replaceChildren(
      ...MONTHLY_FLOWERS.map((f) =>
        h(
          "li",
          { class: "specimen-card" },
          flowerHead(artFor(arts, f), 148, f.name),
          h("p", { class: "specimen-month" }, MONTH_FULL[f.month - 1]),
          h("h3", { class: "specimen-name" }, f.name),
        ),
      ),
    );
  }

  function createStage() {
    const { el: screen, plant, gardenRow } = myopiaPlantScreen({ fraction: 1, garden: true });
    const row = gardenRow!.querySelector(".m-garden-row") as HTMLElement;
    row.classList.add("m-garden-row--year");
    const phone = phoneFrame(screen, { scale: 0.78, class: "garden-device", label: "The Plant tab: this month's flower and the garden row" });

    const flipLeaf = h("div", { class: "cal-leaf cal-leaf--flip" });
    const underLeaf = h("div", { class: "cal-leaf cal-leaf--under" });
    const book = h("div", { class: "cal-book", role: "img", "aria-label": "Calendar, 2026" }, underLeaf, flipLeaf);

    const year = h("div", { class: "garden-year", "aria-hidden": "true" });
    function paintYear(filled: number) {
      year.replaceChildren(
        ...MONTHLY_FLOWERS.map((f, i) =>
          i < filled
            ? h("span", { class: "garden-year-cell is-in" }, flowerHead(artFor(arts, f), 52, f.name), h("span", null, C.months[i]))
            : h("span", { class: "garden-year-cell" }, h("span", { class: "garden-year-slot" }), h("span", null, C.months[i])),
        ),
      );
    }

    const drop = h("div", { class: "garden-drop", "aria-hidden": "true" });
    const live = h("p", { class: "visually-hidden", "aria-live": "polite" });

    const stage = h(
      "div",
      { class: "seq-stage garden-stage" },
      h("div", { class: "wrap garden-pin" }, h("div", { class: "garden-phone" }, phone), h("div", { class: "garden-cal" }, book)),
      h("div", { class: "wrap" }, year),
      drop,
      live,
    );

    function setPages(current: number, next: number) {
      flipLeaf.replaceChildren(calendarPage(current, artFor(arts, MONTHLY_FLOWERS[current])));
      underLeaf.replaceChildren(calendarPage(next, artFor(arts, MONTHLY_FLOWERS[next])));
    }

    function headCenter() {
      const sr = stage.getBoundingClientRect();
      const hr = plant.head.getBoundingClientRect();
      return { x: hr.left + hr.width / 2 - sr.left, y: hr.top + hr.height / 2 - sr.top };
    }
    function cellCenter(k: number) {
      const sr = stage.getBoundingClientRect();
      const cell = (year.children[k] as HTMLElement | undefined) ?? (row.children[k] as HTMLElement | undefined);
      if (!cell) return { x: sr.width / 2, y: sr.height * 0.8 };
      const cr = cell.getBoundingClientRect();
      return { x: cr.left + cr.width / 2 - sr.left, y: cr.top + cr.height / 2 - sr.top };
    }

    let lastPages = [-1, -1];
    let lastShown = -1;
    let lastFilled = -1;
    let lastDropMonth = -1;
    let lastKey = "";
    function apply(i: number, t: number, r: number) {
      const shown = i < 11 && t > 0.62 ? i + 1 : i;
      const filled = i >= 11 ? (r > 0.78 ? 12 : 11) : t > 0.5 ? i + 1 : i;
      const dropAmt = i >= 11 ? seg(r, 0.55, 0.88) : seg(t, 0.04, 0.52);
      const flipAmt = i >= 11 ? 0 : seg(t, 0.42, 0.95);
      const f = MONTHLY_FLOWERS[shown];

      if (shown !== lastShown) {
        lastShown = shown;
        plant.setFlower(f, artFor(arts, f));
        plant.set(1);
      }
      plant.head.style.opacity = dropAmt > 0.08 && dropAmt < 0.92 && shown === i ? "0.15" : "1";
      if (filled !== lastFilled) {
        lastFilled = filled;
        paintRow(row, filled);
        paintYear(filled);
      }
      const next = Math.min(i + 1, 11);
      if (lastPages[0] !== i || lastPages[1] !== next) {
        lastPages = [i, next];
        setPages(i, next);
      }
      flipLeaf.style.transform = `rotateY(${-180 * flipAmt}deg)`;
      book.setAttribute("aria-label", `${MONTH_FULL[shown]} 2026`);

      const dropping = dropAmt > 0.02 && dropAmt < 0.96;
      if (dropping) {
        if (lastDropMonth !== i) {
          lastDropMonth = i;
          drop.replaceChildren(flowerHead(artFor(arts, MONTHLY_FLOWERS[i]), 72, MONTHLY_FLOWERS[i].name));
        }
        const from = headCenter();
        const to = cellCenter(i);
        const p = dropAmt * dropAmt;
        drop.style.opacity = "1";
        drop.style.transform = `translate(${from.x + (to.x - from.x) * p}px, ${from.y + (to.y - from.y) * p + 18 * Math.sin(p * Math.PI)}px) translate(-50%, -50%) scale(${1.15 - 0.8 * p})`;
      } else {
        drop.style.opacity = "0";
      }

      const key = `${shown}-${filled}`;
      if (key !== lastKey) {
        lastKey = key;
        live.textContent = `${MONTH_FULL[shown]}. ${filled} of 12 in the garden.`;
      }
    }

    paintRow(row, 0);
    paintYear(0);
    setPages(0, 1);
    return { el: stage, apply };
  }

  const seq = usePin
    ? pinnedSequence({
        section,
        states: 12,
        restVh: 100,
        transVh: 24,
        stepLabels: C.months,
        stepDescribe: (i) => `${MONTH_FULL[i]} ${MONTHLY_FLOWERS[i].name}`,
        controlLabel: "Step through the year",
        stackCaption: (i) => h("p", { class: "mono-label" }, MONTH_FULL[i]),
        createStage,
      })
    : null;

  section.appendChild(cardsWrap);

  async function loadArts() {
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
  }

  async function mount() {
    await loadArts();
    buildCards();
    seq?.mount();
  }

  return { el: section, mount };
}
