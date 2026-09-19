# Local development

The local setup uses Node.js and the installed Homebrew PostgreSQL and Redis
binaries. It runs independently of Docker and the existing services on ports
3000, 5432, and 6379.

| Service | Address |
| --- | --- |
| Admin panel | http://localhost:3001/login |
| Customer dashboard | http://localhost:3002/auth/login |
| Expo web / Metro | http://localhost:8081 |
| Backend health | http://localhost:5003/health |
| PostgreSQL | 127.0.0.1:5455 |
| Redis | 127.0.0.1:6380 |

Both the **admin panel** and **rh-app customer dashboard** have separate local
admin accounts using `admin@richharbor.com` / `1q2w3e`.

The rh-app account is an active, email-verified tier-1 `superadmin`, with an
approved onboarding record. To seed it again without changing existing passwords:

```sh
(cd rhserver && npm run db:seed:local)
```

This seed uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `rhserver/.env` and requires
`NODE_ENV=development`. The web-admin seed remains in `rhserver/platform/seeders`.

## Environment files

- `.env`: Docker Compose settings (database hostname `db`).
- `rhserver/.env`: native local backend settings, generated JWT and VAPID keys,
  and the local database password.
- `front-end/web-admin/.env.local`: platform API at `/v1`.
- `front-end/rh-app/.env.local`: trading API at `/api` and the public VAPID key.
- `front-end/mobile-expo/.env`: platform API at `/v1`.

Environment files are ignored by Git. AWS, SMTP, and WhatsApp credentials are
blank; those integrations require real credentials. Platform email falls back
to console logging. Firebase push requires `rhserver/firebase-service-account.json`.

For a physical mobile device, set `EXPO_PUBLIC_API_URL` to this Mac's LAN IP
with port 5003 and path `/v1`, and launch Expo without `--localhost`. For an
Android emulator, use `http://10.0.2.2:5003/v1`.

## Restart after stopping

From the repository root, start the project-specific data services if stopped:

```sh
pg_ctl -D .local/postgres -l .local/postgres.log -o '-h 127.0.0.1 -p 5455' start
redis-server --bind 127.0.0.1 --port 6380 --daemonize yes --dir "$PWD/.local" --pidfile "$PWD/.local/redis.pid" --logfile "$PWD/.local/redis.log"
```

Run each app in its own terminal from the repository root:

```sh
(cd rhserver && npm run dev)
(cd front-end/web-admin && npm run dev -- --port 3001)
(cd front-end/rh-app && npm run dev -- --port 3002)
(cd front-end/mobile-expo && npx expo start --web --localhost --port 8081)
```

Dependencies, both databases (`trading_platform` and `rh_platform`), migrations,
and the platform admin seed have already been installed or initialized.

## Current background processes

The initial launch writes logs and process-group leader IDs to `.local/`:
`rhserver`, `web-admin`, `rh-app`, and `mobile-expo` each have a `.log` and `.pid`
file. The runtime directory is excluded through `.git/info/exclude`.

To stop an initially launched app, use its recorded process group, for example:

```sh
kill -TERM -- "-$(cat .local/rhserver.pid)"
```

These PID files describe the initial background launch only; after a manual
restart, use Ctrl+C in that app's terminal. Stop the project data services with:

```sh
pg_ctl -D .local/postgres stop
redis-cli -h 127.0.0.1 -p 6380 shutdown
```

Keep `.local/postgres` to preserve the local database contents.
