import React, { useMemo } from 'react';
import Svg, { Line, Circle, Defs, Marker, Path, G, Text as SvgText } from 'react-native-svg';
import type { DrawShape, DrawBrushes, Color, Key } from '../types';
import { key2pos } from '../core/util';

interface Props {
  shapes: DrawShape[];
  autoShapes: DrawShape[];
  brushes: DrawBrushes;
  boardSize: number;
  orientation: Color;
  visible: boolean;
}

function getSquareCenter(key: Key, asWhite: boolean, boardSize: number): [number, number] {
  const squareSize = boardSize / 8;
  const pos = key2pos(key);
  const file = asWhite ? pos[0] : 7 - pos[0];
  const rank = asWhite ? 7 - pos[1] : pos[1];
  return [file * squareSize + squareSize / 2, rank * squareSize + squareSize / 2];
}

function shapeHash(shape: DrawShape): string {
  return `${shape.orig}-${shape.dest ?? ''}-${shape.brush ?? ''}-${shape.label?.text ?? ''}-${shape.below ?? ''}`;
}

const ShapeArrow = React.memo(
  ({
    shape,
    brushes,
    boardSize,
    asWhite,
  }: {
    shape: DrawShape;
    brushes: DrawBrushes;
    boardSize: number;
    asWhite: boolean;
  }) => {
    if (!shape.dest || !shape.brush) return null;
    const brush = brushes[shape.brush];
    if (!brush) return null;

    const [x1, y1] = getSquareCenter(shape.orig, asWhite, boardSize);
    const [x2, y2] = getSquareCenter(shape.dest, asWhite, boardSize);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;

    const headLength = boardSize / 28;
    const angle = Math.atan2(dy, dx);

    const endX = x2 - Math.cos(angle) * headLength * 0.5;
    const endY = y2 - Math.sin(angle) * headLength * 0.5;

    const lineWidth = (brush.lineWidth / 10) * (boardSize / 8 / 8);
    const markerId = `arrow-${brush.key}`;

    return (
      <G>
        <Defs>
          <Marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth={headLength / lineWidth}
            markerHeight={headLength / lineWidth}
            orient="auto"
          >
            <Path d="M0,0 L10,5 L0,10 Z" fill={brush.color} />
          </Marker>
        </Defs>
        <Line
          x1={x1}
          y1={y1}
          x2={endX}
          y2={endY}
          stroke={brush.color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          opacity={brush.opacity}
          markerEnd={`url(#${markerId})`}
        />
      </G>
    );
  },
  (prev, next) =>
    prev.shape.orig === next.shape.orig &&
    prev.shape.dest === next.shape.dest &&
    prev.shape.brush === next.shape.brush &&
    prev.boardSize === next.boardSize &&
    prev.asWhite === next.asWhite,
);

ShapeArrow.displayName = 'ShapeArrow';

const ShapeCircle = React.memo(
  ({
    shape,
    brushes,
    boardSize,
    asWhite,
  }: {
    shape: DrawShape;
    brushes: DrawBrushes;
    boardSize: number;
    asWhite: boolean;
  }) => {
    if (!shape.brush) return null;
    const brush = brushes[shape.brush];
    if (!brush) return null;

    const [cx, cy] = getSquareCenter(shape.orig, asWhite, boardSize);
    const squareSize = boardSize / 8;
    const radius = squareSize / 2 - (brush.lineWidth / 10) * (squareSize / 16);
    const lineWidth = (brush.lineWidth / 10) * (boardSize / 8 / 8);

    return (
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        stroke={brush.color}
        strokeWidth={lineWidth}
        fill="none"
        opacity={brush.opacity}
      />
    );
  },
  (prev, next) =>
    prev.shape.orig === next.shape.orig &&
    prev.shape.brush === next.shape.brush &&
    prev.boardSize === next.boardSize &&
    prev.asWhite === next.asWhite,
);

ShapeCircle.displayName = 'ShapeCircle';

const ShapeLabel = React.memo(
  ({
    shape,
    brushes,
    boardSize,
    asWhite,
  }: {
    shape: DrawShape;
    brushes: DrawBrushes;
    boardSize: number;
    asWhite: boolean;
  }) => {
    if (!shape.label) return null;
    const label = shape.label;
    const squareSize = boardSize / 8;
    const labelSize = squareSize * 0.4;
    const fontSize = labelSize * 0.75 ** Math.max(1, label.text.length);
    const fill = label.fill ?? (shape.brush ? brushes[shape.brush]?.color ?? '#666' : '#666');

    let cx: number, cy: number;
    if (shape.dest && shape.orig !== shape.dest) {
      const [x1, y1] = getSquareCenter(shape.orig, asWhite, boardSize);
      const [x2, y2] = getSquareCenter(shape.dest, asWhite, boardSize);
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const headLen = boardSize / 28;
      const mag = dist - headLen;
      const angle = Math.atan2(dy, dx) + Math.PI;
      cx = x1 - Math.cos(angle) * mag;
      cy = y1 - Math.sin(angle) * mag;
    } else if (shape.brush) {
      [cx, cy] = getSquareCenter(shape.orig, asWhite, boardSize);
    } else {
      const pos = key2pos(shape.orig);
      const file = asWhite ? pos[0] : 7 - pos[0];
      const rank = asWhite ? 7 - pos[1] : pos[1];
      cx = file * squareSize + squareSize - labelSize / 2;
      cy = rank * squareSize + labelSize / 2;
    }

    return (
      <G>
        <Circle
          cx={cx}
          cy={cy}
          r={labelSize / 2}
          fill={fill}
          fillOpacity={shape.brush ? 0.8 : 1.0}
          stroke="white"
          strokeWidth={squareSize * 0.02}
          strokeOpacity={shape.brush ? 0.7 : 1.0}
        />
        <SvgText
          x={cx}
          y={cy + fontSize * 0.15}
          fontSize={fontSize}
          fontFamily="Noto Sans"
          textAnchor="middle"
          fill="white"
        >
          {label.text}
        </SvgText>
      </G>
    );
  },
  (prev, next) =>
    prev.shape.orig === next.shape.orig &&
    prev.shape.dest === next.shape.dest &&
    prev.shape.label?.text === next.shape.label?.text &&
    prev.boardSize === next.boardSize &&
    prev.asWhite === next.asWhite,
);

ShapeLabel.displayName = 'ShapeLabel';

export const ShapesLayer = React.memo(
  ({ shapes, autoShapes, brushes, boardSize, orientation, visible }: Props) => {
    const asWhite = orientation === 'white';

    const allShapes = useMemo(() => {
      if (!visible) return [];
      const nonPieceAuto = autoShapes.filter(s => !s.piece);
      return [...shapes, ...nonPieceAuto];
    }, [shapes, autoShapes, visible]);

    const belowShapes = useMemo(
      () => allShapes.filter(s => s.below),
      [allShapes],
    );

    const aboveShapes = useMemo(
      () => allShapes.filter(s => !s.below),
      [allShapes],
    );

    const renderShapes = (shapeList: DrawShape[]) =>
      shapeList.flatMap((shape, i) => {
        const key = shapeHash(shape) || `shape-${i}`;
        const elements: React.ReactElement[] = [];

        if (shape.dest && shape.orig !== shape.dest && shape.brush) {
          elements.push(
            <ShapeArrow key={`${key}-arrow`} shape={shape} brushes={brushes} boardSize={boardSize} asWhite={asWhite} />,
          );
        } else if (shape.brush && !shape.dest) {
          elements.push(
            <ShapeCircle key={`${key}-circle`} shape={shape} brushes={brushes} boardSize={boardSize} asWhite={asWhite} />,
          );
        }

        if (shape.label) {
          elements.push(
            <ShapeLabel key={`${key}-label`} shape={shape} brushes={brushes} boardSize={boardSize} asWhite={asWhite} />,
          );
        }

        return elements;
      });

    if (allShapes.length === 0) {
      return null;
    }

    return (
      <>
        {belowShapes.length > 0 && (
          <Svg
            key="shapes-below"
            width={boardSize}
            height={boardSize}
            style={{ position: 'absolute' }}
            pointerEvents="none"
          >
            {renderShapes(belowShapes)}
          </Svg>
        )}
        <Svg
          key="shapes-above"
          width={boardSize}
          height={boardSize}
          style={{ position: 'absolute' }}
          pointerEvents="none"
        >
          {renderShapes(aboveShapes)}
        </Svg>
      </>
    );
  },
);

ShapesLayer.displayName = 'ShapesLayer';
