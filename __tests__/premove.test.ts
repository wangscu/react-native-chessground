import { describe, it, expect } from 'vitest';
import { computePremove } from '../src/core/premove';
import { read } from '../src/core/fen';
import type { Pieces, Key } from '../src/types';

describe('premove', () => {
  it('returns empty for non-existent piece', () => {
    const pieces = read('8/8/8/8/8/8/8/8');
    expect(computePremove(pieces, 'e4' as Key, 'white')).toEqual([]);
  });

  it('returns empty for own turn piece', () => {
    const pieces = read('start');
    expect(computePremove(pieces, 'e2' as Key, 'white')).toEqual([]);
  });

  it('computes knight premoves', () => {
    const pieces = read('8/8/8/8/8/8/8/4N3');
    const dests = computePremove(pieces, 'e1' as Key, 'black');
    expect(dests).toContain('d3');
    expect(dests).toContain('f3');
    expect(dests).toContain('c2');
    expect(dests).toContain('g2');
    expect(dests.length).toBeGreaterThan(0);
  });

  it('computes rook premoves along rank and file', () => {
    const pieces = read('8/8/8/8/4R3/8/8/8');
    const dests = computePremove(pieces, 'e4' as Key, 'black');
    expect(dests).toContain('e1');
    expect(dests).toContain('e8');
    expect(dests).toContain('a4');
    expect(dests).toContain('h4');
  });

  it('computes king premoves including castling', () => {
    const pieces = read('r3k2r/8/8/8/8/8/8/R3K2R');
    const dests = computePremove(pieces, 'e1' as Key, 'black');
    expect(dests).toContain('d1');
    expect(dests).toContain('f1');
    expect(dests).toContain('d2');
    expect(dests).toContain('e2');
    expect(dests).toContain('f2');
    expect(dests).toContain('c1');
    expect(dests).toContain('g1');
  });
});
