import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/screens.css";
import "./styles/pages.css";

import { footer, topBar } from "./components/chrome";
import { h } from "./lib/dom";
import { startAmbient } from "./lib/ambient";
import { initRouter } from "./lib/router";
import { forceReducedMotion } from "./lib/motion";
import "./lib/mode";

const app = document.getElementById("app")!;
const main = h("main", { id: "main", tabindex: "-1" });
app.append(topBar(), main, footer());

startAmbient();
initRouter(main);

// Test hook for the verification harness.
declare global {
  interface Window {
    __arka?: { forceReducedMotion: (v: boolean | null) => void };
  }
}
window.__arka = { forceReducedMotion };
