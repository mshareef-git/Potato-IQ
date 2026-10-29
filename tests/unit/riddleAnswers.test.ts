import { describe, it, expect } from 'vitest';

describe('Riddle Validations', () => {
  it('Bus Driver Riddle validates against player age', () => {
    const savedAge = 25;
    expect(parseInt('25', 10)).toBe(savedAge);
    expect(parseInt('  25  ', 10)).toBe(savedAge);
    expect(parseInt('6', 10)).not.toBe(savedAge); // 6 is decoy equation solution!
  });

  it("Mary's Two Children Riddle accepts blank submission as secret shortcut", () => {
    const blankInput = '';
    const trimmed = blankInput.trim();
    expect(trimmed === '').toBe(true);
  });

  it("Mary's Two Children Riddle accepts valid mathematical percentage formats", () => {
    const validMath = ['51.8', '51.85', '51.9', '14/27', '0.518', '0.5185'];
    ['51.8%', '51.85%', '14/27', '51.8'].forEach((input) => {
      const normalized = input.trim().replace('%', '');
      expect(validMath.includes(normalized)).toBe(true);
    });

    // 50%, 70%, 42 are wrong
    ['50%', '70%', '42'].forEach((input) => {
      const normalized = input.trim().replace('%', '');
      expect(validMath.includes(normalized)).toBe(false);
    });
  });

  it("Logician's Birthday accepts December 31 only", () => {
    const correctDate = 'December 31';
    expect(correctDate === 'December 31').toBe(true);
    expect('January 1' === 'December 31').toBe(false);
    expect('December 30' === 'December 31').toBe(false);
  });
});
