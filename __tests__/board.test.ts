import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../src/core/state';
import * as board from '../src/core/board';
import type { Key, Piece } from '../src/types';

describe('board', () => {
  describe('baseMove', () => {
    it('moves a piece from orig to dest', () => {
      const state = createDefaultState();
      state.movable.free = true;
      const result = board.baseMove(state, 'e2' as Key, 'e4' as Key);
      expect(result).toBeTruthy();
      expect(state.pieces.get('e4' as Key)).toEqual({ role: 'pawn', color: 'white' });
      expect(state.pieces.has('e2' as Key)).toBe(false);
    });

    it('returns false for same orig and dest', () => {
      const state = createDefaultState();
      expect(board.baseMove(state, 'e2' as Key, 'e2' as Key)).toBe(false);
    });

    it('captures opponent piece', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.pieces.clear();
      state.pieces.set('e4' as Key, { role: 'pawn', color: 'white' });
      state.pieces.set('d5' as Key, { role: 'pawn', color: 'black' });
      const result = board.baseMove(state, 'e4' as Key, 'd5' as Key);
      expect(result).toEqual({ role: 'pawn', color: 'black' });
      expect(state.pieces.get('d5' as Key)?.color).toBe('white');
    });

    it('records lastMove', () => {
      const state = createDefaultState();
      state.movable.free = true;
      board.baseMove(state, 'e2' as Key, 'e4' as Key);
      expect(state.lastMove).toEqual(['e2', 'e4']);
    });
  });

  describe('userMove', () => {
    it('allows valid move with dests', () => {
      const state = createDefaultState();
      state.movable.free = false;
      state.movable.dests = new Map([['e2' as Key, ['e3' as Key, 'e4' as Key]]]);
      const result = board.userMove(state, 'e2' as Key, 'e4' as Key);
      expect(result).toBe(true);
    });

    it('rejects invalid move', () => {
      const state = createDefaultState();
      state.movable.free = false;
      state.movable.dests = new Map([['e2' as Key, ['e3' as Key]]]);
      const result = board.userMove(state, 'e2' as Key, 'e5' as Key);
      expect(result).toBe(false);
    });
  });

  describe('selectSquare', () => {
    it('selects a movable piece', () => {
      const state = createDefaultState();
      board.selectSquare(state, 'e2' as Key);
      expect(state.selected).toBe('e2');
    });

    it('moves when selecting dest of selected piece', () => {
      const state = createDefaultState();
      state.movable.free = true;
      board.selectSquare(state, 'e2' as Key);
      board.selectSquare(state, 'e4' as Key);
      expect(state.selected).toBeUndefined();
      expect(state.pieces.get('e4' as Key)).toBeDefined();
    });

    it('deselects when selecting same square (tap mode)', () => {
      const state = createDefaultState();
      state.draggable.enabled = false;
      board.selectSquare(state, 'e2' as Key);
      board.selectSquare(state, 'e2' as Key);
      expect(state.selected).toBeUndefined();
    });
  });

  describe('setCheck', () => {
    it('finds king and sets check', () => {
      const state = createDefaultState();
      board.setCheck(state, 'white');
      expect(state.check).toBe('e1');
    });

    it('sets check to true uses turnColor', () => {
      const state = createDefaultState();
      state.turnColor = 'black';
      board.setCheck(state, true);
      expect(state.check).toBe('e8');
    });

    it('clears check with false', () => {
      const state = createDefaultState();
      state.check = 'e1' as Key;
      board.setCheck(state, false);
      expect(state.check).toBeUndefined();
    });
  });

  describe('toggleOrientation', () => {
    it('flips orientation', () => {
      const state = createDefaultState();
      expect(state.orientation).toBe('white');
      board.toggleOrientation(state);
      expect(state.orientation).toBe('black');
    });
  });

  describe('playPremove', () => {
    it('plays stored premove when valid', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.premovable.current = ['e2' as Key, 'e4' as Key];
      const result = board.playPremove(state);
      expect(result).toBe(true);
      expect(state.premovable.current).toBeUndefined();
    });

    it('returns false when no premove', () => {
      const state = createDefaultState();
      expect(board.playPremove(state)).toBe(false);
    });
  });

  describe('autoCastle', () => {
    it('moves rook when king castles kingside', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.autoCastle = true;
      state.pieces.clear();
      state.pieces.set('e1' as Key, { role: 'king', color: 'white' });
      state.pieces.set('h1' as Key, { role: 'rook', color: 'white' });

      board.baseMove(state, 'e1' as Key, 'h1' as Key);

      expect(state.pieces.get('g1' as Key)?.role).toBe('king');
      expect(state.pieces.get('f1' as Key)?.role).toBe('rook');
      expect(state.pieces.has('e1' as Key)).toBe(false);
      expect(state.pieces.has('h1' as Key)).toBe(false);
    });

    it('moves rook when king castles queenside', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.autoCastle = true;
      state.pieces.clear();
      state.pieces.set('e1' as Key, { role: 'king', color: 'white' });
      state.pieces.set('a1' as Key, { role: 'rook', color: 'white' });

      board.baseMove(state, 'e1' as Key, 'a1' as Key);

      expect(state.pieces.get('c1' as Key)?.role).toBe('king');
      expect(state.pieces.get('d1' as Key)?.role).toBe('rook');
    });
  });
});
