import { describe, it, expect } from 'vitest';
import { isPasswordAccepted } from '../../src/levels/login/WeakPasswordRules';

describe('WeakPasswordRules', () => {
  it('rejects empty password', () => {
    expect(isPasswordAccepted('').accepted).toBe(false);
    expect(isPasswordAccepted('   ').accepted).toBe(false);
  });

  it('accepts short passwords of 4 characters or fewer', () => {
    expect(isPasswordAccepted('a').accepted).toBe(true);
    expect(isPasswordAccepted('1234').accepted).toBe(true);
    expect(isPasswordAccepted('dog').accepted).toBe(true);
  });

  it('accepts known weak passwords', () => {
    expect(isPasswordAccepted('password').accepted).toBe(true);
    expect(isPasswordAccepted('12345').accepted).toBe(true);
    expect(isPasswordAccepted('qwerty').accepted).toBe(true);
    expect(isPasswordAccepted('admin').accepted).toBe(true);
  });

  it('rejects strong or random passwords with humorous message', () => {
    const res = isPasswordAccepted('SuperSecurePassword!999#');
    expect(res.accepted).toBe(false);
    expect(res.reason).toContain('Too strong');
  });
});
