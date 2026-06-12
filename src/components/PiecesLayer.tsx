import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { Pieces, Key, Color } from '../types';
import type { PieceTheme } from '../themes/types';
import { pieceKey } from '../themes/types';
import { PieceComponent } from './Piece';

interface Props {
  pieces: Pieces;
  boardSize: number;
  orientation: Color;
  theme: PieceTheme;
  animDuration: number;
  draggingKey?: Key;
  fadingKeys?: Set<Key>;
}

export const PiecesLayer = React.memo(
  ({ pieces, boardSize, orientation, theme, animDuration, draggingKey, fadingKeys }: Props) => {
    const pieceElements = useMemo(() => {
      const elements: React.ReactElement[] = [];
      for (const [key, piece] of pieces) {
        if (key === 'a0') continue;
        const pk = pieceKey(piece.color, piece.role);
        elements.push(
          <PieceComponent
            key={key}
            pieceKeyStr={pk}
            piece={piece}
            squareKey={key}
            boardSize={boardSize}
            orientation={orientation}
            theme={theme}
            animDuration={animDuration}
            isDragging={key === draggingKey}
            isFading={fadingKeys?.has(key) ?? false}
          />,
        );
      }
      return elements;
    }, [pieces, boardSize, orientation, theme, animDuration, draggingKey, fadingKeys]);

    return (
      <View
        style={{
          position: 'absolute',
          width: boardSize,
          height: boardSize,
        }}
        pointerEvents="box-none"
      >
        {pieceElements}
      </View>
    );
  },
);

PiecesLayer.displayName = 'PiecesLayer';
