// Shared shape for the traced plant artwork (see scripts/extract-flower-art.ts).
export type ArtPath = { d: string; fill: string; tint?: boolean };
export type FlowerArt = {
  /** Tight content box [x, y, w, h] in the 1024×1024 trace space. */
  box: readonly [number, number, number, number];
  paths: readonly ArtPath[];
};
