import { describe, it, expect, vi } from 'vitest';
import errorHandler from '../../src/middleware/errorHandler.js';

function runHandler(err) {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status };
  errorHandler(err, {}, res, vi.fn());
  return { status, json };
}

describe('errorHandler', () => {
  it('maps error fields to JSON response', () => {
    const { status, json } = runHandler({
      message: 'Bad input',
      status: 400,
      code: 'VALIDATION_ERROR',
      field: 'email',
    });

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Bad input',
        status: 400,
        field: 'email',
        details: undefined,
      },
    });
  });

  it('extracts nested SDK error details', () => {
    const { status, json } = runHandler({
      message: '[object Object]',
      details: {
        error: {
          message: 'Session expired',
          status: 401,
          code: 'SESSION_EXPIRED',
        },
      },
    });

    expect(status).toHaveBeenCalledWith(401);
    expect(json.mock.calls[0][0].error.code).toBe('SESSION_EXPIRED');
    expect(json.mock.calls[0][0].error.message).toBe('Session expired');
  });

  it('defaults to 500 INTERNAL_ERROR', () => {
    const { status, json } = runHandler(new Error('boom'));

    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].error.code).toBe('INTERNAL_ERROR');
    expect(json.mock.calls[0][0].error.message).toBe('boom');
  });
});
