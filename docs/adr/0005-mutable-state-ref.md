# Mutable state ref with forceUpdate pattern

Board state is stored in a mutable ref (`useRef(createDefaultState())`) with re-renders triggered via a counter-based `forceUpdate` state, rather than using `useState` or `useReducer` for the board state itself.

The chessground state machine is fundamentally imperative — `baseMove` mutates the pieces Map, sets lastMove, clears check, and fires callbacks all in sequence. Wrapping this in React's immutable update model would require deep-cloning the entire state (including the pieces Map) on every move, which is wasteful for rapid analysis play. The mutable ref preserves the original chessground mutation pattern while the `forceUpdate` counter triggers React reconciliation only when needed.

## Consequences

Every `onStateChange` call re-renders the entire Chessboard component tree. For most chess apps this is acceptable (the board is a single screen). If profiling shows this as a bottleneck, the escape hatch is to split state into a React Context with selective subscriptions, or to move layer-specific state (pieces, selected, shapes) into separate `useState` hooks.

## Considered Options

- **useReducer with immutable updates**: Most idiomatic React, but requires rewriting all board logic to return new state objects instead of mutating.
- **Zustand/Jotai external store**: Better subscription granularity, but adds a dependency and diverges from chessground's state model.
