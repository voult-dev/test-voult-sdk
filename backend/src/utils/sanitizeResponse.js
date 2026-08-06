const SENSITIVE_KEYS = new Set([
  'app',
  'appId',
  'clientId',
  'clientSecret',
  '_id',
  '__v',
  'passwordHash',
  'tokenHash',
  'mfaSecret',
  'mfaBackupCodes',
  'mfaPendingSecret',
  'mfaPendingBackupCodes',
  'emailVerificationToken',
  'emailVerificationExpires',
  'resetPasswordToken',
  'resetPasswordExpires',
  'tokenVersion',
  'endUser',
  'linkedProviders',
  'userId',
  'replacedByTokenHash',
  'refreshToken',
  'accessToken',
  'mfaPendingToken',
]);

const USER_PROFILE_KEYS = new Set([
  'email',
  'username',
  'fullName',
  'name',
  'isEmailVerified',
  'createdAt',
  'updatedAt',
  'failedLoginAttempts',
  'isLocked',
  'lastLoginAt',
  'mfaEnabled',
]);

const AUDIT_LOG_KEYS = new Set([
  'action',
  'status',
  'riskLevel',
  'timestamp',
  'details',
  'ipAddress',
  'userAgent',
]);

const SESSION_KEYS = new Set([
  'id',
  'ipAddress',
  'userAgent',
  'createdAt',
  'lastUsedAt',
  'expiresAt',
]);

const OAUTH_ACCOUNT_KEYS = new Set([
  'provider',
  'avatar',
  'name',
  'email',
  'linkedAt',
]);

const PASSKEY_KEYS = new Set([
  'id',
  'deviceName',
  'createdAt',
  'lastUsedAt',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
}

function pickAllowedKeys(source, allowedKeys) {
  if (!isPlainObject(source)) return source;

  const picked = {};
  for (const key of allowedKeys) {
    if (key in source && source[key] !== undefined) {
      picked[key] = source[key];
    }
  }
  return picked;
}

function sanitizeUnknown(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sanitizeUnknown);
  if (!isPlainObject(value)) return value;

  const sanitized = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) continue;
    sanitized[key] = sanitizeUnknown(nestedValue);
  }
  return sanitized;
}

export function sanitizeUserProfile(user) {
  if (!user) return null;

  const profile = pickAllowedKeys(user, USER_PROFILE_KEYS);
  if (profile.fullName && !profile.name) {
    profile.name = profile.fullName;
  }

  return profile;
}

export function sanitizeAuditLogs(payload) {
  if (!isPlainObject(payload)) return payload;

  return {
    total: payload.total,
    limit: payload.limit,
    skip: payload.skip,
    logs: Array.isArray(payload.logs)
      ? payload.logs.map((log) => pickAllowedKeys(log, AUDIT_LOG_KEYS))
      : [],
  };
}

export function sanitizeSessions(payload) {
  if (!isPlainObject(payload)) return payload;

  return {
    sessions: Array.isArray(payload.sessions)
      ? payload.sessions.map((session) => pickAllowedKeys(session, SESSION_KEYS))
      : [],
  };
}

export function sanitizeOAuthAccounts(payload) {
  if (!isPlainObject(payload)) return payload;

  return {
    providers: Array.isArray(payload.providers)
      ? payload.providers.map((account) => pickAllowedKeys(account, OAUTH_ACCOUNT_KEYS))
      : payload.providers,
  };
}

export function sanitizePasskeys(payload) {
  if (Array.isArray(payload)) {
    return payload.map((passkey) => pickAllowedKeys(passkey, PASSKEY_KEYS));
  }

  if (isPlainObject(payload) && Array.isArray(payload.credentials)) {
    return {
      ...payload,
      credentials: payload.credentials.map((passkey) => pickAllowedKeys(passkey, PASSKEY_KEYS)),
    };
  }

  return sanitizeUnknown(payload);
}

export function sanitizeGetResponse(routeKey, payload) {
  if (payload === null || payload === undefined) return payload;

  switch (routeKey) {
    case 'auth/session':
      return {
        authenticated: Boolean(payload.authenticated),
        mfaPending: Boolean(payload.mfaPending),
        user: sanitizeUserProfile(payload.user),
      };
    case 'user/me':
      return sanitizeUserProfile(payload);
    case 'audit-logs/me':
      return sanitizeAuditLogs(payload);
    case 'sessions':
      return sanitizeSessions(payload);
    case 'me/oauth-accounts':
      return sanitizeOAuthAccounts(payload);
    case 'auth/webauthn/credentials':
      return sanitizePasskeys(payload);
    case 'provider-visibility':
    case 'oauth/config':
    case 'auth/webauthn/compatibility':
    case 'auth/mfa/status':
      return sanitizeUnknown(payload);
    default:
      return sanitizeUnknown(payload);
  }
}

export function sendSanitizedGet(res, routeKey, payload) {
  res.json(sanitizeGetResponse(routeKey, payload));
}
