# react-native-chessground

A React Native chessboard component ported from chessground (lichess.org's chess UI). Provides a native, gesture-driven, animated chessboard for iOS and Android apps.

## Language

### Board & Pieces

**Square**:
One of the 64 cells on the board, identified by a Key (e.g. "e4").
_Avoid_: Cell, tile, position

**Key**:
Algebraic notation string identifying a square (a1-h8).
_Avoid_: Position, coordinate, index

**Piece**:
A chess piece with a Color and Role, rendered on a Square.
_Avoid_: Figure, unit, stone

**Color**:
"white" or "black". The two sides of the board.
_Avoid_: Side, player, team

**Role**:
One of "king", "queen", "rook", "bishop", "knight", "pawn".
_Avoid_: Type, kind, pieceType

**FEN**:
Forsyth-Edwards Notation string describing piece placement. This component handles piece placement only (no castling/en-passant).
_Avoid_: Position string, board state

### Movement

**Move**:
A piece going from one Key (orig) to another Key (dest).
_Avoid_: Action, step, transition

**Dests**:
A Map of Key to Key[] describing all legal moves for the current position. Provided externally; this component contains no chess rules engine.
_Avoid_: Legal moves, valid moves, allowed moves

**Premove**:
A move queued by the player during the opponent's turn, executed automatically when it becomes the player's turn.
_Avoid_: Queued move, pending move

**Predrop**:
In Crazyhouse variant, a piece placement queued before the player's turn.
_Avoid_: Queued drop

### Interaction

**Tap-tap**:
Tap-to-select then tap-to-move interaction pattern. The primary mobile interaction.
_Avoid_: Click-click, two-tap

**Drag**:
Press-and-drag a piece to a destination square.
_Avoid_: Drag-and-drop, slide

**Ghost piece**:
A translucent copy of a piece that follows the finger during a drag.
_Avoid_: Drag piece, floating piece

**Drawing mode**:
Long-press triggered mode for annotating the board with arrows and circles. Single brush color (green) on mobile.
_Avoid_: Annotation mode, markup mode

**Drop mode**:
Mode for placing new pieces on the board from an external pool (Crazyhouse, board editor). Activated via `ref.setDropMode(piece)`.
_Avoid_: Placement mode, insert mode

### Visual Layers

**Shape**:
A visual annotation drawn on the board — an arrow, circle, or label.
_Avoid_: Annotation, marker, drawing

**Auto shape**:
A shape from the analysis overlay, set programmatically (e.g. engine best move arrow).
_Avoid_: Analysis shape, overlay shape

**Highlight**:
Visual emphasis on squares — last move, check, selected square, or premove.
_Avoid_: Mark, indicator

**Theme**:
A configuration object defining piece graphics (SVG components) and board colors (light/dark squares).
_Avoid_: Skin, style, appearance

**Brush**:
A named color+opacity+lineWidth preset used for shapes. 12 built-in brushes: green, red, blue, yellow, paleBlue, paleGreen, paleRed, paleGrey, purple, pink, white, paleWhite.
_Avoid_: Pen, color preset

### State & Lifecycle

**Hold**:
Timer tracking how long a square has been pressed. Used for `MoveMetadata.holdTime`.
_Avoid_: Press duration, long press timer

**Stats**:
Runtime statistics tracking whether the last interaction was a drag or tap (`stats.dragged`).
_Avoid_: Metrics, analytics

**Fading**:
A piece that disappeared (captured) and is animating its opacity to zero over the animation duration.
_Avoid_: Disappearing piece, fade-out piece

### Testing

**testID**:
A string identifier attached to a React Native element for automated test targeting. Every square, piece, and highlight in the board exposes a testID (e.g. `square-e4`, `piece-e4`).
_Avoid_: accessibilityLabel, automationId

**Smoke test**:
A minimal E2E test that verifies the board renders and a single tap-tap move works. Run manually before each release.
_Avoid_: Sanity test, quick test
