import React from 'react';

const MockView = ({ children, ...rest }: any) =>
  React.createElement('div', rest, children);

const Gesture = {
  Tap: () => ({ onStart: () => Gesture.Tap(), onEnd: () => Gesture.Tap(), onFinalize: () => Gesture.Tap() }),
  Pan: () => ({
    minDistance: () => Gesture.Pan(),
    onStart: () => Gesture.Pan(),
    onUpdate: () => Gesture.Pan(),
    onEnd: () => Gesture.Pan(),
    onFinalize: () => Gesture.Pan(),
  }),
  LongPress: () => ({
    minDuration: () => Gesture.LongPress(),
    maxDistance: () => Gesture.LongPress(),
    onStart: () => Gesture.LongPress(),
  }),
  Race: (...gestures: any[]) => gestures[0],
  Simultaneous: (...gestures: any[]) => gestures[0],
  Exclusive: (...gestures: any[]) => gestures[0],
};

const GestureDetector = ({ children }: any) =>
  React.createElement('div', null, children);

const GestureHandlerRootView = MockView;

export { Gesture, GestureDetector, GestureHandlerRootView };
export default { Gesture, GestureDetector, GestureHandlerRootView };
