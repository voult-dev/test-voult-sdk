import { describe, it, expect } from 'vitest';
import {
  isValidPassword,
  getPasswordValidationError,
  PASSWORD_SPECIAL_CHARS,
} from './password.js';

describe('isValidPassword', () => {
  it('accepts a password that meets all rules', () => {
    expect(isValidPassword('Abcdef1!')).toBe(true);
  });

  it('rejects passwords missing required character classes', () => {
    expect(isValidPassword('abcdef1!')).toBe(false);
    expect(isValidPassword('ABCDEF1!')).toBe(false);
    expect(isValidPassword('Abcdefgh!')).toBe(false);
    expect(isValidPassword('Abcdef12')).toBe(false);
  });

  it('rejects disallowed special characters', () => {
    expect(isValidPassword('Abcdef1_')).toBe(false);
    expect(isValidPassword('Abcdef1:')).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe('getPasswordValidationError', () => {
  it('returns null for valid passwords', () => {
    expect(getPasswordValidationError('Abcdef1!')).toBeNull();
  });

  it('returns specific messages for each rule', () => {
    expect(getPasswordValidationError('')).toBe('Password is required');
    expect(getPasswordValidationError('Ab1!')).toContain('8 characters');
    expect(getPasswordValidationError('abcdef1!')).toContain('uppercase');
    expect(getPasswordValidationError('ABCDEF1!')).toContain('lowercase');
    expect(getPasswordValidationError('Abcdefg!')).toContain('number');
    expect(getPasswordValidationError('Abcdef12')).toContain(PASSWORD_SPECIAL_CHARS);
    expect(getPasswordValidationError('Abcdef1!:')).toContain('Only letters');
  });
});
