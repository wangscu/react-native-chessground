import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { DrawShape, Color, Key, Piece } from '../types';
import type { PieceTheme } from '../themes/types';
import { pieceKey } from '../themes/types';
import { key2pos } from '../core/util';

interface Props {
  autoShapes: DrawShape[];
  boardSize: number;
  orientation: Color;
  pieces: Map<Key, Piece>;
  theme: PieceTheme;
}

export const AutoPiecesLayer = React.memo(
  ({ autoShapes, boardSize, orientation, pieces, theme }: Props) => {
    const autoPieces = useMemo(
      () => autoShapes.filter(s => s.piece),
      [autoShapes],
    );

    if (autoPieces.length === 0) return null;

    const squareSize = boardSize / 8;
    const asWhite = orientation === 'white';

    return (
      <View
        style={{ position: 'absolute', width: boardSize, height: boardSize, opacity: 0.5 }}
        pointerEvents="none"
      >
        {autoPieces.map((shape, i) => {
          if (!shape.piece) return null;
          const pos = key2pos(shape.orig);
          const file = asWhite ? pos[0] : 7 - pos[0];
          const rank = asWhite ? 7 - pos[1] : pos[1];
          const x = file * squareSize;
          const y = rank * squareSize;
          const scale = shape.piece.scale ?? 1;
          const pk = pieceKey(shape.piece.color, shape.piece.role);
          const PieceSvg = theme[pk];
          if (!PieceSvg) return null;
          return (
            <View
              key={`auto-${i}`}
              style={{
                position: 'absolute',
                left: x + (squareSize - squareSize * scale) / 2,
                top: y + (squareSize - squareSize * scale) / 2,
                width: squareSize * scale,
                height: squareSize * scale,
              }}
            >
              <PieceSvg size={squareSize * scale} />
            </View>
          );
        })}
      </View>
    );
  },
  (prev, next) =>
    prev.autoShapes === next.autoShapes &&
    prev.boardSize === next.boardSize &&
    prev.orientation === next.orientation &&
    prev.theme === next.theme,
);

AutoPiecesLayer.displayName = 'AutoPiecesLayer';
