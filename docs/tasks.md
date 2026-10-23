# MiniLedger --- Implementation Task List

## Phase 0: Project Setup

-   [ ] Confirm Node.js LTS and npm are installed.
-   [ ] Confirm Git is available.
-   [ ] Confirm PostgreSQL is installed or choose a hosted PostgreSQL
    database.
-   [ ] Install Expo Go on the Android phone.
-   [ ] Create the Git repository and initial folder structure.
-   [ ] Add `.gitignore` for `node_modules`, `.env`, build output, logs,
    and local-only files.
-   [ ] Add `backend/.env.example`.
-   [ ] Create a README skeleton with planned commands.
-   [ ] Verify available disk space before installing dependencies.

**Exit criteria:** project opens in VS Code, Git works, and the chosen
PostgreSQL instance is reachable.

## Phase 1: PostgreSQL and Backend Foundation

-   [ ] Initialize the Node.js + TypeScript backend.
-   [ ] Configure TypeScript and development scripts.
-   [ ] Add Express, `pg`, environment configuration, validation, and
    authentication dependencies.
-   [ ] Create the database and tables for users, OTP challenges (if
    database-backed), and loans.
-   [ ] Add a health endpoint.
-   [ ] Add centralized error handling.
-   [ ] Confirm the backend can connect to PostgreSQL.
-   [ ] Add a documented database initialization or migration command.

**Exit criteria:** backend starts without errors and `/api/health`
responds successfully.

## Phase 2: Mock OTP Authentication

-   [ ] Implement phone-number normalization and validation.
-   [ ] Implement OTP generation.
-   [ ] Print the mock OTP to the backend terminal only.
-   [ ] Store OTP expiry and consumed state.
-   [ ] Implement OTP verification and one-time use.
-   [ ] Create/find the user after successful verification.
-   [ ] Issue a signed access token.
-   [ ] Add authentication middleware.
-   [ ] Ensure protected routes derive the user ID from the verified
    token.

**Exit criteria:** valid OTP logs in; invalid/expired OTP fails;
protected endpoints reject missing/invalid tokens.

## Phase 3: Loan and Summary APIs

-   [ ] Implement `POST /api/loans`.
-   [ ] Implement `GET /api/loans`.
-   [ ] Implement `PATCH /api/loans/:id/repay`.
-   [ ] Implement `GET /api/summary`.
-   [ ] Validate friend name, positive amount, date, and loan ID.
-   [ ] Use parameterized SQL queries.
-   [ ] Ensure users can only read and modify their own loans.
-   [ ] Implement the agreed overdue-date rule.
-   [ ] Return consistent success and error responses.
-   [ ] Test endpoints in Postman.

**Exit criteria:** login, create loan, list loans, repay, and summary
work directly against PostgreSQL.

## Phase 4: React Native Mobile App

-   [ ] Create the React Native app using Expo tooling.
-   [ ] Confirm it opens in Expo Go on the Android phone.
-   [ ] Configure the API base URL using the laptop's reachable LAN IP.
-   [ ] Create phone login screen.
-   [ ] Create OTP verification screen.
-   [ ] Add centralized API client and token handling.
-   [ ] Create dashboard summary card.
-   [ ] Create loan list and status labels.
-   [ ] Highlight overdue outstanding loans.
-   [ ] Create add-loan form.
-   [ ] Add mark-as-repaid interaction.
-   [ ] Add loading, empty, validation, success, and network-error
    states.
-   [ ] Refresh summary and loan list after mutations.
-   [ ] Check layout, keyboard behaviour, and touch targets on the
    phone.

**Exit criteria:** the complete user flow works from the Android
interface, not just from Postman.

## Phase 5: Validation and Tests

-   [ ] Add backend tests for validation.
-   [ ] Add OTP success, failure, expiry, and reuse tests.
-   [ ] Add loan creation and repayment tests.
-   [ ] Add summary and overdue calculation tests.
-   [ ] Add a test proving one user cannot access another user's loan.
-   [ ] Run type checking and linting.
-   [ ] Fix failing tests and runtime errors.
-   [ ] Test with no loans, an overdue loan, a due-today loan, and a
    repaid loan.

**Exit criteria:** tests pass and the demo scenarios behave as
documented.

## Phase 6: Documentation and Delivery

-   [ ] Complete README prerequisites.
-   [ ] Document database creation and initialization.
-   [ ] Document backend environment variables.
-   [ ] Document how to run the backend.
-   [ ] Document how to run the React Native app on Android.
-   [ ] Document how to run tests.
-   [ ] Explain that mock OTP is printed in the backend terminal.
-   [ ] Confirm `.env` and secrets are not committed.
-   [ ] Commit and push the final project to GitHub.
-   [ ] Record a 2--3 minute app walkthrough.
-   [ ] Verify the GitHub README and recording link are accessible to
    the reviewer.

**Exit criteria:** reviewer can clone the repository, follow the README,
run the app, and understand the core implementation.

## Optional Phase 7: Receipt Photo

Only start this after all required functionality is working.

-   [ ] Choose a file-storage approach.
-   [ ] Add receipt selection/capture permission handling.
-   [ ] Upload and associate a receipt with a loan.
-   [ ] Validate file type and size.
-   [ ] Document storage configuration and limitations.
-   [ ] Test upload failure and missing receipt cases.

## Suggested Priority

**P0 --- Must work:** OTP login, PostgreSQL persistence,
create/list/repay loan, summary, overdue highlighting, GitHub README,
demo recording.

**P1 --- Quality:** validation, tests, loading/error states, secure
handling of local secrets.

**P2 --- Optional:** receipt upload and visual polish beyond the core
flow.
