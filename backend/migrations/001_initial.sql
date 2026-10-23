CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS otp_challenges_phone_idx ON otp_challenges(phone, created_at DESC);

CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_name VARCHAR(100) NOT NULL CHECK (length(trim(friend_name)) > 0),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'outstanding' CHECK (status IN ('outstanding', 'repaid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  repaid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS loans_user_due_date_idx ON loans(user_id, due_date);
CREATE INDEX IF NOT EXISTS loans_user_status_idx ON loans(user_id, status);

