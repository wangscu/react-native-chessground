import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../src/core/state';
import * as board from '../src/core/board';
import { computePremove } from '../src/core/premove';
import { read } from '../src/core/fen';
import type { Key } from '../src/types';

describe('P0 fixes', () => {
  describe('hold timer', () => {
    it('tracks hold duration', async () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.hold.start();
      await new Promise(r => setTimeout(r, 50));
      const duration = state.hold.stop();
      expect(duration).toBeGreaterThanOrEqual(40);
    });

    it('cancel resets hold', () => {
      const state = createDefaultState();
      state.hold.start();
      state.hold.cancel();
      expect(state.hold.stop()).toBe(0);
    });

    it('holdTime is passed to afterMove metadata', async () => {
      const state = createDefaultState();
      state.movable.free = true;
      let capturedMetadata: any;
      state.movable.events.after = (_orig, _dest, meta) => {
        capturedMetadata = meta;
      };
      state.hold.start();
      board.selectSquare(state, 'e2' as Key);
      board.selectSquare(state, 'e4' as Key);
      await new Promise(r => setTimeout(r, 10));
      expect(capturedMetadata).toBeDefined();
      expect(capturedMetadata.holdTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('stats tracking', () => {
    it('stats.dragged defaults to false', () => {
      const state = createDefaultState();
      expect(state.stats.dragged).toBe(false);
    });

    it('stats.dragged is set to false after tap-tap move', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.stats.dragged = true;
      board.selectSquare(state, 'e2' as Key);
      board.selectSquare(state, 'e4' as Key);
      expect(state.stats.dragged).toBe(false);
    });
  });

  describe('reset function', () => {
    it('clears lastMove, selected, premove, predrop', () => {
      const state = createDefaultState();
      state.movable.free = true;
      state.lastMove = ['e2' as Key, 'e4' as Key];
      state.selected = 'e4' as Key;
      state.premovable.current = ['d7' as Key, 'd5' as Key];

      board.reset(state);

      expect(state.lastMove).toBeUndefined();
      expect(state.selected).toBeUndefined();
      expect(state.premovable.current).toBeUndefined();
    });
  });

  describe('deleteOnDropOff', () => {
    it('state has deleteOnDropOff default false', () => {
      const state = createDefaultState();
      expect(state.draggable.deleteOnDropOff).toBe(false);
    });
  });

  describe('premove lastMove passthrough', () => {
    it('computePremove accepts lastMove parameter', () => {
      const pieces = read('8/8/8/8/8/8/8/4N3');
      const dests = computePremove(pieces, 'e1' as Key, 'black', undefined, ['e2' as Key, 'e4' as Key]);
      expect(dests.length).toBeGreaterThan(0);
    });
  });

  describe('getSnappedKey', () => {
    it('returns targetKey for aligned squares (queen direction)', () => {
      const result = board.getSnappedKey('e4' as Key, 'e8' as Key);
      expect(result).toBe('e8');
    });

    it('returns targetKey for knight direction', () => {
      const result = board.getSnappedKey('e4' as Key, 'f6' as Key);
      expect(result).toBe('f6');
    });

    it('returns undefined for undefined target', () => {
      const result = board.getSnappedKey('e4' as Key, undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('brushes completeness', () => {
    it('has all 12 default brushes', () => {
      const state = createDefaultState();
      const brushNames = ['green', 'red', 'blue', 'yellow', 'paleBlue', 'paleGreen', 'paleRed', 'paleGrey', 'purple', 'pink', 'white', 'paleWhite'];
      for (const name of brushNames) {
        expect(state.drawable.brushes[name]).toBeDefined();
      }
    });
  });
});
