// Ambient tokens. The page background is one warm cream throughout; the
// hero and the conclusion carry their own solid navy. Nothing here is
// scroll-linked: the site's motion rule is normal document flow with a few
// bounded pinned sequences, so the canvas does not drift in colour as the
// reader scrolls.
const CREAM = "#faf8f5";
const AMBER = "#e8a825";

export function startAmbient() {
  const doc = document.documentElement;
  doc.style.setProperty("--ambient-bg", CREAM);
  doc.style.setProperty("--aperture-tint", AMBER);
  doc.style.setProperty("--day-progress", "0");
}

/** Kept for the router; nothing to recompute. */
export function resetAmbient() {}
