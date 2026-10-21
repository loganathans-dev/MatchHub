# MatchHub

A college sports-event application built with React, Vite, Express and MongoDB/Mongoose. College management accounts create events, register departments, schedule fixtures and record results. Visitors browse colleges, event schedules, results and department standings without signing in.

This is a development project. Automated checks cover selected application rules; a complete browser-and-database acceptance run and real SMTP delivery have not been verified in this review. See [the assessment](docs/ASSESSMENT.md), [20-day improvement plan](docs/IMPROVEMENT_PLAN.md) and [verification checklist](docs/VERIFICATION.md).

## Setup

Requirements: Node.js and npm (checked locally with Node 24.22.1), a running MongoDB instance, and optionally a mail account supported by Nodemailer for password resets.

```bash
cd ~/MatchHub
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`npm install` at the root installs the separate backend and frontend packages through a postinstall script. Alternatively, run `npm install` inside each folder. Each package has its own lockfile; `npm ci` inside each folder uses it for repeatable installation.

Edit `backend/.env` before starting the backend. Use an isolated local database for development and tests. Generate your own JWT secret, for example:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string; required. `MONGO_URI` is not read. |
| `JWT_SECRET` | Required signing secret, at least 32 characters; use a random value. |
| `PORT` | API port; defaults to `5000`. |
| `CLIENT_ORIGIN` | Browser origin permitted by CORS; defaults to `http://localhost:5173`. |
| `NODE_ENV` | Runtime environment, for example `development`. |
| `EMAIL_SERVICE` | Nodemailer service name; defaults to `gmail`. |
| `EMAIL_USER`, `EMAIL_PASS` | Sender credentials; required only for password-reset email. Gmail generally requires an app password. |
| `EMAIL_FROM` | Optional sender address; configure it to match your mail provider. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Only used by the explicit administrator-creation script; no default administrator exists. |
| `VITE_API_URL` | Frontend API origin. Leave empty for the local Vite `/api` proxy. For a separate API host, set its origin without a trailing slash and rebuild the frontend. Never put secrets in `VITE_` variables. |

Start the API and browser application in separate terminals:

```bash
# Terminal 1, repository root
npm run dev:backend

# Terminal 2, repository root
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000`; change `frontend/vite.config.js` if the local API port changes. The backend validates required configuration and connects to MongoDB before listening.

Optional administrator setup: temporarily set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, run `npm --prefix backend run create-admin` from the root, then remove those two variables. The password must be at least 12 characters and no more than 72 UTF-8 bytes. This creates one account and does not overwrite an existing account. The admin interface is a read-only college directory, not an approval system.

## Implemented functionality

- College registration and login, bcrypt password hashing, expiring JWTs, and role checks. College-owned event checks protect department and match operations.
- Event creation with dates, selected sports and descriptive information; event lists for management and visitors.
- Department registration per event, with sports restricted to that event.
- Manual scheduling of team fixtures and multi-department individual/athletics events; department membership and event time range are validated.
- Result entry for team winners/draws and ranked events. Placements must be distinct participating departments. Ranked events require first and second place; third is optional.
- Shared points calculation in both portals: 10/5/3 for first/second/third, zero for draws and unfinished fixtures. Ties share rank. Departments are identified by database ID.
- Public event-specific schedules, results and standings. Public college data uses an allowlist that excludes credentials, reset material and private contact details.
- Email OTP reset endpoints, hashed OTP storage, ten-minute expiry, atomic consumption and invalidation of earlier college sessions after reset. Delivery errors are reported; there is no simulated email-success fallback.
- Management/admin route guards, sign-out controls, visible request-failure notices, associated form labels in many forms, keyboard-accessible navigation cards and reduced-motion support. Full accessibility conformance is not claimed.

Individual and athletics entrants are **department references**, not individual student/athlete records. Sports are configured from a fixed frontend catalog; there are no sport-specific score parsers or tournament brackets. Scores are free text.

## Architecture and API

