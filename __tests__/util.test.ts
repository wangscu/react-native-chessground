import { describe, it, expect } from 'vitest';
import {
  key2pos,
  pos2key,
  opposite,
  samePiece,
  distanceSq,
  diff,
  knightDir,
  rookDir,
  bishopDir,
  queenDir,
  pixelToKey,
  keyToPixel,
  squaresBetween,
  uciToMove,
} from '../src/core/util';
import type { Piece } from '../src/types';

describe('util', () => {
  describe('key2pos / pos2key', () => {
    it('converts a1 to [0,0]', () => {
      expect(key2pos('a1' as any)).toEqual([0, 0]);
    });

    it('converts h8 to [7,7]', () => {
      expect(key2pos('h8' as any)).toEqual([7, 7]);
    });

    it('converts e4 to [4,3]', () => {
      expect(key2pos('e4' as any)).toEqual([4, 3]);
    });

    it('pos2key roundtrips', () => {
      expect(pos2key([4, 3])).toBe('e4');
      expect(pos2key([0, 0])).toBe('a1');
      expect(pos2key([7, 7])).toBe('h8');
    });

    it('pos2key returns undefined for out of bounds', () => {
      expect(pos2key([-1, 0])).toBeUndefined();
      expect(pos2key([8, 0])).toBeUndefined();
    });
  });

  describe('opposite', () => {
    it('flips colors', () => {
      expect(opposite('white')).toBe('black');
      expect(opposite('black')).toBe('white');
    });
  });

  describe('samePiece', () => {
    it('matches identical pieces', () => {
      const p1: Piece = { role: 'knight', color: 'white' };
      const p2: Piece = { role: 'knight', color: 'white' };
      expect(samePiece(p1, p2)).toBe(true);
    });

    it('rejects different roles', () => {
      const p1: Piece = { role: 'knight', color: 'white' };
      const p2: Piece = { role: 'bishop', color: 'white' };
      expect(samePiece(p1, p2)).toBe(false);
    });

    it('rejects different colors', () => {
      const p1: Piece = { role: 'knight', color: 'white' };
      const p2: Piece = { role: 'knight', color: 'black' };
      expect(samePiece(p1, p2)).toBe(false);
    });
  });

  describe('distanceSq', () => {
    it('computes squared distance', () => {
      expect(distanceSq([0, 0], [3, 4])).toBe(25);
      expect(distanceSq([1, 1], [1, 1])).toBe(0);
    });
  });

  describe('directional checks', () => {
    it('knightDir detects knight moves', () => {
      expect(knightDir(0, 0, 1, 2)).toBe(true);
      expect(knightDir(0, 0, 2, 1)).toBe(true);
      expect(knightDir(0, 0, 0, 1)).toBe(false);
      expect(knightDir(0, 0, 1, 1)).toBe(false);
    });

    it('rookDir detects rook moves', () => {
      expect(rookDir(0, 0, 0, 5)).toBe(true);
      expect(rookDir(0, 0, 5, 0)).toBe(true);
      expect(rookDir(0, 0, 3, 3)).toBe(false);
    });

    it('bishopDir detects bishop moves', () => {
      expect(bishopDir(0, 0, 3, 3)).toBe(true);
      expect(bishopDir(0, 0, 3, 0)).toBe(false);
    });

    it('queenDir combines rook and bishop', () => {
      expect(queenDir(0, 0, 3, 3)).toBe(true);
      expect(queenDir(0, 0, 0, 5)).toBe(true);
      expect(queenDir(0, 0, 1, 2)).toBe(false);
    });
  });

  describe('squaresBetween', () => {
    it('returns squares between on a rank', () => {
      const result = squaresBetween(0, 0, 7, 0);
      expect(result).toEqual(['b1', 'c1', 'd1', 'e1', 'f1', 'g1']);
    });

    it('returns empty for adjacent squares', () => {
      const result = squaresBetween(0, 0, 1, 0);
      expect(result).toEqual([]);
    });

    it('returns empty for non-aligned squares', () => {
      const result = squaresBetween(0, 0, 3, 2);
      expect(result).toEqual([]);
    });
  });

  describe('uciToMove', () => {
    it('parses standard move', () => {
      expect(uciToMove('e2e4')).toEqual(['e2', 'e4']);
    });

    it('parses drop move', () => {
      expect(uciToMove('P@e4')).toEqual(['e4']);
    });

    it('returns undefined for undefined input', () => {
      expect(uciToMove(undefined)).toBeUndefined();
    });
  });

  describe('pixelToKey / keyToPixel', () => {
    it('maps pixel to key (white orientation)', () => {
      const boardSize = 320;
      const key = pixelToKey(20, 300, true, boardSize);
      expect(key).toBe('a1');
    });

    it('maps pixel to key (black orientation)', () => {
      const boardSize = 320;
      const key = pixelToKey(20, 300, false, boardSize);
      expect(key).toBe('h8');
    });

    it('returns undefined for out of bounds', () => {
      expect(pixelToKey(-1, 0, true, 320)).toBeUndefined();
      expect(pixelToKey(400, 0, true, 320)).toBeUndefined();
    });

    it('roundtrips keyToPixel -> pixelToKey', () => {
      const boardSize = 320;
      const [x, y] = keyToPixel('e4' as any, true, boardSize);
      const key = pixelToKey(x + 1, y + 1, true, boardSize);
      expect(key).toBe('e4');
    });
  });
});
