import React from 'react';
import Svg, { Text as SvgText } from 'react-native-svg';

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '\u2654',
  wQ: '\u2655',
  wR: '\u2656',
  wB: '\u2657',
  wN: '\u2658',
  wP: '\u2659',
  bK: '\u265A',
  bQ: '\u265B',
  bR: '\u265C',
  bB: '\u265D',
  bN: '\u265E',
  bP: '\u265F',
};

export function createPieceComponents() {
  const pieces: Record<string, React.FC<{ size: number }>> = {};

  for (const [key, symbol] of Object.entries(PIECE_SYMBOLS)) {
    pieces[key] = React.memo(({ size }: { size: number }) => (
      <Svg width={size} height={size} viewBox="0 0 45 45">
        <SvgText
          x="22.5"
          y="38"
          fontSize="38"
          textAnchor="middle"
          fill={key[0] === 'w' ? '#fff' : '#000'}
          stroke={key[0] === 'w' ? '#000' : '#fff'}
          strokeWidth="0.5"
        >
          {symbol}
        </SvgText>
      </Svg>
    ));
    pieces[key].displayName = `Piece_${key}`;
  }

  return pieces;
}

export const meridaPieces = createPieceComponents();
