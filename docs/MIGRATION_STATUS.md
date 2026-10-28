# Supabase to NestJS Migration Status

Last updated: 2026-10-28

This is a migration checkpoint, not a completion claim. Supabase remains operationally required until all runtime dependencies have replacements and the app cutover is verified.

## Architecture inventory

| Current Supabase use | Intended replacement | Current evidence |
| --- | --- | --- |
| Auth | NestJS JWT session cookie | Backend login/current-user endpoints use persisted server-side JWT sessions; the frontend login uses them and does not receive the JWT. |
| Database | PostgreSQL through Prisma | Prisma schema has 22 models. Nest modules now cover auth, users, profile, profile settings, calendar, leads, clients, projects, packages, add-ons, team members, team payments, finance, assignments, galleries, storage, and feedback. |
| Storage | Backend-managed object/file storage | Authenticated uploads and private/public reads now use local disk plus Prisma metadata. Admin gallery/profile image uploads use the API; anonymous booking proof upload still has the Supabase fallback. |
| RPC | NestJS transactional services | Finance transaction service still invokes Supabase RPC. |
| Edge Functions | NestJS services/jobs | Admin users, Google Calendar, and web push still use Supabase functions. |
| Realtime | API query invalidation or a selected push transport | Supabase realtime refresh hook remains in use. |
| RLS | Backend authorization and ownership checks | JWT guards exist on some routes; resource ownership and role checks are incomplete. |

The repository currently contains 68 non-test frontend source files with Supabase references; no backend source files reference Supabase. Leads service, public inquiry, Google Calendar feed management, team project payments, and authenticated image/PDF uploads use NestJS. Client persistence remains on Supabase because dependent booking/project workflows are not migrated as a unit. Other frontend services still use Supabase for reports, parts of galleries and public proof upload, communication, settings, and stored preferences.

The configured local PostgreSQL database is reachable as `attera_visual_db`. A read-only count found 16 rows across 16 tables before additive application tables were created. Its original schema matched the initial Prisma models. Verified custom-format local `pg_dump` archives are stored at `%TEMP%/attera-visual-migration-backup/`, including pre-migration checkpoints and a pre-Calendar Feed backup. Prisma has a baseline plus additive Leads, Clients, Team Members, Finance, Profile Settings, Calendar, Calendar relations, Team Payments, Stored Assets, and Calendar Feed Token migrations; all eleven are recorded as applied locally, and Prisma reports the schema is up to date. Supabase data is intentionally not part of the requested migration now.

## Completed in this checkpoint

