import React from 'react';

const MockDiv = ({ children, ...rest }: any) =>
  React.createElement('div', rest, children);

const useSharedValue = (init: any) => ({ value: init });
const useAnimatedStyle = (fn: () => any) => fn();
const withTiming = (to: number) => to;
const withSequence = (...args: any[]) => args[args.length - 1];
const withDelay = (_: number, val: any) => val;
const Easing = { bezier: () => (t: number) => t, linear: (t: number) => t };
const runOnJS = (fn: any) => fn;

const AnimatedView = MockDiv;

const mock = Object.assign(AnimatedView, {
  View: AnimatedView,
  ScrollView: AnimatedView,
  FlatList: AnimatedView,
  Image: AnimatedView,
  Text: AnimatedView,
});

export default mock;
export {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
};
export const View = AnimatedView;
export const useAnimatedScrollHandler = () => () => {};
export const useDerivedValue = (fn: any) => ({ value: fn() });
export const useAnimatedRef = () => ({ current: null });
export const withSpring = (to: number) => to;
export const withRepeat = (val: any) => val;
export const cancelAnimation = () => {};
export const runOnUI = (fn: any) => fn;
export const interpolate = () => 0;
export const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend' };
export const FadeIn = { duration: () => ({}) };
export const FadeOut = { duration: () => ({}) };
export const Layout = { duration: () => ({}) };
