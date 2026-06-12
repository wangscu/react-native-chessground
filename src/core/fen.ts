import type { FEN, Pieces, Key, Role, Color } from '../types';
import { invRanks, pos2key } from './util';

export const initial: FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const roles: Record<string, Role> = {
  p: 'pawn',
  r: 'rook',
  n: 'knight',
  b: 'bishop',
  q: 'queen',
  k: 'king',
};

const letters: Record<Role, string> = {
  pawn: 'p',
  rook: 'r',
  knight: 'n',
  bishop: 'b',
  queen: 'q',
  king: 'k',
};

export function read(fen: FEN): Pieces {
  if (fen === 'start') fen = initial;
  const pieces: Pieces = new Map();
  let row = 7, col = 0;
  for (const c of fen) {
    switch (c) {
      case ' ':
      case '[':
        return pieces;
      case '/':
        --row;
        if (row < 0) return pieces;
        col = 0;
        break;
      case '~': {
        const k = pos2key([col - 1, row]);
        const piece = k && pieces.get(k);
        if (piece) piece.promoted = true;
        break;
      }
      default: {
        const nb = c.charCodeAt(0);
        if (nb < 57) col += nb - 48;
        else {
          const role = c.toLowerCase();
          const key = pos2key([col, row]);
          if (key)
            pieces.set(key, {
              role: roles[role],
              color: c === role ? 'black' : 'white',
            });
          ++col;
        }
      }
    }
  }
  return pieces;
}

export function write(pieces: Pieces): FEN {
  return invRanks
    .map(y =>
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        .map(x => {
          const piece = pieces.get((x + y) as Key);
          if (piece) {
            let p = letters[piece.role];
            if (piece.color === 'white') p = p.toUpperCase();
            if (piece.promoted) p += '~';
            return p;
          } else return '1';
        })
        .join(''),
    )
    .join('/')
    .replace(/1{2,}/g, s => s.length.toString());
}