- Added a centralized frontend API client using `VITE_API_BASE_URL`, standardized envelope handling, network/timeout errors, and credentialed requests.
- Replaced the Login page's Supabase Auth/database calls with `POST /api/v1/auth/login`.
- Backend login now sets the JWT as an HttpOnly, SameSite=Lax cookie; `/api/v1/auth/me` can authenticate from that cookie and `/api/v1/auth/logout` clears it. The raw JWT is not returned in the response body.
- Removed the hardcoded JWT secret fallback. `JWT_SECRET` must be configured.
- Restricted credentialed CORS to `CORS_ORIGINS`, defaulting to the local Vite origin.
- Baseline-managed the existing local PostgreSQL schema after verifying a pre-change backup and exact schema parity; added and applied an additive migration for legacy VENA lead fields.
- Added and applied an additive Clients migration; existing client rows receive unique portal access IDs while their other data remains intact.
- Migrated frontend Leads read/filter/create/update/delete and public inquiry submission to NestJS. Added backend pagination/filter handling, legacy field/status mapping, and a per-profile/IP public inquiry rate limit.
- Added additive Prisma fields and an applied migration for legacy Client name, status/type, portal ID, dates, avatar, WhatsApp, and home address; added profile-scoped Clients CRUD/search/pagination endpoints and unit coverage. The existing frontend Clients service is retained on Supabase because booking, lead conversion, portal, and project changes currently cross the database boundary and must migrate as a coordinated workflow.
- Added authenticated, profile-scoped Packages and Add-ons CRUD/search endpoints using the existing Prisma models.
- Added authenticated Team Members CRUD/search endpoints, preserving VENA role labels and profile metadata in PostgreSQL.
- Added authenticated Cards, Pockets, and Transactions endpoints. Transaction create/update/delete adjusts card balance atomically, rejects overdrafts, validates profile ownership of related records, and supports transaction pagination/search/filtering.
- Expanded Projects from read-only to authenticated create/update/soft-delete, with same-profile Client and Package checks; added profile-scoped project-team assignment CRUD.
- Added authenticated gallery/item metadata CRUD and a public published-gallery endpoint that enforces access codes and does not expose the stored access code.
- Added authenticated profile read/update endpoints for the fields represented by the current Prisma Profile model, plus profile-scoped feedback moderation endpoints.
- Persisted each login session with an opaque JWT session ID, bounded expiry, and integrity hash; guarded logout revokes the database session. E2E coverage verifies that a previously copied cookie is rejected after logout.
- Added the Prisma `ProfileSetting` model and applied migration 6, with authenticated profile-scoped list/get/upsert/delete endpoints. Settings keys are validated and JSON values are limited to 64 KiB; focused tests cover profile scoping, validation, not-found, and deletion.
- Added a profile-scoped Calendar Events Prisma model and authenticated NestJS range-list/create/update/delete API. Event project/client/team relations are checked against the active profile, with foreign keys and focused tests for date filtering, all-day ranges, invalid ranges, and cross-profile access.
- Added atomic batch transaction creation (1–100 rows) so a batch and all linked card-balance changes commit together or roll back together.
- Added Prisma models and authenticated APIs for team project payments and team payment records. Project payment reconciliation preserves paid history, removes obsolete unpaid rows, validates profile ownership, and payment-record references are checked within the active profile.
- Added local disk storage with Prisma metadata, profile-scoped authenticated upload/read/delete, and public reads restricted to approved asset folders. Uploads are capped at 10 MB and restricted to image/PDF MIME types; path traversal is prevented and private proof uploads are not exposed publicly.
- Migrated authenticated profile/package/gallery image and pricelist PDF uploads/deletions to Nest storage. The API client preserves browser multipart boundaries, and unauthenticated DP proof uploads temporarily retain the legacy public path.
- Replaced Google Calendar feed Edge Function management with authenticated admin create/status/revoke endpoints, SHA-256 hashed feed tokens, and a public ICS endpoint; migrated the frontend feed settings service to NestJS.
- Migrated the frontend team project payment service to NestJS reconciliation/status APIs. Paid historical rows are preserved while obsolete unpaid assignments are removed.
- Added frontend API contract tests, backend cookie controller tests, and user-list authorization tests (8 passing in total).
- The shared API client handles empty 204/205 responses, structured errors, and caller-provided header formats for future CRUD services.
- Added `VITE_API_BASE_URL` to the frontend example environment and separated frontend TypeScript/test discovery from backend files and nested dependency tests.
- Fixed the missing `formatCurrency` import uncovered by the required typecheck.
- Added the existing DTO dependency `@nestjs/mapped-types` to the backend manifest and lockfile so Leads/Clients DTOs compile.
- Activated the existing Users/Leads modules and a new Clients module in `AppModule`; restricted the user listing endpoint to active superadmins after a regression test exposed that any authenticated account could list users.
- Replaced permissive reflected-origin CORS with an explicit comma-separated allowlist and removed untyped request context from authenticated controllers.
- Improved safe user serialization and standardized exception/response envelope typing.

## Remaining stage status

| Stage | Status | Evidence / remaining work |
| --- | --- | --- |
| Authentication | PARTIAL | Cookie-backed login, restoration, expiry, server-side session revocation, CSRF Origin/Referer checks, and HttpOnly cookie clearing are covered by HTTP tests. Password management and role/permission parity remain. |
| API infrastructure | PARTIAL | Central client is used for authentication only; typed migration of each domain service remains. |
| Profile/settings | PARTIAL | Basic authenticated Profile read/update and generic profile-scoped JSON settings CRUD exist. Legacy setting key compatibility, full frontend migration, and any settings payloads beyond the current Prisma model remain. |
| Leads | PARTIAL | Authenticated CRUD and public inquiry form use NestJS; legacy mapping and frontend tests pass. Data is not reconciled against Supabase; public rate limiting is in-memory and per-process. |
| Clients/wedding detail | PARTIAL | NestJS Client CRUD/search/pagination exists and is tested. Frontend persistence, booking/lead-conversion transactions, public portal lookup, avatar storage, and project workflow remain on Supabase until their related tables/services are migrated together. |
| Projects | PARTIAL | NestJS read/create/update/soft-delete exists with Client/Package ownership checks. Legacy project metadata, transactional booking/conversion/payment workflows, public forms, and frontend service migration remain. |
| Team | PARTIAL | Team Members, team-project assignment, project payment reconciliation, and team payment record CRUD APIs exist and are tested. Avatar storage and frontend service migration remain. |
| Calendar/scheduling | PARTIAL | Authenticated event range-list/CRUD API and PostgreSQL model exist. Frontend service, project meeting metadata compatibility, Google Calendar sync/feed, and migration of existing Supabase records are not done. |
| Packages/add-ons | PARTIAL | Authenticated package and add-on CRUD APIs exist; extended package configuration, assets, and frontend service migration remain. |
| Finance | PARTIAL | Cards, pockets, atomic transaction CRUD and atomic batch creation are implemented. Pocket/card transfer workflow, receipts/proofs storage, reports, and frontend integration remain. |
| Reports/dashboard | NOT STARTED | Metrics still depend on existing frontend services/data sources. |
| Communication | NOT STARTED | Supabase tables/functions remain in use. |
| Galleries/portal | PARTIAL | Gallery metadata APIs and protected public gallery lookup exist; backend storage upload/download/delete is now available. Gallery service integration, gallery relationship checks for public assets, existing file references, and public portal workflows remain. Public booking proof upload still depends on Supabase.
| Storage | PARTIAL | Backend local disk API and Prisma metadata exist, with scoped private files and allowlisted public folders. Admin gallery/profile uploads use NestJS. Public DP proof upload, portfolio/client/team avatar integrations, backup/retention policy, and production persistent storage verification remain. |
| Cross-module integration | NOT STARTED | Existing frontend cache tests do not verify NestJS integration. |
| Supabase decommission | BLOCKED | Active references remain; no Supabase URL/key credentials or Supabase DB/storage export were found in local env files, and no source/target parity evidence is available. Do not remove integrations or decommission cloud resources. |
| Final QA/security | PARTIAL | Frontend typecheck, lint, 314 unit tests, build, backend 26 unit tests + 3 auth/API HTTP tests, backend build/schema validation pass. No complete module regression, upload/download, browser DevTools run, or performance audit was run. |

