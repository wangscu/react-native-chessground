import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../src/core/state';
import * as board from '../src/core/board';
import { applyConfig } from '../src/core/config';
import type { Key, Pieces, Piece } from '../src/types';

describe('Coverage boost: board.ts', () => {
  it('reset clears lastMove, selected, premove, predrop', () => {
    const state = createDefaultState();
    state.lastMove = ['e2' as Key, 'e4' as Key];
    state.selected = 'e4' as Key;
    state.premovable.current = ['d7' as Key, 'd5' as Key];
    state.predroppable.current = { role: 'knight', key: 'e4' as Key };
    board.reset(state);
    expect(state.lastMove).toBeUndefined();
    expect(state.selected).toBeUndefined();
    expect(state.premovable.current).toBeUndefined();
    expect(state.predroppable.current).toBeUndefined();
  });

  it('setPieces adds and removes pieces', () => {
    const state = createDefaultState();
    const diff: Pieces = new Map();
    diff.set('e4' as Key, { role: 'queen', color: 'white' });
    diff.set('e2' as Key, undefined as any);
    board.setPieces(state, diff as any);
    expect(state.pieces.get('e4' as Key)?.role).toBe('queen');
    expect(state.pieces.has('e2' as Key)).toBe(false);
  });

  it('stop clears movable and cancels move', () => {
    const state = createDefaultState();
    state.movable.color = 'white';
    state.movable.dests = new Map([['e2' as Key, ['e3' as Key]]]);
    state.selected = 'e2' as Key;
    board.stop(state);
    expect(state.movable.color).toBeUndefined();
    expect(state.movable.dests).toBeUndefined();
    expect(state.selected).toBeUndefined();
  });

  it('toggleOrientation flips and clears selected', () => {
    const state = createDefaultState();
    state.selected = 'e4' as Key;
    board.toggleOrientation(state);
    expect(state.orientation).toBe('black');
    expect(state.selected).toBeUndefined();
  });

  it('baseNewPiece places piece on empty square', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.movable.color = 'white';
    state.turnColor = 'white';
    const piece: Piece = { role: 'knight', color: 'white' };
    const result = board.baseNewPiece(state, piece, 'e4' as Key);
    expect(result).toBe(true);
    expect(state.pieces.get('e4' as Key)?.role).toBe('knight');
  });

  it('baseNewPiece returns false on occupied square without force', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.pieces.set('e4' as Key, { role: 'pawn', color: 'black' });
    const piece: Piece = { role: 'knight', color: 'white' };
    const result = board.baseNewPiece(state, piece, 'e4' as Key);
    expect(result).toBe(false);
  });

  it('baseNewPiece replaces piece with force', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.pieces.set('e4' as Key, { role: 'pawn', color: 'black' });
    const piece: Piece = { role: 'knight', color: 'white' };
    const result = board.baseNewPiece(state, piece, 'e4' as Key, true);
    expect(result).toBe(true);
    expect(state.pieces.get('e4' as Key)?.role).toBe('knight');
  });

  it('playPredrop with valid drop', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.movable.color = 'white';
    state.turnColor = 'white';
    state.predroppable.current = { role: 'knight', key: 'e4' as Key };
    const result = board.playPredrop(state, () => true);
    expect(result).toBe(true);
    expect(state.predroppable.current).toBeUndefined();
  });

  it('playPredrop with invalid drop', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.predroppable.current = { role: 'knight', key: 'e4' as Key };
    const result = board.playPredrop(state, () => false);
    expect(result).toBe(false);
    expect(state.predroppable.current).toBeUndefined();
  });

  it('playPredrop returns false when no current predrop', () => {
    const state = createDefaultState();
    expect(board.playPredrop(state, () => true)).toBe(false);
  });

  it('cancelMove clears everything', () => {
    const state = createDefaultState();
    state.selected = 'e2' as Key;
    state.premovable.current = ['d7' as Key, 'd5' as Key];
    board.cancelMove(state);
    expect(state.selected).toBeUndefined();
    expect(state.premovable.current).toBeUndefined();
  });

  it('dropNewPiece with valid drop', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.pieces.set('a0' as Key, { role: 'knight', color: 'white' });
    state.movable.color = 'white';
    state.turnColor = 'white';
    board.dropNewPiece(state, 'a0' as Key, 'e4' as Key);
    expect(state.pieces.get('e4' as Key)?.role).toBe('knight');
    expect(state.pieces.has('a0' as Key)).toBe(false);
  });

  it('dropNewPiece with predrop when not turn', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.pieces.set('a0' as Key, { role: 'knight', color: 'white' });
    state.movable.color = 'white';
    state.turnColor = 'black';
    state.predroppable.enabled = true;
    board.dropNewPiece(state, 'a0' as Key, 'e4' as Key);
    expect(state.predroppable.current).toBeDefined();
  });

  it('setCheck with boolean true uses turnColor', () => {
    const state = createDefaultState();
    state.turnColor = 'black';
    board.setCheck(state, true);
    expect(state.check).toBe('e8');
  });

  it('unsetPremove clears current', () => {
    const state = createDefaultState();
    state.premovable.current = ['e2' as Key, 'e4' as Key];
    board.unsetPremove(state);
    expect(state.premovable.current).toBeUndefined();
  });

  it('unsetPredrop clears current', () => {
    const state = createDefaultState();
    state.predroppable.current = { role: 'knight', key: 'e4' as Key };
    board.unsetPredrop(state);
    expect(state.predroppable.current).toBeUndefined();
  });
});

