import { describe, it, expect } from 'vitest';
import { checkMathAnswer, TROLLEY_MATH_CHALLENGE } from '../../src/levels/trolley/mathChallenge';

describe('Trolley Math Challenge', () => {
  it('has expression evaluating to 60', () => {
    // (8 * 7) - (36 / 4) + 13 = 56 - 9 + 13 = 60
    expect(TROLLEY_MATH_CHALLENGE.correctAnswer).toBe(60);
  });

  it('accepts correct numeric string', () => {
    expect(checkMathAnswer('60')).toBe(true);
    expect(checkMathAnswer('  60  ')).toBe(true);
  });

  it('rejects incorrect numbers', () => {
    expect(checkMathAnswer('42')).toBe(false);
    expect(checkMathAnswer('0')).toBe(false);
    expect(checkMathAnswer('potato')).toBe(false);
  });
});
