import { useCallback, useMemo, useRef } from 'react';
import type { BoardState } from '../core/state';
import type { BoardConfig } from '../core/config';
import type { Key, Pieces, Color, PiecesDiff, Piece, DrawShape, Drop } from '../types';
import { createDefaultState } from '../core/state';
import { applyConfig } from '../core/config';
import { write as fenWrite } from '../core/fen';
import * as board from '../core/board';

export interface BoardActions {
  set: (config: BoardConfig) => void;
  getFen: () => string;
  toggleOrientation: () => void;
  move: (orig: Key, dest: Key) => void;
  setPieces: (pieces: PiecesDiff) => void;
  selectSquare: (key: Key | null, force?: boolean) => void;
  newPiece: (piece: Piece, key: Key) => void;
  playPremove: () => boolean;
  cancelPremove: () => void;
  playPredrop: (validate: (drop: Drop) => boolean) => boolean;
  cancelPredrop: () => void;
  cancelMove: () => void;
  stop: () => void;
  explode: (keys: Key[]) => void;
  setShapes: (shapes: DrawShape[]) => void;
  setAutoShapes: (shapes: DrawShape[]) => void;
  setDropMode: (piece?: Piece) => void;
  cancelDropMode: () => void;
}

export function useBoardActions(
  state: BoardState,
  onStateChange: () => void,
): BoardActions {
  const mutate = useCallback(
    (fn: (s: BoardState) => void) => {
      fn(state);
      onStateChange();
    },
    [state, onStateChange],
  );

  return useMemo(
    () => ({
      set(config: BoardConfig) {
        mutate(s => {
          if (config.orientation && config.orientation !== s.orientation) {
            board.toggleOrientation(s);
          }
          applyConfig(s, config);
        });
      },

      getFen: () => fenWrite(state.pieces),

      toggleOrientation() {
        mutate(board.toggleOrientation);
      },

      move(orig: Key, dest: Key) {
        mutate(s => board.baseMove(s, orig, dest));
      },

      setPieces(pieces: PiecesDiff) {
        mutate(s => board.setPieces(s, pieces));
      },

      selectSquare(key: Key | null, force?: boolean) {
        mutate(s => {
          if (key) board.selectSquare(s, key, force);
          else if (s.selected) board.unselect(s);
        });
      },

      newPiece(piece: Piece, key: Key) {
        mutate(s => board.baseNewPiece(s, piece, key));
      },

      playPremove(): boolean {
        let result = false;
        mutate(s => {
          result = board.playPremove(s);
        });
        return result;
      },

      cancelPremove() {
        mutate(board.unsetPremove);
      },

      playPredrop(validate: (drop: Drop) => boolean): boolean {
        let result = false;
        mutate(s => {
          result = board.playPredrop(s, validate);
        });
        return result;
      },

      cancelPredrop() {
        mutate(board.unsetPredrop);
      },

      cancelMove() {
        mutate(board.cancelMove);
      },

      stop() {
        mutate(board.stop);
      },

      explode(keys: Key[]) {
        mutate(s => {
          s.exploding = { stage: 1, keys };
        });
        setTimeout(() => {
          mutate(s => {
            if (s.exploding) s.exploding.stage = 2;
          });
          setTimeout(() => {
            mutate(s => {
              s.exploding = undefined;
            });
          }, 120);
        }, 120);
      },

      setShapes(shapes: DrawShape[]) {
        mutate(s => {
          s.drawable.shapes = shapes.slice();
        });
      },

      setAutoShapes(shapes: DrawShape[]) {
        mutate(s => {
          s.drawable.autoShapes = shapes;
        });
      },

      setDropMode(piece?: Piece) {
        mutate(s => {
          s.dropmode = { active: true, piece };
        });
      },

      cancelDropMode() {
        mutate(s => {
          s.dropmode = { active: false };
        });
      },
    }),
    [state, mutate],
  );
}
