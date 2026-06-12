import type { Pieces, Key, Piece, NumberPair } from '../types';
import { allKeys, key2pos, samePiece, distanceSq } from './util';

export type AnimVector = [number, number, number, number];
export type AnimVectors = Map<Key, AnimVector>;
export type AnimFadings = Map<Key, Piece>;

export interface AnimPlan {
  anims: AnimVectors;
  fadings: AnimFadings;
}

interface AnimPiece {
  key: Key;
  pos: [number, number];
  piece: Piece;
}

const makePiece = (key: Key, piece: Piece): AnimPiece => ({
  key,
  pos: key2pos(key),
  piece,
});

const closer = (piece: AnimPiece, pieces: AnimPiece[]): AnimPiece | undefined =>
  pieces.sort((p1, p2) => distanceSq(piece.pos, p1.pos) - distanceSq(piece.pos, p2.pos))[0];

export function computeAnimPlan(prevPieces: Pieces, currentPieces: Pieces): AnimPlan {
  const anims: AnimVectors = new Map();
  const animedOrigs: Key[] = [];
  const fadings: AnimFadings = new Map();
  const missings: AnimPiece[] = [];
  const news: AnimPiece[] = [];
  const prePieces: Map<Key, AnimPiece> = new Map();

  for (const [k, p] of prevPieces) {
    prePieces.set(k, makePiece(k, p));
  }

  for (const key of allKeys) {
    const curP = currentPieces.get(key);
    const preP = prePieces.get(key);
    if (curP) {
      if (preP) {
        if (!samePiece(curP, preP.piece)) {
          missings.push(preP);
          news.push(makePiece(key, curP));
        }
      } else {
        news.push(makePiece(key, curP));
      }
    } else if (preP) {
      missings.push(preP);
    }
  }

  for (const newP of news) {
    const preP = closer(
      newP,
      missings.filter(p => samePiece(newP.piece, p.piece)),
    );
    if (preP) {
      const vector: NumberPair = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
      anims.set(newP.key, [...vector, ...vector] as AnimVector);
      animedOrigs.push(preP.key);
    }
  }

  for (const p of missings) {
    if (!animedOrigs.includes(p.key)) {
      fadings.set(p.key, p.piece);
    }
  }

  return { anims, fadings };
}

export function getAnimTargets(
  anims: AnimVectors,
  progress: number,
): Map<Key, NumberPair> {
  const result = new Map<Key, NumberPair>();
  for (const [key, vector] of anims) {
    result.set(key, [vector[0] * progress, vector[1] * progress]);
  }
  return result;
}
