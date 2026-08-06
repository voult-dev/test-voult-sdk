import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api.js';

describe('api', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('returns parsed JSON on success', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: '1' } }),
    });

    const data = await api('/auth/session');
    expect(data).toEqual({ user: { id: '1' } });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/session',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });

  it('sends JSON body for POST requests', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await api('/auth/register', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'Abcdef1!' },
    });

    expect(fetchMock.mock.calls[0][1].body).toBe(
      JSON.stringify({ email: 'a@b.com', password: 'Abcdef1!' }),
    );
  });

  it('throws enriched error when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      }),
    });

    await expect(api('/auth/mfa/status')).rejects.toMatchObject({
      message: 'Unauthorized',
      status: 401,
      code: 'UNAUTHORIZED',
    });
  });

  it('falls back when response body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
    });

    await expect(api('/broken')).rejects.toMatchObject({
      message: 'Request failed',
      status: 500,
    });
  });
});
