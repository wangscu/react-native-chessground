import type { Key, Color, Pieces, Dests, DrawShape, DrawBrushes, DrawBrush, MoveMetadata, Drop, Mobility, SetPremoveMetadata, KeyPair, Role, Exploding, BrushColor, RanksPosition } from '../types';
import * as fen from './fen';

export interface Drawable {
  enabled: boolean;
  visible: boolean;
  defaultSnapToValidMove: boolean;
  eraseOnMovablePieceClick: boolean;
  shapes: DrawShape[];
  autoShapes: DrawShape[];
  brushes: DrawBrushes;
  onChange?: (shapes: DrawShape[]) => void;
}

export interface DrawCurrent {
  orig: Key;
  dest?: Key;
  brush: BrushColor;
  snapToValidMove: boolean;
}

export interface BoardState {
  pieces: Pieces;
  orientation: Color;
  turnColor: Color;
  check?: Key;
  lastMove?: Key[];
  selected?: Key;

  coordinates: boolean;
  ranksPosition: RanksPosition;
  autoCastle: boolean;
  viewOnly: boolean;
  blockTouchScroll: boolean;

  highlight: {
    lastMove: boolean;
    check: boolean;
  };

  animation: {
    enabled: boolean;
    duration: number;
  };

  movable: {
    free: boolean;
    color?: Color | 'both';
    dests?: Dests;
    showDests: boolean;
    rookCastle: boolean;
    events: {
      after?: (orig: Key, dest: Key, metadata: MoveMetadata) => void;
      afterNewPiece?: (role: Role, key: Key, metadata: MoveMetadata) => void;
    };
  };

  premovable: {
    enabled: boolean;
    showDests: boolean;
    castle: boolean;
    dests?: Key[];
    customDests?: Dests;
    current?: KeyPair;
    additionalPremoveRequirements: Mobility;
    events: {
      set?: (orig: Key, dest: Key, metadata?: SetPremoveMetadata) => void;
      unset?: () => void;
    };
  };

  predroppable: {
    enabled: boolean;
    current?: { role: Role; key: Key };
    events: {
      set?: (role: Role, key: Key) => void;
      unset?: () => void;
    };
  };

  draggable: {
    enabled: boolean;
    distance: number;
    showGhost: boolean;
    deleteOnDropOff: boolean;
  };

  dropmode: {
    active: boolean;
    piece?: { role: Role; color: Color };
  };

  selectable: {
    enabled: boolean;
  };

  drawable: Drawable;

  exploding?: Exploding;

  stats: {
    dragged: boolean;
  };

  hold: {
    startAt?: number;
    start: () => void;
    cancel: () => void;
    stop: () => number;
  };

  events: {
    change?: () => void;
    move?: (orig: Key, dest: Key, capturedPiece?: { role: Role; color: Color }) => void;
    dropNewPiece?: (piece: { role: Role; color: Color }, key: Key) => void;
    select?: (key: Key) => void;
  };
}

export const defaultBrushes: DrawBrushes = {
  green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
  red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
  blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
  yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
  paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
  paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
  paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
  paleGrey: { key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15 },
  purple: { key: 'purple', color: '#68217a', opacity: 0.65, lineWidth: 10 },
  pink: { key: 'pink', color: '#ee2080', opacity: 0.5, lineWidth: 10 },
  white: { key: 'white', color: 'white', opacity: 1, lineWidth: 10 },
  paleWhite: { key: 'pwhite', color: 'white', opacity: 0.6, lineWidth: 10 },
};

export function createDefaultState(): BoardState {
  return {
    pieces: fen.read(fen.initial),
    orientation: 'white',
    turnColor: 'white',
    coordinates: true,
    ranksPosition: 'right',
    autoCastle: true,
    viewOnly: false,
    blockTouchScroll: false,
    highlight: {
      lastMove: true,
      check: true,
    },
    animation: {
      enabled: true,
      duration: 200,
    },
    movable: {
      free: true,
      color: 'both',
      showDests: true,
      rookCastle: true,
      events: {},
    },
    premovable: {
      enabled: true,
      showDests: true,
      castle: true,
      additionalPremoveRequirements: () => true,
      events: {},
    },
    predroppable: {
      enabled: false,
      events: {},
    },
    draggable: {
      enabled: true,
      distance: 3,
      showGhost: true,
      deleteOnDropOff: false,
    },
    dropmode: {
      active: false,
    },
    selectable: {
      enabled: true,
    },
    drawable: {
      enabled: true,
      visible: true,
      defaultSnapToValidMove: true,
      eraseOnMovablePieceClick: true,
      shapes: [],
      autoShapes: [],
      brushes: defaultBrushes,
    },
    stats: {
      dragged: false,
    },
    hold: {
      start() { this.startAt = Date.now(); },
      cancel() { this.startAt = undefined; },
      stop() {
        if (!this.startAt) return 0;
        const time = Date.now() - this.startAt;
        this.startAt = undefined;
        return time;
      },
    },
    events: {},
  };
}
