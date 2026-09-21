// "Timing matters": Maya has 21 minutes left. A compact interactive decision
// simulation in normal document flow. Three neutral choices; time moves after
// the visitor decides; the ARKA phone is the controlled variable.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { depressionHome } from "../components/screens";
import { nudgeBanner } from "../components/ui";
import { clamp, h, lerp, s } from "../lib/dom";
import { later, reducedMotion, tween } from "../lib/motion";

type Choice = "nothing" | "tonight" | "now";

const WAKE = 7 * 60 + 20;
const NOW = 11 * 60 + 45;
const CLOSE = 12 * 60 + 30;
const EVENING = 21 * 60;

export function timingScene() {
  const C = ABOUT.timing;

  // ── Timeline SVG (fixed geometry; only transform/opacity and text change)
  const TW = 720;
  const TH = 90;
  const x = (min: number) => 30 + ((min - WAKE) / (CLOSE - WAKE)) * (TW - 60);
  const svg = s("svg", { class: "tm-svg", viewBox: `0 0 ${TW} ${TH}`, role: "img", "aria-label": "Maya's morning: wake at 7:20, now 11:45, window closes 12:30. 21 minutes left." });
  svg.appendChild(s("line", { x1: x(WAKE), y1: 40, x2: x(NOW), y2: 40, stroke: "#1a1a1a", "stroke-width": 1.5 }));
  const remaining = s("line", { x1: x(NOW), y1: 40, x2: x(CLOSE), y2: 40, stroke: "#E8A825", "stroke-width": 4, "stroke-linecap": "round", style: `transform-origin:${x(NOW)}px 40px` });
  svg.appendChild(remaining);
  svg.appendChild(s("circle", { cx: x(WAKE), cy: 40, r: 5, fill: "#1a1a1a" }));
  const nowDot = s("circle", { cx: x(NOW), cy: 40, r: 6, fill: "#1a1a1a" });
  svg.appendChild(nowDot);
  svg.appendChild(s("circle", { cx: x(CLOSE), cy: 40, r: 5, fill: "#FAF8F5", stroke: "#1a1a1a", "stroke-width": 1.5 }));
  const tick = (min: number, t: string, label: string, cls = "") => {
    svg.appendChild(s("text", { x: x(min), y: 18, "text-anchor": "middle", class: `tm-t ${cls}` }, t));
    svg.appendChild(s("text", { x: x(min), y: 70, "text-anchor": "middle", class: `tm-l ${cls}` }, label.toUpperCase()));
  };
  tick(WAKE, C.timeline.wake.t, C.timeline.wake.label);
  const nowT = s("text", { x: x(NOW), y: 18, "text-anchor": "middle", class: "tm-t tm-t--now" }, C.timeline.now.t);
  const nowL = s("text", { x: x(NOW), y: 70, "text-anchor": "middle", class: "tm-l" }, C.timeline.now.label.toUpperCase());
  svg.append(nowT, nowL);
  tick(CLOSE, C.timeline.close.t, C.timeline.close.label);
  const leftLabel = s("text", { x: (x(NOW) + x(CLOSE)) / 2, y: 86, "text-anchor": "middle", class: "tm-leftlabel" }, C.left.toUpperCase());
  svg.appendChild(leftLabel);

  // Progress bar
  const barFill = h("span", { class: "tm-bar-fill", style: `transform:scaleX(${C.progress.done / C.progress.target})` });
  const progText = h("span", { class: "tm-prog mono-label" }, `${C.progress.done} / ${C.progress.target} ${C.progress.label}`);
  const bar = h("div", { class: "tm-bar-wrap" }, h("span", { class: "tm-bar", role: "img", "aria-label": `${C.progress.done} of ${C.progress.target} minutes` }, barFill), progText);

  // Phone
  const screen = depressionHome({ done: 9, target: 30, mood: false, lumi: false });
  const phone = phoneFrame(screen, { scale: 0.42, label: C.phoneLabel });
  const dBar = screen.querySelector<HTMLElement>(".d-bar-fill");
  const dNum = screen.querySelector<HTMLElement>(".d-mins strong");
  const dRem = screen.querySelector<HTMLElement>(".d-remaining");
  const notif = h("div", { class: "tm-notif" });
  const phoneWrap = h("div", { class: "tm-phone" }, phone, notif);

  // Choices
  const options = C.options.map((o) =>
    h(
      "button",
      { class: "tm-choice", type: "button", "data-id": o.id, "aria-pressed": "false" },
      h("span", { class: "tm-choice-label" }, o.label),
      h("span", { class: "tm-choice-sub" }, o.sub),
    ),
  );
  const choices = h("div", { class: "tm-choices", role: "group", "aria-label": C.ask }, ...options);

  // Outcome
  const outTitle = h("p", { class: "tm-out-title" });
  const outBody = h("p", { class: "tm-out-body" });
  const chooses = h("p", { class: "tm-chooses mono-label" }, C.chooses);
  const reset = h("button", { class: "btn btn--ghost tm-reset", type: "button" }, C.reset);
  const outcome = h("div", { class: "tm-outcome", "aria-live": "polite", hidden: true }, chooses, outTitle, outBody, reset);

  // Lesson (after the nudge path)
  const lesson = h(
    "div",
    { class: "tm-lesson", hidden: true },
    h("div", { class: "tm-lesson-steps", "aria-hidden": "true" }, ...C.lesson.steps.map((st, i) => h("span", { class: "tm-lesson-step" }, h("span", { class: "mono-label" }, st), i < 2 ? h("span", { class: "tm-lesson-arrow" }, "→") : null))),
    h("h3", null, C.lesson.heading),
    h("p", { class: "lede" }, C.lesson.bodyBefore, h("em", { class: "tm-em" }, C.lesson.bodyEmphasis), C.lesson.bodyAfter),
  );

  const el = h(
    "section",
    { class: "section tm-section", id: "timing" },
    h(
      "div",
      { class: "wrap tm-grid" },
      h(
        "div",
        { class: "tm-left" },
        h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body), h("p", { class: "fictional mono-label" }, C.fictional)),
        h("div", { class: "tm-timeline", "data-enter": true }, svg, bar),
        h("div", { class: "tm-ask", "data-enter": true }, h("p", { class: "tm-ask-q" }, C.ask), choices),
        outcome,
        lesson,
      ),
      h("div", { class: "tm-right", "data-enter": true }, phoneWrap),
    ),
  );

  // ── State
  let running: (() => void) | null = null;
  let choice: Choice | null = null;
  const fmtTime = (min: number) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;

  function setClock(min: number) {
    const m = clamp(min, NOW, CLOSE);
    const f = (m - NOW) / (CLOSE - NOW);
    nowDot.style.transform = `translateX(${(x(CLOSE) - x(NOW)) * f}px)`;
    nowT.style.transform = `translateX(${(x(CLOSE) - x(NOW)) * f}px)`;
    nowL.style.transform = nowT.style.transform;
    nowT.textContent = fmtTime(Math.round(min));
    remaining.style.transform = `scaleX(${1 - f})`;
    // "21 min left" is the light still needed, not the clock: it holds while
    // the window is open and disappears when the window closes.
    leftLabel.textContent = m < CLOSE ? C.left.toUpperCase() : "";
    nowL.textContent = min >= CLOSE ? "" : C.timeline.now.label.toUpperCase();
    // Daylight tone: 0 = warm daylight, 1 = night
    const night = min <= CLOSE ? 0 : clamp((min - CLOSE) / (EVENING - CLOSE), 0, 1);
    el.style.setProperty("--tone", String(night));
    el.style.setProperty("--warm", String(min <= CLOSE ? 1 - f * 0.6 : 0));
  }
  function setProgress(done: number) {
    barFill.style.transform = `scaleX(${done / C.progress.target})`;
    progText.textContent = `${Math.round(done)} / ${C.progress.target} ${C.progress.label}`;
    if (dBar) dBar.style.transform = `scaleX(${done / C.progress.target})`;
    if (dNum) dNum.textContent = `${Math.round(done)}`;
    if (dRem) dRem.textContent = `${Math.max(0, C.progress.target - Math.round(done))} min remaining`;
    if (done >= C.progress.target - 0.5) leftLabel.textContent = "";
  }
  function showNotif(title: string, body: string, time?: string) {
    notif.replaceChildren(nudgeBanner(title, body, { time, class: "tm-banner" }));
    notif.classList.add("is-on");
    phone.classList.add("is-buzz");
    later(() => phone.classList.remove("is-buzz"), 600);
  }
  function clearNotif() {
    notif.classList.remove("is-on");
    later(() => notif.replaceChildren(), 400);
  }
  function showOutcome(title: string, body: string, withChooses = false) {
    outTitle.textContent = title;
    outBody.textContent = body;
    outBody.hidden = !body;
    chooses.hidden = !withChooses;
    outcome.hidden = false;
    later(() => outcome.classList.add("is-in"), 20);
  }

  function resetAll() {
    running?.();
    running = null;
    choice = null;
    options.forEach((o) => {
      o.setAttribute("aria-pressed", "false");
      o.disabled = false;
    });
    outcome.classList.remove("is-in");
    outcome.hidden = true;
    lesson.hidden = true;
    lesson.classList.remove("is-in");
    clearNotif();
    setClock(NOW);
    setProgress(C.progress.done);
    el.classList.remove("is-done");
  }

  function run(id: Choice) {
    if (running) return;
    choice = id;
    options.forEach((o) => {
      o.setAttribute("aria-pressed", String(o.dataset.id === id));
      o.disabled = true;
    });
    const rm = reducedMotion();
    const slow = (ms: number) => (rm ? 0 : ms);

    if (id === "nothing") {
      const stop = tween(slow(2600), (p) => setClock(lerp(NOW, CLOSE, p)), () => {
        showOutcome(C.outcomes.nothing.title, C.outcomes.nothing.body);
      });
      running = stop;
    } else if (id === "tonight") {
      const stop = tween(slow(3400), (p) => setClock(lerp(NOW, EVENING, p)), () => {
        later(() => {
          showNotif("ARKA", C.eveningSummary, "21:00");
          later(() => showOutcome(C.outcomes.tonight.title, C.outcomes.tonight.body), slow(600));
        }, slow(300));
      });
      running = stop;
    } else {
      showNotif(C.nudge.title, C.nudge.body, "11:45");
      later(() => {
        showOutcome("", "", true);
        // Maya chooses to go outside: time runs 11:45 → 12:06 while progress 9 → 30
        const stop = tween(slow(2400), (p) => {
          setClock(lerp(NOW, NOW + 21, p));
          setProgress(lerp(C.progress.done, C.progress.target, p));
          el.style.setProperty("--warm", String(1 + p * 0.5));
        }, () => {
          clearNotif();
          outTitle.textContent = C.outcomes.now.title;
          later(() => {
            el.classList.add("is-done");
            lesson.hidden = false;
            later(() => lesson.classList.add("is-in"), 20);
          }, slow(900));
        });
        running = stop;
      }, slow(1400));
    }
  }

  options.forEach((o) => o.addEventListener("click", () => run(o.dataset.id as Choice)));
  reset.addEventListener("click", resetAll);

  function mount() {
    if (dBar) {
      dBar.style.width = "100%";
      dBar.style.transformOrigin = "left center";
    }
    setClock(NOW);
    setProgress(C.progress.done);
    void choice;
  }
  return { el, mount };
}
