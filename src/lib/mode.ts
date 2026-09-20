// Explore | Research mode (spec §6). Explore is the default: clean
// storytelling. Research reveals EvidenceMarker superscripts. Persisted in
// localStorage inside try/catch.
export type Mode = "explore" | "research";

const KEY = "arka-mode";
const listeners = new Set<(m: Mode) => void>();
let current: Mode = load();

function load(): Mode {
  try {
    const v = localStorage.getItem(KEY);
    return v === "research" ? "research" : "explore";
  } catch {
    return "explore";
  }
}

export function getMode(): Mode {
  return current;
}

export function setMode(m: Mode) {
  current = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {
    /* storage unavailable — keep in memory only */
  }
  document.documentElement.dataset.mode = m;
  listeners.forEach((fn) => fn(m));
}

export function onModeChange(fn: (m: Mode) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

document.documentElement.dataset.mode = current;
