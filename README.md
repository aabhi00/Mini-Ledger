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

## Commands

- `npm run migrate` — apply the PostgreSQL schema.
- `npm run dev` — run the backend in watch mode.
- `npm test` — run backend tests.
- `npm run typecheck` — type-check the backend.

The OTP is a development-only value printed to the backend terminal. It is never included in the API response.
