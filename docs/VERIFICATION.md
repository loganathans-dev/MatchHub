# Verification record and acceptance checklist

## Checks run in this review

- Production frontend build using the installed packages.
- Frontend ESLint checks.
- 18 backend middleware/controller regression tests using database stubs: malformed inputs/IDs, throttling, wrong roles, tenant scoping, participant/result rules, valid creation/update, private public projections and validation errors.
- 7 authentication/reset regression tests using database/mail stubs: role/version tokens, password check, hashed atomic reset, replay rejection, expired/invalid OTP, revoked session and SMTP failure without a simulated fallback.
- 4 shared scoring tests: team and ranked awards, unfinished/draw behavior, equal ranks, sport filtering and distinct department IDs.
- 1 real loopback HTTP test containing seven request scenarios: root/404, college/admin authentication failures, injection-shaped login, invalid ID and malformed JSON. Does not connect to a database.
- Attempted online npm audit for both packages: blocked by `EAI_AGAIN registry.npmjs.org`. Offline reports were available but are insufficient to establish current vulnerability status.

Test bodies are deliberately run directly with Node by the scripts so their individual results are visible. HTTP checks require permission to bind a local port in restricted environments.

## Not verified

No isolated MongoDB service or browser automation was available in this session. The existing configured database was not used, and no existing records were changed. Real account persistence, database indexes/unique races, cross-tenant behavior against stored records, complete rendered UI flows, responsive layouts, assistive technologies, real SMTP delivery, clean network installation and deployment remain unverified. Tests with stubs validate application branches, not Mongoose/database integration.

## Manual acceptance run (disposable database only)

1. Install from a fresh clone and create a unique development JWT secret. Start MongoDB, backend and frontend using the README. Confirm clear startup failure with a missing URI/secret.
2. Register two colleges. Verify required/invalid fields, case-normalized login, incorrect password and sign-out. Confirm no password or reset material appears in public responses.
3. Under college A create an event with two sports and three departments registered for those sports. Confirm invalid dates, unknown sports and duplicate registrations receive useful errors.
4. Schedule a team fixture and a ranked event. Check distinct departments, sport membership, complete event time range and local/UTC conversion. Verify wrong-event/college participants are rejected through direct API requests.
5. Record a winner, a draw and ranked placements. Verify all 10/5/3 totals and medals on both portals, tied standings and zero points for unfinished fixtures. Correct a result and confirm totals recalculate.
6. Under college B attempt direct GET/POST/PUT access to A's private event resources. Confirm rejection/empty own-resource listing and no modification. Public results remain intentionally readable.
7. Browse each event as a visitor. Confirm another event's departments and fixtures do not leak into its standings. Test loading, no data, server failure and missing records.
8. Configure a test mailbox. Request OTP; test wrong/expired codes, resend, delivery failure, reset replay and login with the new password. Earlier college sessions must fail subsequent API requests.
9. Create an explicit administrator using the CLI; test wrong-role JWTs and the read-only directory. Verify no UI claims persisted approval/location editing.
10. Check keyboard operation, focus visibility, form names/errors, reduced motion, long content, mobile/tablet/desktop layouts and refresh/back/deep-link behavior. Record failures rather than asserting accessibility compliance.
11. Run online audits, lint, build, unit and HTTP tests; add database/browser regressions for discovered issues. Rehearse production SPA routing and backup/restore separately before claiming deployment readiness.
