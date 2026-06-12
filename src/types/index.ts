export type Color = 'white' | 'black';
export type Role = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
export type Key = 'a0' | `${File}${Rank}`;
export type FEN = string;
export type Pos = [number, number];
export type NumberPair = [number, number];
export type KeyPair = [Key, Key];

export interface Piece {
  role: Role;
  color: Color;
  promoted?: boolean;
}

export interface Drop {
  role: Role;
  key: Key;
}

export type Pieces = Map<Key, Piece>;
export type PiecesDiff = Map<Key, Piece | undefined>;
export type Dests = Map<Key, Key[]>;

export interface PosAndKey {
  pos: Pos;
  key: Key;
}

export type BrushColor = 'green' | 'red' | 'blue' | 'yellow';

export type RanksPosition = 'left' | 'right';

export type DirectionalCheck = (x1: number, y1: number, x2: number, y2: number) => boolean;

export type MobilityContext = {
  orig: PosAndKey;
  dest: PosAndKey;
  role: Role;
  allPieces: Pieces;
  friendlies: Pieces;
  enemies: Pieces;
  color: Color;
  rookFilesFriendlies: number[];
  lastMove: Key[] | undefined;
};

export type Mobility = (ctx: MobilityContext) => boolean;

export interface MoveMetadata {
  premove: boolean;
  ctrlKey?: boolean;
  holdTime?: number;
  captured?: Piece;
  predrop?: boolean;
}

export interface SetPremoveMetadata {
  ctrlKey?: boolean;
}

export interface DrawShape {
  orig: Key;
  dest?: Key;
  brush?: string;
  modifiers?: DrawModifiers;
  piece?: DrawShapePiece;
  customSvg?: { html: string; center?: 'orig' | 'dest' | 'label' };
  label?: { text: string; fill?: string };
  below?: boolean;
}

export interface DrawModifiers {
  lineWidth?: number;
  hilite?: string;
}

export interface DrawShapePiece {
  role: Role;
  color: Color;
  scale?: number;
}

export interface DrawBrush {
  key: string;
  color: string;
  opacity: number;
  lineWidth: number;
}

export interface DrawBrushes {
  green: DrawBrush;
  red: DrawBrush;
  blue: DrawBrush;
  yellow: DrawBrush;
  [color: string]: DrawBrush;
}

export interface Exploding {
  stage: number;
  keys: readonly Key[];
}

export const colors: readonly Color[] = ['white', 'black'];
export const roles: readonly Role[] = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
export const files: readonly File[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ranks: readonly Rank[] = ['1', '2', '3', '4', '5', '6', '7', '8'];
