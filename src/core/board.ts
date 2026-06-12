import type { BoardState } from './state';
import type { Key, Color, Pieces, Dests, PiecesDiff, Piece, MoveMetadata, Drop, SetPremoveMetadata, Role } from '../types';
import { computePremove } from './premove';
import { opposite, key2pos, pos2keyUnsafe } from './util';

export function callUserFunction<T extends (...args: any[]) => void>(
  f: T | undefined,
  ...args: Parameters<T>
): void {
  if (f) setTimeout(() => f(...args), 1);
}

export function setCheck(state: BoardState, color: Color | boolean): void {
  state.check = undefined;
  if (color === true) color = state.turnColor;
  if (color) {
    for (const [k, p] of state.pieces) {
      if (p.role === 'king' && p.color === color) {
        state.check = k;
      }
    }
  }
}

export function setSelected(state: BoardState, key: Key): void {
  state.selected = key;
  if (!isPremovable(state, key)) {
    state.premovable.dests = undefined;
  } else if (!state.premovable.customDests) {
    state.premovable.dests = computePremove(
      state.pieces,
      key,
      state.turnColor,
      state.premovable.additionalPremoveRequirements,
      state.lastMove,
    );
  }
}

export function unselect(state: BoardState): void {
  state.selected = undefined;
  state.premovable.dests = undefined;
  state.hold.cancel();
}

function isMovable(state: BoardState, orig: Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

export const canMove = (state: BoardState, orig: Key, dest: Key): boolean =>
  orig !== dest &&
  isMovable(state, orig) &&
  (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest));

function isPremovable(state: BoardState, orig: Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.premovable.enabled &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

const canPremove = (state: BoardState, orig: Key, dest: Key): boolean =>
  orig !== dest &&
  isPremovable(state, orig) &&
  (state.premovable.customDests?.get(orig) ??
    computePremove(state.pieces, orig, state.turnColor, state.premovable.additionalPremoveRequirements, state.lastMove)
  ).includes(dest);

function canDrop(state: BoardState, orig: Key, dest: Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (orig === dest || !state.pieces.has(dest)) &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

function canPredrop(state: BoardState, orig: Key, dest: Key): boolean {
  const piece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  return (
    !!piece &&
    (!destPiece || destPiece.color !== state.movable.color) &&
    state.predroppable.enabled &&
    (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

function setPremove(state: BoardState, orig: Key, dest: Key, meta: SetPremoveMetadata): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(state: BoardState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: BoardState, role: Role, key: Key): void {
  unsetPremove(state);
  state.predroppable.current = { role, key };
  callUserFunction(state.predroppable.events.set, role, key);
}

export function unsetPredrop(state: BoardState): void {
  if (state.predroppable.current) {
    state.predroppable.current = undefined;
    callUserFunction(state.predroppable.events.unset);
  }
}

function tryAutoCastle(state: BoardState, orig: Key, dest: Key): boolean {
  if (!state.autoCastle) return false;
  const king = state.pieces.get(orig);
  if (!king || king.role !== 'king') return false;
  const origPos = key2pos(orig);
  const destPos = key2pos(dest);
  if ((origPos[1] !== 0 && origPos[1] !== 7) || origPos[1] !== destPos[1]) return false;
  if (origPos[0] === 4 && !state.pieces.has(dest)) {
    if (destPos[0] === 6) dest = pos2keyUnsafe([7, destPos[1]]);
    else if (destPos[0] === 2) dest = pos2keyUnsafe([0, destPos[1]]);
  }
  const rook = state.pieces.get(dest);
  if (!rook || rook.color !== king.color || rook.role !== 'rook') return false;
  state.pieces.delete(orig);
  state.pieces.delete(dest);
  if (origPos[0] < destPos[0]) {
    state.pieces.set(pos2keyUnsafe([6, destPos[1]]), king);
    state.pieces.set(pos2keyUnsafe([5, destPos[1]]), rook);
  } else {
    state.pieces.set(pos2keyUnsafe([2, destPos[1]]), king);
    state.pieces.set(pos2keyUnsafe([3, destPos[1]]), rook);
  }
  return true;
}

export function baseMove(state: BoardState, orig: Key, dest: Key): Piece | boolean {
  const origPiece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = destPiece && destPiece.color !== origPiece.color ? destPiece : undefined;
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces.set(dest, origPiece);
    state.pieces.delete(orig);
  }
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseNewPiece(state: BoardState, piece: Piece, key: Key, force?: boolean): boolean {
  if (state.pieces.has(key)) {
    if (force) state.pieces.delete(key);
    else return false;
  }
  callUserFunction(state.events.dropNewPiece, piece, key);
  state.pieces.set(key, piece);
  state.lastMove = [key];
  state.check = undefined;
  callUserFunction(state.events.change);
  state.movable.dests = undefined;
  state.turnColor = opposite(state.turnColor);
  return true;
}

function baseUserMove(state: BoardState, orig: Key, dest: Key): Piece | boolean {
  const result = baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.turnColor = opposite(state.turnColor);
  }
  return result;
}

export function userMove(state: BoardState, orig: Key, dest: Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const holdTime = state.hold.stop();
      unselect(state);
      state.stats.dragged = false;
      const metadata: MoveMetadata = { premove: false, holdTime };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, {});
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

export function dropNewPiece(state: BoardState, orig: Key, dest: Key, force?: boolean): void {
  const piece = state.pieces.get(orig);
  if (piece && (canDrop(state, orig, dest) || force)) {
    state.pieces.delete(orig);
    baseNewPiece(state, piece, dest, force);
    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      premove: false,
      predrop: false,
    });
  } else if (piece && canPredrop(state, orig, dest)) {
    setPredrop(state, piece.role, dest);
  } else {
    unsetPremove(state);
    unsetPredrop(state);
  }
  state.pieces.delete(orig);
  unselect(state);
}

export function selectSquare(state: BoardState, key: Key, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      state.hold.cancel();
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        state.stats.dragged = false;
        return;
      }
    }
  }
  if (
    (state.selectable.enabled || state.draggable.enabled) &&
    (isMovable(state, key) || isPremovable(state, key))
  ) {
    setSelected(state, key);
    state.hold.start();
  }
}

