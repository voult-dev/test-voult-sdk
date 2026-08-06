import { describe, it, expect } from 'vitest';
import {
  sanitizeUserProfile,
  sanitizeAuditLogs,
  sanitizeGetResponse,
} from '../../src/utils/sanitizeResponse.js';

describe('sanitizeUserProfile', () => {
  it('keeps public profile fields and removes internal ids', () => {
    const profile = sanitizeUserProfile({
      id: 'user_123',
      email: 'dev@example.com',
      app: 'app_secret',
      appId: 'app_secret',
      fullName: 'Dev User',
      isEmailVerified: true,
      passwordHash: 'hidden',
      tokenVersion: 2,
      createdAt: '2024-01-01T00:00:00.000Z',
    });

    expect(profile).toEqual({
      email: 'dev@example.com',
      fullName: 'Dev User',
      name: 'Dev User',
      isEmailVerified: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    expect(profile.id).toBeUndefined();
  });
});

describe('sanitizeAuditLogs', () => {
  it('returns user-visible audit fields only', () => {
    const payload = sanitizeAuditLogs({
      total: 1,
      limit: 50,
      skip: 0,
      logs: [
        {
          _id: 'log_1',
          appId: 'app_secret',
          userId: 'user_1',
          action: 'LOGIN',
          status: 'SUCCESS',
          riskLevel: 'LOW',
          timestamp: '2024-01-01T00:00:00.000Z',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          details: { method: 'email' },
        },
      ],
    });

    expect(payload.logs[0]).toEqual({
      action: 'LOGIN',
      status: 'SUCCESS',
      riskLevel: 'LOW',
      timestamp: '2024-01-01T00:00:00.000Z',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      details: { method: 'email' },
    });
  });
});

describe('sanitizeGetResponse', () => {
  it('sanitizes session payloads', () => {
    expect(
      sanitizeGetResponse('auth/session', {
        authenticated: true,
        mfaPending: false,
        user: { email: 'a@b.com', app: 'secret' },
      }),
    ).toEqual({
      authenticated: true,
      mfaPending: false,
      user: { email: 'a@b.com' },
    });
  });
});
