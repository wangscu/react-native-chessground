import { describe, it, expect } from 'vitest';
import { read, write, initial } from '../src/core/fen';

describe('fen', () => {
  describe('read', () => {
    it('parses initial position', () => {
      const pieces = read(initial);
      expect(pieces.size).toBe(32);
      expect(pieces.get('e1')).toEqual({ role: 'king', color: 'white' });
      expect(pieces.get('e8')).toEqual({ role: 'king', color: 'black' });
      expect(pieces.get('a2')).toEqual({ role: 'pawn', color: 'white' });
      expect(pieces.get('a7')).toEqual({ role: 'pawn', color: 'black' });
      expect(pieces.get('d1')).toEqual({ role: 'queen', color: 'white' });
      expect(pieces.get('b8')).toEqual({ role: 'knight', color: 'black' });
    });

    it('parses "start" alias', () => {
      const pieces = read('start');
      expect(pieces.size).toBe(32);
    });

    it('parses empty board', () => {
      const pieces = read('8/8/8/8/8/8/8/8');
      expect(pieces.size).toBe(0);
    });

    it('parses position with promoted piece', () => {
      const pieces = read('8/8/8/8/8/8/8/q~7');
      const piece = pieces.get('a1');
      expect(piece).toBeDefined();
      expect(piece!.role).toBe('queen');
      expect(piece!.color).toBe('black');
      expect(piece!.promoted).toBe(true);
    });

    it('handles partial FEN (stops at space or bracket)', () => {
      const pieces = read('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(pieces.size).toBe(32);
    });
  });

  describe('write', () => {
    it('writes initial position', () => {
      const pieces = read(initial);
      const fen = write(pieces);
      expect(fen).toBe(initial);
    });

    it('roundtrips empty board', () => {
      const pieces = read('8/8/8/8/8/8/8/8');
      expect(write(pieces)).toBe('8/8/8/8/8/8/8/8');
    });

    it('roundtrips complex position', () => {
      const fen = 'r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R';
      const pieces = read(fen);
      expect(write(pieces)).toBe(fen);
    });
  });
});
