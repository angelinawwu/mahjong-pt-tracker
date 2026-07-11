import { describe, expect, it } from 'vitest';
import { generateHandTiles, getComboAvailability } from './handGenerator';

const HONORS = new Set([
  'wind-east', 'wind-south', 'wind-west', 'wind-north',
  'symbol-blue', 'symbol-green', 'symbol-red',
]);

const isHonor = (t: string) => HONORS.has(t);
const suitOf = (t: string) => (isHonor(t) ? null : t.split('-')[0]);

function suitedSuits(hand: string[]): Set<string> {
  return new Set(hand.map(suitOf).filter((s): s is string => s !== null));
}

function tileCounts(hand: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of hand) m.set(t, (m.get(t) || 0) + 1);
  return m;
}

const RUNS = 50;

describe('generateHandTiles', () => {
  it('thirteen orphans (house rule): 14 distinct tiles, same-suit tiles >= 3 apart', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['thirteen-orphans']);
      expect(hand).toHaveLength(14);
      expect(new Set(hand).size).toBe(14);
      for (const suit of ['bucket', 'log', 'number']) {
        const nums = hand
          .filter((t) => suitOf(t) === suit)
          .map((t) => parseInt(t.split('-')[1]))
          .sort((a, b) => a - b);
        for (let j = 1; j < nums.length; j++) {
          expect(nums[j] - nums[j - 1]).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('chi chi chi alone: no triplets and not a single-suit hand', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['chi-chi-chi']);
      expect(hand).toHaveLength(14);
      const counts = tileCounts(hand);
      for (const [, n] of counts) expect(n).toBeLessThanOrEqual(2);
      expect(suitedSuits(hand).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('pure suit + all triplets: one suit, no honors, only triplets and a pair', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['all-triplets', 'pure-suit']);
      expect(hand).toHaveLength(14);
      expect(hand.some(isHonor)).toBe(false);
      expect(suitedSuits(hand).size).toBe(1);
      const counts = [...tileCounts(hand).values()].sort();
      expect(counts).toEqual([2, 3, 3, 3, 3]);
    }
  });

  it('mixed suit alone: exactly one suit plus honors', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['mixed-suit']);
      expect(suitedSuits(hand).size).toBe(1);
      expect(hand.some(isHonor)).toBe(true);
    }
  });

  it('seven pairs alone: 7 pairs, not accidentally pure or mixed', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['seven-pairs']);
      expect(hand).toHaveLength(14);
      const counts = [...tileCounts(hand).values()];
      expect(counts).toHaveLength(7);
      expect(counts.every((n) => n === 2)).toBe(true);
      expect(suitedSuits(hand).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('none alone: no accidental all-triplets, all-sequences, pure or mixed', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['none']);
      expect(hand).toHaveLength(14);
      const counts = [...tileCounts(hand).values()];
      expect(counts.some((n) => n >= 3)).toBe(true); // has a triplet
      expect(suitedSuits(hand).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('wind triplet modifier: hand contains the requested wind triplets', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['none', 'wind-triplet', 'wind-triplet']);
      const windTriplets = [...tileCounts(hand)].filter(
        ([t, n]) => t.startsWith('wind-') && n >= 3
      );
      expect(windTriplets).toHaveLength(2);
    }
  });

  it('all symbols with symbol triplet: only honors, includes a dragon triplet', () => {
    for (let i = 0; i < RUNS; i++) {
      const { hand } = generateHandTiles(['all-symbols', 'symbol-triplet']);
      expect(hand.every(isHonor)).toBe(true);
      const dragonTriplets = [...tileCounts(hand)].filter(
        ([t, n]) => t.startsWith('symbol-') && n >= 3
      );
      expect(dragonTriplets.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('getComboAvailability', () => {
  it('seven pairs disables wind and symbol triplets', () => {
    const a = getComboAvailability(['seven-pairs']);
    expect(a['wind-triplet'].disabled).toBe(true);
    expect(a['symbol-triplet'].disabled).toBe(true);
  });

  it('thirteen orphans disables triplet and suit modifiers', () => {
    const a = getComboAvailability(['thirteen-orphans']);
    expect(a['wind-triplet'].disabled).toBe(true);
    expect(a['symbol-triplet'].disabled).toBe(true);
    expect(a['pure-suit'].disabled).toBe(true);
    expect(a['mixed-suit'].disabled).toBe(true);
  });

  it('pure suit disables mixed suit and honor triplets', () => {
    const a = getComboAvailability(['pure-suit']);
    expect(a['mixed-suit'].disabled).toBe(true);
    expect(a['wind-triplet'].disabled).toBe(true);
    expect(a['symbol-triplet'].disabled).toBe(true);
  });

  it('chi chi chi disables honor triplets but allows suit modifiers', () => {
    const a = getComboAvailability(['chi-chi-chi']);
    expect(a['wind-triplet'].disabled).toBe(true);
    expect(a['symbol-triplet'].disabled).toBe(true);
    expect(a['pure-suit'].disabled).toBe(false);
    expect(a['mixed-suit'].disabled).toBe(false);
  });

  it('dragon caps honor triplets at 1 total', () => {
    const a = getComboAvailability(['dragon']);
    expect(a['wind-triplet'].maxCount).toBe(1);
    expect(a['symbol-triplet'].maxCount).toBe(1);
    const b = getComboAvailability(['dragon', 'wind-triplet']);
    expect(b['symbol-triplet'].disabled).toBe(true);
  });

  it('selecting a hand type is evaluated as a replacement for the current one', () => {
    // seven-pairs is selected, but switching to all-triplets is still fine
    const a = getComboAvailability(['seven-pairs']);
    expect(a['all-triplets'].disabled).toBe(false);
    // wind-triplet x2 blocks switching to seven-pairs
    const b = getComboAvailability(['none', 'wind-triplet', 'wind-triplet']);
    expect(b['seven-pairs'].disabled).toBe(true);
    expect(b['dragon'].disabled).toBe(true); // dragon only has room for 1
  });

  it('honor triplets leave room for a sequence in a plain hand', () => {
    const a = getComboAvailability(['none', 'wind-triplet', 'wind-triplet']);
    expect(a['symbol-triplet'].maxCount).toBe(1); // 2 winds + 1 dragon = 3, 4th set stays a sequence
    const b = getComboAvailability(['all-triplets']);
    expect(b['symbol-triplet'].maxCount).toBe(3); // only 3 dragon tile types
  });
});
