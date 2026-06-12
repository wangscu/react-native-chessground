import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import type { Key, RanksPosition } from '../types';
import { files, ranks } from '../types';

interface Props {
  boardSize: number;
  orientation: 'white' | 'black';
  ranksPosition: RanksPosition;
  lightColor: string;
  darkColor: string;
}

export const Coordinates = React.memo(
  ({ boardSize, orientation, ranksPosition, lightColor, darkColor }: Props) => {
    const squareSize = boardSize / 8;
    const fontSize = squareSize * 0.22;

    const orderedFiles = useMemo(
      () => (orientation === 'white' ? [...files] : [...files].reverse()),
      [orientation],
    );

    const orderedRanks = useMemo(
      () => (orientation === 'white' ? [...ranks].reverse() : [...ranks]),
      [orientation],
    );

    return (
      <View style={{ position: 'absolute', width: boardSize, height: boardSize }} pointerEvents="none">
        {orderedFiles.map((f, i) => {
          const isLight = (i + (orientation === 'white' ? 7 : 0)) % 2 === 1;
          return (
            <Text
              key={`file-${f}`}
              style={{
                position: 'absolute',
                left: i * squareSize + squareSize - fontSize * 0.8,
                top: boardSize - fontSize * 1.2,
                fontSize,
                fontWeight: '700',
                color: isLight ? darkColor : lightColor,
              }}
            >
              {f}
            </Text>
          );
        })}
        {orderedRanks.map((r, i) => {
          const isLight = (i + (orientation === 'white' ? 0 : 1)) % 2 === 1;
          const left = ranksPosition === 'left' ? 2 : boardSize - fontSize * 0.8;
          return (
            <Text
              key={`rank-${r}`}
              style={{
                position: 'absolute',
                left,
                top: i * squareSize + 1,
                fontSize,
                fontWeight: '700',
                color: isLight ? darkColor : lightColor,
              }}
            >
              {r}
            </Text>
          );
        })}
      </View>
    );
  },
);

Coordinates.displayName = 'Coordinates';