## Validation snapshot

- PASS — `npx vitest run src/services/__tests__/auth-api.test.ts` (3 tests).
- PASS — frontend full `npm test` (51 files, 314 tests).
- PASS — focused API client suite (4 tests).
- PASS — backend unit suite (19 files, 43 tests) and auth/API HTTP e2e (2 files, 4 tests; auth guard covers calendar, settings, storage, and team payment routes).
- PASS — Prisma schema validation via backend Prisma 7 config.
- PASS — `prisma migrate status` reports 11 migrations found and the local PostgreSQL schema up to date; `migrate diff --exit-code` reports no schema difference.
- PASS — created a verified custom-format local PostgreSQL backup after applying Calendar migrations; restore archive listing succeeds.
- PASS — frontend `npm run build` (existing warnings about `eval`, CSS minification, and oversized chunks remain).
- PASS — backend `npm run build` from `backend/`.
- PASS — root `npx tsc --noEmit`.
- PASS — root `npm run lint` after excluding generated nested dependency/build output and fixing the remaining common response typing errors.
- PASS — `npx eslint` on the changed frontend files.
- PASS — backend `npx oxlint src/ test/`.
- NOT TESTED — backend business integration tests against PostgreSQL, migration application/data parity, upload/download, and runtime performance audit. The in-app browser was opened but no supported Chrome DevTools MCP was available for network/console validation.
- PARTIAL — package installation reports 5 development dependency advisories (2 low, 1 moderate, 2 high); a full vulnerability triage is still required.
- PASS — backend production dependency audit `npm --prefix .\\backend audit --omit=dev` (0 vulnerabilities). Development dependency advisories still require triage.
- PASS — local Nest runtime started with PostgreSQL connected; unauthenticated requests to `/auth/me`, `/leads`, and `/clients` each returned 401. Local UI login/session restoration was exercised with the development account in an isolated browser; logout and invalidation are covered by HTTP e2e.

## Remaining work for runtime cutover

Supabase data migration is no longer requested. The local database is Prisma-managed and backed up. Runtime dependency removal is still blocked by unfinished frontend integrations and Supabase-backed storage/auth/realtime/functions; the project has 70 non-test frontend files with Supabase references. Cloud Supabase resources have not been altered.

## Skill instructions applied in this checkpoint

- `.agents/skills/using-agent-skills/SKILL.md` — discovered local skills; surfaced assumptions, verified with actual commands, and kept changes scoped.
- `.agents/skills/incremental-implementation/SKILL.md` — implemented and verified a single auth/API vertical slice before expanding.
- `.agents/skills/api-and-interface-design/SKILL.md` — used the existing `{ success, data }` envelope and actual `/api/v1/auth/*` contract.
- `.agents/skills/frontend-ui-engineering/SKILL.md` — preserved the existing login layout and set `credentials: 'include'` for cookie auth.
- `.agents/skills/security-and-hardening/SKILL.md` — used HttpOnly cookie storage, removed the default JWT secret, and constrained credentialed CORS.
- `.agents/skills/test-driven-development/SKILL.md` — added focused API contract tests and ran them.
- `.agents/skills/planning-and-task-breakdown/SKILL.md` — mapped stage dependencies and verification checkpoints in this status document.
- `.agents/skills/deprecation-and-migration/SKILL.md` — deferred Supabase removal until a verified replacement and data recovery path exist.
- `.agents/skills/supabase/SKILL.md` — preserved active Supabase integrations and did not alter its data, storage, or auth services during the migration checkpoint.
- `backend/.agents/skills/prisma-orm-setup/SKILL.md`, `prisma-postgres-setup/SKILL.md`, and `prisma-client-api/SKILL.md` — retained the existing Prisma 7 adapter/configuration, reused the configured PostgreSQL target, and used an explicit field selection for authorization.
- `.agents/skills/git-workflow-and-versioning/SKILL.md` — inspected repository state; Git operations cannot be performed because this workspace has no `.git` directory.
