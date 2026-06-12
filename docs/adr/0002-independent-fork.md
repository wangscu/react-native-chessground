# Fork as independent repository

react-native-chessground is a fully independent fork of chessground, not a sub-package or sub-directory within the chessground monorepo.

The React Native component has a fundamentally different rendering pipeline (Reanimated + SVG vs DOM diff), different state management (React declarative vs imperative mutation), and a different release cadence. Coupling it to the upstream repo would constrain both projects' evolution and complicate CI/CD. The pure logic functions (FEN parsing, premove calculation, coordinate utilities) are small enough (~450 lines total) that copying them and manually syncing upstream fixes is cheaper than the coupling cost.

## Considered Options

- **Sub-directory in chessground repo**: Would share TypeScript source directly, but ties RN releases to upstream release cycle and adds React Native toolchain to a vanilla TS project.
- **Independent npm package referencing chessground as dependency**: Adds a dependency on a DOM-targeted library from an RN context, risking bundler issues and pulling in unnecessary code.
