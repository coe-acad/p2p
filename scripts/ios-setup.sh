#!/usr/bin/env bash
#
# One-shot iOS scaffold for the borrowed-Mac session.
#
# Run this from the repo root on macOS. It is idempotent — re-running it after a
# failure is safe. Everything scriptable happens here; the two things Xcode will
# not let us script are printed at the end.
#
# Prereqs on the Mac: Xcode (+ `xcode-select --install`), CocoaPods, Node 20+.
#
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"
PLIST="$ROOT/ios/App/App/Info.plist"
PB=/usr/libexec/PlistBuddy

[[ "$(uname)" == "Darwin" ]] || { echo "This must run on macOS."; exit 1; }
command -v pod >/dev/null || { echo "CocoaPods missing: sudo gem install cocoapods"; exit 1; }
command -v xcodebuild >/dev/null || { echo "Xcode missing."; exit 1; }

echo "==> Installing deps and building the web bundle"
npm ci
npm run build

echo "==> Adding the iOS platform"
if [[ -d "$ROOT/ios" ]]; then
  echo "    ios/ already exists — skipping 'cap add'"
else
  npx cap add ios
fi
npx cap sync ios

# PlistBuddy's Add fails when the key exists, so delete-then-add for idempotency.
pset() { $PB -c "Delete :$2" "$1" >/dev/null 2>&1 || true; $PB -c "Add :$2 $3 $4" "$1"; }

echo "==> Writing Info.plist entries"

# The discom/device upload screens accept jpg+png, so iOS's WebView file picker
# offers "Take Photo" and "Photo Library". Both abort the app without a usage
# string. See LocationDiscomScreen.tsx:420, LocationDeviceScreen.tsx:382.
pset "$PLIST" NSCameraUsageDescription string "Take a photo of your electricity bill or device nameplate to upload it."
pset "$PLIST" NSPhotoLibraryUsageDescription string "Choose a photo of your electricity bill or device nameplate to upload it."

# public/manifest.json declares portrait-primary; the Capacitor template ships
# with landscape enabled. Match the declared intent so no landscape layout bugs
# surface after handover.
$PB -c "Delete :UISupportedInterfaceOrientations" "$PLIST" >/dev/null 2>&1 || true
$PB -c "Add :UISupportedInterfaceOrientations array" "$PLIST"
$PB -c "Add :UISupportedInterfaceOrientations: string UIInterfaceOrientationPortrait" "$PLIST"

echo "==> Wiring Firebase"
SRC_GSI=""
for c in "$ROOT/GoogleService-Info.plist" "$ROOT/ios/GoogleService-Info.plist"; do
  [[ -f "$c" ]] && SRC_GSI="$c" && break
done

if [[ -z "$SRC_GSI" ]]; then
  echo "!!  GoogleService-Info.plist not found at the repo root."
  echo "!!  Firebase console -> add iOS app -> bundle id com.charzpe.p2p -> download it,"
  echo "!!  drop it in the repo root, and re-run this script."
  exit 1
fi

cp "$SRC_GSI" "$ROOT/ios/App/App/GoogleService-Info.plist"

# Phone auth verifies the device with a silent APNs push, and falls back to a
# reCAPTCHA page in SFSafariViewController when push is unavailable. The
# fallback returns to the app through this URL scheme. Without an APNs key
# (which needs the paid Apple account we don't have yet) the fallback is the
# ONLY working path — so this entry is what makes OTP work in this session.
REVERSED=$($PB -c "Print :REVERSED_CLIENT_ID" "$SRC_GSI" 2>/dev/null || true)
if [[ -n "$REVERSED" ]]; then
  $PB -c "Delete :CFBundleURLTypes" "$PLIST" >/dev/null 2>&1 || true
  $PB -c "Add :CFBundleURLTypes array" "$PLIST"
  $PB -c "Add :CFBundleURLTypes:0 dict" "$PLIST"
  $PB -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$PLIST"
  $PB -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string $REVERSED" "$PLIST"
  echo "    URL scheme set: $REVERSED"
else
  echo "!!  REVERSED_CLIENT_ID missing from GoogleService-Info.plist."
  echo "!!  Firebase console -> Authentication -> Sign-in method: the iOS app needs"
  echo "!!  an OAuth client. Without this, OTP cannot fall back to reCAPTCHA and"
  echo "!!  phone auth will fail until the APNs key is added by the account owner."
fi

cat <<'EOF'

============================================================
Scripted work is done. Two steps Xcode will not let us script:

1. Add GoogleService-Info.plist to the App target.
   `npx cap open ios`, then drag ios/App/App/GoogleService-Info.plist
   into the App folder in Xcode's file navigator.
   TICK "Copy items if needed" AND the "App" target checkbox.
   The file is on disk already but Xcode will not bundle it without
   an explicit target membership — Firebase returns nil at launch
   if you skip this.

2. Signing: select the App target -> Signing & Capabilities ->
   set Team to your personal Apple ID. Free provisioning is enough
   to install on a device for testing.
   Do NOT add the Push Notifications capability — free provisioning
   cannot carry that entitlement and it will break the build.
   That capability belongs to the account owner (see HANDOVER-IOS.md).

Then: npx cap run ios --target <your-device>

Test before you give the Mac back — see the checklist in HANDOVER-IOS.md.
============================================================
EOF
