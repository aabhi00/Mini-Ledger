# MiniLedger --- Project Proposal

## 1. Overview

MiniLedger is a small mobile application for recording money lent to
friends and tracking repayments. It provides a simple phone-number login
flow using a mock OTP, a dashboard summary, a list of loans, and actions
to add a loan or mark it as repaid.

This project is intended as a working demonstration for an interview
assignment. The implementation should be easy to explain, test, and run
locally.

## 2. Problem Statement

People sometimes lend money to friends and lose track of who owes what,
when repayment is due, and which loans are overdue. MiniLedger keeps
these records in one place and makes overdue loans visible.

## 3. Goals

-   Allow a user to request and verify a mock OTP sent to a phone
    number.
-   Persist users and loan records in PostgreSQL.
-   Create a loan with a friend's name, amount, and due date.
-   Mark an outstanding loan as repaid.
-   Show total lent, total repaid, and the amount currently overdue.
-   Highlight overdue loans in the mobile interface.
-   Validate inputs and provide understandable error messages.
-   Include basic automated tests and clear run instructions.

## 4. Proposed Technology Stack

The assignment's stack is fixed and will not be replaced.

-   **Mobile app:** React Native
-   **React Native development workflow:** Expo (tooling only; React
    Native remains the app framework)
-   **Backend runtime:** Node.js
-   **Backend language:** TypeScript
-   **HTTP API:** Express.js
-   **Database:** PostgreSQL
-   **Database access:** `pg` with parameterized SQL queries
-   **Authentication demo:** mock OTP printed in the backend terminal; a
    signed token for authenticated API requests
-   **API testing:** Postman or equivalent HTTP client
-   **Version control:** Git and GitHub

Exact package versions will be selected when implementation begins and
recorded in the project manifests.

## 5. Main User Flow

1.  The user enters a phone number.
2.  The backend generates a short-lived mock OTP and prints it in the
    server log.
3.  The user reads the OTP from the development terminal and enters it
    in the app.
4.  The backend verifies the OTP and returns an authentication token.
5.  The dashboard loads the user's summary and loan list.
6.  The user can add a loan or mark an outstanding loan as repaid.
7.  The dashboard refreshes to reflect the updated totals and loan
    status.

## 6. Scope

### Included in the first version

-   Phone-number login with mock OTP.
-   Authenticated loan APIs.
-   PostgreSQL persistence.
-   Dashboard summary.
-   Loan list with overdue styling.
-   Add-loan form.
-   Mark-as-repaid action.
-   Input validation, useful loading/error/empty states, and basic
    tests.
-   README with setup and run instructions.

### Deferred / optional

-   Receipt photo upload.
-   Partial repayments.
-   Push notifications and SMS delivery.
-   Production-grade identity verification, password recovery, and
    account management.
-   Deployment to a public server or app store.

Receipt uploads are optional in the assignment, so they should not delay
the core working flow.

## 7. Success Criteria

The project is ready for demonstration when a reviewer can:

-   Start PostgreSQL and the backend using the README.
-   Start the React Native app on an Android phone.
-   Request an OTP and find it in the backend terminal.
-   Log in successfully with that OTP.
-   Add a loan and see it persist after refreshing the app.
-   See an overdue loan clearly highlighted when its due date is in the
    past and it is not repaid.
-   Mark a loan as repaid and see the dashboard totals update.
-   Run the documented automated tests.

## 8. Constraints and Assumptions

-   Initial development and demonstration will use a Windows laptop with
    20 GB RAM, an Intel Core i5 processor, and an Android phone.
-   The backend and PostgreSQL will initially run locally.
-   The Android phone and laptop should be on the same Wi-Fi network
    when testing the phone against the local backend.
-   Mock OTP is for demonstration only. It must not be described as
    production-secure authentication.
-   Currency will be displayed as INR (₹) unless the assignment owner
    requests otherwise.
-   A loan is considered overdue when it is not repaid and its due date
    is earlier than the current local calendar date. The implementation
    should use a consistent date policy and test it.

## 9. Delivery

-   Source code committed to GitHub.
-   README containing prerequisites, environment variables, database
    setup, migration/initialization steps, and run/test commands.
-   A 2--3 minute screen recording showing login, dashboard, adding a
    loan, overdue highlighting, and repayment.