export function setPieces(state: BoardState, pieces: PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
}

export function toggleOrientation(state: BoardState): void {
  state.orientation = opposite(state.orientation);
  state.selected = undefined;
}

export function playPremove(state: BoardState): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const [orig, dest] = move;
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const metadata: MoveMetadata = { premove: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      success = true;
    }
  }
  unsetPremove(state);
  return success;
}

export function playPredrop(state: BoardState, validate: (drop: Drop) => boolean): boolean {
  const drop = state.predroppable.current;
  if (!drop) return false;
  let success = false;
  if (validate(drop)) {
    const piece = { role: drop.role, color: state.movable.color as Color } as Piece;
    if (baseNewPiece(state, piece, drop.key)) {
      callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
        premove: false,
        predrop: true,
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMove(state: BoardState): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: BoardState): void {
  state.movable.color = undefined;
  state.movable.dests = undefined;
  cancelMove(state);
}

export const whitePov = (s: BoardState): boolean => s.orientation === 'white';

export function getSnappedKey(
  orig: Key,
  targetKey: Key | undefined,
): Key | undefined {
  if (!targetKey) return undefined;
  const origPos = key2pos(orig);
  const destPos = key2pos(targetKey);
  const isSame = origPos[0] === destPos[0] && origPos[1] === destPos[1];
  const isQueenDir = (origPos[0] === destPos[0]) !== (origPos[1] === destPos[1]) ||
    (Math.abs(origPos[0] - destPos[0]) === Math.abs(origPos[1] - destPos[1]) && origPos[0] !== destPos[0]);
  const isKnightDir = Math.abs(origPos[0] - destPos[0]) * Math.abs(origPos[1] - destPos[1]) === 2;
  if (isSame || isQueenDir || isKnightDir) return targetKey;
  return targetKey;
}

export function reset(state: BoardState): void {
  state.lastMove = undefined;
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
}
