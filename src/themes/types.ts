import React from 'react';
import type { Color, Role } from '../types';

export interface PieceTheme {
  [key: string]: React.FC<{ size: number }>;
}

export interface BoardTheme {
  light: string;
  dark: string;
  check: string;
  lastMove: string;
  selected: string;
  premove: string;
  destDot: string;
  premoveDestDot: string;
}

export interface ChessTheme {
  pieces: PieceTheme;
  board: BoardTheme;
}

export const defaultBoardTheme: BoardTheme = {
  light: '#f0d9b5',
  dark: '#b58863',
  check: '#ff0000',
  lastMove: 'rgba(155, 199, 0, 0.41)',
  selected: 'rgba(20, 85, 30, 0.5)',
  premove: 'rgba(20, 30, 85, 0.5)',
  destDot: 'rgba(0, 0, 0, 0.15)',
  premoveDestDot: 'rgba(20, 30, 85, 0.3)',
};

export function pieceKey(color: Color, role: Role): string {
  const colorChar = color === 'white' ? 'w' : 'b';
  const roleChar: Record<Role, string> = {
    king: 'K',
    queen: 'Q',
    rook: 'R',
    bishop: 'B',
    knight: 'N',
    pawn: 'P',
  };
  return colorChar + roleChar[role];
}
