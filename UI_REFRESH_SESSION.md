# Samai UI Refresh — Session Notes

> Working checkpoint for the calm-fintech UI refresh. Pick this up next session to know where things stand without re-asking.

## Status

**Branch:** `development` (local only — nothing committed or pushed for this UI work)
**Dev server:** `npm run dev` → http://localhost:8081/

If you want to commit this work, create a new branch first (`fix/ui-refresh-auth-marketplace` or similar). Per project rule: **never merge to `development` without double confirmation**.

---

## Brand & visual rules — locked in

| Rule | Value |
|---|---|
| Product name | **Samai** (NOT "atria" — atria is the parent org) |
| Palette source | Atria University (deep blue + green) |
| Primary (brand) | `hsl(240 60% 42%)` — Atria deep blue |
| Accent (action/energy) | `hsl(144 65% 38%)` — Atria green |
| Background | `hsl(48 38% 97%)` — soft tinted yellow |
| Cards | pure white `hsl(0 0% 100%)` on top of tinted bg |
| Typeface | Inter Variable via `@fontsource-variable/inter` |
| Aesthetic | Calm fintech (Stripe/Revolut/Cred inspired) |
| No-gos | gradients, glows, particles, shimmer, MarioCoin |

### Typography scale (used across all screens)

| Element | Class |
|---|---|
| Hero brand mark | `<BrandMark size="lg" />` — text-4xl sm:text-5xl, h-10 sm:h-12 Zap |
| Compact brand mark | `<BrandMark />` — text-sm sm:text-base, h-4 Zap |
| Kicker (above H1) | `text-sm font-medium uppercase tracking-[0.18em] text-accent` |
| H1 | `text-lg font-semibold leading-snug tracking-tight sm:text-xl` |
| Body | `text-sm text-muted-foreground` |
| Numbers (prices, kWh, dates) | wrap with `.nums` for tabular figures |

### Card hover language (used consistently)

300ms ease-out transitions, with these layers stacking on hover:
- Card lifts (`-translate-y-1`) + scales (`scale-[1.005]`)
- Border tints in card's identity color
- Soft drop shadow in card's identity color
- Left edge stripe scales from 40% → 100% opacity
- Icon tile fills with brand color
- Title color shifts, chevron slides right 6px
- `:active` state: card squishes to `scale-[0.99]` with snappy 100ms transition
- Mobile (touch devices): chevron has a subtle 2.4s `nudge-x` loop to hint "tap me"
- All animations respect `prefers-reduced-motion: reduce`

---

## What's done this session

### Foundation
- `src/index.css` — full token rewrite. Palette swap, font import, kicker/H1/body/touch-nudge utilities, legacy `.btn-solar`/`.btn-green`/`.btn-outline-calm` neutralised so un-reskinned pages don't break.
- `tailwind.config.ts` — Inter wired as default sans, shadow scale simplified to one flat `card` shadow.
- `package.json` — added `@fontsource-variable/inter`.

### New components
- `src/components/BrandMark.tsx` — Samai wordmark (Zap glyph + text), supports `size="sm"|"lg"`.
- `src/components/ListingSkeleton.tsx` — shape-matching placeholder for marketplace loading state.

### Auth & onboarding flow — fully reskinned
- `src/pages/VerifyPage.tsx` — handler kept (post-OTP existence check + branching). Removed `isReturningUser`/`isNewUser` prop plumbing.
- `src/components/screens/VerificationScreen.tsx` — full rewrite. Single screen handles phone entry and OTP. Hero-centered brand. Connected OTP boxes (backspace, paste, auto-advance, `inputMode=numeric` for mobile numpad). Enter submits phone form.
- `src/components/screens/IntentSelectionScreen.tsx` — full rewrite. Single-tap cards (no Continue button). Per-card identity color (Buy = blue, Sell = green) at rest, not just on hover. Rich hover animations (left stripe, gradient wash, icon morph, title underline, chevron slide).
- `src/pages/OnboardingVCPage.tsx` — full rewrite. Drag-or-click dropzone, step-3-of-3 indicator, soft-green ghost "Skip for now" button (browse-only mode), original upload/validation logic preserved.
- `src/App.tsx` — `/` now routes directly to `VerifyPage`. `/verify` kept as alias.
- `src/components/layout/ProtectedRoute.tsx` — VC NOT gated at route level. Buyers can browse without VC; gate fires at action time. Sellers still need `onboardingComplete=true`.

