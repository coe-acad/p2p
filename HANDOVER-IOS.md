# iOS — build and handover

The iOS app is the same Vite/React bundle the Android app ships, wrapped by Capacitor.
No application code is Android-specific, so `src/` is unchanged for iOS.

This file has two audiences. **Part 1** is the developer scaffolding the project.
**Part 2** is whoever owns the Apple Developer account — none of it is dev work.

---

## Part 1 — Developer runbook

Follow these in order. Stage A is on your Linux box today. Stage B needs the Mac.

You need **no paid Apple account** for any of this. A free Apple ID gives 7-day device
provisioning, which covers every test below.

---

### Stage A — today, on Linux (~20 min)

**A1. Register the iOS app in Firebase.**
Console → Project settings → Your apps → **Add app → iOS**.
- Apple bundle ID: **`com.charzpe.p2p`** — must match `appId` in `capacitor.config.ts` exactly.
- Nickname: anything. App Store ID: leave blank.
- Click **Register app**, then **Download `GoogleService-Info.plist`**.
- **Stop there.** The wizard's remaining steps (add the SDK, edit AppDelegate, run `pod install`)
  are handled by Capacitor. Skip them.

**A2. Put the file at the repo root and confirm it is usable.**
```bash
mv ~/Downloads/GoogleService-Info.plist .
grep -A1 REVERSED_CLIENT_ID GoogleService-Info.plist
```
You must see a `com.googleusercontent.apps.…` value. **If that key is missing**, phone auth has
no working path without an APNs key you don't have. Fix: Firebase console → Authentication →
Sign-in method → enable **Google** (you never have to use it — enabling it mints the OAuth
client), then re-download the plist and check again.

**A3. Add test phone numbers.**
Firebase console → Authentication → Sign-in method → Phone → **Phone numbers for testing**.
Add e.g. `+91 9999999999` with code `123456`.
Test numbers bypass device verification entirely, so at the Mac you can prove the app wiring
works independently of the reCAPTCHA path — and you won't burn real SMS quota debugging.

**A4. Confirm phone sign-in is enabled at all** — same screen, Phone provider → Enabled.

**A5. Commit and push.**
```bash
git add GoogleService-Info.plist HANDOVER-IOS.md scripts/ .github/ package.json package-lock.json
git commit -m "chore(ios): add iOS platform, setup script, and handover docs"
git push
```
Pushing means the Mac only has to `git clone`.

---

### Stage B — at the Mac

**B1. Start the Xcode download before anything else.**
App Store → Xcode → Get. It is ~10 GB and can take an hour. Everything below waits on it, so
begin it the moment you sit down, then do B2 while it runs.

**B2. Install the rest.**
```bash
xcode-select --install          # command line tools
sudo gem install cocoapods
brew install node@20            # or nvm install 20
```

**B3. Open Xcode once** after it installs. Accept the licence and let it install additional
components. It will not build until you do.

**B4. Sign in with your personal Apple ID.**
Xcode → Settings → Accounts → **+** → Apple ID. Free account is fine.

**B5. Clone and run the setup script.**
```bash
git clone <repo-url> && cd p2p
git checkout chore/charzpe-html-title
./scripts/ios-setup.sh
```
This installs deps, builds the web bundle, runs `cap add ios` + `cap sync`, writes every
Info.plist entry, and wires the Firebase URL scheme from your plist. It is idempotent — if it
fails partway, fix the cause and re-run it.

**B6. Open the project.**
```bash
npx cap open ios
```

**B7. Add `GoogleService-Info.plist` to the App target.**
In Xcode's left file navigator, drag `ios/App/App/GoogleService-Info.plist` into the **App**
folder. In the dialog, tick **"Copy items if needed"** and the **"App"** target checkbox.
The file is already on disk, but Xcode will not bundle it without explicit target membership —
skip this and Firebase returns nil at launch and every OTP fails.

**B8. Set the signing team.**
Select the **App** target → **Signing & Capabilities** → tick "Automatically manage signing" →
Team = your personal Apple ID.
- **Do NOT add the Push Notifications capability.** Free provisioning cannot carry that
  entitlement and it will fail the build. It belongs to the account owner.
- If Xcode reports the bundle ID is unavailable, someone has already registered
  `com.charzpe.p2p` to another team. Change the bundle ID to `com.charzpe.p2p.dev` **and**
  register a second iOS app in Firebase for that ID, otherwise the plist stops matching.

**B9. Prepare the iPhone.**
Connect by USB, tap **Trust** on the device. Then on the phone: Settings → Privacy & Security →
**Developer Mode** → on → restart when prompted (iOS 16+).

**B10. Run it.**
```bash
npx cap run ios --target <device-id>
```
Or press ▶ in Xcode. On first launch the phone refuses to run an untrusted developer — go to
Settings → General → VPN & Device Management → tap your Apple ID → **Trust**.

---

### Stage C — test on the device, before you give the Mac back

- [ ] **C1.** App launches to the verify screen
- [ ] **C2. OTP with the test number from A3.** Proves the app-side wiring. If this fails, the
      problem is B7 (plist not in the target) or Firebase config — not iOS verification.
