import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useEffect,
} from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import type {
  Key,
  Color,
  DrawShape,
  Drop,
  Piece,
  Mobility,
  Dests,
  DrawBrushes,
  RanksPosition,
} from '../types';
import type { BoardConfig } from '../core/config';
import type { ChessTheme } from '../themes/types';
import type { BoardActions } from '../hooks/useBoardState';
import { createDefaultState } from '../core/state';
import { applyConfig } from '../core/config';
import { useBoardActions } from '../hooks/useBoardState';
import { pixelToKey } from '../core/util';
import { pieceKey } from '../themes/types';
import * as board from '../core/board';
import { SquaresLayer } from './SquaresLayer';
import { PiecesLayer } from './PiecesLayer';
import { HighlightsLayer } from './HighlightsLayer';
import { ShapesLayer } from './ShapesLayer';
import { ExplosionOverlay } from './ExplosionOverlay';
import { AutoPiecesLayer } from './AutoPiecesLayer';
import { Coordinates } from './Coordinates';
import { defaultTheme } from '../themes';

export interface ChessboardProps {
  fen?: string;
  orientation?: Color;
  turnColor?: Color;
  check?: Color | boolean;
  lastMove?: Key[];
  coordinates?: boolean;
  ranksPosition?: RanksPosition;
  autoCastle?: boolean;
  viewOnly?: boolean;
  blockTouchScroll?: boolean;
  highlight?: {
    lastMove?: boolean;
    check?: boolean;
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean;
    color?: Color | 'both';
    dests?: Dests;
    showDests?: boolean;
    rookCastle?: boolean;
    events?: {
      after?: (orig: Key, dest: Key, metadata: any) => void;
      afterNewPiece?: (role: string, key: Key, metadata: any) => void;
    };
  };
  premovable?: {
    enabled?: boolean;
    showDests?: boolean;
    castle?: boolean;
    customDests?: Dests;
    additionalPremoveRequirements?: Mobility;
    events?: {
      set?: (orig: Key, dest: Key, metadata?: any) => void;
      unset?: () => void;
    };
  };
  predroppable?: {
    enabled?: boolean;
    events?: {
      set?: (role: string, key: Key) => void;
      unset?: () => void;
    };
  };
  draggable?: {
    enabled?: boolean;
    distance?: number;
    showGhost?: boolean;
    deleteOnDropOff?: boolean;
  };
  selectable?: {
    enabled?: boolean;
  };
  drawable?: {
    enabled?: boolean;
    visible?: boolean;
    defaultSnapToValidMove?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrushes;
    onChange?: (shapes: DrawShape[]) => void;
  };
  events?: {
    change?: () => void;
    move?: (orig: Key, dest: Key, capturedPiece?: any) => void;
    dropNewPiece?: (piece: any, key: Key) => void;
    select?: (key: Key) => void;
  };
  theme?: Partial<ChessTheme>;
}

export interface ChessboardRef extends BoardActions {}

