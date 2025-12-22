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

create_issue "Bootstrap rh_platform monorepo scaffold (Expo + FastAPI + Docker Compose) + E2E health check" "chore,backend,mobile,docker,docs,testing" <<'EOF'
## Goal
Create a working monorepo scaffold that boots locally and supports an end-to-end health check from the mobile app to the API.

This issue is intentionally larger (target ~1 hour) and should result in a runnable baseline.

---

## Required folder structure
Create these paths exactly (root folder is `rh_platform/`):

- apps/mobile
- services/api
- docker
- infra/terraform
- scripts
- .github/workflows

Root-level required files:
- README.md
- .env.example
- Makefile
- docker-compose.yml
- .gitignore

---

## Backend requirements (FastAPI)
Location: `services/api`

### Files (minimum)
- services/api/app/main.py
- services/api/app/core/config.py
- services/api/app/api/v1/router.py
- services/api/app/api/v1/endpoints/health.py

### API behavior
- Add router prefix `/v1`
- Endpoint: `GET /v1/health` returns: `{"status":"ok"}`

### CORS
Configure CORS to allow Expo dev origins. Minimum allow list:
- http://localhost:19006
- http://localhost:8081

Also document how to test from a physical device (LAN IP). If you allow wildcard origins in local dev, document clearly that it is ONLY for local.

### Run config
- Use `uvicorn` with `reload=True` in local dev
- Port: 8000

---

## Docker / Compose requirements
Root: `docker-compose.yml`

### Services
1) Postgres 16
- Expose 5432
- Use a named volume

2) API container
- Build from `docker/api.Dockerfile`
- Expose 8000
- Must hot reload during dev using a volume mount of `./services/api:/app`
- Must receive env vars:
  - DATABASE_URL
  - CORS_ORIGINS
  - APP_ENV (optional)
  - API_HOST / API_PORT (optional)

### Required Dockerfile
- docker/api.Dockerfile must run the API

---

## Mobile requirements (Expo + NativeWind)
Location: `apps/mobile`

### Must include
- Expo app that starts
- NativeWind (Tailwind for RN) configured and used on at least one screen

### Screens (minimum)
- Login
- Register
- Home

### Home screen: end-to-end call
Add:
- Button: "Check API Health"
- On click, call `${API_BASE_URL}/v1/health`
- Show result on screen

### API base URL config
Create `apps/mobile/src/lib/config.ts` exporting `API_BASE_URL`.
Document changing this for physical device testing:
- Example: http://192.168.x.x:8000

---

## Makefile requirements (root)
Add these targets:
- make up        -> docker-compose up --build -d
- make down      -> docker-compose down
- make logs      -> docker-compose logs -f --tail=200
- make api-shell -> docker-compose exec api sh (or bash)

---

## README requirements (root)
Document step-by-step setup and verification.

### Backend run
- make up
- curl http://localhost:8000/v1/health

### Mobile run
- cd apps/mobile
- install deps
- start Expo
- set API_BASE_URL if needed
- click "Check API Health" and verify output

### Troubleshooting
Add minimum notes:
- physical device cannot reach localhost
- use LAN IP
- CORS issues

---

## CI workflow (basic)
Add `.github/workflows/ci.yml` with:
- API job: install deps + run pytest
- Mobile job: install deps + run minimal check (typecheck/lint if configured)

---

## Tests (must include)
Backend pytest tests in `services/api/tests`:
1) test_health_ok
- Use FastAPI TestClient
- Assert 200
- Assert json: {"status":"ok"}

Mobile tests are optional for this issue; include a manual test checklist in README.

---

## Acceptance Criteria
- `make up` brings up Postgres + API successfully
- `curl http://localhost:8000/v1/health` returns 200 + expected JSON
- Mobile app runs and Home button successfully calls backend and displays status
- Backend pytest passes
- CI workflow is present and runs
EOF

create_issue "Backend dev environment: DB connectivity health, DB module, and expanded tests (Docker-ready)" "backend,db,docker,docs,testing" <<'EOF'
## Goal
Harden the backend development environment so it is ready for fintech features:
- explicit DB session module
- health endpoint includes DB connectivity status
- improved docker-compose reliability
- expanded test suite
- better documentation

---

## DB wiring (required)
Add DB module files under `services/api/app/db`:
- session.py -> SQLAlchemy engine + SessionLocal factory
- base.py -> Base model (declarative base)

Use DATABASE_URL from env (no hardcoding).

---

## Health endpoint improvement (required)
Update `GET /v1/health` to include DB status.

Preferred:
- Always return 200 but include db status field:
  - {"status":"ok", "db":"ok"} OR {"status":"ok", "db":"down"}

Alternative acceptable:
- Return 503 if DB down.
If using 503, document the behavior.

---

## Docker compose improvements (required)
Update compose to improve stability:
- Add Postgres healthcheck
- Ensure API depends on DB service readiness best-effort
- Confirm DATABASE_URL uses `db` host inside compose

---

## Makefile improvements (required)
Add:
- make test-api -> run pytest for backend (locally or in container)
Optional:
- make lint-api / fmt-api if you add tooling

---

## README improvements (required)
Add:
- Running tests
- Common issues:
  - mobile cannot call localhost
  - how to find LAN IP on macOS
  - CORS debugging
- Logs commands

---

## Tests (required)
Add/expand backend tests:
1) test_health_includes_db_field
- assert response JSON contains "db"

2) test_settings_load_env
- verify Settings reads env vars (can set env in test)

3) test_db_connectivity_ok (integration-ish)
- If DB is available, assert db == "ok"
- If DB not available, either:
  - skip test when DATABASE_URL not set for integration, OR
  - mark as integration and document running via docker compose

Document how to run integration tests.

---

## Acceptance Criteria
- `docker-compose up --build` is stable and API starts reliably
- `/v1/health` includes db status field
- Tests pass (unit tests always; integration tests documented)
- README includes troubleshooting and test instructions
EOF

echo "✅ Done. Created 2 big issues in $REPO"
