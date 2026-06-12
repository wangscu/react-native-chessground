# Testing strategy: two-and-a-half layer pyramid with minimal native mocks

Tests are organized in two-and-a-half layers: unit tests for pure logic (vitest + node), component rendering tests (react-native-testing-library + minimal mocks for Reanimated/RNGH/SVG), and a single Maestro E2E smoke test run manually before release.

The core logic layer (fen, premove, board, config, anim) demands 90%+ line coverage because it is the correctness foundation and is trivially testable in a node environment. Component rendering tests cover four key scenarios (initial render, tap-tap move, fen prop change, imperative ref API) rather than pursuing coverage metrics, because the Reanimated/RNGH mock layer introduces fidelity gaps that make coverage numbers misleading. E2E is limited to a smoke test because RN E2E is slow, fragile in CI, and the gesture/animation details it would validate are better verified manually in the example app.

## Considered Options

- **Full E2E coverage with Detox**: Would catch real device issues but requires Xcode scheme + Gradle configuration, 5-10 minute CI runs, and produces flaky tests from animation timing.
- **Snapshot-only component tests**: Fastest to set up, but snapshots are brittle for a board with 64+ elements and provide no interaction coverage.
- **No component tests, only unit + E2E**: Would miss the gap between pure logic correctness and actual component behavior (e.g., props driving re-renders, ref handle wiring).
