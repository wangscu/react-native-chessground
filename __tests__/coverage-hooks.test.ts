import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { createDefaultState } from '../src/core/state';
import { applyConfig } from '../src/core/config';
import { useBoardActions } from '../src/hooks/useBoardState';
import type { Key, DrawShape } from '../src/types';

function useActions(state: any) {
  let actions: any;
  function TestComp() {
    actions = useBoardActions(state, () => {});
    return null;
  }
  ReactTestRenderer.create(React.createElement(TestComp));
  return actions;
}

describe('Coverage boost: config.ts rookCastle', () => {
  it('normalizes rookCastle dests when rookCastle is false', () => {
    const state = createDefaultState();
    state.movable.color = 'white';
    const dests = new Map<Key, Key[]>([
      ['e1' as Key, ['c1' as Key, 'g1' as Key, 'a1' as Key, 'h1' as Key, 'e2' as Key]],
    ]);
    applyConfig(state, { movable: { rookCastle: false, dests } });
    const e1Dests = state.movable.dests!.get('e1' as Key);
    expect(e1Dests).not.toContain('a1');
    expect(e1Dests).not.toContain('h1');
    expect(e1Dests).toContain('c1');
    expect(e1Dests).toContain('g1');
  });

  it('keeps rook dests when rookCastle is true', () => {
    const state = createDefaultState();
    state.movable.color = 'white';
    const dests = new Map<Key, Key[]>([
      ['e1' as Key, ['a1' as Key, 'h1' as Key]],
    ]);
    applyConfig(state, { movable: { rookCastle: true, dests } });
    expect(state.movable.dests!.get('e1' as Key)).toContain('a1');
  });

  it('applies animation and disables when too short', () => {
    const state = createDefaultState();
    applyConfig(state, { animation: { duration: 50 } });
    expect(state.animation.enabled).toBe(false);
  });

  it('applies predroppable config', () => {
    const state = createDefaultState();
    applyConfig(state, { predroppable: { enabled: true } });
    expect(state.predroppable.enabled).toBe(true);
  });

  it('applies drawable config', () => {
    const state = createDefaultState();
    applyConfig(state, { drawable: { enabled: false, visible: false } });
    expect(state.drawable.enabled).toBe(false);
  });

  it('applies check false', () => {
    const state = createDefaultState();
    state.check = 'e1' as Key;
    applyConfig(state, { check: false });
    expect(state.check).toBeUndefined();
  });
});

describe('Coverage boost: useBoardState imperative API', () => {
  it('set applies config', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.set({ orientation: 'black' });
    expect(state.orientation).toBe('black');
  });

  it('getFen returns current FEN', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    expect(actions.getFen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  });

  it('toggleOrientation flips', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.toggleOrientation();
    expect(state.orientation).toBe('black');
  });

  it('move moves a piece', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.move('e2', 'e4');
    expect(state.pieces.get('e4' as Key)?.role).toBe('pawn');
  });

  it('setPieces modifies pieces', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    const diff = new Map([['e4' as Key, { role: 'queen' as const, color: 'white' as const }]]);
    actions.setPieces(diff as any);
    expect(state.pieces.get('e4' as Key)?.role).toBe('queen');
  });

  it('selectSquare selects a key', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.selectSquare('e2' as Key);
    expect(state.selected).toBe('e2');
  });

  it('selectSquare null unselects', () => {
    const state = createDefaultState();
    state.selected = 'e2' as Key;
    const actions = useActions(state);
    actions.selectSquare(null);
    expect(state.selected).toBeUndefined();
  });

  it('newPiece places a piece', () => {
    const state = createDefaultState();
    state.pieces.clear();
    state.movable.color = 'white';
    state.turnColor = 'white';
    const actions = useActions(state);
    actions.newPiece({ role: 'knight', color: 'white' }, 'e4' as Key);
    expect(state.pieces.get('e4' as Key)?.role).toBe('knight');
  });

  it('playPremove returns false when no premove', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    expect(actions.playPremove()).toBe(false);
  });

  it('cancelPremove clears premove', () => {
    const state = createDefaultState();
    state.premovable.current = ['e2' as Key, 'e4' as Key];
    const actions = useActions(state);
    actions.cancelPremove();
    expect(state.premovable.current).toBeUndefined();
  });

  it('playPredrop returns false when no predrop', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    expect(actions.playPredrop(() => true)).toBe(false);
  });

  it('cancelPredrop clears predrop', () => {
    const state = createDefaultState();
    state.predroppable.current = { role: 'knight', key: 'e4' as Key };
    const actions = useActions(state);
    actions.cancelPredrop();
    expect(state.predroppable.current).toBeUndefined();
  });

  it('cancelMove clears selection', () => {
    const state = createDefaultState();
    state.selected = 'e2' as Key;
    const actions = useActions(state);
    actions.cancelMove();
    expect(state.selected).toBeUndefined();
  });

  it('stop clears movable', () => {
    const state = createDefaultState();
    state.movable.color = 'white';
    const actions = useActions(state);
    actions.stop();
    expect(state.movable.color).toBeUndefined();
  });

  it('setShapes sets shapes', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    const shapes: DrawShape[] = [{ orig: 'e2' as Key, brush: 'green' }];
    actions.setShapes(shapes);
    expect(state.drawable.shapes).toEqual(shapes);
  });

  it('setAutoShapes sets auto shapes', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    const shapes: DrawShape[] = [{ orig: 'e4' as Key, brush: 'blue' }];
    actions.setAutoShapes(shapes);
    expect(state.drawable.autoShapes).toBe(shapes);
  });

  it('setDropMode activates', () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.setDropMode({ role: 'knight', color: 'white' });
    expect(state.dropmode.active).toBe(true);
  });

  it('cancelDropMode deactivates', () => {
    const state = createDefaultState();
    state.dropmode.active = true;
    const actions = useActions(state);
    actions.cancelDropMode();
    expect(state.dropmode.active).toBe(false);
  });

  it('explode sets exploding stages', async () => {
    const state = createDefaultState();
    const actions = useActions(state);
    actions.explode(['e4' as Key]);
    expect(state.exploding!.stage).toBe(1);
    await new Promise(r => setTimeout(r, 150));
    expect(state.exploding?.stage).toBe(2);
    await new Promise(r => setTimeout(r, 150));
    expect(state.exploding).toBeUndefined();
  });
});
