import { describe, it, expect } from 'vitest';
import { createDefaultState } from '../src/core/state';
import { applyConfig } from '../src/core/config';
import { computeAnimPlan } from '../src/core/anim';
import { read } from '../src/core/fen';
import type { Pieces, Key } from '../src/types';

describe('config', () => {
  it('applies fen and replaces pieces', () => {
    const state = createDefaultState();
    applyConfig(state, { fen: '8/8/8/8/8/8/8/4K3' });
    expect(state.pieces.size).toBe(1);
    expect(state.pieces.get('e1' as Key)?.role).toBe('king');
  });

  it('applies orientation', () => {
    const state = createDefaultState();
    applyConfig(state, { orientation: 'black' });
    expect(state.orientation).toBe('black');
  });

  it('applies turnColor', () => {
    const state = createDefaultState();
    applyConfig(state, { turnColor: 'black' });
    expect(state.turnColor).toBe('black');
  });

  it('applies check and finds king', () => {
    const state = createDefaultState();
    applyConfig(state, { check: 'white' });
    expect(state.check).toBe('e1');
  });

  it('applies lastMove', () => {
    const state = createDefaultState();
    applyConfig(state, { lastMove: ['e2' as Key, 'e4' as Key] });
    expect(state.lastMove).toEqual(['e2', 'e4']);
  });

  it('clears lastMove when set to empty', () => {
    const state = createDefaultState();
    state.lastMove = ['e2' as Key, 'e4' as Key];
    applyConfig(state, { lastMove: [] });
    expect(state.lastMove).toEqual([]);
  });

  it('deep merges movable config', () => {
    const state = createDefaultState();
    applyConfig(state, { movable: { free: false } });
    expect(state.movable.free).toBe(false);
    expect(state.movable.showDests).toBe(true);
  });

  it('deep merges animation config', () => {
    const state = createDefaultState();
    applyConfig(state, { animation: { duration: 300 } });
    expect(state.animation.duration).toBe(300);
    expect(state.animation.enabled).toBe(true);
  });

  it('disables animation when duration too short', () => {
    const state = createDefaultState();
    applyConfig(state, { animation: { duration: 50 } });
    expect(state.animation.enabled).toBe(false);
  });

  it('applies viewOnly', () => {
    const state = createDefaultState();
    applyConfig(state, { viewOnly: true });
    expect(state.viewOnly).toBe(true);
  });

  it('applies drawable shapes', () => {
    const state = createDefaultState();
    const shapes = [{ orig: 'e2' as Key, dest: 'e4' as Key, brush: 'green' }];
    applyConfig(state, { drawable: { shapes } });
    expect(state.drawable.shapes).toEqual(shapes);
  });

  it('overrides dests without merging', () => {
    const state = createDefaultState();
    const dests1 = new Map([['e2' as Key, ['e3' as Key]]]);
    const dests2 = new Map([['d2' as Key, ['d3' as Key]]]);
    applyConfig(state, { movable: { dests: dests1 } });
    applyConfig(state, { movable: { dests: dests2 } });
    expect(state.movable.dests?.get('d2' as Key)).toEqual(['d3']);
    expect(state.movable.dests?.has('e2' as Key)).toBe(false);
  });
});

describe('anim', () => {
  describe('computeAnimPlan', () => {
    it('detects simple move animation', () => {
      const prev = read('8/8/8/8/8/8/4P3/8');
      const current = read('8/8/8/8/4P3/8/8/8');
      const plan = computeAnimPlan(prev, current);

      expect(plan.anims.size).toBe(1);
      expect(plan.anims.has('e4' as Key)).toBe(true);
      const vector = plan.anims.get('e4' as Key)!;
      expect(vector[0]).toBe(0);
      expect(vector[1]).toBe(-2);
    });

    it('detects fading pieces on capture', () => {
      const prev = read('8/8/8/8/4p3/8/4P3/8');
      const current = read('8/8/8/8/4P3/8/8/8');
      const plan = computeAnimPlan(prev, current);

      expect(plan.fadings.size).toBeGreaterThan(0);
    });

    it('returns empty plan for identical positions', () => {
      const pieces = read('start');
      const copy = new Map(pieces);
      const plan = computeAnimPlan(pieces, copy);
      expect(plan.anims.size).toBe(0);
      expect(plan.fadings.size).toBe(0);
    });
  });
});
