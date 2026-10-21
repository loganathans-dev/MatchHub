# Improvement plan: 20 working days

Allow about four working weeks for one developer, extending the schedule when acceptance checks uncover defects. Days are effort estimates, not claims that the work is finished. This review completed portions of days 1–8 and documentation/testing work, but the database/browser acceptance gates remain open. Essential corrections precede optional new features.

| Day | Work | Completion gate |
| --- | --- | --- |
| 1 | Inventory routes, data models, configuration, dependencies and resume claims; record baseline. | Feature truth table and risk list reviewed against source. |
| 2 | Fix setup and configuration; remove tracked environment/dependency/log files; rotate real exposed credentials. | Fresh clone installs; isolated MongoDB starts; startup fails clearly for invalid configuration. |
| 3 | Review legacy data on a backup: email casing, sport IDs/names, duplicate departments and dangling references. Write a dry-run migration/report. | No important data modified; migration scope and rollback reviewed. |
| 4 | Complete tenant/role checks and negative tests for all protected endpoints. | Two isolated colleges cannot read or mutate each other's private resources; admin token denied college writes. |
| 5 | Complete authentication/reset review: limits, enumeration behavior, token lifetime, stale sessions and SMTP errors. | Real test mailbox delivery plus expired/incorrect/replayed OTP checks; earlier sessions rejected after reset. |
| 6 | Strengthen registration/event/department validation and consistent error responses. | Boundary, malformed, missing, duplicate and concurrent submissions tested. |
| 7 | Verify scheduling relationships, sport types, time zones and duplicate/opponent rules; design basic conflict checks. | Valid fixtures persist; invalid references, date ranges and collisions are rejected. |
| 8 | Verify results, draws, corrections and standings with representative fixtures. | Both portals show identical expected totals and tied ranks from persisted data. |
| 9 | Apply approved legacy-data migration on a disposable copy, then review unique index strategy. | Dry run and restore work; duplicate writes prevented without breaking existing data. |
| 10 | Replace event router-state-only context with stable event URLs; improve expired-session and retry behavior. | Bookmark, refresh, back navigation and expired-token scenarios work. |
| 11 | Review forms, required fields, score entry, loading/empty/error states and duplicate-submit prevention. | Every main screen distinguishes failure from empty data and prevents accidental repeated submissions. |
| 12 | Keyboard/screen-reader pass: dropdown semantics, labels, focus, dialogs, errors and contrast. | Main flows complete by keyboard; automated accessibility scan and manual findings documented. |
| 13 | Responsive pass at narrow mobile, tablet and desktop widths; date/time and long-content checks. | No inaccessible controls or unintended page overflow; tables remain scrollable. |
| 14 | Add isolated MongoDB integration tests covering real schemas, indexes, password hashing and queries. | Tests run against a disposable database without touching existing data. |
| 15 | Add browser end-to-end happy path: register, login, event, departments, fixture, result and visitor standings. | Fresh-browser run passes with screenshots/traces for failures. |
| 16 | Add adversarial and recovery runs: tenant isolation, malformed input, concurrent edits, offline API and database failures. | Critical/high findings fixed with regression tests. |
| 17 | Test pagination/query plans on a representative dataset; set explicit limits and check payload privacy. | Document actual query evidence without invented performance targets. |
| 18 | Deployment rehearsal: SPA fallback, API origin, HTTPS, environment handling, backup/restore and shared rate-limit needs. | Staging setup and recovery instructions reproduced; unresolved hosting gaps listed. |
| 19 | Dedicated integration/fix buffer; repeat impacted tests after fixes. | No open critical/high defect in the agreed demo scope. |
| 20 | Reproduce setup from a clean clone, finalize README, record demo and reconcile resume wording. | Every feature claim maps to demonstrable behavior; remaining limits explicit. |

Optional work after those gates: persisted registration approval and venue editing, athlete records, configurable scoring, tournament brackets, live push updates and dashboards. Estimate each separately; none is part of the current verified feature set. External mailbox access, network availability, legacy data volume and hosting requirements can extend the plan.