- [ ] **C3. OTP with a real number.** This exercises the reCAPTCHA fallback: a web challenge
      appears, then returns to the app via the URL scheme. Working = your handover is complete.
      The account owner's APNs key later makes this silent and invisible — a console change,
      **not** a code change.
- [ ] **C4. Razorpay: order → checkout → UPI → app-switch → return.** Needs a real UPI app
      installed on the phone. If the UPI option is missing, see the next section and rebuild
      **in this session**.
- [ ] **C5.** Upload a VC `.json`, and a discom `.pdf` and a **photo** — the photo path is what
      confirms the camera/photo-library usage strings work.
- [ ] **C6.** Notch check: header and bottom nav clear the Dynamic Island and home indicator.
- [ ] **C7.** Rotate the phone — it must stay portrait.

**C8.** Commit anything you changed in `scripts/` or `capacitor.config.ts` and push.
Do **not** commit `ios/` (see below).

**C9.** Send Part 2 of this file to the Apple account owner.

### If Razorpay hides the UPI option

On Android, `capacitor.config.ts` overrides the user agent because Capacitor's Android WebView
UA contains `wv`, which Razorpay reads as "WebView — hide UPI". iOS has no `wv` token, so the
override is not applied there.

If UPI is missing anyway, iOS's WKWebView UA is the likely cause — it lacks the `Safari/` token
real Safari has. Add an `ios` block alongside the existing `android` one in
`capacitor.config.ts`, then `npm run build && npx cap sync ios` and rebuild:

```ts
ios: {
  overrideUserAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
},
```

Verified in `@capacitor/ios` `CAPInstanceDescriptor.swift:80` — iOS reads `ios.overrideUserAgent`,
then falls back to a top-level `overrideUserAgent`. It never reads the `android` block.

Do **not** apply this pre-emptively. Test first; only add it if UPI is actually missing.

### Things deliberately not done

- **No `LSApplicationQueriesSchemes`.** The Android `<queries>` block has no iOS equivalent here.
  That plist key only gates `canOpenURL`, and `@capacitor/ios` never calls it — it calls
  `UIApplication.shared.open()` directly (`WebViewDelegationHandler.swift:117` and `:330`), which
  needs no declaration. The UPI app-switch works without it.
- **No Push Notifications capability.** Free provisioning cannot carry the entitlement; adding it
  breaks the build. It belongs to the account owner.
- **No edge-swipe-back gesture.** iOS has no hardware back button, and
  `allowsBackForwardNavigationGestures` is not exposed through Capacitor config — it needs a
  native edit. The in-app back controls cover navigation. Add later if it's actually missed.

### After the Mac session

**Do not commit `ios/`.** This repo ignores generated native projects (`.gitignore`: `android`,
`ios`) — nothing under `android/` is tracked either. `scripts/ios-setup.sh` is the source of
truth for the native config instead, so `ios/` can be thrown away and rebuilt byte-for-byte.

That is a real improvement over the Android side, where the manifest's custom `<queries>` block
lives only in the untracked `android/` tree and is shuttled around as `android.zip`. If that zip
is ever lost, those edits are lost with it. Worth porting the same script treatment to Android
at some point — not now.

`.github/workflows/ios-build.yml` regenerates `ios/` and builds it unsigned on every push, so a
broken iOS build is caught without borrowing a Mac again.

**Anything you change in Xcode by hand is lost on the next regen.** Put it in the script.

---

## Part 2 — Apple account owner: what only you can do

None of this is development work, and none of it requires the codebase to change.

| # | Task | Where | Notes |
|---|---|---|---|
| 1 | Enrol in the Apple Developer Program ($99/yr) | developer.apple.com | Individual ≈24h. Organisation needs a D-U-N-S number and can take **1–2 weeks**. Everything below waits on this — start it first. |
| 2 | Register the App ID `com.charzpe.p2p` | Certificates, Identifiers & Profiles | Enable the **Push Notifications** capability on the identifier. |
| 3 | Create an **APNs auth key** (`.p8`) | Certificates, Identifiers & Profiles → Keys | Download it once — Apple will not let you download it again. |
| 4 | Upload the `.p8` to Firebase | Firebase console → Project settings → Cloud Messaging | **This is what makes phone-auth OTP work properly.** Without it, users get a reCAPTCHA challenge instead of a silent check. Functional either way, worse UX. |
| 5 | Enable Push Notifications + Background Modes → Remote notifications | Xcode, App target → Signing & Capabilities | Needs the paid team selected. |
| 6 | Create the App Store Connect record | appstoreconnect.apple.com | Name, category, privacy policy URL. |
| 7 | Privacy nutrition labels | App Store Connect | The app collects **phone number, location, and payment data** — declare all three. |
| 8 | Demo account for review | App Store Connect | A working phone number + OTP the reviewer can use, or the build gets rejected as unreviewable. |
| 9 | Export compliance | App Store Connect | HTTPS only → standard exemption applies. |
| 10 | Signing, archive, TestFlight upload | Xcode | Requires the paid team from #1. |

**Review note:** payments go through Razorpay for a real-world service (energy), so Apple's
in-app-purchase rule (Guideline 3.1.1) does not apply. Be ready to state that if review asks.

**Dependency order:** #1 → #2 → #3 → #4. Item #4 is the only one that changes app behaviour;
the rest are distribution mechanics.
