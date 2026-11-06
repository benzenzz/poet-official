# Donation wall — implementation plan

Branch: `feat/donation`. Do not commit. Do not push. Do not print secret values.

POET is a static GitHub Pages site (`index.html`, `team/index.html`, `dong-hanh/index.html`, `style.css`, `app.js`). Add an individual donation page. Corporate Đồng hành packages stay as they are. Desktop “Đồng hành” links that are commented out stay commented out.

## Policy

A paid gift is stored, then shown on the site only after an admin publishes it. The public wall shows display name (or “Ẩn danh”), message, amount, and paid time. The browser never marks a gift as paid. The PayOS return URL is a receipt screen only.

## Secrets

Read `/Users/phu.mai/Projects/poet/.env`. It already has `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, and `PAYOS_CHECKSUM_KEY`. `.env` is gitignored. Never echo those values, never write them into source, wrangler.toml, logs, or this plan.

Generate `ADMIN_TOKEN` as 32 random bytes, hex-encoded. Write it only to `/Users/phu.mai/Projects/poet/.admin-token` (mode 0600) and store the same value as a Worker secret. Add `.admin-token` to `.gitignore`. The existing `.gitignore` only lists `.env`; keep that line.

`ADMIN_TOKEN` is kept only as a fallback credential. The admin UI lives on the
static site at `admin/` (see below) and normally logs in with username +
password (`admin_users` table, default `admin` / `admin`, session tokens in
`admin_sessions`, 12h expiry). A `Bearer <ADMIN_TOKEN>` header still passes
`authorizeAdmin` as a legacy session so the transition never locks anyone out.

## Cloudflare resources

Account id: `aa1bf2458466672a05bfa5f7ad34cac2`.

The Cloudflare MCP OAuth grant is read-only. Writes through `cloudflare__execute` return error 10000. Do not use it for creates, uploads, or secrets.

Wrangler is already logged in as maiphh29@gmail.com with `workers_scripts:write` and `d1:write`. Credentials are in `/Users/phu.mai/Library/Preferences/.wrangler/config/default.toml`. Use `npx wrangler@4` from this repo. Never print `oauth_token` or `refresh_token`.

These resources already exist. Do not create them again:

- workers.dev subdomain: `lucasmai` (account subdomain; previously `poet-ung-ho`, renamed on Cloudflare's side).
- D1 database name: `poet-donations`
- D1 database id: `824e865d-428f-4fe2-aa68-a097809ba78c`

Worker URL: `https://poet-donations.lucasmai.workers.dev`. The front-end reads it from one place only: root `config.js` (`window.POET_API_BASE`), which `ung-ho/donate.js`, `ung-ho/result.js`, `ung-ho/checkout.js` (v2 bridge) and `admin/admin.js` consume.

1. Apply `worker/schema.sql` with `npx wrangler@4 d1 execute poet-donations --remote --file worker/schema.sql`.
2. Put the real database id in `worker/wrangler.toml`.
3. Deploy with `npx wrangler@4 deploy` from `worker/`. Set `ALLOWED_ORIGIN` as a plain-text var in wrangler.toml: `https://maiphh.github.io`.
4. Set secrets with `npx wrangler@4 secret put`, reading values from `.env` and the generated admin token via stdin. Never pass secrets as process arguments that show up in `ps`, and never echo them.
5. Enable the workers.dev route if deploy does not do it: `POST /accounts/{account_id}/workers/scripts/poet-donations/subdomain` with `{ "enabled": true, "previews_enabled": false }`, using the Wrangler OAuth token.

Worker URL becomes `https://poet-donations.<subdomain>.workers.dev`. Put that origin in the static page as `API_BASE`. No trailing slash.

## Files to add

- `worker/schema.sql`
- `worker/src/payos.js` — signature, PayOS HTTP, no I/O besides `fetch`
- `worker/src/index.js` — fetch handler
- `worker/wrangler.toml` — name `poet-donations`, main `src/index.js`, compatibility_date `2026-01-01`, D1 binding `DB` with `database_name = "poet-donations"` and the real `database_id`. No secrets in this file.
- `worker/test/signature.test.mjs` — node:test, no dependencies
- `ung-ho/index.html`
- `ung-ho/donate.js`
- `admin/index.html`
- `admin/admin.js`
- Append donation styles to `style.css`. Do not restyle existing pages.
- Add an “Ủng hộ” link in the header, mobile nav, and footer of `index.html`, `team/index.html`, and `dong-hanh/index.html`. Match each file’s relative paths (`ung-ho/index.html` from the root, `../ung-ho/index.html` from nested pages).

## Schema

```sql
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
```

`status` is one of `pending`, `paid`, `published`, `hidden`, `cancelled`. The public wall only sees `published`. The webhook stores PayOS audit fields on each paid row (`payos_account_number`, `payos_reference`, `payos_transaction_time`, `payos_description`, `payos_currency`, `counter_account_bank_id/name`, `counter_account_bank_name`, `counter_account_number`, `virtual_account_name/number`) for later review in the admin UI. These fields are admin-only and never appear on the public wall. Do not store the raw IP (rate limiting keeps only an HMAC prefix).

