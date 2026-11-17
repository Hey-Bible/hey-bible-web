#!/bin/zsh
# Draws the Hey Bible book-and-cross mark and writes the site's favicons and
# logo image from it. Needs zsh and ImageMagick 7 (`magick`).
#
# Usage, from the repository root:
#   scripts/brand/make-icons.sh      (or `npm run brand`, which also renders
#                                     the share image and social graphics)
#
# The drawing is the one in src/components/LogoMark.astro, on its 24-unit grid.
set -e
# printf follows the locale; ImageMagick draw coordinates need a '.' decimal point
export LC_ALL=C

ROOT=${0:A:h}/../..
F=$ROOT/public/img/favicons
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT

CREAM='#F3E8D6'; INK='#43302A'

# glyph <canvas w> <canvas h> <mark box px> <out>: the mark in white on black,
# centred. The mark box is the full 24-unit grid; the book fills 16 by 19 of it.
glyph() {
  local CW=$1 CH=$2 G=$3 OUT=$4
  local s=$(( G / 24.0 )) ox=$(( (CW - G) / 2.0 )) oy=$(( (CH - G) / 2.0 ))
  px() { printf '%.2f' $(( ox + $1 * s )) }
  py() { printf '%.2f' $(( oy + $1 * s )) }
  r() { printf '%.2f' $(( $1 * s )) }
  magick -size ${CW}x${CH} xc:black \
    -fill white -draw "roundrectangle $(px 4),$(py 2.5) $(px 20),$(py 21.5) $(r 3.5),$(r 3.5)" \
    -fill black -draw "roundrectangle $(px 10.8),$(py 5.2) $(px 13.2),$(py 14.2) $(r 0.6),$(r 0.6)" \
    -fill black -draw "roundrectangle $(px 8),$(py 7.8) $(px 16),$(py 10.2) $(r 0.6),$(r 0.6)" \
    -fill black -draw "roundrectangle $(px 7),$(py 16.6) $(px 17.5),$(py 19) $(r 1.2),$(r 1.2)" \
    -alpha off "$OUT"
}

# tinted <canvas w> <canvas h> <mark box px> <colour> <out>: the mark on transparency.
tinted() {
  glyph $1 $2 $3 "$W/mask.png"
  magick -size ${1}x${2} "xc:$4" "$W/mask.png" -alpha off -compose CopyOpacity -composite "$5"
}

# Icon: brown mark on a cream square
tinted 1024 1024 640 "$INK" "$W/mark.png"
magick -size 1024x1024 "xc:$CREAM" "$W/mark.png" -compose Over -composite "$W/icon.png"

magick "$W/icon.png" -resize 512x512 "$F/android-chrome-512x512.png"
magick "$W/icon.png" -resize 192x192 "$F/android-chrome-192x192.png"
magick "$W/icon.png" -resize 180x180 "$F/apple-touch-icon.png"

# Small favicons: a bigger mark, so it still reads at 16 pixels
tinted 512 512 420 "$INK" "$W/mark-small.png"
magick -size 512x512 "xc:$CREAM" "$W/mark-small.png" -compose Over -composite "$W/icon-small.png"
magick "$W/icon-small.png" -resize 32x32 "$F/favicon-32x32.png"
magick "$W/icon-small.png" -resize 16x16 "$F/favicon-16x16.png"
magick "$W/icon-small.png" -define icon:auto-resize=48,32,16 "$F/favicon.ico"
cp "$F/favicon.ico" "$ROOT/public/favicon.ico"

# The mark alone on transparency, cropped close: 600 by 686, as before
tinted 600 686 866 "$INK" "$ROOT/public/img/logo-small.png"

echo "wrote favicons to $F and the logo to public/img/logo-small.png"
