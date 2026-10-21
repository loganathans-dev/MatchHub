# Project assessment

## Scope and evidence

Reviewed the frontend routes/pages/styles, all backend routes/controllers/models, authentication middleware, API configuration, dependency manifests, tracked files and existing documentation. Traced registration/login, password reset, event creation, department registration, fixture scheduling, result entry, both points tables, public college/event browsing and administrator sign-in/directory behavior. No resume file or supplied resume text was available for a direct claim-by-claim comparison.

The stack is suitable for a small college sports project. The route/controller/model split is understandable, but duplicated client logic and missing backend relationship checks previously made the two portals inconsistent. The project now has a stronger development baseline, not a verified production deployment.

## Findings and corrections

| Priority | Original problem | Change and evidence | Remaining limits |
| --- | --- | --- | --- |
| Critical | Any college JWT could list every match, schedule into another college's event, or change another college's results. | Owned-event filtering/checks in all match operations; ownership regression tests. | Real database multi-tenant acceptance test still required. |
| Critical | Public college responses excluded only passwords, exposing reset fields and private contacts. | Explicit public field allowlist; regression check. | Historical exposure and credential rotation require owner action. |
| High | JWTs had no role separation; admin dashboard had no guard. | Role claims, role checks and client guards; wrong-role/session tests. | Tokens in localStorage; no refresh/revocation store or MFA. |
| High | Password reset stored plaintext Math.random OTPs and fell back to Ethereal, reporting success without real recipient delivery. | Crypto-generated, hashed OTPs; real-delivery failure response and cleanup; atomic consumption and session-version invalidation; reset tests. | Real provider delivery, account enumeration and shared throttling remain. |
| High | Reference fields could point to unrelated departments/events; result placements could be invalid or repeated. | Validate event ownership, participant registration/sport membership, distinct opponents/placements and dates. | Legacy-data cleanup, conflict detection and result concurrency remain. |
| High | Missing primitive input checks allowed query-shaped login/OTP fields; validation/cast errors became 500s. | Typed auth inputs, ID checks, credential/body limits and consistent client/server error status mapping. | Full schema-level constraints and broader edge-case coverage remain. |
| High | Environment sample used `MONGO_URI` while code read `MONGODB_URI`; server listened before database success. | Correct example; required startup configuration; await database connection. | MongoDB startup/failure and deployment checks need isolated integration tests. |
| High | Environment files, backend node_modules and logs were tracked. | Root ignore rules; removed those files from Git index while retaining local copies. | Historical secrets remain in Git history; replace real credentials. |
| Medium | Department form stored sport IDs while fixtures used names; one page ignored configured API origin. | New registrations persist sport names; department API calls respect `VITE_API_URL`; scheduling filters names. | Audit old records before migration; no automatic destructive conversion. |
| Medium | Student event page fetched all college events/results; points omitted runner/third-place points. | Event filters server/client; populated placements; one shared 10/5/3 calculator, ID grouping and tied ranking. | Scoring is a project rule, not a configurable rules engine. |
| Medium | Admin approval/rejection/location buttons modified local state only; fake venue text and discarded logo upload implied unsupported features. | Honest read-only admin directory and unavailable venue/logo wording; removed unsupported home-card claims. | No approval/location/upload workflow implemented. |
| Medium | No usable root scripts/tests; lint failures and template documentation. | Root setup/start/check scripts, meaningful regression tests, lint corrections and rewritten documentation. | Clean online install and complete CI pipeline remain. |
| Medium | Network errors could silently become empty lists; logout on management home did not clear credentials. | Shared failure banner/request wrapper, loading feedback and token-clearing logout. | Expired-session UX, per-page retry and request cancellation can improve further. |
| Medium | Clickable cards lacked keyboard access; labels often were not associated with inputs; template root sizing conflicted with app layout. | Keyboard support on main navigation cards, label associations, focus style, reduced motion and responsive grid/root fixes. | No browser/screen-reader conformance claim; custom comboboxes and remaining controls need dedicated audit. |
| Low | Queries lacked indexes for common tenant/date filters. | Compound event/department/match query indexes and scoped public filters. | No measured performance claim; pagination, explain plans and dataset testing remain. |

## Feature truth table

**Implemented, source-traced and selectively unit-tested:** account registration/login, college-scoped event and department creation, manual fixtures, result updates, shared standings and public read-only browsing. HTTP rejection paths also pass local tests. Database persistence and complete rendered flows remain unverified in this session.

**Implemented but externally dependent:** MongoDB storage and SMTP OTP delivery. The application needs working configuration; no real email was sent during review.

**Partial:** administrator functionality is login plus a read-only directory; event lifecycle/status management, responsive/accessibility coverage, operational safeguards and input coverage need more work. Individual/athletics events represent departments, not named athletes.

**Absent or previously simulated:** persisted approval/rejection/location updates, logo upload, automatic fixture generation, collision detection, live score push, analytics, student registration and tournament brackets. Do not describe these as completed.

## Resume wording

Suggested project description: “MatchHub — a React, Express and MongoDB application for college sports-event administration and public schedule/result browsing.”

Suggested bullets based on implemented code and selected regression checks:

- Built college management flows for sports-event creation, department registration, manual fixture scheduling and result entry using React, Express and Mongoose.
- Implemented JWT role checks and college-scoped authorization, with validation of event membership, participating departments and result placements.
- Created public event views and shared department standings logic using a 10/5/3 points rule, backed by automated authorization, password-reset and scoring regression tests.

If mentioning password recovery: “Implemented email OTP reset endpoints with expiring hashed codes and session invalidation; real SMTP delivery requires configured credentials and acceptance testing.”

Do not claim “production-ready,” “secure platform,” “real-time scores,” “automated tournament scheduling,” “complete admin approval,” individual athlete management, deployment scale, uptime, performance improvements or user counts without additional implementation and evidence. A passing build is not evidence of those claims.
