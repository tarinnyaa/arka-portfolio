// "Targets exist. Delivery is weak." Quote, then three columns that flip on
// scroll from a limitation to ARKA's answer (a transformation, so it explains).
import { ABOUT } from "@content/about";
import { evidence } from "../components/evidence";
import { h } from "../lib/dom";
import { onEnter, reducedMotion } from "../lib/motion";

export function deliveryScene() {
  const C = ABOUT.delivery;
  const cols = C.columns.map((c) =>
    h(
      "div",
      { class: "flip-col" },
      h("h3", null, c.title),
      h(
        "div",
        { class: "flip-inner" },
        h("div", { class: "flip-face flip-face--front card card--flat" }, h("span", { class: "kicker" }, "Limitation"), h("p", null, c.limitation)),
        h(
          "div",
          { class: "flip-face flip-face--back card" },
          h("span", { class: "kicker" }, "ARKA"),
          h("p", null, c.answer, c.ref ? evidence(c.ref) : null),
        ),
      ),
    ),
  );
  const flipBtn = h("button", { type: "button", class: "btn btn--ghost rm-hide-not", "aria-pressed": "false", onclick: () => toggle() }, "Show ARKA's answer");
  const el = h(
    "section",
    { class: "section delivery-section" },
    h(
      "div",
      { class: "wrap" },
      h("span", { class: "kicker" }, C.kicker),
      h(
        "blockquote",
        { class: "quote" },
        h("p", null, `“${C.quote}”`),
        h("footer", { class: "cite" }, "Faulkner et al., 2020", evidence(C.quoteRef)),
      ),
      h("div", { class: "grid-3 flip-grid" }, ...cols),
      h("p", { class: "muted small flip-hint" }, C.flipHint),
      flipBtn,
    ),
  );
  let flipped = false;
  function toggle(force?: boolean) {
    flipped = force ?? !flipped;
    cols.forEach((c, i) => setTimeout(() => c.classList.toggle("is-flipped", flipped), reducedMotion() ? 0 : i * 140));
    flipBtn.setAttribute("aria-pressed", String(flipped));
    flipBtn.textContent = flipped ? "Show the limitation" : "Show ARKA's answer";
  }
  function mount() {
    onEnter(el, () => toggle(true), "top 45%");
  }
  return { el, mount };
}
