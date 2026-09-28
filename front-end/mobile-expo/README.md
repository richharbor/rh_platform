# RFIN — Expo app

React Native / Expo port of the `rfin-nexus-main` web app. Same design system, same
data, same screens — rebuilt with native primitives.

## Runtime

Expo SDK 57 · React Native 0.86 · React 19.2 · expo-router 57 · TypeScript 6.

New Architecture and Android edge-to-edge are always on in SDK 57, so the old
`newArchEnabled` / `android.edgeToEdgeEnabled` keys are gone from `app.json`.
`userInterfaceStyle` must stay `"automatic"` — pinning it to `"light"` makes
`useColorScheme()` always report light and silently kills the System theme option.

## Run

```bash
npm start          # Expo dev server (press i / a / w)
npm run ios
npm run android
npm run typecheck
```

## Structure

```
app/                       expo-router routes (file-based, like the web TanStack routes)
  _layout.tsx              theme + auth providers, fonts, phone frame, auth redirect gate
  (auth)/welcome.tsx       value prop, sign in / create account
  (auth)/login.tsx         phone + password, or OTP-only sign in
  (auth)/register.tsx      name/phone/email/password, strength meter, consent
  (auth)/verify.tsx        6-digit OTP, auto-submit, resend cooldown
  (auth)/role.tsx          pick Buyer / Seller / Referral (Buyer always on)
  (auth)/onboarding.tsx    step machine assembled from the chosen roles
  index.tsx                Home — role-aware hero, BUY/SELL/REFER, rewards, recommendations
  explore/index.tsx        Explore — search + category carousels + seller/referral CTAs
  explore/[category].tsx   Category grid
  product/[slug].tsx       Product detail — role-aware earnings + sticky CTA
  apply/[slug].tsx         3-step buyer application + success/reward state
  earn.tsx                 Three earning pathways, milestone
  rewards.tsx              Points, Bronze→Elite tiers, benefits, lucky draw, campaigns
  transactions.tsx         Two-ledger auditable transaction list
  profile/index.tsx        Identity, roles, KYC, money, activity, account
  profile/kyc.tsx          Verification checks, progress, upload/re-verify
  profile/bank.tsx         Payout accounts: add, verify, set primary, remove
  profile/documents.tsx    Uploaded / requested / in-review / expired, by category
  profile/notifications.tsx Activity feed + per-channel preferences
  profile/support.tsx      Call / WhatsApp / email, tickets, FAQ
  profile/security.tsx     Biometrics, app lock, 2FA, payout OTP, sessions
  profile/settings.tsx     Language, currency, haptics, legal, sign out
  seller/                  Dashboard, lead pipeline, add lead, seller earnings
  refer/                   Referral dashboard, create & share (WhatsApp / copy / QR)
src/theme/                 Design tokens + light/dark schemes
  palette.ts               lightColors / darkColors, and the `on*Soft` ink pairs
  tokens.ts                scheme-independent: radius, fonts, type scale
  build.ts                 per-scheme surfaces, shadows, `num()`, `display()`
  context.tsx              ThemeProvider, useTheme, useThemedStyles
src/lib/auth-context.tsx   sign in / register / OTP / onboarding, persisted
src/components/            ui kit, AppShell (nav + role switcher), ProductCard, motion, toast
  icons.tsx                bespoke nav icons (outline + solid states) and the RFIN mark
src/lib/rfin-data.ts       Shared data model (copied from web, Intl-free formatters)
src/lib/role-context.tsx   Role switching, persisted via AsyncStorage
```

## Bottom nav

A frosted `BlurView` bar with one indicator that springs between tabs, rather than
five independently highlighted tabs. Icons are hand-drawn in `src/components/icons.tsx`
and ship two states: stroked when idle, solid when active. Swapping weight — not just
colour — is what makes the selection legible at a glance; stock icon sets only give
you the outline. Selecting a tab fires a light haptic on native.

The blur is translucent by design, so a `navBarScrim` token sits on top of it to keep
labels legible when the bar floats over a busy card. Nav text clears AA in both
schemes at its 10px size.

## Dark mode

`StyleSheet.create` at module scope freezes whatever colours it read at import time,
so a screen cannot react to a theme change. Every screen therefore declares

```ts
const makeStyles = ({ colors }: Theme) => StyleSheet.create({ ... });
```

and calls `useThemedStyles(makeStyles)` inside the component; sheets are cached per
factory per scheme, so each is built at most twice per session. Colours used in JSX
come from `useTheme()`. Two rules follow from this:

- **A theme colour can never be a default parameter value** (`bg = colors.muted`)
  — parameters evaluate before hooks run. Use `bg ?? colors.muted` in the body.
- **A soft tint and its ink are a pair.** `earnSoft` is pale with dark green ink in
  light mode and deep with bright green ink in dark, so chips and tone helpers read
  `onEarnSoft`, never `earn`. Same for gold, warning, info and destructive.

The scheme follows the OS by default and can be pinned in Profile → Settings →
Appearance; the choice persists. Light-mode values are unchanged from before.

## Porting notes

- **Colors**: the web tokens are `oklch()`; they're converted to sRGB hex in `src/theme.ts`.
- **Tailwind → StyleSheet**: spacing is the 4px scale, `rounded-2xl` is 24px (the CSS
  redefines it as `--radius + 6px`), and every `text-*` size carries Tailwind's
  line-height. The `num` utility's `-0.035em` tracking scales with font size, so use
  `num(size)` rather than a fixed `letterSpacing`.
- **Fonts**: Manrope for display/numbers, Inter for body — note that only `h1/h2/h3`
  get the display font on the web, so `<p className="font-extrabold">` maps to Inter bold.
- **Navigation**: the web `AppShell` rendered a `fixed` bottom nav on every route, so the
  nav lives in the root layout above the `Stack` rather than in an expo-router `Tabs`.
- **Persistence**: `localStorage` → `AsyncStorage`. **Toasts**: `sonner` → `src/components/Toast.tsx`.
- **Line-heights need a 1.2x floor.** CSS lets glyphs overflow a short line box
  (`text-5xl` is `line-height: 1`), but RN *clips* text to the line box, beheading
  Manrope ExtraBold's ascenders. `fontScale` therefore raises the two tightest Tailwind
  steps (48/48 -> 48/58, 36/40 -> 36/44); everything else matches Tailwind exactly.
- **Never use `<Link asChild>` around a styled `Pressable`.** expo-router renders `asChild`
  through a Radix `Slot`, whose `mergeProps` merges `style` with an object spread
  (`{ ...slotStyle, ...childStyle }`). A Pressable *function* style
  (`style={({ pressed }) => [...]}`) has no enumerable own properties, so it spreads to
  `{}` and the child's styling is silently destroyed — cards lose their padding, surface
  and press state. Use `src/components/Touchable.tsx`, which navigates via `useRouter()`.
- **Formatters**: `Intl.NumberFormat("en-IN")` is replaced by `formatIN` so digit grouping
  is correct on Hermes builds without full ICU.
