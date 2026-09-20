// "One platform should not mean one interface" (spec §7, [B]). One phone,
// pinned. On scroll it morphs through the five configurations — a real layout
// transition: type scale, element count, target size, spacing, tab count and
// hierarchy are interpolated between neighbouring states, not crossfaded
// screenshots. Beside each: who → what.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { ART_SUNFLOWER } from "../lib/flowerArt.core.gen";
import { miniPlant } from "../components/plant";
import { HEALTHY_SEGMENTS, bigSun, scoreRing } from "../components/screens";
import { sectionHead } from "../components/ui";
import { clamp, h, lerp } from "../lib/dom";
import { scrub } from "../lib/motion";

type State = {
  key: string;
  greeting: string;
  typeScale: number;
  cards: number; // secondary cards visible
  btnH: number; // primary action height
  gap: number; // vertical rhythm
  tabs: string[];
  tabLabels: boolean;
  primary: string;
  accent: string;
  dark: boolean;
  bg: string;
};

const STATES: State[] = [
  { key: "myopia", greeting: "Your plant", typeScale: 1.0, cards: 1, btnH: 0, gap: 12, tabs: ["Home", "Insights", "Plant", "Inbox"], tabLabels: true, primary: "", accent: "#6BA368", dark: true, bg: "#FAF8F5" },
  { key: "healthy", greeting: "Good afternoon, Sam", typeScale: 1.0, cards: 4, btnH: 0, gap: 8, tabs: ["Home", "Insights", "Lumi", "Inbox", "Diary"], tabLabels: true, primary: "", accent: "#5B9BD5", dark: false, bg: "#FAF8F5" },
  { key: "glaucoma", greeting: "Good morning, Mrs Tan", typeScale: 1.6, cards: 2, btnH: 64, gap: 16, tabs: ["Home", "Insights", "Inbox", "Lumi"], tabLabels: true, primary: "Mark as done", accent: "#1F3A5F", dark: false, bg: "#FFFFFF" },
  { key: "depression", greeting: "Good morning.", typeScale: 1.0, cards: 2, btnH: 48, gap: 14, tabs: ["Home", "Insights", "Lumi", "Inbox", "Diary"], tabLabels: true, primary: "Continue morning light", accent: "#8B5FBF", dark: false, bg: "#FBF9FD" },
  { key: "stroke", greeting: "Good morning.", typeScale: 1.4, cards: 0, btnH: 84, gap: 20, tabs: [], tabLabels: false, primary: "START", accent: "#0B6F75", dark: false, bg: "#FFFFFF" },
];

const CARD_TEXT = [
  ["78 minutes outside so far today.", "", "", ""],
  ["Bright light 34 min · since 7:10", "Evening peak 40 lx · at 23:10", "Bedtime 23:40 · avg this week", "Next up: dim the lights at 21:40"],
  ["Eye drops · 8:00 PM", "Appointment · 12 Oct", "", ""],
  ["How are you feeling?", "Tonight · Wind-down at 9:30 PM", "", ""],
  ["", "", "", ""],
];

