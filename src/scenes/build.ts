// "Build an intervention": static and real. A laptop frame showing a
// faithful replica of the ARKA researcher portal (its shell, sidebar,
// typography, controls and colours as captured in portal-reference/) at a
// study configuration screen. Beside it, the participant phone for the
// selected population, using the real myopia Plant tab. Normal document
// flow, entrance animation only.
import { ABOUT } from "@content/about";
import { laptopFrame, phoneFrame } from "../components/frames";
import { sunriseMark } from "../components/icons";
import { DEFAULT_CONFIG, participantScreen } from "../components/screens";
import { h, s } from "../lib/dom";

export function buildScene() {
  const C = ABOUT.build;
  const P = C.portal;

  const laptop = laptopFrame(portalShell(), { label: C.laptopLabel, class: "bd-laptop" });
  const phone = phoneFrame(participantScreen(DEFAULT_CONFIG.myopia), { scale: 0.5, label: C.phoneLabel });

  const el = h(
    "section",
    { class: "section bd-section", id: "build" },
    h(
      "div",
      { class: "wrap" },
      h("div", { class: "section-head", "data-enter": true }, h("span", { class: "kicker" }, C.kicker), h("h2", null, C.heading), h("p", { class: "lede" }, C.body)),
      h(
        "div",
        { class: "bd-grid" },
        h("div", { class: "bd-left", "data-enter": true }, laptop, h("p", { class: "bd-cap mono-label" }, "Researcher portal · ", P.page)),
        h("div", { class: "bd-right", "data-enter": true }, phone, h("p", { class: "bd-cap mono-label" }, "Participant app · ", P.preset)),
      ),
    ),
  );

  function portalShell(): HTMLElement {
    const navItem = (label: string, opts: { active?: boolean; sub?: boolean; icon?: string; badge?: string; chevron?: boolean } = {}) =>
      h(
        "div",
        { class: `pt-nav${opts.active ? " is-active" : ""}${opts.sub ? " pt-nav--sub" : ""}` },
        h("span", { class: "pt-ico", "aria-hidden": "true" }, glyph(opts.icon ?? label)),
        h("span", { class: "pt-nav-label" }, label),
        opts.badge ? h("span", { class: "pt-badge" }, opts.badge) : null,
        opts.chevron ? h("span", { class: "pt-chev", "aria-hidden": "true" }, "⌵") : null,
      );
    const sidebar = h(
      "aside",
      { class: "pt-side" },
      h("div", { class: "pt-brand" }, sunriseMark(18, "#C48A1A"), h("span", { class: "pt-brand-word" }, "ARKA"), h("span", { class: "pt-brand-portal" }, "Portal")),
      h("p", { class: "pt-group" }, "Portal"),
      h("div", { class: "pt-portal-card" }, navItem("All Studies", { icon: "studies" }), navItem("All Participants", { icon: "participants" }), navItem("Researchers", { icon: "researchers", badge: "1" })),
      h("p", { class: "pt-group" }, "Current study"),
      h("div", { class: "pt-study" }, h("span", { class: "pt-study-name" }, P.study), h("span", { class: "pt-study-code" }, P.code)),
      navItem("Overview", { icon: "overview" }),
      navItem("Study Design", { icon: "design", chevron: true }),
      navItem("Arms", { sub: true, icon: "arms" }),
      navItem("Phases", { sub: true, icon: "phases" }),
      navItem("Intake Questions", { sub: true, icon: "intake" }),
      navItem("Updates", { sub: true, icon: "updates" }),
      navItem("Protocols", { icon: "protocols", chevron: true }),
      navItem("Light Goals", { sub: true, icon: "light" }),
      navItem("Mobile App Config", { sub: true, icon: "mobile", active: true }),
      navItem("Nudges", { sub: true, icon: "nudges" }),
      navItem("Participants", { icon: "participants" }),
      navItem("Monitoring", { icon: "monitoring" }),
      navItem("Export", { icon: "export" }),
      h("p", { class: "pt-group" }, "Resources"),
      navItem("Setup Guide", { icon: "guide" }),
      navItem("Account Settings", { icon: "settings" }),
      h("div", { class: "pt-user" }, h("span", { class: "pt-avatar" }, "T"), h("span", { class: "pt-user-text" }, h("span", { class: "pt-user-name" }, "Tarinnya Ramaraviku..."), h("span", { class: "pt-user-org" }, "NUS Yong Loo Lin School of M...")), h("span", { class: "pt-user-out", "aria-hidden": "true" }, "⇥")),
    );

    const select = (label: string, value: string) => h("label", { class: "pt-field" }, h("span", { class: "pt-field-label" }, label), h("span", { class: "pt-select" }, h("span", null, value), h("span", { class: "pt-select-chev", "aria-hidden": "true" }, "⌵")));
    const toggle = (label: string, sub: string, on: boolean) => h("div", { class: "pt-toggle-row" }, h("span", { class: "pt-toggle-text" }, h("strong", null, label), h("span", null, sub)), h("span", { class: `pt-switch${on ? " is-on" : ""}`, "aria-hidden": "true" }));
    const choice = (name: string, blurb: string, on: boolean) =>
      h("div", { class: `pt-choice${on ? " is-on" : ""}` }, h("span", { class: "pt-radio", "aria-hidden": "true" }), h("span", { class: "pt-choice-text" }, h("strong", null, name), h("span", null, blurb)));
    const module = (title: string, summary: string, on: boolean) =>
      h("div", { class: "pt-mod" }, h("span", { class: `pt-switch${on ? " is-on" : ""}`, "aria-hidden": "true" }), h("span", { class: "pt-mod-text" }, h("strong", null, title), h("span", null, summary)));

    const who = h(
      "div",
      { class: "pt-card pt-card--who" },
      h("div", { class: "pt-card-head" }, h("h3", null, P.who), h("p", null, P.whoSub)),
      h(
        "div",
        { class: "pt-card-body" },
        h("div", { class: "pt-row pt-row--2" }, select("Arm", "Default (all arms)"), select("Phase", P.phase)),
        h("div", { class: "pt-field" }, h("span", { class: "pt-field-label" }, "Interface"), h("p", { class: "pt-hint" }, "Switching resets the module toggles below to that interface's recommended defaults.")),
        h("div", { class: "pt-choices" }, choice("Intervention", "Progress gauge, daily goal, and coaching copy", true), choice("Placebo", "Neutral wear tracking: no gauge, goal or target", false)),
        h("div", { class: "pt-editing" }, h("span", { class: "pt-editing-ico", "aria-hidden": "true" }, "✧"), "Editing ", h("strong", null, "All arms"), " · ", h("strong", null, "All phases"), h("span", { class: "pt-editing-sep" }, "Using system defaults until saved")),
      ),
    );
    const lumi = h(
      "div",
      { class: "pt-card" },
      h("div", { class: "pt-card-head" }, h("h3", null, "Lumi chatbot"), h("p", null, "Shown as its own tab in the participant app. Existing conversations are kept if you turn it off.")),
      h("div", { class: "pt-card-body" }, toggle("Show Lumi in the app", "When off, the Lumi tab is hidden and the chat API refuses messages.", false)),
    );
    const pieces = h(
      "div",
      { class: "pt-split" },
      h(
        "div",
        { class: "pt-card" },
        h("div", { class: "pt-card-head" }, h("h3", null, "Home screen pieces"), h("p", null, "11 of 11 shown on the intervention interface")),
        h(
          "div",
          { class: "pt-card-body pt-mods" },
          module("Sync status banner", "Green when the watch synced, red with instructions when it did not", true),
          module("Outdoor minutes total", "Large minutes number for today", true),
          module("Goal coaching message", "Take your child outside for X more minutes", true),
          module("Monthly wear time", "Progress toward the monthly wear-time minimum", true),
        ),
      ),
      h("div", { class: "pt-preview-col" }, h("h3", { class: "pt-preview-h" }, "Preview"), h("p", { class: "pt-hint" }, "The intervention home screen as the parent sees it"), h("div", { class: "pt-preview-phone", "aria-hidden": "true" })),
    );

    const main = h("main", { class: "pt-main" }, h("h1", { class: "pt-h1" }, P.page), h("p", { class: "pt-sub" }, P.pageSub), who, lumi, pieces);
    const footer = h(
      "div",
      { class: "pt-foot" },
      h("span", null, P.footer),
      h("span", { class: "pt-foot-actions" }, h("span", { class: "pt-btn pt-btn--ghost" }, P.discard), h("span", { class: "pt-btn pt-btn--outline" }, glyph("reset"), P.reset), h("span", { class: "pt-btn pt-btn--primary" }, glyph("save"), P.save)),
    );
    return h("div", { class: "pt" }, sidebar, h("div", { class: "pt-content" }, main, footer));
  }

  return { el, mount: () => {} };
}

