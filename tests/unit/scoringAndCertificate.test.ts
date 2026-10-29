import { describe, it, expect } from 'vitest';
import { getCertificateTitle, ALL_SKIPPED_TITLES, REGULAR_CERTIFICATE_TITLES } from '../../src/data/certificateTitles';
import { SCORED_ROUND_IDS } from '../../src/app/gameFlow';

describe('Scoring & Certificate Rules', () => {
  it('has exactly 5 scored rounds with unified riddles section', () => {
    expect(SCORED_ROUND_IDS.length).toBe(5);
  });

  it('selects forced title and stamp when all rounds are skipped', () => {
    const result = getCertificateTitle(true);
    expect(ALL_SKIPPED_TITLES).toContain(result.title);
    expect(result.extraRoast).toContain('You skipped EVERYTHING');
    expect(result.stamp).toBe('PERFECT ATTENDANCE — ZERO PARTICIPATION');
  });

  it('selects title from regular pool when player participates', () => {
    const result = getCertificateTitle(false);
    expect(REGULAR_CERTIFICATE_TITLES).toContain(result.title);
    expect(result.stamp).toBeUndefined();
  });
});