### Marketplace (BuyerHomePage) — fully reskinned
- `src/pages/BuyerHomePage.tsx` — full rewrite. Dropped MUI imports (`Alert`, `Button`, `Box`). Dropped teal welcome card. Single calm VC banner (was 2). Skeleton loading. Cleaner empty + error states. Clicking Select without VC now bounces straight to upload modal (no in-page error).
- `src/components/EnergyListingCard.tsx` — full rewrite. Per-source identity colors (Solar amber, Wind blue, Hydro sky, Biomass green, Grid slate). Tabular numerals for qty/price. Soft secondary bar for delivery window + total. Tiny Zap glyph top-right. Full hover language from intent cards. Removed favorite-heart (not connected to anything).
- `src/components/SearchListings.tsx` — full rewrite. Submit-on-Enter (no separate Search button). Filter chip-button with active-count badge. Active filter chips at top with Clear-all link. Advanced panel slides down on toggle.

### Files deleted
- `src/pages/WelcomePage.tsx`
- `src/components/screens/WelcomeScreen.tsx`

---

## Verified working

- TypeScript: `npx tsc --noEmit -p tsconfig.app.json` passes for every file I touched.
- Build: `npm run build` clean (one unrelated chunk-size warning).
- Pre-existing type errors in untouched files (`HomePage.tsx`, `LocationDeviceScreen.tsx`, etc.) were already there before this session.

---

## Roadmap — what's still on the list

In priority order from the visual refresh plan:

| # | Status | Item |
|---|---|---|
| 1 | ✅ done | Auth/onboarding flow (Phone+OTP, Intent, VC) |
| 2 | ✅ done | Buyer marketplace (BuyerHomePage, EnergyListingCard, SearchListings) |
| 3 | ⏭ next | **Buy-flow modals** — `ConfirmOrderModal`, `SelectedOrderModal`, `QuoteOrderModal` |
| 4 | pending | `PaymentPage` (Razorpay checkout-style screen) |
| 5 | pending | History tables — `BuyerOrderHistoryPage`, `BuyerPaymentsPage`, `LoginHistoryPage` |
| 6 | pending | Seller pages — `HomePage`, `TodayTradesPage`, `TomorrowTradesPage`, `PublishedPage` |
| 7 | pending | Profile + Settings (10 sub-pages) |
| 8 | pending | Polish pass — skeletons everywhere, page transitions, favicon, PWA splash |

## Deferred (separate passes later — not part of visual refresh)

- **MUI removal** — still used in `HomePage.tsx` and a few other un-touched seller pages. Drops bundle size meaningfully when gone.
- **notistack removal** — still in `App.tsx`; sonner already imported and ready to replace it.
- **Unauth `GET /api/user/exists`** — phone enumeration risk. Backend security hardening.
- **Action-level VC gate in order flow** — minimal version is in place (handleSelectOffer pops upload modal). A proper `useVCGate()` hook with toast UX would be cleaner.

---

## How to resume next session

1. **Read this file first.**
2. Check the memory directory if context is missing: `~/.claude/projects/-home-rohith-Desktop-atria-versions-Version3/memory/`
3. Open dev server: `cd /home/rohith/Desktop/atria/versions/p2p && npm run dev` → http://localhost:8081/
4. Eyeball the auth flow + marketplace before continuing.
5. If you want to keep going on the roadmap, **buy-flow modals** are next. They're triggered from `BuyerHomePage` (click any listing card → Select). Files:
   - `src/components/ConfirmOrderModal.tsx`
   - `src/components/SelectedOrderModal.tsx`
   - `src/components/QuoteOrderModal.tsx`

## Session-specific behavior decisions

- VC gating: **browse-only model** (not full block). Skip lets user enter the app and browse. Action-level gate fires on Select/Init/Confirm. Backend remains source of truth (NACKs at /select).
- Country code: locked `+91`, no selector.
- Heart/favorite icon on listing cards: dropped.
- "MarioCoin", "VoiceNarration", "AskSamai" pages: untouched (out of current scope).
- Brand mark: always centered as a hero at the top of auth/onboarding screens. Top-left placement is reserved for in-app contexts.

## User preferences saved to memory

These rules persist across sessions:
- `feedback_commit_no_coauthor.md` — never add `Co-Authored-By: Claude` trailers to commits.
- `feedback_never_merge_development.md` — never merge to `development` without 2x confirmation.
- `project_brand_identity.md` — product is Samai; AU palette is the visual scheme only.
- `project_typography_rules.md` — type scale rules for kicker / H1 / body / hero brand.
