#!/usr/bin/env bash
set -euo pipefail

REPO="richharbor/rh_platform"

create_issue () {
  local title="$1"
  local labels="$2"
  local body_file
  body_file="$(mktemp)"
  cat > "$body_file"
  echo "Creating: $title"
  gh issue create -R "$REPO" --title "$title" --body-file "$body_file" --label "$labels"
  rm -f "$body_file"
}

create_issue "Mobile Auth MVP: App Loader → Signup/Login (API-backed) → Onboarding → Home" "mobile,backend,security,docs,testing" <<'EOF'
## Goal
Implement the first complete user journey end-to-end:

**App launch loader → (Login/Signup) → Signup → Onboarding → Home**

This must include:
1) A startup loader (placeholder now; later swapped with branded logo animation)
2) Backend signup/login APIs
3) Premium-looking mobile login/signup screens that actually work
4) Onboarding after signup, then landing on Home

This is a foundational MVP slice and should be implemented in a way that is easy to extend (KYC, wallet, push later).

---

## Scope & Repo Areas
### Mobile (required)
- `apps/mobile/**`

### Backend (required)
- `services/api/**`

### Not in scope (explicitly)
- Payments, wallet ledger, transactions
- Push notifications
- KYC flow (only onboarding placeholder)
- Password reset (can be a later issue)

---

## UX / Flow Requirements (Mobile)

### A) Startup loader
**When app starts:**
- Show a full-screen loader for ~1–2 seconds OR until initial checks complete (whichever is longer).
- Loader must be implemented as a dedicated screen/component so it can be replaced later with a logo animation without rewriting navigation.

**Later replacement note:** Keep the loader layout isolated in its own file, e.g. `src/screens/Splash.tsx` or `src/components/Loader.tsx`.

**Acceptance:**
- On app launch, user always sees the loader briefly before any other screen.

---

### B) Auth decision
After loader:
- If user is authenticated (valid stored access token) → go to **Home**
- If not authenticated → go to **Auth stack** (Login/Signup)

**Token persistence**
- Store auth tokens using a secure storage mechanism (Expo SecureStore preferred).
- On app start, read tokens and decide route.

**Acceptance:**
- App relaunch keeps user logged in unless token missing/invalid.

---

### C) Signup (working) + premium UI
Create a **Signup screen**:
- Inputs:
  - Full name (optional but recommended)
  - Email (required)
  - Password (required)
  - Confirm password (required)
- UX:
  - Clear validation errors
  - Disable submit button while loading
  - Premium UI spacing/typography, rounded cards, modern feel
  - Show server errors in a friendly way
- On success:
  - Save tokens
  - Go to **Onboarding**

**Acceptance:**
- Signup creates user on backend
- Tokens saved
- Navigates to onboarding after signup

---

### D) Login (working) + premium UI
Create a **Login screen**:
- Inputs:
  - Email
  - Password
- UX:
  - Loading state
  - Friendly error states
  - Premium UI consistency with signup
- On success:
  - Save tokens
  - Go to **Home** (unless onboarding required — see onboarding section)

**Acceptance:**
- Login works against backend
- Tokens saved
- Navigates to home

---

### E) Onboarding (after signup)
Onboarding runs only after signup (first-time user).
For this issue, onboarding can be minimal but must be real screens + state:

- Onboarding steps (example):
  1) Welcome / short intro
  2) Choose preferences (placeholder)
  3) Confirm and continue

Persist an `onboarding_completed` flag on backend and/or locally:
- Preferred: backend user profile field `onboarding_completed`
- Acceptable for MVP: local flag, but document limitations

After onboarding is completed:
- Mark completed
- Navigate to **Home**

**Acceptance:**
- After signup, user is forced through onboarding once
- After onboarding completion, future launches go straight to Home

---

### F) Home screen
A simple Home screen is enough for this issue:
- Show a welcome message with the user's email/name from the backend `GET /v1/auth/me` (or profile endpoint)
- Provide a logout button that clears stored tokens and returns to login

**Acceptance:**
- Home renders correctly with authenticated user data
- Logout works

---

## Backend Requirements (FastAPI)

### A) Auth endpoints (required)
Implement:
1) `POST /v1/auth/register`
2) `POST /v1/auth/login`
3) `POST /v1/auth/refresh` (recommended but optional for MVP)
4) `GET /v1/auth/me`

**Register request**
- email, password
- optional: name

**Responses**
- Return JWT access token + refresh token (if implemented)
- Return minimal user object (id, email, name, onboarding_completed)

### B) Storage & security requirements
- Store hashed passwords (bcrypt/argon2)
- Validate email uniqueness
- JWT signing keys from env
- Access token TTL configurable
- CORS must allow Expo dev origins

### C) Onboarding flag
Add user field:
- `onboarding_completed: bool` default `false`
Provide endpoint to update after onboarding:
- `PATCH /v1/profile/onboarding` (or `PUT /v1/profile`)
Minimum requirement:
- A backend mechanism exists to persist onboarding completion.

---

## API Contract (Mobile consumes)
Define these JSON shapes and keep them consistent.

### Register
Request:
```json
{ "email": "a@b.com", "password": "xxxxxx", "name": "Prabhat" }
