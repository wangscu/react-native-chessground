import React from 'react';

const View = React.forwardRef(({ children, style, testID, ...rest }: any, ref: any) =>
  React.createElement('div', { ref, 'data-testid': testID, style, ...rest }, children),
);
View.displayName = 'View';

const Text = ({ children, style, testID, ...rest }: any) =>
  React.createElement('span', { 'data-testid': testID, style, ...rest }, children);

const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => (Array.isArray(style) ? Object.assign({}, ...style) : style || {}),
};

const LayoutAnimation = {
  configureNext: () => {},
  Presets: { easeInEaseOut: {} },
};

const Platform = { OS: 'ios', select: (obj: any) => obj.ios || obj.default };

const Dimensions = {
  get: () => ({ width: 375, height: 812 }),
  addEventListener: () => ({ remove: () => {} }),
};

const PixelRatio = { get: () => 2, getFontScale: () => 1, getPixelSizeForLayoutSize: (s: number) => s * 2 };

const Animated = {
  View,
  createAnimatedComponent: (comp: any) => comp,
};

const Image = ({ source, style, testID, ...rest }: any) =>
  React.createElement('img', { 'data-testid': testID, src: typeof source === 'string' ? source : '', style, ...rest });

export {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  Dimensions,
  PixelRatio,
  Animated,
  Image,
};

export default {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  Dimensions,
  PixelRatio,
  Animated,
  Image,
};
