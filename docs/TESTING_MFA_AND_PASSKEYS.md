# Testing MFA & Passkeys in the Playground

This guide walks through testing **TOTP MFA** and **WebAuthn passkeys** using the Voult Auth Playground UI. Both features proxy through the playground BFF (`localhost:2000`) to the Voult API (`VOULT_BASE_URL`).

## Prerequisites

### 1. Run all services

```bash
# Terminal 1 — Voult API (default port 3000)
cd ../voult && npm run dev

# Terminal 2 — Playground (frontend + BFF)
cd voult_playground && npm run dev
```

| Service | URL |
|---------|-----|
| Playground UI | http://localhost:5173 |
| Playground BFF | http://localhost:2000/api |
| Voult API | http://localhost:3000 (or your `VOULT_BASE_URL`) |

### 2. Configure `backend/.env`

Minimum required:

```bash
PORT=2000
VOULT_BASE_URL=http://localhost:3000/
APP_BASE_URL=http://localhost:5173/
CLIENT_ID=app_...
CLIENT_SECRET=...
SESSION_SECRET=change-me
```

Use the **client ID and secret** from your Voult app dashboard.

### 3. Configure WebAuthn on the Voult API

Passkeys are verified in the **browser** on the playground origin, but Voult generates the WebAuthn challenges. Set these in **`../voult/.env`** (not the playground `.env`):

```bash
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:5173
WEBAUTHN_RP_NAME=Voult Playground
```

| Variable | Why it matters |
|----------|----------------|
| `WEBAUTHN_RP_ID` | Must match the browser hostname (`localhost`, not `127.0.0.1`) |
| `WEBAUTHN_ORIGIN` | Must exactly match where the React app runs (`http://localhost:5173`) |
| `WEBAUTHN_RP_NAME` | Label shown in Touch ID / Windows Hello prompts |

Restart the Voult API after changing these.

> **Important:** Open the playground at `http://localhost:5173`, not `http://127.0.0.1:5173`, unless you update `WEBAUTHN_ORIGIN` to match.

### 4. Have a test account

Create one via **Sign up** (`/signup`) or **OAuth** (`/oauth`).

- Password example that passes Voult rules: `Str0ng!Pass` (only `@$!%*?&` are allowed as special characters).
- **Passkey registration** requires a **verified email**. Easiest paths:
  - Sign in with **Google/GitHub OAuth** (email is verified automatically), or
  - After password signup, verify email on **Account** (`/account`) using the token from your verification email.

---

## Architecture (quick reference)

```
Browser (5173)  →  BFF /api/* (2000)  →  Voult /api/auth/* (3000)
                         ↑
                   session cookie stores
                   accessToken + mfaPendingToken
```

- The browser never sees `CLIENT_SECRET`.
- After login, the BFF stores Voult tokens in an **express-session** cookie.
- MFA step-up stores `mfaPendingToken` in the same session until you verify.

Playground pages:

| Page | Route | Purpose |
|------|-------|---------|
| MFA | `/mfa` | Enable/disable MFA, login step-up |
| Passkeys | `/passkeys` | Register, sign in, manage passkeys |
| Sign in | `/signin` | Password login (triggers MFA redirect) |

---

## Testing MFA (TOTP)

### Step 1 — Enable MFA on an account

1. Sign in at http://localhost:5173/signin (or use OAuth).
2. Confirm the sidebar shows **Authenticated**.
3. Go to **MFA** in the nav (`/mfa`).
4. Click **Start setup** → `POST /api/auth/mfa/setup`.
5. Scan the **QR code** with an authenticator app:
   - Google Authenticator, 1Password, Authy, etc.
   - Or enter the **secret** manually.
6. **Save the backup codes** shown on screen (only displayed once).
7. Enter the current **6-digit TOTP** from your app.
8. Click **Enable MFA** → `POST /api/auth/mfa/enable`.

Expected: response panel shows success; **Get MFA status** reports MFA enabled.

### Step 2 — Test login with MFA step-up

1. **Sign out** (sidebar button).
2. Go to **Sign in** and log in with the same email/password.
3. You should be redirected to **`/mfa`** automatically (sidebar shows **MFA required**).
4. On the **Login step-up** form:
   - Leave **MFA pending token** empty — the BFF already stored it in your session cookie.
   - Enter the **6-digit TOTP** (or a **backup code**).
5. Click **Verify MFA** → `POST /api/auth/mfa/verify`.

Expected: sidebar shows **Authenticated**; you receive a full Voult session (access + refresh tokens).

### Step 3 — Optional MFA operations

While signed in, on `/mfa`:

| Action | What to do |
|--------|------------|
| **Status** | Click **Get MFA status** |
| **Disable MFA** | Enter password + TOTP → **Disable MFA** |
| **Regenerate backup codes** | Enter current TOTP → **Regenerate** (invalidates old codes) |

### MFA troubleshooting

| Symptom | Fix |
|---------|-----|
| `INVALID_MFA_TOKEN` | Clock skew — sync device time; re-enter code |
| `INVALID_MFA_SESSION` / pending token expired | `mfaPendingToken` lasts **5 minutes** — sign in again from `/signin` |
| Enable/setup buttons disabled | Sign in first (sidebar must show Authenticated) |
| TOTP never prompted on login | Confirm MFA was enabled via **Get MFA status** |

---

## Testing Passkeys (WebAuthn)

All passkey flows live on **Passkeys** (`/passkeys`).

