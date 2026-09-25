# RFIN desktop

Next.js 16 web app for RFIN customers, built on the pixel-perfect-main design
(paper/ink palette, Anton · Inter · JetBrains Mono, red → blue → amber → green
accents). Covers all eight steps of the plan, matching the Expo app screen for screen:
sign-in and onboarding; dashboard with proactive alerts and "For you"; Discover,
product, compare, eligibility, checkout, orders, KYC, bank; documents, notifications,
support; private markets (company research, alerts, buy, portfolio, sell); rewards,
draws, benefits and referrals; partner onboarding, leads, cases, clients, earnings,
resources and performance; My financial life, goals, family, financial profile,
research and the RFIN Assistant.

```bash
npm run dev        # http://localhost:4400
npm run build
npm run typecheck
```

## Shared with the Expo app

Data comes from rhserver's `/rfin` API (Postgres, `rfin` schema) — set
`NEXT_PUBLIC_API_URL` in `.env.local` (default `http://localhost:5050`). Types,
state machines, RBAC rules and the HTTP transport come from
`rhserver/shared/rfin` (`@rfin/shared`), the same contract the Expo app and
rhserver use.

Mock rules (server-side): any 6-digit OTP except `000000`; `98765 43210` is an existing account;
file names containing "blur" are rejected; bank accounts ending `0000` fail;
`/dev` toggles failed payments and network errors.

## RBAC

`rhserver/shared/rfin/src/rbac.json` defines modules/actions and what each role
grants — the clients use it to shape navigation, rhserver enforces it on every call:
Buyer, Seller, Referral Partner (one RFIN ID can hold several).

- Navigation shows only modules the roles grant (`can(roles, module, "view")`).
- `ROUTE_GUARDS` maps URL prefixes to permissions; the shell renders a 403
  panel for anything the roles don't allow.
- Mode (Investor / Partner) only picks the nav; roles decide access.
- Profile lets you add/remove roles and shows the full permission grid.

## Layout

```
src/app/(auth)/        welcome, phone, otp, profile-setup, needs (split ink panel)
src/app/(app)/         Shell: sidebar + main + optional right rail
src/components/ui.tsx  design-system components ported from pixel-perfect-main
src/components/shell.tsx  sidebar, RBAC nav, mode switch, 403, Page/rail
src/stores/            session (roles, mode), drafts, theme — localStorage
src/lib/               api (HTTP transport → rhserver), React Query hooks
```