```text
frontend/src/pages/{Management,Students,Admin}
    -> fetch wrapper + /api HTTP requests
    -> Express routes -> validation / JWT middleware -> controllers
    -> Mongoose models -> MongoDB
```

Models: `College` and `Admin` store accounts; `Event` belongs to a college; `Department` belongs to a college and an event; `Match` belongs to an event and references departments for participants and placements. Common college/event/date query fields have compound indexes. Public views are read-only; standings are calculated in the frontend from completed matches.

| API group | Access and behavior |
| --- | --- |
| `/api/auth` | Public, rate-limited registration, login, forgot-password, verify-otp, reset-password POST endpoints. |
| `/api/events` | College JWT; GET own events, POST create. |
| `/api/departments` | College JWT; GET own departments (`eventId` optional), POST registration with `eventId`. |
| `/api/matches` | College JWT; GET own-event fixtures (`eventId` optional), POST fixture with `event`. |
| `/api/matches/:id` | College JWT; PUT own-event status/results. |
| `/api/public/colleges`, `/api/public/colleges/:id` | Public institution summaries. |
| `/api/public/events` | Public events; optional `collegeId` filter. |
| `/api/public/colleges/:id/matches`, `.../departments` | Public college data; optional `eventId` filter. |
| `/api/admin/login`, `/api/admin/colleges` | POST administrator login; GET directory requires an admin JWT. |

The frontend route guard improves navigation; the API enforces authorization. Tokens are stored in localStorage. New role-scoped tokens require existing users to sign in again after this update. There is no refresh-token or server-side logout mechanism.

## Checks

```bash
npm run lint
npm run build
npm test
npm run test:http
```

`npm test` runs backend controller/middleware tests with database stubs and frontend scoring tests. `test:http` binds an ephemeral loopback port and checks Express routing, authentication failures, invalid input and JSON errors without connecting to MongoDB. These are not database integration or browser tests. Build output is `frontend/dist`. Production hosting must serve SPA fallback routes and proxy `/api`, or supply `VITE_API_URL` at build time; no deployment is configured here.

Online dependency audits were attempted but blocked by registry DNS/network access. An offline zero-advisory report does not establish that dependencies are vulnerability-free. Re-run `npm audit` in both subprojects when online.

## Known limitations and existing-data considerations

- No live updates/WebSockets, automatic scheduling, participant/student accounts, registration approval, venue/location persistence, logo uploads, payments or analytics. Former browser-only approval controls were replaced with an honest read-only directory; unsupported logo input is marked unavailable.
- Event status defaults to `Upcoming`; no lifecycle editor or automatic transition is implemented. Match status can be set through the API; the UI primarily records completed results.
- No fixture-conflict detection, capacity rules, event/department editing or deletion, result audit history or optimistic concurrency control.
- Lists are unpaginated. Authentication throttling is per-process/IP, not shared across servers; password-reset responses can reveal account existence. HTTPS, hosting, backup/restore and operational monitoring are not configured.
- Some controls, custom dropdowns, alerts and mobile layouts still need browser and assistive-technology testing. Management event selection uses router state rather than stable event URLs.
- Existing department records may store sport IDs (`ts-…`, `ig-…`, `at-…`) instead of names. New writes use names consistently; review and migrate old records against `frontend/src/utils/constants.js` on a backup before scheduling. No existing data was modified by this review.
- Historical inconsistent references/results, duplicate department names and mixed-case emails need an explicit data audit. New validation does not repair old records. Department duplicate checks are not backed by a unique index, so concurrent registrations can race.
- Previously tracked `.env` files, dependencies and logs are removed from Git tracking while local copies are retained. If previously committed credentials were real, rotate them; removing files does not erase Git history. `.gitignore` prevents new accidental additions. Old debugging scripts are not automated tests and should not be run against important data.

No resume document was found in this repository. Suggested evidence-based wording is included in the assessment; avoid claims of production readiness, measured performance, live scoring or a completed approval workflow.
