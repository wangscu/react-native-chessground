import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Chessboard, type ChessboardRef, uciToMove } from 'react-native-chessground';

const MOVES = [
  'e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1b5', 'a7a6',
  'b5a4', 'g8f6', 'e1g1', 'f8e7', 'f1e1', 'b7b5',
];

export default function App() {
  const boardRef = useRef<ChessboardRef>(null);
  const [moveIndex, setMoveIndex] = useState(0);
  const [fen, setFen] = useState('start');
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');

  const makeNextMove = useCallback(() => {
    if (moveIndex >= MOVES.length) return;
    const keys = uciToMove(MOVES[moveIndex]);
    if (keys && keys.length === 2 && boardRef.current) {
      boardRef.current.move(keys[0], keys[1]);
      setFen(boardRef.current.getFen());
      setMoveIndex(i => i + 1);
    }
  }, [moveIndex]);

  const resetBoard = useCallback(() => {
    setFen('start');
    setMoveIndex(0);
  }, []);

  const flipBoard = useCallback(() => {
    setOrientation(o => (o === 'white' ? 'black' : 'white'));
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.safe}>
        <Text style={styles.title}>react-native-chessground</Text>

        <View style={styles.boardContainer}>
          <Chessboard
            ref={boardRef}
            fen={fen}
            orientation={orientation}
            turnColor={moveIndex % 2 === 0 ? 'white' : 'black'}
            animation={{ enabled: true, duration: 200 }}
            movable={{ free: true }}
            events={{
              move: (orig, dest) => {
                console.log(`Move: ${orig} → ${dest}`);
              },
            }}
          />
        </View>

        <Text style={styles.fen}>{fen}</Text>
        <Text style={styles.moveCount}>Move {moveIndex + 1} / {MOVES.length}</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={makeNextMove}>
            <Text style={styles.buttonText}>Next Move</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={flipBoard}>
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetBoard}>
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#302e2b' },
  safe: { flex: 1, alignItems: 'center', paddingTop: 40 },
  title: { color: '#bababa', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  boardContainer: { width: '90%', aspectRatio: 1 },
  fen: { color: '#999', fontSize: 11, fontFamily: 'monospace', marginTop: 12, paddingHorizontal: 16, textAlign: 'center' },
  moveCount: { color: '#777', fontSize: 13, marginTop: 4 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 20 },
  button: {
    backgroundColor: '#4a4a4a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  resetButton: { backgroundColor: '#8b0000' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
