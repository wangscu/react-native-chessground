import type { BoardState } from './state';
import type { Key, Color, Dests, DrawShape, DrawBrushes, Mobility } from '../types';
import { read as fenRead } from './fen';
import { setCheck, setSelected } from './board';

export interface BoardConfig {
  fen?: string;
  orientation?: Color;
  turnColor?: Color;
  check?: Color | boolean;
  lastMove?: Key[];
  coordinates?: boolean;
  autoCastle?: boolean;
  viewOnly?: boolean;
  blockTouchScroll?: boolean;
  highlight?: {
    lastMove?: boolean;
    check?: boolean;
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean;
    color?: Color | 'both';
    dests?: Dests;
    showDests?: boolean;
    rookCastle?: boolean;
    events?: {
      after?: (orig: Key, dest: Key, metadata: any) => void;
      afterNewPiece?: (role: string, key: Key, metadata: any) => void;
    };
  };
  premovable?: {
    enabled?: boolean;
    showDests?: boolean;
    castle?: boolean;
    customDests?: Dests;
    additionalPremoveRequirements?: Mobility;
    events?: {
      set?: (orig: Key, dest: Key, metadata?: any) => void;
      unset?: () => void;
    };
  };
  predroppable?: {
    enabled?: boolean;
    events?: {
      set?: (role: string, key: Key) => void;
      unset?: () => void;
    };
  };
  draggable?: {
    enabled?: boolean;
    distance?: number;
    showGhost?: boolean;
    deleteOnDropOff?: boolean;
  };
  selectable?: {
    enabled?: boolean;
  };
  drawable?: {
    enabled?: boolean;
    visible?: boolean;
    defaultSnapToValidMove?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrushes;
    onChange?: (shapes: DrawShape[]) => void;
  };
  events?: {
    change?: () => void;
    move?: (orig: Key, dest: Key, capturedPiece?: any) => void;
    dropNewPiece?: (piece: any, key: Key) => void;
    select?: (key: Key) => void;
  };
}

export function applyConfig(state: BoardState, config: BoardConfig): void {
  if (config.movable?.dests) state.movable.dests = undefined;
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];

  deepMerge(state, config);

  if (config.fen) {
    state.pieces = fenRead(config.fen);
    state.drawable.shapes = config.drawable?.shapes || [];
  }

  if ('check' in config) setCheck(state, config.check || false);
  if ('lastMove' in config && !config.lastMove) state.lastMove = undefined;
  else if (config.lastMove) state.lastMove = config.lastMove;

  if (state.selected) setSelected(state, state.selected);

  if (config.animation) {
    deepMerge(state.animation, config.animation);
    if ((state.animation.duration || 0) < 70) state.animation.enabled = false;
  }

  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.color === 'white' ? '1' : '8';
    const kingStartPos = ('e' + rank) as Key;
    const dests = state.movable.dests.get(kingStartPos);
    const king = state.pieces.get(kingStartPos);
    if (dests && king && king.role === 'king') {
      state.movable.dests.set(
        kingStartPos,
        dests.filter(
          d =>
            !(d === 'a' + rank && dests.includes(('c' + rank) as Key)) &&
            !(d === 'h' + rank && dests.includes(('g' + rank) as Key)),
        ),
      );
    }
  }
}

function deepMerge(base: any, extend: any): void {
  for (const key in extend) {
    if (key === '__proto__' || key === 'constructor' || !Object.prototype.hasOwnProperty.call(extend, key))
      continue;
    if (
      Object.prototype.hasOwnProperty.call(base, key) &&
      isPlainObject(base[key]) &&
      isPlainObject(extend[key])
    )
      deepMerge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isPlainObject(o: unknown): boolean {
  if (typeof o !== 'object' || o === null) return false;
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}
