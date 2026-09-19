# MYNAA expressive SVG shapes
Original SVG geometry inspired by the visual families in Google's Material 3 Expressive shape reference:
https://m3.material.io/styles/shape/overview-principles
These are MYNAA interpretations, not exact official MaterialShapes exports.
Use Shape for decorative SVGs and ShapeFrame for an icon/image backdrop. Both accept a shape name and size. Shape accepts color and an optional accessible label; unlabeled shapes are decorative. Colours inherit currentColor. Frame content stays within a central safe area.
Prefer these SVG paths for expressive silhouettes; use CSS for layout, theme and restrained interaction motion. Avoid continuous decorative motion and preserve reduced-motion preferences.
Standalone SVGs mirror src/components/shapes/paths.ts. Keep both in sync when adjusting geometry.

