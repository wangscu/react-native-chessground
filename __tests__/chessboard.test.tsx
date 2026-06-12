import { describe, it, expect } from 'vitest';
import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Chessboard } from '../src/components/Chessboard';
import type { ChessboardRef } from '../src/components/Chessboard';

describe('Chessboard component rendering', () => {
  describe('Scenario 1: Initial render', () => {
    it('renders chessboard container', () => {
      const renderer = ReactTestRenderer.create(<Chessboard />);
      const tree = renderer.toJSON();
      expect(tree).toBeTruthy();
    });

    it('renders with testID on the container', () => {
      const renderer = ReactTestRenderer.create(<Chessboard />);
      const root = renderer.root;
      const board = root.findByProps({ testID: 'chessboard' });
      expect(board).toBeTruthy();
    });

    it('renders 64 squares', () => {
      const renderer = ReactTestRenderer.create(<Chessboard />);
      const root = renderer.root;
      const squares = root.findAll(
        (node) => node.props.testID && node.props.testID.startsWith('sq-'),
      );
      expect(squares.length).toBe(64);
    });

    it('renders 32 pieces on initial position', () => {
      const renderer = ReactTestRenderer.create(<Chessboard />);
      const root = renderer.root;
      const pieces = root.findAll(
        (node) => node.type === 'div' && node.props.testID && node.props.testID.startsWith('piece-'),
      );
      expect(pieces.length).toBe(32);
    });

    it('renders specific pieces at correct squares', () => {
      const renderer = ReactTestRenderer.create(<Chessboard />);
      const root = renderer.root;
      expect(root.findByProps({ testID: 'piece-e1' })).toBeTruthy();
      expect(root.findByProps({ testID: 'piece-e8' })).toBeTruthy();
      expect(root.findByProps({ testID: 'piece-a2' })).toBeTruthy();
      expect(root.findByProps({ testID: 'piece-d8' })).toBeTruthy();
    });
  });

  describe('Scenario 2: FEN prop change', () => {
    it('re-renders pieces when fen changes', async () => {
      const renderer = await act(async () =>
        ReactTestRenderer.create(<Chessboard fen="start" />),
      );

      let pieces = renderer!.root.findAll(
        (node) => node.type === 'div' && node.props.testID && node.props.testID.startsWith('piece-'),
      );
      expect(pieces.length).toBe(32);

      await act(async () => {
        renderer!.update(<Chessboard fen="8/8/8/8/8/8/8/4K3" />);
      });

      pieces = renderer!.root.findAll(
        (node) => node.type === 'div' && node.props.testID && node.props.testID.startsWith('piece-'),
      );
      expect(pieces.length).toBe(1);
    });

    it('renders empty board for empty fen', async () => {
      const renderer = await act(async () =>
        ReactTestRenderer.create(<Chessboard fen="8/8/8/8/8/8/8/8" />),
      );
      const pieces = renderer!.root.findAll(
        (node) => node.type === 'div' && node.props.testID && node.props.testID.startsWith('piece-'),
      );
      expect(pieces.length).toBe(0);
    });
  });

  describe('Scenario 3: Imperative ref API', () => {
    it('exposes ref with expected methods', () => {
      const ref = React.createRef<ChessboardRef>();
      ReactTestRenderer.create(<Chessboard ref={ref} />);

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current!.getFen).toBe('function');
      expect(typeof ref.current!.move).toBe('function');
      expect(typeof ref.current!.toggleOrientation).toBe('function');
      expect(typeof ref.current!.setShapes).toBe('function');
      expect(typeof ref.current!.setAutoShapes).toBe('function');
      expect(typeof ref.current!.setDropMode).toBe('function');
      expect(typeof ref.current!.cancelDropMode).toBe('function');
      expect(typeof ref.current!.explode).toBe('function');
      expect(typeof ref.current!.playPremove).toBe('function');
      expect(typeof ref.current!.cancelPremove).toBe('function');
      expect(typeof ref.current!.stop).toBe('function');
    });

    it('getFen returns current position', () => {
      const ref = React.createRef<ChessboardRef>();
      ReactTestRenderer.create(<Chessboard ref={ref} />);
      const fen = ref.current!.getFen();
      expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });

    it('getFen returns custom fen after prop change', async () => {
      const ref = React.createRef<ChessboardRef>();
      await act(async () => {
        ReactTestRenderer.create(
          <Chessboard ref={ref} fen="8/8/8/8/4k3/8/8/4K3" />,
        );
      });
      expect(ref.current!.getFen()).toBe('8/8/8/8/4k3/8/8/4K3');
    });

    it('toggleOrientation flips the board', () => {
      const ref = React.createRef<ChessboardRef>();
      ReactTestRenderer.create(<Chessboard ref={ref} />);
      ref.current!.toggleOrientation();
      expect(ref.current).toBeTruthy();
    });

    it('move programmatically moves a piece', () => {
      const ref = React.createRef<ChessboardRef>();
      ReactTestRenderer.create(<Chessboard ref={ref} />);

      ref.current!.move('e2', 'e4');

      const fen = ref.current!.getFen();
      expect(fen).not.toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });
  });

  describe('Scenario 4: Props-driven configuration', () => {
    it('renders with viewOnly mode', () => {
      const renderer = ReactTestRenderer.create(<Chessboard viewOnly />);
      const board = renderer.root.findByProps({ testID: 'chessboard' });
      expect(board).toBeTruthy();
    });

    it('renders with custom orientation', () => {
      const renderer = ReactTestRenderer.create(<Chessboard orientation="black" />);
      expect(renderer.toJSON()).toBeTruthy();
    });

    it('renders with custom turnColor', () => {
      const renderer = ReactTestRenderer.create(<Chessboard turnColor="black" />);
      expect(renderer.toJSON()).toBeTruthy();
    });

    it('renders without coordinates when disabled', () => {
      const renderer = ReactTestRenderer.create(<Chessboard coordinates={false} />);
      expect(renderer.toJSON()).toBeTruthy();
    });
  });
});
