// "8:14 AM" — five phones, one timestamp, five different things happening.
import { ABOUT } from "@content/about";
import { phoneFrame } from "../components/frames";
import { eightFourteenScreen, type Population } from "../components/screens";
import { sectionHead } from "../components/ui";
import { h } from "../lib/dom";

export function eightFourteenScene() {
  const C = ABOUT.eightFourteen;
  const phones = C.phones.map((p) =>
    h(
      "li",
      { class: "ef-phone" },
      phoneFrame(eightFourteenScreen(p.key as Population, p.line), { scale: 0.42, label: `${p.key} phone at 8:14 AM: ${p.line}` }),
      h("p", { class: "ef-label" }, h("strong", null, cap(p.key)), h("span", null, p.line)),
    ),
  );
  const el = h(
    "section",
    { class: "section eight-section" },
    h(
      "div",
      { class: "wrap" },
      sectionHead(C.kicker, C.heading),
      h("ul", { class: "ef-row", role: "list" }, ...phones),
      h("p", { class: "closing-line" }, C.closing),
    ),
  );
  return { el, mount: () => {} };
}

function cap(sv: string) {
  return sv.charAt(0).toUpperCase() + sv.slice(1);
}
