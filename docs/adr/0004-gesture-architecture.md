# Gesture architecture: Race composition with tap, long-press+draw, and drag

The board uses `Gesture.Race` with three competing gesture branches: `Tap` for tap-tap movement, `Gesture.Simultaneous(LongPress, Pan)` for drawing shapes, and `Pan` with `minDistance` for piece dragging.

This composition was chosen over a single unified Pan gesture (which would require complex state-machine logic to distinguish tap from drag from draw at gesture start) and over sequential gesture handlers (which would block interactions). The Race pattern lets react-native-gesture-handler automatically route to the correct gesture based on which one activates first — a quick touch triggers Tap, a held touch triggers LongPress+DrawPan, and a moving touch with sufficient distance triggers DragPan.

## Considered Options

- **Single Pan with minDistance(0) and state machine**: All logic in one handler, but complex branching based on timing and piece presence, harder to maintain.
- **Sequential gesture registration**: Different gesture for different modes (viewOnly vs interactive), but requires dynamic gesture reconfiguration.