## PayOS

Base URL: `https://api-merchant.payos.vn`.

Headers on merchant calls: `x-client-id`, `x-api-key`, `Content-Type: application/json`.

### Create link

`POST /v2/payment-requests`.

- `orderCode`: random integer from 100000000 through 999999999. Retry on primary-key conflict. Do not use `Date.now()` (it exceeds int32 and is guessable).
- `amount`: integer VND, min 10000, max 20000000.
- `description`: the 9-digit `orderCode` as a string (e.g. `482917364`). Unique per gift, fits the 9-character limit on unlinked PayOS accounts, and is what you search for later in the bank app or sao ke. The donor message never goes in this field.
- `returnUrl`: `https://<worker-host>/return`
- `cancelUrl`: `https://<worker-host>/cancel`
- `expiredAt`: unix seconds, now + 30 minutes, must fit in int32.
- `items`: one item, name `Ung ho POET`, quantity 1, price = amount.
- `signature`: HMAC-SHA256 hex of the alphabetically sorted string `amount=$amount&cancelUrl=$cancelUrl&description=$description&orderCode=$orderCode&returnUrl=$returnUrl`. Do not URL-encode. This is the payment-requests signature, not the payouts signature.

Verify the response `signature` over the response `data` object with the same webhook algorithm below. If `code` is not `"00"` or the signature does not match, insert nothing and return 502. On success, insert `pending` with `payment_link_id` and return only `{ orderCode, checkoutUrl }` to the browser.

### Webhook

`POST /api/webhooks/payos`.

PayOS signature algorithm (payment-requests / webhooks, from https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/):

- Sort the `data` object keys alphabetically.
- Skip keys whose value is `undefined`.
- `null` becomes an empty string.
- Join `key=value` with `&`. Numbers stringify in base 10 with no quotes. Do not URL-encode.
- HMAC-SHA256 with the checksum key, hex digest.
- Compare to the provided signature in constant time.

Official test vector, which the unit test must accept:

- checksum key `1a54716c8f0efb2744fb28b6e38b25da7f67a925d98bc1c18bd8faaecadd7675`
- data: orderCode 123, amount 3000, description `VQRIO123`, accountNumber `12345678`, reference `TF230204212323`, transactionDateTime `2023-02-04 18:25:00`, currency `VND`, paymentLinkId `124c33293c43417ab7879e14c8d9eb18`, code `00`, desc `Thành công`, and the six counter/virtual account fields as empty strings
- expected signature `412e915d2871504ed31be63c8f62a149a4410d34c4c42affc9006ef9917eaa03`

Handler rules:

- Invalid JSON or bad signature: HTTP 400. Do not update the database.
- Valid signature but unknown `orderCode`: HTTP 200. PayOS sends orderCode 123 while confirming the webhook URL.
- Valid signature, known order, `success === true`, outer `code === "00"`, `data.code === "00"`, and `data.amount` equals the stored amount: set `pending` or `cancelled` to `paid`, store `payos_reference` from `data.reference`, set `paid_at` to ISO time. If status is already `paid`, `published`, or `hidden`, leave the row unchanged. HTTP 200.
- Valid signature but amount or success code does not match: do not change status. HTTP 200 so PayOS stops retrying a payload that will never match.
- Never read or store `accountNumber`, `counterAccount*`, or `virtualAccount*`.

After the Worker is publicly reachable, `POST /confirm-webhook` with `{ "webhookUrl": "https://<worker-host>/api/webhooks/payos" }`. This call makes PayOS send the sample webhook. The sample must get HTTP 200.

### Cancel a link

`POST /v2/payment-requests/{orderCode}/cancel` with `{ "cancellationReason": "test" }`. Used only by the deploy check below.

## Worker routes

All JSON errors are `{ "error": "..." }` in Vietnamese, with the right status code.

| Method and path | Behavior |
| --- | --- |
| `POST /api/donations` | Create a pending gift and a PayOS link. Refused with 403 while donations are turned off. |
| `GET /api/donations` | Published wall. |
| `GET /api/settings` | Public site flag: `{ donationsEnabled }`. |
| `GET /api/donations/:orderCode` | Status only, for the receipt page. |
| `POST /api/webhooks/payos` | PayOS webhook. Stores donor/receiver bank audit fields on success. |
| `GET /return` and `GET /cancel` | Small HTML receipt pages. |
| `POST /api/admin/login` | Username + password login, returns a 12h session token. Seeds default `admin` / `admin` on first use. |
| `GET /api/admin/me` | Session check, returns `{ username }`. |
| `POST /api/admin/logout` | Drop the current session. |
| `POST /api/admin/change-password` | `{ currentPassword, newPassword }`, drops other sessions. |
| `GET /api/admin/settings` | Read the on/off flag and the public business count. |
| `POST /api/admin/settings` | `{ donationsEnabled }` and/or `{ businessCount }` — turn the donation site on/off; set the business count shown publicly as `fundraising.businessCount`. |
| `GET /api/admin/donations` | Full donate history (all statuses, newest first, max 200) with bank audit fields. |
| `POST /api/admin/donations/:orderCode/publish` | `paid` or `hidden` becomes `published`. |
| `POST /api/admin/donations/:orderCode/hide` | `published` or `paid` becomes `hidden`. |
| `GET /admin` | Gone (410) — the admin UI moved to the static site at `admin/`. |

