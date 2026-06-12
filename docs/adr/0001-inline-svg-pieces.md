# Render pieces as inline SVG via react-native-svg

Pieces are rendered as inline SVG components rather than pre-rasterized PNG images loaded via React Native's Image component.

SVG rendering enables lossless scaling, dynamic color theming, and simpler asset distribution (no multi-resolution PNG generation pipeline). The trade-off is higher component count — up to 32 Svg trees rendering simultaneously — mitigated by React.memo on each piece component and per-piece Reanimated sharedValues to prevent re-renders of stationary pieces during drag or animation.

## Considered Options

- **PNG images via Image component**: Best raw performance, but requires a build pipeline to rasterize SVGs at multiple resolutions, and theme switching means maintaining parallel asset sets.
- **Skia canvas rendering**: Best performance for large numbers of shapes, but touch event handling is awkward compared to the View hierarchy, and it adds a heavy dependency.

## Consequences

If profiling reveals SVG rendering as a bottleneck (e.g. on low-end Android), the escape hatch is to replace only the Piece component's internals with an Image-based renderer behind the same interface, without changing any other layer.
