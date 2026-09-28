# RFIN app (rebuild)

Expo SDK 57 rebuild of RFIN, planned from `RFIN_Functionality_UIUX_Complete_Report_95_Points.md`.
Data comes from rhserver's `/rfin` API (Postgres, `rfin` schema). Set `EXPO_PUBLIC_API_URL`
in `.env` (localhost for the iOS simulator, `10.0.2.2` for Android, your LAN IP for a device).

```bash
npm start           # i / a / w
npm run typecheck
```

All eight plan steps are built: auth/onboarding, home, explore + transaction flow, KYC/bank,
activity/documents/notifications/support, private markets (discover, company, buy, portfolio,
sell), rewards + referrals, partner onboarding and operations, and the Phase 2/3 screens —
`life`, `goals`, `family`, `profile/financial`, `research`, `assistant` (linked from Profile
and the Home header). The desktop app (`front-end/rfin-desktop`) has the same screens.

## Layout

```
app/                 routes (expo-router)
  dev/index.tsx      server-side scenarios (force payment failure) + theme
  dev/gallery.tsx    every component in every state
src/
  design/            colours, fonts, light/dark theme
  ui/                design system (buttons, cards, status chips, stepper, timeline, sheets, toasts, states)
  domain/states.ts   state machines: KYC, payment, order, reward, gift card, lucky draw, lead, referral, payout
  domain/models.ts   typed models; points / benefits / commission / referral ledgers kept separate
  api/client.ts      HTTP transport to rhserver, token from the session store
  api/hooks.ts       React Query hooks (orders poll while in flight)
  analytics/         typed event dictionary + track()
```

Money is integer paise throughout; use `formatINR` / `formatCompact` from `src/lib/format.ts`.
Types, states, RBAC, flows and the HTTP transport come from `rhserver/shared/rfin`
(`@rfin/shared`); the files under `src/domain`, `src/api/transport.ts` etc. re-export it.
