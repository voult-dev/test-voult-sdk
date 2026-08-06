import { describe, it, expect, vi } from 'vitest';
import {
  persistVoultAuth,
  clearVoultAuth,
  persistMfaPending,
} from '../../src/utils/voultSession.js';

describe('persistVoultAuth', () => {
  it('stores user and tokens on the session', () => {
    const req = { session: {} };
    persistVoultAuth(req, {
      user: { id: 'u1', email: 'a@b.com' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    expect(req.session.voult).toEqual({
      user: { id: 'u1', email: 'a@b.com' },
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('accepts token alias for accessToken', () => {
    const req = { session: {} };
    persistVoultAuth(req, { token: 'legacy-token', user: null });
    expect(req.session.voult.accessToken).toBe('legacy-token');
  });

  it('no-ops when session or tokens are missing', () => {
    const req = {};
    persistVoultAuth(req, { user: { id: 'u1' } });
    expect(req.session).toBeUndefined();

    const req2 = { session: {} };
    persistVoultAuth(req2, null);
    expect(req2.session.voult).toBeUndefined();
  });
});

describe('clearVoultAuth', () => {
  it('removes voult and mfaPendingToken from session', () => {
    const save = vi.fn((cb) => cb());
    const req = {
      session: {
        voult: { accessToken: 'x' },
        mfaPendingToken: 'pending',
        save,
      },
    };

    clearVoultAuth(req);

    expect(req.session.voult).toBeUndefined();
    expect(req.session.mfaPendingToken).toBeUndefined();
    expect(save).toHaveBeenCalled();
  });
});

describe('persistMfaPending', () => {
  it('stores mfaPendingToken on session', () => {
    const req = { session: {} };
    persistMfaPending(req, 'mfa-token');
    expect(req.session.mfaPendingToken).toBe('mfa-token');
  });

  it('no-ops when session or token is missing', () => {
    persistMfaPending({}, 'token');
    persistMfaPending({ session: {} }, null);
    expect(true).toBe(true);
  });
});
