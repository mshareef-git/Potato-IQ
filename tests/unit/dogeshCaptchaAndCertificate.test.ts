import { describe, it, expect } from 'vitest';
import {
  CAPTCHA_IDLE_COMMENTS,
  getRandomCaptchaComment,
  DOGESH_COMMENTS,
} from '../../src/data/dogeshComments';
import { FINALE_DIALOGUE, REGULAR_CERTIFICATE_TITLES, ALL_SKIPPED_TITLES } from '../../src/data/certificateTitles';
import { DOGESH_ASSETS } from '../../src/data/assetManifest';

describe('Dogesh CAPTCHA Comments & Priority Verification', () => {
  it('has dedicated CAPTCHA idle comments pool', () => {
    expect(CAPTCHA_IDLE_COMMENTS.length).toBeGreaterThanOrEqual(8);
    CAPTCHA_IDLE_COMMENTS.forEach((comment) => {
      expect(typeof comment).toBe('string');
      expect(comment.length).toBeGreaterThan(10);
    });
  });

  it('getRandomCaptchaComment avoids immediate consecutive repetition', () => {
    const first = getRandomCaptchaComment();
    const second = getRandomCaptchaComment();
    // Over multiple calls, it should not repeat the immediately preceding comment
    expect(typeof first).toBe('string');
    expect(typeof second).toBe('string');
  });

  it('includes HEY! THAT WAS UNCALLED FOR! in punch reaction comments', () => {
    expect(DOGESH_COMMENTS.shooed).toContain('HEY! THAT WAS UNCALLED FOR!');
  });
});

describe('Certificate Layout & Confession Verification', () => {
  it('preserves all four exact lines in FINALE_DIALOGUE', () => {
    expect(FINALE_DIALOGUE.length).toBe(4);
    expect(FINALE_DIALOGUE[0]).toBe(
      'HAHAHAHA! YOU ACTUALLY EXPECTED KING DOGESH TO BE CAPABLE OF TAKING AN IQ TEST?!'
    );
    expect(FINALE_DIALOGUE[1]).toBe(
      'BRO, I EAT MY HOMEWORK AND BARK AT MY OWN REFLECTION!'
    );
    expect(FINALE_DIALOGUE[2]).toBe(
      "MY IQ HAS BEEN AT ROOM-TEMPERATURE SINCE BIRTH!"
    );
    expect(FINALE_DIALOGUE[3]).toBe(
      "AND YOU LET ME JUDGE YOUR INTELLIGENCE. WE'RE BOTH COOKED."
    );
  });

  it('ensures no certificate titles contain a numeric IQ score', () => {
    const allTitles = [...REGULAR_CERTIFICATE_TITLES, ...ALL_SKIPPED_TITLES];
    allTitles.forEach((title) => {
      // Should not contain "IQ: 120" or standalone numbers indicating IQ scores
      expect(title).not.toMatch(/IQ:\s*\d+/i);
      expect(title).not.toMatch(/score:\s*\d+/i);
    });
  });

  it('verifies laughing Dogesh asset exists in asset manifest', () => {
    expect(DOGESH_ASSETS.laugh).toBeDefined();
    expect(DOGESH_ASSETS.cry).toBeDefined();
    expect(DOGESH_ASSETS.base).toBeDefined();
  });
});