/** Tiny 14px outline glyphs for the sidebar, matching lucide's weight. */
function glyph(name: string): SVGSVGElement {
  const svg = s("svg", { viewBox: "0 0 24 24", width: 14, height: 14, fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" });
  const add = (d: string) => svg.appendChild(s("path", { d }));
  switch (name.toLowerCase()) {
    case "studies": add("M8 3h8M9 3v6l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3"); break;
    case "participants": add("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"); break;
    case "researchers": add("M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4zM9 12l2 2 4-4"); break;
    case "overview": add("M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"); break;
    case "design": add("M4 4h16v16H4zM4 9h16M9 9v11"); break;
    case "arms": add("M12 3v18M5 8l7-5 7 5M8 21h8"); break;
    case "phases": add("M4 6h16M4 12h16M4 18h16"); break;
    case "intake": add("M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"); break;
    case "updates": add("M12 22a10 10 0 1 0-10-10M12 6v6l4 2"); break;
    case "protocols": add("M4 4h16v12H4zM8 20h8"); break;
    case "light": add("M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8"); break;
    case "mobile": add("M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01"); break;
    case "nudges": add("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"); break;
    case "monitoring": add("M22 12h-4l-3 9L9 3l-3 9H2"); break;
    case "export": add("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"); break;
    case "guide": add("M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"); break;
    case "settings": add("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"); break;
    case "reset": add("M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"); break;
    case "save": add("M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8"); break;
    default: add("M4 12h16");
  }
  return svg;
}
