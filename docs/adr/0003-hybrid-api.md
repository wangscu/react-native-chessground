# Hybrid API: declarative props + imperative ref handle

The component accepts low-frequency configuration via props (orientation, coordinates, animation duration, viewOnly, theme) and exposes high-frequency operations (move, setDests, setShapes) via an imperative ref handle.

A purely declarative API — where every move is expressed as a prop change — would trigger full React reconciliation on every chess move. In rapid play or analysis mode (multiple moves per second), this causes unnecessary re-renders of the piece tree. The imperative handle bypasses React's render cycle for moves, updating Reanimated sharedValues directly on the UI thread.

## Considered Options

- **Purely declarative (props only)**: Most idiomatic React, but re-render cost is measurable with 32 SVG piece components updating simultaneously.
- **Purely imperative (ref only)**: Simplest internally, but forces callers to manage mount/unmount lifecycle manually and loses the benefit of React's declarative configuration.
