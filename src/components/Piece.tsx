import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { Key, Piece as PieceType, Color } from '../types';
import type { PieceTheme } from '../themes/types';
import { keyToPixel } from '../core/util';

interface Props {
  pieceKeyStr: string;
  piece: PieceType;
  squareKey: Key;
  boardSize: number;
  orientation: Color;
  theme: PieceTheme;
  animDuration: number;
  isDragging: boolean;
  isFading: boolean;
  opacity?: number;
}

export const PieceComponent = React.memo(
  ({
    pieceKeyStr,
    piece,
    squareKey,
    boardSize,
    orientation,
    theme,
    animDuration,
    isDragging,
    isFading,
    opacity: opacityProp = 1,
  }: Props) => {
    const squareSize = boardSize / 8;
    const [targetX, targetY] = keyToPixel(squareKey, orientation === 'white', boardSize);

    const translateX = useSharedValue(targetX);
    const translateY = useSharedValue(targetY);
    const fadeOpacity = useSharedValue(isFading ? 1 : 0);

    useEffect(() => {
      if (!isDragging && !isFading) {
        translateX.value = withTiming(targetX, {
          duration: animDuration,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        });
        translateY.value = withTiming(targetY, {
          duration: animDuration,
          easing: Easing.bezier(0.37, 0, 0.63, 1),
        });
      }
    }, [targetX, targetY, isDragging, isFading, animDuration]);

    useEffect(() => {
      if (isFading) {
        fadeOpacity.value = withTiming(0, { duration: animDuration });
      }
    }, [isFading, animDuration]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: isFading ? fadeOpacity.value : opacityProp,
    }));

    const PieceSvg = theme[pieceKeyStr];
    if (!PieceSvg) return null;

    return (
      <Animated.View
        testID={`piece-${squareKey}`}
        style={[
          {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
          },
          animatedStyle,
        ]}
        pointerEvents={isDragging ? 'none' : 'auto'}
      >
        <PieceSvg size={squareSize} />
      </Animated.View>
    );
  },
  (prev, next) => {
    if (prev.pieceKeyStr !== next.pieceKeyStr) return false;
    if (prev.squareKey !== next.squareKey) return false;
    if (prev.boardSize !== next.boardSize) return false;
    if (prev.orientation !== next.orientation) return false;
    if (prev.isDragging !== next.isDragging) return false;
    if (prev.isFading !== next.isFading) return false;
    return true;
  },
);

PieceComponent.displayName = 'PieceComponent';
