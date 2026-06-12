import type { Key, Pieces, Color, Mobility, MobilityContext, Role } from '../types';
import * as util from './util';

const pawn: Mobility = (ctx: MobilityContext) =>
  util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) <= 1 &&
  (util.diff(ctx.orig.pos[0], ctx.dest.pos[0]) === 1
    ? ctx.dest.pos[1] === ctx.orig.pos[1] + (ctx.color === 'white' ? 1 : -1)
    : util.pawnDirAdvance(...ctx.orig.pos, ...ctx.dest.pos, ctx.color === 'white'));

const knight: Mobility = (ctx: MobilityContext) => util.knightDir(...ctx.orig.pos, ...ctx.dest.pos);

const bishop: Mobility = (ctx: MobilityContext) => util.bishopDir(...ctx.orig.pos, ...ctx.dest.pos);

const rook: Mobility = (ctx: MobilityContext) => util.rookDir(...ctx.orig.pos, ...ctx.dest.pos);

const queen: Mobility = (ctx: MobilityContext) => bishop(ctx) || rook(ctx);

const king: Mobility = (ctx: MobilityContext) =>
  util.kingDirNonCastling(...ctx.orig.pos, ...ctx.dest.pos) ||
  (ctx.orig.pos[1] === ctx.dest.pos[1] &&
    ctx.orig.pos[1] === (ctx.color === 'white' ? 0 : 7) &&
    ((ctx.orig.pos[0] === 4 &&
      ((ctx.dest.pos[0] === 2 && ctx.rookFilesFriendlies.includes(0)) ||
        (ctx.dest.pos[0] === 6 && ctx.rookFilesFriendlies.includes(7)))) ||
      ctx.rookFilesFriendlies.includes(ctx.dest.pos[0])));

const mobilityByRole: Record<Role, Mobility> = { pawn, knight, bishop, rook, queen, king };

export function computePremove(
  pieces: Pieces,
  key: Key,
  turnColor: Color,
  additionalRequirements: Mobility = () => true,
  lastMove?: Key[],
): Key[] {
  const piece = pieces.get(key);
  if (!piece || piece.color === turnColor) return [];
  const color = piece.color;
  const friendlies = new Map([...pieces].filter(([_, p]) => p.color === color));
  const orig = { key, pos: util.key2pos(key) };
  const mobility: Mobility = (ctx: MobilityContext) =>
    mobilityByRole[piece.role](ctx) && additionalRequirements(ctx);
  const partialCtx = {
    orig,
    role: piece.role,
    allPieces: pieces,
    friendlies,
    enemies: new Map([...pieces].filter(([_, p]) => p.color !== color)),
    color,
    rookFilesFriendlies: Array.from(pieces)
      .filter(
        ([k, p]) =>
          k[1] === (color === 'white' ? '1' : '8') &&
          p.color === color &&
          p.role === 'rook',
      )
      .map(([k]) => util.key2pos(k)[0]),
    lastMove: lastMove,
  };
  return util.allPosAndKey.filter(dest => mobility({ ...partialCtx, dest })).map(pk => pk.key);
}
