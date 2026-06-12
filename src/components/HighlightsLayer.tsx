import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { Key, Dests, Color, Pieces } from '../types';
import type { BoardTheme } from '../themes/types';
import { keyToPixel } from '../core/util';

interface Props {
  boardSize: number;
  orientation: Color;
  theme: BoardTheme;
  selected?: Key;
  lastMove?: Key[];
  check?: Key;
  dests?: Dests;
  pieces: Pieces;
  premoveDests?: Key[];
  premoveCurrent?: [Key, Key];
  showDests: boolean;
  showPremoveDests: boolean;
}

export const HighlightsLayer = React.memo(
  ({
    boardSize,
    orientation,
    theme,
    selected,
    lastMove,
    check,
    dests,
    pieces,
    premoveDests,
    premoveCurrent,
    showDests,
    showPremoveDests,
  }: Props) => {
    const squareSize = boardSize / 8;
    const asWhite = orientation === 'white';

    const highlights = useMemo(() => {
      const items: React.ReactElement[] = [];

      if (lastMove) {
        for (const key of lastMove) {
          const [x, y] = keyToPixel(key, asWhite, boardSize);
          items.push(
            <View
              key={`last-${key}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: squareSize,
                height: squareSize,
                backgroundColor: theme.lastMove,
              }}
            />,
          );
        }
      }

      if (selected) {
        const [x, y] = keyToPixel(selected, asWhite, boardSize);
        items.push(
          <View
            key="selected"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: squareSize,
              height: squareSize,
              backgroundColor: theme.selected,
            }}
          />,
        );
      }

      if (check) {
        const [x, y] = keyToPixel(check, asWhite, boardSize);
        items.push(
          <View
            key="check"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: squareSize,
              height: squareSize,
              backgroundColor: theme.check + '66',
              borderRadius: squareSize / 2,
            }}
          />,
        );
      }

      if (premoveCurrent) {
        for (const key of premoveCurrent) {
          const [x, y] = keyToPixel(key, asWhite, boardSize);
          items.push(
            <View
              key={`premove-${key}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: squareSize,
                height: squareSize,
                backgroundColor: theme.premove,
              }}
            />,
          );
        }
      }

      return items;
    }, [lastMove, selected, check, premoveCurrent, boardSize, asWhite, squareSize, theme]);

    const destDots = useMemo(() => {
      if (!showDests || !selected || !dests) return null;
      const selectedDests = dests.get(selected);
      if (!selectedDests) return null;

      const dotSize = squareSize * 0.3;
      const captureSize = squareSize;
      const items: React.ReactElement[] = [];

      for (const dest of selectedDests) {
        const [x, y] = keyToPixel(dest, asWhite, boardSize);
        const hasPiece = pieces.has(dest);
        if (hasPiece) {
          items.push(
            <View
              key={`dest-capture-${dest}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: captureSize,
                height: captureSize,
                borderRadius: captureSize / 2,
                borderWidth: squareSize * 0.08,
                borderColor: theme.destDot,
              }}
            />,
          );
        } else {
          items.push(
            <View
              key={`dest-dot-${dest}`}
              style={{
                position: 'absolute',
                left: x + (squareSize - dotSize) / 2,
                top: y + (squareSize - dotSize) / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: theme.destDot,
              }}
            />,
          );
        }
      }
      return items;
    }, [selected, dests, pieces, showDests, boardSize, asWhite, squareSize, theme]);

    const premoveDots = useMemo(() => {
      if (!showPremoveDests || !selected || !premoveDests) return null;
      const dotSize = squareSize * 0.3;
      const items: React.ReactElement[] = [];

      for (const dest of premoveDests) {
        const [x, y] = keyToPixel(dest, asWhite, boardSize);
        items.push(
          <View
            key={`premove-dot-${dest}`}
            style={{
              position: 'absolute',
              left: x + (squareSize - dotSize) / 2,
              top: y + (squareSize - dotSize) / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: theme.premoveDestDot,
            }}
          />,
        );
      }
      return items;
    }, [selected, premoveDests, showPremoveDests, boardSize, asWhite, squareSize, theme]);

    return (
      <View
        style={{ position: 'absolute', width: boardSize, height: boardSize }}
        pointerEvents="none"
      >
        {highlights}
        {destDots}
        {premoveDots}
      </View>
    );
  },
);

HighlightsLayer.displayName = 'HighlightsLayer';
