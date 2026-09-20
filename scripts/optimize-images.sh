#!/usr/bin/env sh
# One-off image optimisation (documented per spec §1 "scripts/").
#
# WHAT IT DID
#   The supplied illustrations and the hero photograph are 1536×1024 PNGs of
#   1.6–2.3 MB each (≈18 MB total). The site renders them at ≤ 900 CSS px, so
#   each is re-encoded as a WebP sibling (same name, .webp) at quality 82.
#   Result: ~60–120 KB per image. The PNG originals stay in the repo as the
#   source of truth; components reference the .webp files (content/shared.ts).
#
# Requires cwebp (brew install webp). Run from the repo root:
#   sh scripts/optimize-images.sh
set -eu
cd "$(dirname "$0")/.."
for f in public/assets/illustrations/*.png public/assets/brand/hero-ecosystem.png; do
  out="${f%.png}.webp"
  cwebp -quiet -q 82 -m 6 "$f" -o "$out"
  printf '%s -> %s (%s bytes)\n' "$f" "$out" "$(stat -f%z "$out")"
done