Admin API requires header `Authorization: Bearer <session-token>` (or the legacy `ADMIN_TOKEN`), compared in constant time. Missing or wrong token: 401.

CORS on `/api/*` for browser routes: allow origin `ALLOWED_ORIGIN` only, methods `GET, POST`, header `Content-Type` and `Authorization`, `Access-Control-Max-Age: 86400`. Reject other origins with 403 and no ACAO header. Webhook and admin HTML are not CORS requests. Do not use `*`.

`POST /api/donations` body: `{ amount, displayName, message, anonymous }`.

- `amount` must be an integer in range. Presets the page sends: 50000, 100000, 200000, 500000, 1000000. Custom amounts are allowed inside the range.
- `anonymous` boolean. If true, store display name `Ẩn danh` and ignore `displayName`.
- Otherwise `displayName` is 1–40 characters after trim.
- `message` is 1–160 characters after trim.
- Reject control characters, `<`, `>`, and any string matching `https?://` or `www.`.
- Rate limit: HMAC-SHA256 of `CF-Connecting-IP` with the checksum key, store the hex prefix (32 chars) in `create_attempts`. Refuse when that hash has 5 rows in the last hour (HTTP 429). Delete that hash’s rows older than 2 hours on each attempt. Missing IP: HTTP 400.

`GET /api/donations` returns at most 30 published rows, newest `paid_at` first: `{ donations: [{ displayName, message, amount, paidAt }] }`. `Cache-Control: public, max-age=30`. No payment link ids, no order codes.

`GET /api/donations/:orderCode` returns `{ status }` only. Unknown code: 404.

Admin API requires header `Authorization: Bearer <ADMIN_TOKEN>`, compared in constant time. Missing or wrong token: 401.

`GET /return` and `GET /cancel` read PayOS query params (`orderCode`, `status`, `cancel`) and show Vietnamese copy. Return page says the gift is recorded and will appear after it is reviewed. It may fetch `GET /api/donations/:orderCode` and show `pending`, `paid`, or `published`. It must not tell the user the gift is published unless status is `published`. Both pages link to `https://maiphh.github.io/poet/ung-ho/`. Keep the HTML inside the Worker, with no external assets.

`admin/index.html` + `admin/admin.js` is the admin UI on the static site (not linked from the public nav): username + password login (default `admin` / `admin`, stored in `sessionStorage` as a session token), an on/off toggle for the donation site, full donate history with bank audit fields plus publish / hide buttons, and a change-password form. New rules live under `.admin` in `style.css`.

## Static page

`ung-ho/index.html` uses the same head, header, and footer pattern as `team/index.html` (relative paths `../`). Page title `Ủng hộ — POET`. Copy in Vietnamese, same voice as the homepage: short, warm, no corporate language.

Sections:

1. Page hero. Say this is a gift to POET, the name and message are shown after review, and an anonymous option exists.
2. A form: amount presets plus a custom VND input, display name, message, anonymous checkbox, submit. Submitting disables the button, POSTs to the Worker, then sets `location` to `checkoutUrl`.
3. A wall of published gifts, loaded from `GET /api/donations`. Empty state: “Chưa có lời nhắn nào được đăng.”
4. If the page is opened with `?result=return` or `?result=cancel` it does not need to; the receipt pages live on the Worker.

Render names and messages with `textContent` only. No `innerHTML` of user data.

Match existing classes (`page-hero`, `section-kicker`, `button`, `button-purple`, `container`). New rules live under `.donate` in `style.css` and must work at 375px and at desktop width. Inputs use the existing ink, paper, and outline colors.

`app.js` already rewrites `index.html` links on GitHub Pages. Keep donation links as `ung-ho/index.html` so that rewrite still works.

## Deploy check

Run `node --test worker/test/signature.test.mjs` and make it pass before upload.

After deploy, without printing secrets:

1. `GET /api/donations` returns `{ "donations": [] }`.
2. `POST /confirm-webhook` returns code `00`.
3. Create one real payment link for 10000 VND with display name `Kiem tra` and message `Thu nghiem`, then cancel it with the cancel API. Confirm the row exists as `pending` or `cancelled` and is absent from `GET /api/donations`.
4. `GET /admin` returns 410 (admin UI moved to the static site). A request to the admin list without a token returns 401. `POST /api/admin/login` with `admin` / `admin` returns a session token on first use.

If `wrangler deploy` or `wrangler d1 execute` fails, stop and report the error with secrets redacted. Do not fall back to the Cloudflare MCP.

## Out of scope

No Git commit, no push, no PayOS payouts, no email, no donor accounts, no changes to the Đồng hành package data in `app.js`.