export const Chessboard = forwardRef<ChessboardRef, ChessboardProps>(
  (props, ref) => {
    const [boardSize, setBoardSize] = useState(320);
    const [, forceUpdate] = useState(0);
    const stateRef = useRef(createDefaultState());
    const state = stateRef.current;

    const [dragKey, setDragKey] = useState<Key | undefined>();
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | undefined>();
    const [drawingOrig, setDrawingOrig] = useState<Key | undefined>();
    const [drawingDest, setDrawingDest] = useState<Key | undefined>();
    const [fadingKeys, setFadingKeys] = useState<Set<Key>>(new Set());

    const drawingModeRef = useRef(false);
    const dragKeyRef = useRef<Key | undefined>();
    const drawingOrigRef = useRef<Key | undefined>();
    const prevPiecesRef = useRef(new Map(state.pieces));

    const onStateChange = useCallback(() => {
      const prev = prevPiecesRef.current;
      const curr = stateRef.current.pieces;
      const fading = new Set<Key>();
      for (const [key, piece] of prev) {
        if (!curr.has(key)) fading.add(key);
      }
      if (fading.size > 0 && stateRef.current.animation.enabled) {
        setFadingKeys(fading);
        setTimeout(() => setFadingKeys(new Set()), stateRef.current.animation.duration);
      }
      prevPiecesRef.current = new Map(curr);
      forceUpdate(n => n + 1);
    }, []);

    const actions = useBoardActions(state, onStateChange);

    const prevPropsRef = useRef<Record<string, unknown>>({});

    useEffect(() => {
      const config: BoardConfig = {};
      let hasChanges = false;
      const current: Record<string, unknown> = {
        fen: props.fen,
        orientation: props.orientation,
        turnColor: props.turnColor,
        check: props.check,
        lastMove: props.lastMove,
        coordinates: props.coordinates,
        autoCastle: props.autoCastle,
        viewOnly: props.viewOnly,
        highlight: props.highlight,
        animation: props.animation,
        movable: props.movable,
        premovable: props.premovable,
        predroppable: props.predroppable,
        draggable: props.draggable,
        selectable: props.selectable,
        drawable: props.drawable,
        events: props.events,
        ranksPosition: props.ranksPosition,
      };

      for (const [key, value] of Object.entries(current)) {
        if (value !== undefined && value !== prevPropsRef.current[key]) {
          (config as any)[key] = value;
          hasChanges = true;
        }
      }

      prevPropsRef.current = current;

      if (hasChanges) {
        applyConfig(stateRef.current, config);
        onStateChange();
      }
    }, [
      props.fen, props.orientation, props.turnColor, props.check,
      props.lastMove, props.coordinates, props.autoCastle, props.viewOnly,
      props.highlight, props.animation, props.movable, props.premovable,
      props.predroppable, props.draggable, props.selectable, props.drawable,
      props.events, props.ranksPosition, onStateChange,
    ]);

    useImperativeHandle(ref, () => actions, [actions]);

    const onLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setBoardSize(Math.min(width, height));
    }, []);

    const theme = useMemo(
      () => ({
        pieces: props.theme?.pieces ?? defaultTheme.pieces,
        board: { ...defaultTheme.board, ...props.theme?.board },
      }),
      [props.theme],
    );

    const asWhite = state.orientation === 'white';
    const squareSize = boardSize / 8;

    const tapGesture = useMemo(
      () =>
        Gesture.Tap()
          .onStart(e => {
            if (state.viewOnly) return;
            const key = pixelToKey(e.x, e.y, asWhite, boardSize);
            if (!key) return;

            if (state.dropmode.active && state.dropmode.piece) {
              board.unsetPremove(stateRef.current);
              board.unsetPredrop(stateRef.current);
              state.pieces.set('a0', state.dropmode.piece);
              board.dropNewPiece(stateRef.current, 'a0', key);
              stateRef.current.dropmode = { active: false };
              onStateChange();
              return;
            }

            if (state.drawable.eraseOnMovablePieceClick && state.drawable.shapes.length > 0) {
              const piece = state.pieces.get(key);
              if (piece) {
                const isMovablePiece =
                  state.movable.color === 'both' ||
                  (state.movable.color === piece.color && state.turnColor === piece.color);
                if (isMovablePiece && state.selected !== key) {
                  stateRef.current.drawable.shapes = [];
                  stateRef.current.drawable.onChange?.([]);
                }
              }
            }

            board.selectSquare(stateRef.current, key);
            onStateChange();
          }),
      [asWhite, boardSize, state.viewOnly, state.dropmode, state.drawable, state.movable, state.pieces, state.selected, state.turnColor, onStateChange],
    );

    const longPressDrawGesture = useMemo(
      () =>
        Gesture.LongPress()
          .minDuration(400)
          .maxDistance(20)
          .onStart(e => {
            if (!state.drawable.enabled || state.viewOnly) return;
            const key = pixelToKey(e.x, e.y, asWhite, boardSize);
            if (key) {
              drawingModeRef.current = true;
              drawingOrigRef.current = key;
              setDrawingOrig(key);
              setDrawingDest(undefined);
            }
          }),
      [asWhite, boardSize, state.drawable.enabled, state.viewOnly],
    );

    const drawPanGesture = useMemo(
      () =>
        Gesture.Pan()
          .minDistance(0)
          .onStart(e => {
            if (!drawingModeRef.current) return;
          })
          .onUpdate(e => {
            if (!drawingModeRef.current) return;
            const key = pixelToKey(e.x, e.y, asWhite, boardSize);
            if (key && key !== drawingOrigRef.current) {
              setDrawingDest(key);
            } else {
              setDrawingDest(undefined);
            }
          })
          .onEnd(e => {
            if (!drawingModeRef.current || !drawingOrigRef.current) return;
            const orig = drawingOrigRef.current;
            const dest = pixelToKey(e.x, e.y, asWhite, boardSize);

            const shapes = stateRef.current.drawable.shapes.slice();
            if (dest && dest !== orig) {
              const existingIdx = shapes.findIndex(
                s => s.orig === orig && s.dest === dest && s.brush === 'green',
              );
              if (existingIdx !== -1) {
                shapes.splice(existingIdx, 1);
              } else {
                shapes.push({ orig, dest, brush: 'green' });
              }
            } else if (!dest || dest === orig) {
              const existingIdx = shapes.findIndex(
                s => s.orig === orig && !s.dest && s.brush === 'green',
              );
              if (existingIdx !== -1) {
                shapes.splice(existingIdx, 1);
              } else {
                shapes.push({ orig, brush: 'green' });
              }
            }

            stateRef.current.drawable.shapes = shapes;
            stateRef.current.drawable.onChange?.(shapes);
            drawingModeRef.current = false;
            drawingOrigRef.current = undefined;
            setDrawingOrig(undefined);
            setDrawingDest(undefined);
            onStateChange();
          })
          .onFinalize(() => {
            if (drawingModeRef.current) {
              drawingModeRef.current = false;
              drawingOrigRef.current = undefined;
              setDrawingOrig(undefined);
              setDrawingDest(undefined);
            }
          }),
      [asWhite, boardSize, onStateChange],
    );

    const dragGesture = useMemo(
      () =>
        Gesture.Pan()
          .minDistance(state.draggable.distance)
          .onStart(e => {
            if (state.viewOnly || !state.draggable.enabled) return;
            const key = pixelToKey(e.x, e.y, asWhite, boardSize);
            if (key && state.pieces.has(key) && key !== 'a0') {
              const piece = state.pieces.get(key)!;
              const canDrag =
                state.movable.color === 'both' ||
                (state.movable.color === piece.color &&
                  (state.turnColor === piece.color || state.premovable.enabled));
              if (canDrag) {
                dragKeyRef.current = key;
                setDragKey(key);
                setDragPos({ x: e.x, y: e.y });
                board.setSelected(stateRef.current, key);
                onStateChange();
              }
            }
          })
          .onUpdate(e => {
            if (dragKeyRef.current) {
              setDragPos({ x: e.x, y: e.y });
            }
          })
          .onEnd(e => {
            if (dragKeyRef.current) {
              board.unsetPremove(stateRef.current);
              board.unsetPredrop(stateRef.current);
              const destKey = pixelToKey(e.x, e.y, asWhite, boardSize);
              if (destKey) {
                board.userMove(stateRef.current, dragKeyRef.current, destKey);
              } else if (state.draggable.deleteOnDropOff) {
                stateRef.current.pieces.delete(dragKeyRef.current);
                stateRef.current.selected = undefined;
              }
              dragKeyRef.current = undefined;
              setDragKey(undefined);
              setDragPos(undefined);
              onStateChange();
            }
          })
          .onFinalize(() => {
            if (dragKeyRef.current) {
              dragKeyRef.current = undefined;
              setDragKey(undefined);
              setDragPos(undefined);
            }
          }),
      [asWhite, boardSize, state, onStateChange],
    );

    const composedGesture = useMemo(
      () =>
        Gesture.Race(
          tapGesture,
          Gesture.Simultaneous(longPressDrawGesture, drawPanGesture),
          dragGesture,
        ),
      [tapGesture, longPressDrawGesture, drawPanGesture, dragGesture],
    );

    const currentDrawShape: DrawShape | undefined = useMemo(() => {
      if (!drawingOrig) return undefined;
      return {
        orig: drawingOrig,
        dest: drawingDest && drawingDest !== drawingOrig ? drawingDest : undefined,
        brush: 'green',
      };
    }, [drawingOrig, drawingDest]);

    const shapesWithCurrent = useMemo(() => {
      const shapes = state.drawable.shapes;
      return currentDrawShape ? [...shapes, currentDrawShape] : shapes;
    }, [state.drawable.shapes, currentDrawShape]);

    const dragPieceElement = useMemo(() => {
      if (!dragKey || !dragPos || !state.draggable.showGhost) return null;
      const piece = state.pieces.get(dragKey);
      if (!piece) return null;
      const PieceSvg = theme.pieces[pieceKey(piece.color, piece.role)];
      if (!PieceSvg) return null;
      return (
        <View
          style={{
            position: 'absolute',
            left: dragPos.x - squareSize / 2,
            top: dragPos.y - squareSize / 2,
            width: squareSize,
            height: squareSize,
            opacity: 0.7,
          }}
          pointerEvents="none"
        >
          <PieceSvg size={squareSize} />
        </View>
      );
    }, [dragKey, dragPos, state.pieces, theme.pieces, squareSize]);

    const dests = state.selected ? state.movable.dests : undefined;
    const showDests = state.movable.showDests && !!state.selected;

    return (
      <View testID="chessboard" onLayout={onLayout} style={{ aspectRatio: 1, width: '100%' }}>
        <GestureDetector gesture={composedGesture}>
          <View style={{ width: boardSize, height: boardSize, overflow: 'hidden' }}>
            <SquaresLayer
              boardSize={boardSize}
              orientation={state.orientation}
              theme={theme.board}
            />

            {state.coordinates && (
              <Coordinates
                boardSize={boardSize}
                orientation={state.orientation}
                ranksPosition={state.ranksPosition}
                lightColor={theme.board.light}
                darkColor={theme.board.dark}
              />
            )}

            <HighlightsLayer
              boardSize={boardSize}
              orientation={state.orientation}
              theme={theme.board}
              selected={state.selected}
              lastMove={state.highlight.lastMove ? state.lastMove : undefined}
              check={state.highlight.check ? state.check : undefined}
              dests={dests}
              pieces={state.pieces}
              premoveDests={state.premovable.showDests ? state.premovable.dests : undefined}
              premoveCurrent={state.premovable.current}
              showDests={showDests}
              showPremoveDests={state.premovable.showDests && !!state.selected}
            />

            <PiecesLayer
              pieces={state.pieces}
              boardSize={boardSize}
              orientation={state.orientation}
              theme={theme.pieces}
              animDuration={state.animation.enabled ? state.animation.duration : 0}
              draggingKey={dragKey}
              fadingKeys={fadingKeys}
            />

            <AutoPiecesLayer
              autoShapes={state.drawable.autoShapes}
              boardSize={boardSize}
              orientation={state.orientation}
              pieces={state.pieces}
              theme={theme.pieces}
            />

            <ShapesLayer
              shapes={shapesWithCurrent}
              autoShapes={state.drawable.autoShapes}
              brushes={state.drawable.brushes}
              boardSize={boardSize}
              orientation={state.orientation}
              visible={state.drawable.visible}
            />

            {state.exploding && (
              <ExplosionOverlay
                exploding={state.exploding}
                boardSize={boardSize}
                orientation={state.orientation}
              />
            )}

            {dragPieceElement}
          </View>
        </GestureDetector>
      </View>
    );
  },
);

Chessboard.displayName = 'Chessboard';