export function morphScene() {
  const C = ABOUT.morph;

  // Hero visuals, all present, faded per state.
  const heroes = [
    h("div", { class: "mo-hero mo-hero--plant" }, miniPlant(ART_SUNFLOWER, { size: 120, label: "sunflower" })),
    h("div", { class: "mo-hero mo-hero--ring" }, scoreRing(71, HEALTHY_SEGMENTS, 150).svg),
    h("div", { class: "mo-hero mo-hero--num" }, h("p", { class: "mo-big" }, "84 min"), h("p", { class: "mo-big-label" }, "Bright light today"), h("div", { class: "mo-bar" }, h("span", { style: "width:70%;background:#1F3A5F" })), h("p", { class: "mo-big-label" }, "36 min remaining")),
    h("div", { class: "mo-hero mo-hero--window" }, h("p", { class: "mo-big-label" }, "Your morning light window"), h("p", { class: "mo-mid" }, "24 / 30 min"), h("div", { class: "mo-bar" }, h("span", { style: "width:80%;background:#8B5FBF" })), h("p", { class: "mo-big-label" }, "6 min remaining")),
    h("div", { class: "mo-hero mo-hero--sun" }, bigSun(120), h("p", { class: "mo-mid" }, "Morning light · 30 minutes")),
  ];
  const heroSlot = h("div", { class: "mo-hero-slot" }, ...heroes);
  const greeting = h("h2", { class: "mo-greet" }, STATES[0].greeting);
  const cards = [0, 1, 2, 3].map(() => h("div", { class: "mo-card" }, h("p", null, "")));
  const cardsWrap = h("div", { class: "mo-cards" }, ...cards);
  const primary = h("span", { class: "mo-primary" }, "");
  const tabs = h("div", { class: "mo-tabs" });
  const tabEls = [0, 1, 2, 3, 4].map(() => h("span", { class: "mo-tab" }, h("span", { class: "mo-tab-dot" }), h("span", { class: "mo-tab-label" })));
  tabs.append(...tabEls);
  const screen = h("div", { class: "scr scr--morph" }, h("div", { class: "scr-body mo-body" }, greeting, heroSlot, cardsWrap, primary), tabs);
  const phone = phoneFrame(screen, { scale: 0.6, label: "One phone morphing through five configurations" });

  const captions = C.steps.map((st, i) =>
    h("li", { class: "mo-caption", "data-i": i }, h("p", { class: "mo-who" }, h("strong", null, st.who), h("span", { class: "mo-arrow", "aria-hidden": "true" }, " → "), h("em", null, st.arrow)), h("p", { class: "muted" }, st.text)),
  );
  const captionList = h("ol", { class: "mo-captions" }, ...captions);
  const closing = h("p", { class: "closing-line mo-closing" }, C.closing);

  const pin = h("div", { class: "mo-pin" }, h("div", { class: "wrap mo-grid" }, h("div", { class: "mo-phone" }, phone), h("div", { class: "mo-side" }, captionList, closing)));
  const el = h("section", { class: "section section--tight morph-section" }, h("div", { class: "wrap" }, sectionHead(C.kicker, C.heading)), pin);

  function set(p: number) {
    // 5 states; hold each, transition in the last 40% of each segment
    const segs = STATES.length - 1;
    const x = clamp(p, 0, 1) * segs;
    const i = Math.min(segs - 1, Math.floor(x));
    const f = x - i;
    const t = clamp((f - 0.55) / 0.45, 0, 1); // hold then move
    const a = STATES[i];
    const b = STATES[i + 1];
    const ts = lerp(a.typeScale, b.typeScale, t);
    const gap = lerp(a.gap, b.gap, t);
    const btnH = lerp(a.btnH, b.btnH, t);
    const cardsN = lerp(a.cards, b.cards, t);
    screen.style.setProperty("--ts", ts.toFixed(3));
    screen.style.setProperty("--gap", `${gap.toFixed(1)}px`);
    screen.style.setProperty("--accent", t < 0.5 ? a.accent : b.accent);
    screen.style.background = t < 0.5 ? a.bg : b.bg;
    const active = t < 0.5 ? i : i + 1;
    greeting.textContent = STATES[active].greeting;
    heroes.forEach((hh, k) => {
      const o = k === i ? 1 - t : k === i + 1 ? t : 0;
      hh.style.opacity = o.toFixed(3);
      hh.style.transform = `scale(${0.9 + 0.1 * o})`;
      hh.style.pointerEvents = "none";
    });
    cards.forEach((c, k) => {
      const vis = clamp(cardsN - k, 0, 1);
      c.style.opacity = vis.toFixed(3);
      c.style.maxHeight = `${vis * 72}px`;
      c.style.marginBottom = `${vis * gap}px`;
      const txt = CARD_TEXT[active][k] || CARD_TEXT[t < 0.5 ? i : i + 1][k] || "";
      (c.firstChild as HTMLElement).textContent = txt;
    });
    primary.style.height = `${btnH}px`;
    primary.style.opacity = btnH > 8 ? "1" : "0";
    primary.style.fontSize = `${lerp(16, 30, clamp((btnH - 44) / 40, 0, 1))}px`;
    primary.textContent = STATES[active].primary;
    primary.style.background = STATES[active].accent;
    const tabsN = lerp(a.tabs.length, b.tabs.length, t);
    tabEls.forEach((te, k) => {
      const vis = clamp(tabsN - k, 0, 1);
      te.style.opacity = vis.toFixed(3);
      te.style.flex = `${vis} 1 0`;
      const label = STATES[active].tabs[k] ?? "";
      (te.lastChild as HTMLElement).textContent = label;
      te.style.fontSize = `${11 * Math.max(1, ts * 0.85)}px`;
    });
    tabs.style.opacity = tabsN < 0.5 ? "0" : "1";
    tabs.classList.toggle("is-dark", STATES[active].dark);
    captions.forEach((c, k) => c.classList.toggle("is-on", k === active));
    closing.classList.toggle("is-on", p > 0.97);
  }

  function mount() {
    scrub(
      { set },
      {
        trigger: pin,
        pin,
        end: "+=450%",
        steps: C.steps.map((st, i) => ({ label: st.who, p: i / (C.steps.length - 1), describe: `${st.who} → ${st.arrow}. ${st.text}` })),
        controlLabel: "Step through the five configurations",
      },
    );
  }
  return { el, mount };
}
