# RFIN customer API (`/rfin`, `rfin` schema)

Backend for the RFIN Expo app (`front-end/rfin-app`) and desktop app
(`front-end/rfin-desktop`). Lives beside the admin API; separate schema,
separate auth.

## Layout

```
migrations/rfin/      0001 core tables · 0002 documents, notifications, support · 0003 private
                      markets + rewards · 0004 partner onboarding + operations · 0005 customer 360
seeders/rfin/         catalogue, companies, lucky draw, demo customer (idempotent)
models/rfin/          rfinCustomer, rfinProduct, rfinOrder, … (schema pinned to rfin)
controllers/rfin/     auth, customer, catalogue, verification, order, activity, support, markets,
                      rewards, partner, customer360 (life, goals, family, alerts, assistant), dev
routes/rfin/          mounted at /rfin
middlewares/rfin/     authenticateCustomer (JWT type "rfin_customer"), requireCustomerPermission
service/rfin/         serialize, progress (time-driven state, row-locked), provision, eligibility,
                      scenario, notify, support, insights (recommendations, goal pace), assistant
constants/rfin/       RBAC + flow rules (read from shared/rfin), KYC defaults, timings
shared/rfin/          TypeScript contract imported by both apps (@rfin/shared)
config/rfin.config.js sequelize-cli config (history in admin."SequelizeMetaRfin")
```

## Setup

```bash
npm run db:migrate:rfin   # creates the rfin schema + tables
npm run db:seed:rfin      # catalogue + demo customer (safe to re-run)
npm run dev
```

Env: `RFIN_SCHEMA` (default `rfin`), `RFIN_CUSTOMER_TTL` (default `30d`), `JWT_SECRET`.
Optional: `ANTHROPIC_API_KEY` turns on the Claude-backed assistant (`RFIN_ASSISTANT_MODEL`,
default `claude-opus-5`; `RFIN_ASSISTANT_EFFORT`, default `medium`). Without it the assistant
answers from rules over the same data.

Don't run `db:seed:all` — it would re-run admin seeders. Use the `:rfin` scripts.

## Behaviour

- **Sign-in:** `POST /rfin/auth/otp` → `POST /rfin/auth/verify`. No SMS provider yet:
  any 6 digits except `000000`. New numbers are provisioned with starter data.
  Demo account: `98765 43210` (already onboarded).
- **RBAC:** every route checks `shared/rfin/src/rbac.json` for the customer's roles
  (buyer · seller · partner). 401 without a customer token, 403 without the grant.
- **Orders:** `POST /rfin/orders` needs an `Idempotency-Key` header (same key → same
  order) and refuses with 422 until the product's required KYC is verified.
- **Mock providers:** payments, KYC reviews and bank penny-drops advance on a
  schedule stored in the row (`next_at`, `review_until`, `verify_at`) and applied
  on read — no in-memory timers, so it survives restarts. Upload names containing
  "blur" are rejected; account numbers ending `0000` fail verification.
- **Dev:** `POST /rfin/dev/scenario { failPayments }` (not mounted in production).
- **Progression is locked:** state is advanced on read inside `withLock()` (transaction +
  row lock), so concurrent reads can't double-issue notifications, points or payouts.
- **Activity:** documents are issued when an order completes; notifications have per-category
  preferences (service messages can't be muted); support tickets carry the screen they came
  from and advance agent → resolved on the same schedule.
- **Private markets:** companies with research tabs, watchlist, buy (quote → order), holdings
  with cost basis, and sell listings that move verify → price → match → approvals → transfer → paid.
- **Rewards:** welcome points unlock on the first eligible transaction; tiers, benefits, gift
  cards, lucky draws (0/3 → entered → results) and referrals (pending → approved → paid) each
  live in their own ledger.
- **Partner:** onboarding wizard → verification → active Partner ID; leads, cases, Client 360,
  opportunities, commissions (on hold → available) and payouts with TDS.
- **Customer 360 (Phase 2/3):** financial profile, products held elsewhere, goals with monthly
  pace, family cover, "My financial life", recommendations with reasons, price/new-supply
  alerts (checked on read), research/education/events, support suggestions while typing,
  partner performance, and `POST /rfin/assistant` — grounded in the customer's own data,
  explains rather than advises, falls back to rules on refusal or error.
