import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { Exploding, Key, Color } from '../types';
import { keyToPixel } from '../core/util';

interface Props {
  exploding: Exploding;
  boardSize: number;
  orientation: Color;
}

const ExplosionSquare = React.memo(
  ({
    key_,
    boardSize,
    orientation,
    stage,
  }: {
    key_: Key;
    boardSize: number;
    orientation: Color;
    stage: number;
  }) => {
    const squareSize = boardSize / 8;
    const [x, y] = keyToPixel(key_, orientation === 'white', boardSize);

    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (stage === 1) {
        scale.value = withTiming(1, { duration: 120 });
        opacity.value = 1;
      } else if (stage === 2) {
        scale.value = withTiming(1.5, { duration: 120 });
        opacity.value = withTiming(0, { duration: 120 });
      }
    }, [stage]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: x + squareSize / 2 },
        { translateY: y + squareSize / 2 },
        { translateX: -squareSize / 2 },
        { translateY: -squareSize / 2 },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: squareSize,
            height: squareSize,
            backgroundColor: '#ff6600',
            borderRadius: squareSize / 4,
          },
          animatedStyle,
        ]}
      />
    );
  },
);

ExplosionSquare.displayName = 'ExplosionSquare';

export const ExplosionOverlay = React.memo(({ exploding, boardSize, orientation }: Props) => {
  return (
    <View
      style={{ position: 'absolute', width: boardSize, height: boardSize }}
      pointerEvents="none"
    >
      {exploding.keys.map(key => (
        <ExplosionSquare
          key={key}
          key_={key}
          boardSize={boardSize}
          orientation={orientation}
          stage={exploding.stage}
        />
      ))}
    </View>
  );
});

ExplosionOverlay.displayName = 'ExplosionOverlay';
