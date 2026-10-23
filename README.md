# MiniLedger

MiniLedger is an Expo React Native app and Express/PostgreSQL API for tracking money lent to friends.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 14+
- Expo Go on an Android device (phone and computer on the same Wi-Fi)

## Quick start

1. Create a `miniledger` PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` and a strong `JWT_SECRET`.
3. Install and prepare the API:

   ```sh
   cd backend
   npm install
   npm run migrate
   npm run dev
   ```

4. In another terminal, start the Expo application:

   ```sh
   cd mobile
   npm install
   npm start
   ```

Set `mobile/src/config.ts` to the computer's reachable LAN IP before opening the app in Expo Go.

## Database setup

Create the database (using a PostgreSQL administrator account):

```sql
CREATE DATABASE miniledger;
```

The migration creates `users`, `otp_challenges`, and `loans`, including indexes and database checks. It is safe to run the provided initial migration again because it uses `IF NOT EXISTS`.

## Backend environment

Copy `backend/.env.example` to `backend/.env`. These variables are required:

| Variable | Meaning |
| --- | --- |
| `PORT` | HTTP port (default `3000`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | long random signing secret |
| `OTP_TTL_MINUTES` | mock OTP lifetime (default `5`) |
| `NODE_ENV` | set to `development` locally |

Never commit `backend/.env`. The app deliberately does not expose either its JWT secret or database credentials.

## API

- `GET /api/health`
- `POST /api/auth/request-otp` — request body: `{ "phone": "+919876543210" }`
- `POST /api/auth/verify-otp` — request body: `{ "phone": "+919876543210", "otp": "123456" }`
- `GET /api/loans` — bearer token required
- `POST /api/loans` — bearer token required; `{ "friendName": "Aman", "amount": 1500, "dueDate": "2026-10-20" }`
- `PATCH /api/loans/:id/repay` — bearer token required
- `GET /api/summary` — bearer token required

Errors use `{ "error": { "code": "…", "message": "…" } }`. Amounts are strings in responses so decimal money values do not lose precision in JavaScript.

## OTP demo boundary

The API creates a six-digit OTP, stores only a hash, gives it a configurable expiry, and marks it consumed after successful verification. In development it prints the OTP in the backend terminal only; the API response never includes it. This is intentionally a local demo, not production authentication.

## Running on Android

Find the laptop's Wi-Fi IPv4 address (for example with `ipconfig` on Windows) and replace the placeholder in `mobile/src/config.ts` with it. Start `npm start` in `mobile`, scan the Expo QR code with Expo Go, and ensure the phone and laptop are on the same Wi-Fi network. If connection fails, allow the selected backend port through Windows Firewall on the private network.

Tokens are stored with Expo SecureStore rather than plain persistent storage.

## Tests

```sh
cd backend
npm test
npm run typecheck
```

The included tests cover phone/OTP and loan validation plus the overdue rule, including the important fact that a loan due today is not overdue. API integration tests require a configured disposable PostgreSQL database; run the migration before exercising routes with Postman or another HTTP client.

## Commands

- `npm run migrate` — apply the PostgreSQL schema.
- `npm run dev` — run the backend in watch mode.
- `npm test` — run backend tests.
- `npm run typecheck` — type-check the backend.

The OTP is a development-only value printed to the backend terminal. It is never included in the API response.
