import { describe, it, expect } from 'vitest';
import { isNavItemEnabled, canAccessRoute } from './navAccess';

describe('nav access rules', () => {
  it('disables guest flows when authenticated', () => {
    expect(
      isNavItemEnabled({ access: 'guest' }, { authenticated: true, mfaPending: false }),
    ).toBe(false);
    expect(
      isNavItemEnabled({ access: 'guest' }, { authenticated: false, mfaPending: true }),
    ).toBe(false);
  });

  it('enables account routes only when authenticated', () => {
    expect(
      isNavItemEnabled({ access: 'authenticated' }, { authenticated: true, mfaPending: false }),
    ).toBe(true);
    expect(
      isNavItemEnabled({ access: 'authenticated' }, { authenticated: false, mfaPending: false }),
    ).toBe(false);
  });

  it('allows MFA during pending login', () => {
    expect(canAccessRoute('/mfa', { authenticated: false, mfaPending: true })).toBe(true);
    expect(canAccessRoute('/account', { authenticated: false, mfaPending: true })).toBe(false);
  });
});
