CREATE TABLE IF NOT EXISTS donations (
  order_code INTEGER PRIMARY KEY,
  amount INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL,
  anonymous INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  payment_link_id TEXT,
  payos_reference TEXT,
  created_at TEXT NOT NULL,
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_donations_public ON donations (status, paid_at);

CREATE TABLE IF NOT EXISTS create_attempts (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_ip ON create_attempts (ip_hash, created_at);

-- Frontend /admin settings (donation site on/off).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Simple username + password auth for the frontend /admin page.
CREATE TABLE IF NOT EXISTS admin_users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_exp ON admin_sessions (expires_at);

-- Audit columns from the PayOS webhook (donor bank info for later review).
-- Never exposed on the public wall; only on the admin API.
ALTER TABLE donations ADD COLUMN payos_account_number TEXT;
ALTER TABLE donations ADD COLUMN payos_transaction_time TEXT;
ALTER TABLE donations ADD COLUMN payos_description TEXT;
ALTER TABLE donations ADD COLUMN payos_currency TEXT;
ALTER TABLE donations ADD COLUMN counter_account_bank_id TEXT;
ALTER TABLE donations ADD COLUMN counter_account_bank_name TEXT;
ALTER TABLE donations ADD COLUMN counter_account_name TEXT;
ALTER TABLE donations ADD COLUMN counter_account_number TEXT;
ALTER TABLE donations ADD COLUMN virtual_account_name TEXT;
ALTER TABLE donations ADD COLUMN virtual_account_number TEXT;

-- Message visibility flag (independent of payment status).
ALTER TABLE donations ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;

-- One-time, safe to re-run. Legacy statuses fold into pending/success.
UPDATE donations SET hidden = 1, status = 'success' WHERE status = 'hidden';
UPDATE donations SET status = 'success' WHERE status IN ('paid', 'published');
UPDATE donations SET status = 'pending' WHERE status = 'cancelled';

-- Covering index: public/admin totals (SUM/COUNT of success gifts) read the
-- index only, not full donation rows. Safe to re-run.
CREATE INDEX IF NOT EXISTS idx_donations_success_amount ON donations (status, amount);

CREATE INDEX IF NOT EXISTS idx_donations_created ON donations (created_at);

-- Manual business-deal ledger (migration 0005). Never shown on the message
-- wall; only `received` rows count toward the public fundraising total.
CREATE TABLE IF NOT EXISTS business_deals (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  tax_code TEXT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_business_deals_status_amount
  ON business_deals (status, amount);

-- Migrations 0004 (gift) and 0006 (wall sticker).
ALTER TABLE donations ADD COLUMN gift_id TEXT;
ALTER TABLE donations ADD COLUMN gift_qty INTEGER;
ALTER TABLE donations ADD COLUMN sticker TEXT;
