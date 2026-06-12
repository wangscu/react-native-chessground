import { cburnettPieces } from './cburnett/pieces';
import { defaultBoardTheme } from './types';
import type { ChessTheme } from './types';

export const defaultTheme: ChessTheme = {
  pieces: cburnettPieces,
  board: defaultBoardTheme,
};
