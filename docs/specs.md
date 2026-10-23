# MiniLedger --- Product and Technical Specifications

## 1. Product Requirements

### Authentication

-   The login screen accepts a phone number.
-   The user can request an OTP.
-   The backend generates a mock OTP and prints it in the backend
    terminal. show it on the frontend as well for now.
-   The OTP expires after a short configurable period (recommended: 5
    minutes).
-   OTP verification returns a signed access token on success.
-   Invalid, expired, or already-used OTPs are rejected.
-   Development OTPs must not be returned in the OTP-request API
    response.
-   Protected endpoints require a valid token.
-   The token identifies the current user; users must only be able to
    access their own loans.

### Loans

Each loan has: - Friend's name. - Amount in INR. - Due date. - Status:
`outstanding` or `repaid`. - Creation timestamp. - Optional repayment
timestamp.

Required actions: - Create a loan. - List the authenticated user's
loans. - Mark an outstanding loan as repaid. - Reject attempts to mark a
loan as repaid more than once, or handle them idempotently with a clear
response.

### Dashboard Summary

The summary endpoint returns: - **Total lent:** sum of the original
amounts of all loans created by the current user. - **Total repaid:**
sum of original amounts for loans marked as repaid. - **Overdue
amount:** sum of original amounts for outstanding loans whose due date
is before today's date.

There are no partial repayments in the first version. Therefore, the
full amount of a repaid loan contributes to `totalRepaid`; only
outstanding loans contribute to `overdueAmount` when overdue.

### Mobile Interface

Required screens/states: 1. Phone number login. 2. OTP verification. 3.
Dashboard with summary card. 4. Loan list. 5. Add-loan form (screen or
modal). 6. Loading, empty, success, and error states.

UI behaviour: - Overdue outstanding loans must be visually distinct and
labelled "Overdue". - Repaid loans must be labelled "Repaid". -
Non-overdue outstanding loans must be labelled "Outstanding". - The
add-loan form validates friend name, positive amount, and due date. -
After creating or repaying a loan, refresh the list and summary. - Avoid
showing a successful action until the server confirms it.

## 2. API Contract

Base path: `/api`

### `POST /api/auth/request-otp`

Request:

``` json
{
  "phone": "+919876543210"
}
```

Success response:

``` json
{
  "message": "If the phone number is valid, an OTP has been generated."
}
```

The actual OTP is printed only in the server log during development. Do
not log access tokens.

### `POST /api/auth/verify-otp`

Request:

``` json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

Success response:

``` json
{
  "token": "<signed-access-token>",
  "user": {
    "id": "uuid",
    "phone": "+919876543210"
  }
}
```

### `GET /api/loans`

Requires `Authorization: Bearer <token>`.

Success response:

``` json
{
  "loans": [
    {
      "id": "uuid",
      "friendName": "Aman",
      "amount": "1500.00",
      "dueDate": "2026-10-20",
      "status": "outstanding",
      "createdAt": "2026-10-23T09:00:00.000Z",
      "repaidAt": null,
      "isOverdue": true
    }
  ]
}
```

The example is illustrative; runtime values must come from PostgreSQL
and the API.

### `POST /api/loans`

Requires authentication.

Request:

``` json
{
  "friendName": "Aman",
  "amount": 1500,
  "dueDate": "2026-10-20"
}
```

Success: `201 Created`, with the created loan.

### `PATCH /api/loans/:id/repay`

Requires authentication.

Marks an outstanding loan belonging to the authenticated user as repaid.

Success: `200 OK`, with the updated loan. Return `404` if the loan does
not exist for that user. Return a documented conflict or idempotent
success for an already-repaid loan.

### `GET /api/summary`

Requires authentication.

Success response:

``` json
{
  "totalLent": "1500.00",
  "totalRepaid": "0.00",
  "overdueAmount": "1500.00",
  "currency": "INR"
}
```

Amounts may be serialized as decimal strings to avoid JavaScript
floating-point ambiguity. The mobile app may format them for display.

### `GET /api/health`

Returns a simple health status so local setup can be checked.

## 3. Data Model

### `users`

-   `id`: UUID primary key.
-   `phone`: unique phone number, normalized before storage.
-   `created_at`: timestamp with time zone.

### `loans`

-   `id`: UUID primary key.
-   `user_id`: UUID foreign key to `users.id`.
-   `friend_name`: non-empty text.
-   `amount`: `NUMERIC(12,2)`, must be greater than zero.
-   `due_date`: `DATE`.
-   `status`: constrained to `outstanding` or `repaid`.
-   `created_at`: timestamp with time zone.
-   `repaid_at`: nullable timestamp with time zone.

Indexes: - `users.phone` unique index. - `loans(user_id, due_date)`. -
`loans(user_id, status)`.

### Mock OTP storage

Keep OTP records in a separate table or a small in-memory development
store with phone, hashed OTP, expiry, and consumed status. A
database-backed store is more reliable across server restarts; a simple
in-memory store is acceptable for a small local demo if documented.
Never store OTPs indefinitely.

## 4. Validation and Error Handling

-   Phone number: trim whitespace and validate a reasonable
    international format; normalize consistently.
-   OTP: exactly six numeric digits; reject invalid or expired codes.
-   Friend name: trim whitespace; reject empty values and enforce a
    sensible maximum length (e.g. 100 characters).
-   Amount: numeric, finite, and greater than zero; reject malformed
    values and excessive precision beyond two decimal places.
-   Due date: valid ISO calendar date (`YYYY-MM-DD`).
-   IDs: validate UUID format.
-   Authentication: reject missing or invalid tokens with `401`.
-   Authorization: never return or modify another user's loans.
-   Use parameterized SQL queries to prevent SQL injection.
-   Return consistent JSON errors without stack traces or secrets.

Suggested error format:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than zero."
  }
}
```

## 5. Environment Variables

Backend `.env` (do not commit it): - `PORT` - `DATABASE_URL` -
`JWT_SECRET` - `OTP_TTL_MINUTES` - `NODE_ENV`

Commit `.env.example` with placeholder values only. Never commit real
secrets.

## 6. Non-Functional Requirements

-   TypeScript strict mode should be enabled where practical.
-   Keep API routes, validation, database access, and business logic
    separated into understandable modules.
-   Use environment variables for configuration.
-   Include database initialization/migration instructions.
-   Include basic tests for validation, summary calculations, OTP
    expiry/verification, and loan repayment.
-   The app must show useful feedback for network failures.
-   Do not expose the backend directly to the public internet for the
    local demo.
-   Do not store the access token in plain, persistent storage without
    considering the platform's secure-storage option. Use
    Expo-compatible secure storage if it fits the selected Expo
    workflow; otherwise document the demo limitation.
