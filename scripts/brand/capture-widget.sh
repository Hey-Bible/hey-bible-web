#!/bin/sh
# Draws the iOS home screen widget for the Features page, using the widget's own
# code from hey-bible-app, and saves the pictures in brand/store/captures/widget/.
#
#   npm run brand:widget
#
# Needs Xcode and an iOS simulator. It builds the widget's views with
# widget-render.swift, and runs that inside the simulator so the type and
# colours are the ones a phone would draw. HB_APP_DIR says where hey-bible-app
# is (default: next to this repository); HB_SIMULATOR names the simulator to
# use (default: the one that is running, or else the first iPhone).
set -eu

root="$(cd "$(dirname "$0")/../.." && pwd)"
app="${HB_APP_DIR:-$root/../hey-bible-app}"
widget="$app/ios/App/HeyBibleWidget"
out="$root/brand/store/captures/widget"
[ -f "$widget/HeyBibleWidget.swift" ] || { echo "No widget source in $widget; set HB_APP_DIR" >&2; exit 1; }

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# The widget's views, without the Xcode previews at the end of the file
sed '/^\/\/ MARK: - Previews/,$d' "$widget/HeyBibleWidget.swift" > "$work/HeyBibleWidget.swift"
xcrun --sdk iphonesimulator swiftc -parse-as-library \
  -target "$(uname -m)-apple-ios17.0-simulator" \
  "$work/HeyBibleWidget.swift" "$widget/SharedModels.swift" "$root/scripts/brand/widget-render.swift" \
  -o "$work/widget-render"

device="${HB_SIMULATOR:-}"
[ -n "$device" ] || device="$(xcrun simctl list devices booted | sed -n 's/.*(\([0-9A-F-]\{36\}\)) (Booted).*/\1/p' | head -1)"
if [ -z "$device" ]; then
  device="$(xcrun simctl list devices available | sed -n 's/.*iPhone.*(\([0-9A-F-]\{36\}\)).*/\1/p' | head -1)"
  [ -n "$device" ] || { echo "No iPhone simulator found" >&2; exit 1; }
  xcrun simctl boot "$device"
  xcrun simctl bootstatus "$device" > /dev/null
  started=1
fi

mkdir -p "$out"
xcrun simctl spawn "$device" "$work/widget-render" "$out"
[ -z "${started:-}" ] || xcrun simctl shutdown "$device"
