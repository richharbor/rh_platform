# rh_platform

Monorepo scaffold for Rich Harbor platform (mobile, api, infra).

## Structure
- `apps/mobile` - Expo + NativeWind app
- `services/api` - FastAPI service
- `docker` - Dockerfiles
- `infra/terraform` - Infrastructure as code

## Prereqs
- Docker + Docker Compose
- Node.js 18+ (for mobile)
- Python 3.11+ (for API tests)

## Backend (FastAPI)
1) Start containers:
   - `make up`
2) Verify health:
   - `curl http://localhost:8000/v1/health`
   - Expected: `{"status":"ok"}`

## Mobile (Expo)
1) Install deps:
   - `cd apps/mobile`
   - `npm install`
2) Start Expo:
   - `npm start`
3) Set API base URL (if needed):
   - Default is `http://localhost:8000`
   - For physical device testing, set `EXPO_PUBLIC_API_BASE_URL` to your LAN IP
     - Example: `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.25:8000`
4) In the app, tap "Check API Health" on Home and verify status.

## Troubleshooting
- Physical devices cannot reach `localhost`; use your LAN IP instead.
- If CORS errors occur, set `CORS_ORIGINS` to include your Expo dev URL.
  - Example: `http://localhost:19006,http://localhost:8081,http://192.168.1.25:19006`
- If you use `CORS_ORIGINS=*`, keep it for local development only.

## Tests
- API:
  - `cd services/api && pytest`
- Mobile (manual checklist):
  - App launches
  - Login screen renders
  - Register screen renders
  - Home screen shows API base URL
  - "Check API Health" returns `{ "status": "ok" }`
