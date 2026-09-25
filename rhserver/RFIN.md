# RFIN customer API (`/rfin`, `rfin` schema)

Backend for the RFIN Expo app (`front-end/rfin-app`) and desktop app
(`front-end/rfin-desktop`). Lives beside the admin API; separate schema,
separate auth.

## Layout

```
migrations/rfin/      0001-create-rfin-schema.js — all rfin tables
seeders/rfin/         catalogue, companies, lucky draw, demo customer (idempotent)
models/rfin/          rfinCustomer, rfinProduct, rfinOrder, … (schema pinned to rfin)
controllers/rfin/     auth, customer, catalogue, verification, order, rewards, partner, dev
routes/rfin/          mounted at /rfin
middlewares/rfin/     authenticateCustomer (JWT type "rfin_customer"), requireCustomerPermission
service/rfin/         serialize, progress (time-driven state), provision, eligibility, scenario
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