### Step 1 — Check compatibility

1. Open `/passkeys`.
2. Click **Check compatibility** → `GET /api/auth/webauthn/compatibility`.
3. Confirm the hint says **Browser WebAuthn: supported** (Chrome, Safari, Edge, Firefox).

Use a browser and OS that support platform authenticators (Touch ID, Windows Hello, etc.).

### Step 2 — Register a passkey

1. **Sign in** first (OAuth is easiest if email verification is a blocker).
2. On `/passkeys`, set a **Device name** (e.g. `MacBook Touch ID`).
3. Click **Register passkey**:
   - `POST /api/auth/webauthn/register/options` — Voult returns challenge options
   - Browser shows biometric/PIN prompt (`navigator.credentials.create`)
   - `POST /api/auth/webauthn/register/verify` — Voult stores the credential
4. Click **List passkeys** to confirm it appears.

### Step 3 — Sign in with a passkey

1. **Sign out**.
2. On `/passkeys`, optionally enter your **email hint** (helps Voult find the account).
3. Click **Sign in with passkey**:
   - `POST /api/auth/webauthn/login/options`
   - Browser passkey picker (`navigator.credentials.get`)
   - `POST /api/auth/webauthn/login/verify`
4. Sidebar should show **Authenticated**.

Passkey login **skips MFA** — the passkey replaces password + TOTP for that sign-in.

### Step 4 — Manage passkeys

While signed in on `/passkeys`:

| Action | How |
|--------|-----|
| **List** | **List passkeys** |
| **Delete** | Click **Delete** next to a credential |
| **Rename** | Paste credential **ID**, enter new name → **Rename passkey** |

### Passkey troubleshooting

| Symptom | Fix |
|---------|-----|
| `SecurityError` / ceremony fails immediately | Set `WEBAUTHN_RP_ID=localhost` and `WEBAUTHN_ORIGIN=http://localhost:5173` in **Voult** `.env`; restart Voult |
| Using `127.0.0.1` instead of `localhost` | Use `http://localhost:5173` or update `WEBAUTHN_ORIGIN` to match |
| `EMAIL_NOT_VERIFIED` on register | Verify email on `/account`, or sign in via OAuth first |
| Register button disabled | Sign in first |
| `WEBAUTHN_NOT_REGISTERED` on login | Register a passkey while authenticated |
| `WEBAUTHN_CHALLENGE_EXPIRED` | Retry — challenges expire after a short window |

---

## End-to-end test checklist

### MFA

- [ ] Sign up or sign in with a password account
- [ ] Enable MFA on `/mfa` (QR + backup codes saved)
- [ ] Sign out and sign in again → redirected to `/mfa`
- [ ] Complete step-up with TOTP (pending token field can stay empty)
- [ ] Confirm sidebar shows Authenticated
- [ ] (Optional) Sign in with a backup code instead of TOTP
- [ ] (Optional) Disable MFA and confirm login no longer requires step-up

### Passkeys

- [ ] Set `WEBAUTHN_*` vars in Voult `.env` and restart Voult
- [ ] Open playground at `http://localhost:5173`
- [ ] Sign in with a verified-email account
- [ ] Register a passkey on `/passkeys`
- [ ] Sign out and sign in with passkey only
- [ ] List, rename, and delete passkeys

---

## API routes (BFF proxy map)

The UI calls `/api/...` on the BFF, which proxies to Voult:

### MFA

| Playground BFF | Voult API |
|----------------|-----------|
| `POST /api/auth/mfa/setup` | `POST /api/auth/mfa/setup` |
| `POST /api/auth/mfa/enable` | `POST /api/auth/mfa/enable` |
| `POST /api/auth/mfa/verify` | `POST /api/auth/mfa/verify` |
| `GET /api/auth/mfa/status` | `GET /api/auth/mfa/status` |
| `POST /api/auth/mfa/disable` | `POST /api/auth/mfa/disable` |
| `POST /api/auth/mfa/backup-codes/regenerate` | `POST /api/auth/mfa/backup-codes/regenerate` |

### WebAuthn

| Playground BFF | Voult API |
|----------------|-----------|
| `GET /api/auth/webauthn/compatibility` | `GET /api/auth/webauthn/compatibility` |
| `POST /api/auth/webauthn/register/options` | `POST /api/auth/webauthn/register/options` |
| `POST /api/auth/webauthn/register/verify` | `POST /api/auth/webauthn/register/verify` |
| `POST /api/auth/webauthn/login/options` | `POST /api/auth/webauthn/login/options` |
| `POST /api/auth/webauthn/login/verify` | `POST /api/auth/webauthn/login/verify` |
| `GET /api/auth/webauthn/credentials` | `GET /api/auth/webauthn/credentials` |
| `PATCH /api/auth/webauthn/credentials/:id` | `PATCH /api/auth/webauthn/credentials/:id` |
| `DELETE /api/auth/webauthn/credentials/:id` | `DELETE /api/auth/webauthn/credentials/:id` |

Each response is also shown in the **Response panel** at the bottom of every playground page (raw JSON + errors).

---

## Further reading

- [MFA / TOTP integration guide](./information/MFA_TOTP_GUIDE.md) — how MFA works in Voult and how to integrate it in your own app
- [VOULT_AUTH.md](./integration/VOULT_AUTH.md) — full auth integration overview
- Voult repo: `docs/security_imp/WEBAUTHN_GUIDE.md` — WebAuthn internals and production notes
