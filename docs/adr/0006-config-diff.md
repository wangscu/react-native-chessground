# Config diff optimization for prop-driven updates

The `useEffect` that applies props to board state tracks previous prop values in a ref and only passes changed fields to `applyConfig`, rather than unconditionally applying all props on every render.

Without this diff, every parent re-render — even when no board-relevant props changed — would trigger `applyConfig` with the full config object. Since `applyConfig` performs side effects like FEN re-parsing (which clears pieces and resets selected square) and deep-merging (which can reset animation state), unconditional application would cause visual glitches during normal React rendering cycles.

The diff compares each prop key by reference equality (`!==`), which works for primitives and object references. Callback props (events) are compared by reference, so inline arrow functions in JSX would trigger re-application — callers should memoize callbacks with `useCallback`.
