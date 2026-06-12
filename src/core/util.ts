import type { Key, Pos, Piece, Color, NumberPair, PosAndKey, DirectionalCheck } from '../types';

export const invRanks: readonly string[] = ['8', '7', '6', '5', '4', '3', '2', '1'];

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const allKeys: readonly Key[] = files.flatMap(f => ranks.map(r => (f + r) as Key));

export const pos2key = (pos: Pos): Key | undefined =>
  pos.every(x => x >= 0 && x <= 7) ? allKeys[8 * pos[0] + pos[1]] : undefined;

export const pos2keyUnsafe = (pos: Pos): Key => pos2key(pos)!;

export const key2pos = (k: Key): Pos => [k.charCodeAt(0) - 97, k.charCodeAt(1) - 49];

export const uciToMove = (uci: string | undefined): Key[] | undefined => {
  if (!uci) return undefined;
  if (uci[1] === '@') return [uci.slice(2, 4) as Key];
  return [uci.slice(0, 2), uci.slice(2, 4)] as Key[];
};

export const allPos: readonly Pos[] = allKeys.map(key2pos);

export const allPosAndKey: readonly PosAndKey[] = allKeys.map((key, i) => ({ key, pos: allPos[i] }));

export const opposite = (c: Color): Color => (c === 'white' ? 'black' : 'white');

export const distanceSq = (pos1: Pos, pos2: Pos): number =>
  (pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2;

export const samePiece = (p1: Piece, p2: Piece): boolean =>
  p1.role === p2.role && p1.color === p2.color;

export const samePos = (p1: Pos, p2: Pos): boolean => p1[0] === p2[0] && p1[1] === p2[1];

export const diff = (a: number, b: number): number => Math.abs(a - b);

export const knightDir: DirectionalCheck = (x1, y1, x2, y2) => diff(x1, x2) * diff(y1, y2) === 2;

export const rookDir: DirectionalCheck = (x1, y1, x2, y2) => (x1 === x2) !== (y1 === y2);

export const bishopDir: DirectionalCheck = (x1, y1, x2, y2) => diff(x1, x2) === diff(y1, y2) && x1 !== x2;

export const queenDir: DirectionalCheck = (x1, y1, x2, y2) =>
  rookDir(x1, y1, x2, y2) || bishopDir(x1, y1, x2, y2);

export const kingDirNonCastling: DirectionalCheck = (x1, y1, x2, y2) =>
  Math.max(diff(x1, x2), diff(y1, y2)) === 1;

export const pawnDirCapture = (x1: number, y1: number, x2: number, y2: number, isDirectionUp: boolean) =>
  diff(x1, x2) === 1 && y2 === y1 + (isDirectionUp ? 1 : -1);

export const pawnDirAdvance = (x1: number, y1: number, x2: number, y2: number, isDirectionUp: boolean) => {
  const step = isDirectionUp ? 1 : -1;
  return (
    x1 === x2 &&
    (y2 === y1 + step ||
      (y2 === y1 + 2 * step && (isDirectionUp ? y1 <= 1 : y1 >= 6)))
  );
};

export const squaresBetween = (x1: number, y1: number, x2: number, y2: number): Key[] => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx && dy && Math.abs(dx) !== Math.abs(dy)) return [];
  const stepX = Math.sign(dx), stepY = Math.sign(dy);
  const squares: Pos[] = [];
  let x = x1 + stepX, y = y1 + stepY;
  while (x !== x2 || y !== y2) {
    squares.push([x, y]);
    x += stepX;
    y += stepY;
  }
  return squares.map(pos2key).filter(k => k !== undefined);
};

export function computeSquareCenter(
  key: Key,
  asWhite: boolean,
  boardSize: number,
): NumberPair {
  const squareSize = boardSize / 8;
  const pos = key2pos(key);
  const file = asWhite ? pos[0] : 7 - pos[0];
  const rank = asWhite ? 7 - pos[1] : pos[1];
  return [
    file * squareSize + squareSize / 2,
    rank * squareSize + squareSize / 2,
  ];
}

export function posToPixel(
  pos: Pos,
  asWhite: boolean,
  boardSize: number,
): NumberPair {
  const squareSize = boardSize / 8;
  return [
    (asWhite ? pos[0] : 7 - pos[0]) * squareSize,
    (asWhite ? 7 - pos[1] : pos[1]) * squareSize,
  ];
}

export function keyToPixel(
  key: Key,
  asWhite: boolean,
  boardSize: number,
): NumberPair {
  return posToPixel(key2pos(key), asWhite, boardSize);
}

export function pixelToKey(
  x: number,
  y: number,
  asWhite: boolean,
  boardSize: number,
): Key | undefined {
  const squareSize = boardSize / 8;
  let file = Math.floor(x / squareSize);
  let rank = 7 - Math.floor(y / squareSize);
  if (!asWhite) {
    file = 7 - file;
    rank = 7 - rank;
  }
  return file >= 0 && file < 8 && rank >= 0 && rank < 8
    ? pos2key([file, rank])
    : undefined;
}

export const adjacentSquares = (square: Key): Key[] => {
  const pos = key2pos(square);
  const adjacent: Pos[] = [];
  if (pos[0] > 0) adjacent.push([pos[0] - 1, pos[1]]);
  if (pos[0] < 7) adjacent.push([pos[0] + 1, pos[1]]);
  return adjacent.map(pos2key).filter(k => k !== undefined);
};

export const squareShiftedVertically = (square: Key, delta: number): Key | undefined => {
  const pos = key2pos(square);
  pos[1] += delta;
  return pos2key(pos);
};
