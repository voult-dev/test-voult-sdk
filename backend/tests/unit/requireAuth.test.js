import { describe, it, expect, vi } from 'vitest';
import requireAuth from '../../src/middleware/requireAuth.js';

function createMocks() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status };
  const next = vi.fn();
  return { res, status, json, next };
}

describe('requireAuth', () => {
  it('returns 401 when session has no access token', () => {
    const req = { session: {} };
    const { res, status, json, next } = createMocks();

    requireAuth(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Sign in first to perform that action.',
        status: 401,
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when access token is present', () => {
    const req = { session: { voult: { accessToken: 'token' } } };
    const { res, next } = createMocks();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
