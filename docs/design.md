# MiniLedger --- Technical and UI Design

## 1. Architecture

``` text
React Native mobile app (Expo development workflow)
        |
        | HTTP JSON requests + Bearer access token
        v
Node.js + Express.js + TypeScript API
        |
        | parameterized SQL via pg
        v
PostgreSQL
```

Expo is used only to develop and run the React Native app. The mobile
application itself is React Native, as required by the assignment.

For local Android testing, the API should listen on a network interface
reachable by the phone. The app must use the laptop's LAN IP address
rather than `localhost`. Keep the laptop and phone on the same Wi-Fi
network, and configure Windows Firewall narrowly if access is blocked.

## 2. Suggested Repository Structure

``` text
MiniLedger/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── loans/
│   │   │   └── summary/
│   │   └── utils/
│   ├── migrations/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── App.tsx
│   └── package.json
├── docs/
│   ├── propose.md
│   ├── specs.md
│   ├── design.md
│   └── tasks.md
├── README.md
└── .gitignore
```

Keep the first implementation small. Avoid unnecessary layers or
libraries if a straightforward module is easier to explain in an
interview.

## 3. Backend Design

### Request flow

1.  Express receives the request.
2.  Middleware parses JSON and handles authentication for protected
    routes.
3.  The route validates request data.
4.  The service applies business rules.
5.  Database code executes parameterized SQL.
6.  The API returns a consistent JSON response.

### Responsibilities

-   **Auth module:** request OTP, store its expiry, verify OTP,
    create/find user, issue token.
-   **Loans module:** create/list loans and mark a loan as repaid.
-   **Summary module:** calculate aggregate totals for the authenticated
    user.
-   **Database module:** create a PostgreSQL pool and expose query
    helpers.
-   **Error middleware:** map expected failures to safe JSON responses.

### Important business rules

-   Every loan belongs to one user.
-   Every loan query must filter by the authenticated user's ID.
-   A loan is overdue only if its status is `outstanding` and its due
    date is earlier than the agreed current date.
-   Repayment sets status to `repaid` and records `repaid_at`.
-   Use a PostgreSQL transaction if a multi-step operation needs
    atomicity.
-   Keep money in PostgreSQL `NUMERIC(12,2)` and avoid floating-point
    arithmetic for server-side totals.

## 4. Mobile Screen Design

### Screen A --- Phone Login

Elements: - MiniLedger title and short description. - Phone number
input. - "Send OTP" button. - Inline validation and loading state.

### Screen B --- OTP Verification

Elements: - Masked or partially displayed phone number. - Six-digit OTP
input. - "Verify OTP" button. - Error feedback for an invalid/expired
OTP. - A way to return and edit the phone number.

The development OTP is read from the backend terminal. The app must not
display the OTP automatically.

### Screen C --- Dashboard

Top to bottom: 1. Header with MiniLedger and a concise greeting. 2.
Summary card with Total Lent, Total Repaid, and Overdue. 3. Primary "Add
Loan" action. 4. Loan list ordered with outstanding/overdue items easy
to notice. 5. Empty state when no loans exist.

Each loan row/card shows: - Friend's name. - Amount. - Due date. -
Status label. - "Mark Repaid" action only for outstanding loans.

### Screen D --- Add Loan

Fields: - Friend's name. - Amount in rupees. - Due date. - Save and
Cancel actions.

Show validation messages near fields. Disable duplicate submission while
saving. After the API confirms creation, return to the dashboard and
refresh its data.

## 5. Visual Style

-   Clean, calm, finance-oriented interface.
-   Light neutral background, white cards, dark readable text.
-   One restrained primary accent colour and a distinct overdue warning
    colour.
-   Rounded cards with consistent spacing.
-   Use text labels as well as colour to communicate status.
-   Ensure comfortable touch targets and keyboard-aware forms.
-   Keep the UI polished but achievable without complex animation.

## 6. Data Loading and State

-   Store the API base URL in a single mobile configuration file.
-   Centralize fetch calls and attach the bearer token for protected
    endpoints.
-   Handle loading, success, empty, and failure states.
-   Refresh loans and summary after adding or repaying.
-   Do not optimistically claim repayment before the server confirms it.
-   On an expired/invalid token, return the user to login with a clear
    message.

## 7. Testing Design

Backend tests should cover: - Valid and invalid phone/OTP input. - OTP
expiry and successful one-time verification. - Empty friend name and
invalid/non-positive amount. - Valid loan creation. - User A cannot
access User B's loan. - Repayment changes status and records a
timestamp. - Summary excludes repaid loans from overdue amount. - Due
today is not overdue under the selected date policy.

Use a test database or controlled test fixtures so tests do not damage
personal development data.

## 8. Security and Demo Boundaries

-   Mock OTP is intentionally a development-only mechanism.
-   Never return OTPs in API responses.
-   Use a strong local JWT secret from `.env`.
-   Keep `.env`, tokens, and personal test data out of Git.
-   Do not expose database credentials in the mobile app.
-   Do not commit uploaded receipts or other private files.
-   Before any public deployment, replace mock OTP and review token
    storage, rate limiting, HTTPS, logging, and secret management.
