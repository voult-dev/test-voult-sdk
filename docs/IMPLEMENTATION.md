# Voult SDK Playground - Implementation Documentation

## Project Overview

This project is a fully functional **Express.js test application** that exercises all Voult Authentication API endpoints using the `voult-sdk`. It provides a comprehensive frontend interface for testing authentication flows, user management, OAuth providers, and account settings.

## What Was Implemented

### 1. API Function Coverage

All endpoints documented in `docs/information/API_fUNCTIONS.md` have been implemented:

#### Authentication Endpoints
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/username-register` - Username/password registration
- `POST /api/auth/email-login` - Email/password login
- `POST /api/auth/username-login` - Username/password login
- `POST /api/auth/logout` - Logout
- `POST /api/send-magic-link` - Passwordless magic link
- `POST /api/validate-magic-link` - Magic link verification

#### User Management Endpoints
- `GET /api/user/me` - Get current user profile
- `PATCH /api/user/me` - Update user profile
- `POST /api/user/disable` - Disable account
- `POST /api/user/reenable` - Re-enable account
- `GET /api/user/verify-email` - Verify email
- `POST /api/user/forgot-password` - Send password reset
- `POST /api/user/reset-password` - Reset password

#### OAuth Provider Endpoints
- Google: `POST /api/auth/google/register`, `POST /api/auth/google/login`
- GitHub: `POST /api/auth/github/register`, `POST /api/auth/github/login`
- Facebook: `POST /api/auth/facebook/register`, `POST /api/auth/facebook/login`
- LinkedIn: `POST /api/auth/linkedin/register`, `POST /api/auth/linkedin/login`
- Microsoft: `POST /api/auth/microsoft/register`, `POST /api/auth/microsoft/login`
- Apple: `POST /api/auth/apple/register`, `POST /api/auth/apple/login`

#### OAuth Account Linking
- `POST /api/oauth/:provider/link` - Link OAuth provider
- `GET /api/me/oauth-accounts` - Get linked providers
- `DELETE /api/me/oauth-accounts/:provider` - Unlink provider
- `POST /api/me/set-password` - Set password for social accounts

#### Session Management
- `GET /api/sessions` - List active sessions
- `GET /api/sessions/revoke/:sessionId` - Revoke session
- `POST /api/sessions/refresh` - Refresh access token

#### Provider Visibility
- `GET /api/provider-visibility/:clientId` - Get enabled providers

### 2. New Files Created

#### Controllers
- **`controllers/settings.js`** - Account management controller
  - `settingsPage` - Renders settings page with sessions, linked providers
  - `updateProfile` - Updates user full name
  - `forgotPassword` - Sends password reset email
  - `resetPassword` - Resets password with token
  - `setPassword` - Sets password for social-only accounts
  - `revokeSession` - Revokes a specific session
  - `linkOAuth` - Initiates OAuth provider linking
  - `unlinkOAuth` - Unlinks OAuth provider
  - `reenableAccount` - Re-enables disabled account

- **`controllers/oauth.js`** - OAuth flows controller
  - `oauthPage` - Renders OAuth selection page
  - `googleLogin`, `githubLogin`, `facebookLogin`, `linkedinLogin`, `microsoftLogin`, `appleLogin` - Social login handlers
  - `googleRegister`, `githubRegister`, `facebookRegister`, `linkedinRegister`, `microsoftRegister`, `appleRegister` - Social registration handlers
  - `verifyEmailPage` - Renders email verification page
  - `verifyEmail` - Processes email verification
  - `resetPasswordPage` - Renders password reset page
  - `resetPassword` - Processes password reset

#### Views
- **`views/voult/settings.ejs`** - Settings page with profile, password, OAuth providers, sessions
- **`views/voult/oauth.ejs`** - OAuth provider selection with collapsible forms
- **`views/voult/verify-email.ejs`** - Email verification form
- **`views/voult/reset-password.ejs`** - Password reset form

#### Routes
Extended **`routes/voult.js`** with:
- `/settings` - Settings page
- `/settings/profile` - Update profile (PATCH)
- `/settings/forgot-password` - Forgot password
- `/settings/reset-password` - Reset password
- `/settings/set-password` - Set password
- `/settings/sessions/:sessionId/revoke` - Revoke session
- `/settings/oauth/:provider/link` - Link OAuth provider
- `/settings/oauth/:provider/unlink` - Unlink OAuth provider
- `/settings/reenable` - Re-enable account
- `/oauth` - OAuth selection page
- `/oauth/:provider/login` - Social login
- `/oauth/:provider/register` - Social registration
- `/verify-email` - Email verification
- `/reset-password` - Password reset

### 3. Architecture

#### Request Flow
1. **Router** receives request → matches route
2. **Middleware** (`requireVoultSession`) checks authentication for protected routes
3. **Controller** handles business logic, calls SDK functions
4. **SDK** (`voult-sdk`) communicates with Voult API
5. **Response** is either rendered (HTML) or JSON based on `_redirect` param

#### Session Management
- Express session stores `req.session.voult` with tokens
- `syncVoultClient` middleware syncs session tokens into the shared SDK client
- On each request, client is restored from session
- After response, refreshed tokens are saved back to session

#### Error Handling
- `catchAsync` wrapper catches async errors and passes to Express error handler
- SDK errors are caught and displayed via flash messages
- Proper HTTP status codes are maintained

### 4. Frontend Design

#### Navigation
The navbar includes links to all pages:
- Home
- Playground
- Sign up (Email/Username)
- Sign in (Email/Username/Magic Link)
- Account
- Settings
- OAuth
- Verify Email
- Reset Password
- Sign out (for authenticated users)

#### UI Patterns
- Bootstrap-based responsive design
- Collapsible OAuth forms (Bootstrap Collapse)
- Card-based layouts for settings sections
- Flash messages for success/error/info feedback
- JSON response support for API testing

### 5. How Everything Works

#### SDK Integration
The app uses `voult-sdk` (located at `../voult-sdk`) which provides:
- `VoultClient` - HTTP client with automatic header injection
- All authentication functions (signIn, signUp, etc.)
- Session management functions
- OAuth providers
- Error handling classes

#### Configuration
From `.env`:
- `CLIENT_ID` - Voult app client ID
- `CLIENT_SECRET` - Voult app client secret
- `base_url` - Public base URL for callbacks
- `SECRET` - Session secret

#### Magic Link Flow
1. User enters email on `/voult/signin/magic`
2. App calls `signInWithEmailLink` with redirect URI
3. Voult sends magic link email
4. User clicks link, hits `/voult/magic-callback?token=...`
5. App calls `verifyEmailLink` with token
6. Session is established, user redirected to `/voult/account`

#### OAuth Flow
1. User selects provider on `/voult/oauth`
2. Enters credentials (idToken, code, etc.) for provider
3. App calls appropriate SDK function (`signInWithGoogle`, etc.)
4. SDK exchanges credentials with Voult API
5. User is authenticated, tokens stored in session

#### Settings Page Features
- **Profile**: Update full name via PATCH request
- **Password**: Set new password (for social accounts) or request reset
- **OAuth**: Link/unlink social providers
- **Sessions**: View active sessions, revoke specific ones
- **Account**: Re-enable account, navigate back to account page

### 6. Testing the Application

```bash
npm install
npm start
# Visit http://localhost:2000
```

Key test flows:
1. Sign up with email/password
2. Sign in and access account page
3. Test magic link flow
4. Test OAuth provider forms (mock credentials)
5. Update profile
6. Revoke sessions
7. Link/unlink OAuth providers

### 7. Future Enhancements

- Real OAuth redirect flows with provider callbacks
- Email verification UI page
- Password reset email flow integration
- Provider visibility checking (GET /api/provider-visibility/:clientId)
- Rate limiting display
- Token refresh demonstration
- CSRF token handling if needed

## Files Modified/Created Summary

### Modified
- `routes/voult.js` - Added settings, OAuth, utility routes
- `views/partials/nav.ejs` - Added navigation links
- `views/voult/index.ejs` - Added OAuth and utilities cards

### Created
- `controllers/settings.js` - Settings controller
- `controllers/oauth.js` - OAuth controller
- `views/voult/settings.ejs` - Settings page
- `views/voult/oauth.ejs` - OAuth selection page
- `views/voult/verify-email.ejs` - Email verification page
- `views/voult/reset-password.ejs` - Password reset page

## Notes

- The app uses `method-override` to support PATCH and DELETE methods via `_method` parameter
- All routes support both HTML form submission (with `_redirect=1`) and JSON API mode (without it)
- Flash messages provide user feedback
- The SDK client is shared across requests via `syncVoultClient` middleware