describe('Coverage boost: config.ts', () => {
  it('applies movable.dests override', () => {
    const state = createDefaultState();
    const dests = new Map([['e2' as Key, ['e3' as Key, 'e4' as Key]]]);
    applyConfig(state, { movable: { dests } });
    expect(state.movable.dests).toBe(dests);
  });

  it('applies drawable.autoShapes override', () => {
    const state = createDefaultState();
    const autoShapes = [{ orig: 'e2' as Key, dest: 'e4' as Key, brush: 'green' }];
    applyConfig(state, { drawable: { autoShapes } });
    expect(state.drawable.autoShapes).toBe(autoShapes);
  });

  it('applies drawable shapes', () => {
    const state = createDefaultState();
    const shapes = [{ orig: 'e2' as Key, brush: 'red' }];
    applyConfig(state, { drawable: { shapes } });
    expect(state.drawable.shapes).toBe(shapes);
  });

  it('applies premovable config', () => {
    const state = createDefaultState();
    applyConfig(state, { premovable: { enabled: false, showDests: false } });
    expect(state.premovable.enabled).toBe(false);
    expect(state.premovable.showDests).toBe(false);
  });

  it('applies draggable config', () => {
    const state = createDefaultState();
    applyConfig(state, { draggable: { enabled: false, distance: 10, showGhost: false } });
    expect(state.draggable.enabled).toBe(false);
    expect(state.draggable.distance).toBe(10);
    expect(state.draggable.showGhost).toBe(false);
  });

  it('applies selectable config', () => {
    const state = createDefaultState();
    applyConfig(state, { selectable: { enabled: false } });
    expect(state.selectable.enabled).toBe(false);
  });

  it('applies events config', () => {
    const state = createDefaultState();
    const fn = () => {};
    applyConfig(state, { events: { change: fn } });
    expect(state.events.change).toBe(fn);
  });

  it('applies highlight config', () => {
    const state = createDefaultState();
    applyConfig(state, { highlight: { lastMove: false, check: false } });
    expect(state.highlight.lastMove).toBe(false);
    expect(state.highlight.check).toBe(false);
  });

  it('applies coordinates and ranksPosition', () => {
    const state = createDefaultState();
    applyConfig(state, { coordinates: false, ranksPosition: 'left' });
    expect(state.coordinates).toBe(false);
    expect(state.ranksPosition).toBe('left');
  });

  it('applies blockTouchScroll', () => {
    const state = createDefaultState();
    applyConfig(state, { blockTouchScroll: true });
    expect(state.blockTouchScroll).toBe(true);
  });
});

import * as util from '../src/core/util';

describe('Coverage boost: util.ts edge cases', () => {

  it('pos2key returns undefined for out of bounds negative', () => {
    expect(util.pos2key([-1, 0])).toBeUndefined();
    expect(util.pos2key([0, -1])).toBeUndefined();
  });

  it('pos2key returns undefined for out of bounds over 7', () => {
    expect(util.pos2key([8, 0])).toBeUndefined();
    expect(util.pos2key([0, 8])).toBeUndefined();
  });

  it('squaresBetween on diagonal', () => {
    const result = util.squaresBetween(0, 0, 3, 3);
    expect(result).toEqual(['b2', 'c3']);
  });

  it('squaresBetween reversed direction', () => {
    const result = util.squaresBetween(7, 7, 4, 4);
    expect(result).toEqual(['g7', 'f6']);
  });

  it('squaresBetween adjacent returns empty', () => {
    expect(util.squaresBetween(0, 0, 1, 0)).toEqual([]);
    expect(util.squaresBetween(0, 0, 0, 1)).toEqual([]);
  });

  it('adjacentSquares for middle square', () => {
    const result = util.adjacentSquares('e4' as Key);
    expect(result).toContain('d4');
    expect(result).toContain('f4');
  });

  it('adjacentSquares for edge square', () => {
    const result = util.adjacentSquares('a4' as Key);
    expect(result).toContain('b4');
    expect(result).not.toContain('a3');
  });

  it('squareShiftedVertically up', () => {
    expect(util.squareShiftedVertically('e4' as Key, 1)).toBe('e5');
  });

  it('squareShiftedVertically down out of bounds', () => {
    expect(util.squareShiftedVertically('e1' as Key, -1)).toBeUndefined();
  });

  it('squareShiftedVertically up out of bounds', () => {
    expect(util.squareShiftedVertically('e8' as Key, 1)).toBeUndefined();
  });

  it('computeSquareCenter returns correct center', () => {
    const [x, y] = util.computeSquareCenter('a1' as Key, true, 320);
    expect(x).toBe(20);
    expect(y).toBe(300);
  });

  it('keyToPixel and pixelToKey roundtrip', () => {
    for (const key of ['a1', 'h8', 'e4', 'd5'] as Key[]) {
      const [x, y] = util.keyToPixel(key, true, 320);
      const result = util.pixelToKey(x + 1, y + 1, true, 320);
      expect(result).toBe(key);
    }
  });
});
