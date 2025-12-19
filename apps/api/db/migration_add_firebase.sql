-- Add firebase_uid column for Google OAuth users
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;

-- Make password_hash nullable (Google OAuth users don't have passwords)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Add unique constraint on firebase_uid
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;

