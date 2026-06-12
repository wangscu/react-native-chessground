import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { Key } from '../types';
import type { BoardTheme } from '../themes/types';
import { allKeys, key2pos } from '../core/util';

interface Props {
  boardSize: number;
  orientation: 'white' | 'black';
  theme: BoardTheme;
}

export const SquaresLayer = React.memo(({ boardSize, orientation, theme }: Props) => {
  const squareSize = boardSize / 8;

  const squares = useMemo(
    () =>
      allKeys.map(key => {
        const pos = key2pos(key);
        const file = orientation === 'white' ? pos[0] : 7 - pos[0];
        const rank = orientation === 'white' ? 7 - pos[1] : pos[1];
        const isLight = (pos[0] + pos[1]) % 2 === 1;
        return {
          key,
          x: file * squareSize,
          y: rank * squareSize,
          color: isLight ? theme.light : theme.dark,
        };
      }),
    [boardSize, orientation, theme],
  );

  return (
    <View style={{ position: 'absolute', width: boardSize, height: boardSize }}>
      {squares.map(sq => (
        <View
          key={sq.key}
          testID={`sq-${sq.key}`}
          style={{
            position: 'absolute',
            left: sq.x,
            top: sq.y,
            width: squareSize,
            height: squareSize,
            backgroundColor: sq.color,
          }}
        />
      ))}
    </View>
  );
});

SquaresLayer.displayName = 'SquaresLayer';
