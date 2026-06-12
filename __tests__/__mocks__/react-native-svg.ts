import React from 'react';

const MockSvg = ({ children, ...rest }: any) =>
  React.createElement('div', rest, children);

const createMock = (name: string) => {
  const Comp = (props: any) => React.createElement('div', { ...props }, props.children);
  Comp.displayName = name;
  return Comp;
};

const Svg = MockSvg;
const Path = createMock('Path');
const Circle = createMock('Circle');
const Line = createMock('Line');
const Rect = createMock('Rect');
const G = createMock('G');
const Defs = createMock('Defs');
const Marker = createMock('Marker');
const Text = createMock('SvgText');
const ClipPath = createMock('ClipPath');

export default Svg;
export { Svg, Path, Circle, Line, Rect, G, Defs, Marker, Text, ClipPath };
