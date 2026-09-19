# Appearance and loading states

Personal device preferences are under the Appearance settings button (sliders icon), available on auth pages, account, and task layouts. Theme: System / Light / Dark. Motion: Off / Subtle (default) / Standard. The operating system's reduced-motion setting always disables animation, including loaders, regardless of the chosen level.

Theme and motion are saved in localStorage under mynaa.appearance, separate from workspace configuration. A small blocking same-origin script applies the theme before styles load. Settings sync between tabs and follow live system theme/reduced-motion changes. Storage failures fall back to session-only preferences.

Shared components live in src/components/loaders:
- CircularLoader: decorative indicator; pair with one loading announcement.
- ButtonLoader: compact decorative spinner.
- LoadingButton: disables repeat submission, exposes aria-busy, and preserves the original label's space.
- PageLoader: centered indicator with a polite status label.
- LinearLoader: indeterminate by default; supply value (0–100) for real progress only.
- ZigzagLoader: subtle zigzag indicator with a status label and unique SVG clip IDs.
- Skeleton: non-announcing placeholder; its parent should explain loading once.

Loaders use the same neutral theme and motion tokens. Off/reduced mode removes every animation and transition; text and actual determinate progress remain. Login, register, verify and logout use LoadingButton; session restoration uses PageLoader. Other indicators are available for future screens and can be previewed in appearance settings.

No animation library or backend settings endpoint was added. The motion is M3-inspired (short eased transitions and small entry offsets); it does not claim to implement Google's complete component library.
