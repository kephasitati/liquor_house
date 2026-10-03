#!/usr/bin/env bash
# Builds public/bottles/<handle>.webp (the demo cellar's photographs) and public/hero/*.webp
# (the cut-out bottles in the hero and the pour) from the shop photographs already kept in
# medusa/src/scripts/data/beyond/. Those were downloaded from Nairobi retailers' listings and
# are self-hosted, never hotlinked; scripts/bottle-credits.json records where each came from.
#
#   bash scripts/bottle-photos.sh        (needs ImageMagick and node)
#
# The finished photos are committed in public/, so building or running the site never needs
# this script or anything outside this folder. It is only for re-cutting them, and reads its
# sources from PHOTO_SRC (by default the photo folder in the monorepo this project started in).
#
# Every product photo is normalised to the same 600×750 frame on pure white, standing on the
# same floor line, so a grid of them reads as one shelf. Pure white matters: the cards print
# the photo with mix-blend-mode: multiply, and white is the only colour that disappears.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
APP="$(dirname "$HERE")"
SRC="${PHOTO_SRC:-$APP/../medusa/src/scripts/data/beyond}"
[ -d "$SRC" ] || { echo "No source photos at $SRC — set PHOTO_SRC to the folder that holds them." >&2; exit 1; }
OUT="$APP/public/bottles"
HERO="$APP/public/hero"
mkdir -p "$OUT" "$HERO"

# Backgrounds that are not quite white (a grey studio sweep) need a looser flood fill.
fuzz_for() { case "$1" in schweppes-ginger-ale-330ml.png) echo 38% ;; *) echo 8% ;; esac; }

node -e 'const m=require(process.argv[1]); for (const [h,f] of Object.entries(m)) if (h !== "_") console.log(h+" "+f)' "$HERE/bottle-photos.json" |
while read -r handle file; do
  f="$(fuzz_for "$file")"
  convert "$SRC/$file" -background white -alpha remove -alpha off -resize '1400x1400>' \
    -bordercolor white -border 2 -fuzz "$f" -fill white \
    -draw 'color 0,0 floodfill' \
    -fuzz 4% -trim +repage \
    -resize 520x660 -background white -gravity south -extent 600x705 -gravity north -extent 600x750 \
    -strip -quality 82 "$OUT/$handle.webp"
done

# Cut-outs for the dark scenes: the white ground flood-filled to transparent from the edges,
# the edge eased by a pixel so it does not halo, and the foot trimmed off where the studio
# shadow sat.
cutout() { # <source> <name> <foot-trim px>
  convert "$SRC/$1" -resize '1400x1400>' -bordercolor white -border 2 -alpha set -fuzz 9% -fill none \
    -draw 'color 0,0 floodfill' -shave 2x2 \
    -channel A -morphology Erode Disk:1.5 -blur 0x0.8 +channel -trim +repage \
    -gravity south -chop "0x$3" +repage -resize 'x900>' -strip -quality 86 "$HERO/$2.webp"
}
cutout hennessy-vsop.webp hennessy-vsop 6
cutout moet-and-chandon-brut-imperial.jpg moet 2
cutout jameson.webp jameson 4
cutout monkey-shoulder.webp monkey-shoulder 8
# The pour (components/PourScene.astro) uncorks the bottle as it tips, so it is split in two:
# the wooden cap (the top 31 rows) and the rest. Keep CORK_ROWS in step with the scene.
CORK_ROWS=31
convert "$HERO/monkey-shoulder.webp" -crop "x$CORK_ROWS+0+0" +repage -strip -quality 86 "$HERO/monkey-shoulder-cork.webp"
convert "$HERO/monkey-shoulder.webp" -crop "+0+$CORK_ROWS" +repage -strip -quality 86 "$HERO/monkey-shoulder-body.webp"
echo "bottles: $(ls "$OUT" | wc -l)  hero: $(ls "$HERO" | wc -l)"
