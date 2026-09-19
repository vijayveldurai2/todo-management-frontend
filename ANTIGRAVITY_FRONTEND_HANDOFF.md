# MYNAA frontend: design and implementation handoff

## Start here
Continue the existing frontend rather than generating a new design or replacing the setup.
Read AGENTS.md, package.json, src/app/router.tsx, and the shared components before editing.
Use /_/components as the visual reference; login/register show the theme in a real flow.
The package manifest is authoritative for installed versions (React 19 and React Router 7 at this handoff); older prose may be stale.
Keep backend and frontend repositories separate. Follow the feature-branch and application-execution rules in AGENTS.md.

## Product direction
MYNAA is a general-purpose task application for any industry. Keep it calm, readable, spacious and customizable.
Do not add dense Jira/ClickUp-style chrome, persistent dashboard metrics or rows of secondary actions.
Show the main action clearly. Put secondary actions in labelled overflow menus; right-click can supplement but never replace visible, keyboard-accessible actions.
Company mark/name belongs at the left of the header.

## Theme contract
Use Google Sans Flex with the existing font setup. Large titles are bold with the existing italic/slant treatment; body text and form labels remain upright.
Reuse src/styles/index.css, auth.css, appearance.css and components.css.
Use semantic CSS tokens, not hardcoded page colours:
- --paper: main surface (#fcfcfb light / #191919 dark)
- --ink: main text (#242424 / #ededeb)
- --soft: secondary text (#73736e / #a7a7a1)
- --line: dividers (#e5e5e0 / #383835)
- --wash: quiet secondary surface (#f2f2ee / #252523)
Preserve light, dark and system modes through AppearanceProvider. Do not create a second preference store.
Use restrained borders/shadows, generous space, existing pill/soft/asymmetric button options and readable form spacing.
The shape-gallery colours are optional previews, not a decision to recolour the entire app.

## Shape and motion
Use SVG geometry for distinctive expressive shapes. Do not approximate them with arbitrary CSS border-radius blobs.
Reuse src/components/shapes/Shape.tsx and paths.ts; standalone files live in public/shapes.
These are MYNAA interpretations inspired by M3, not official Google exports.
Shape renders a decorative SVG; give label only when the shape itself conveys meaning. ShapeFrame layers content over a silhouette.
Use shapes sparingly around empty states, illustrations, welcome or success moments. Keep text and task rows simple.
Use existing motion variables and off/subtle/standard preferences. Always respect prefers-reduced-motion. No endless decorative animation.
Keep the temporary filled illustrations replaceable; the user has not approved their illustration style.

## Shared components
Reuse components/ui for Button, Card, TextField, SelectField and Checkbox.
Reuse components/common/Modal.tsx and components/overlays for dialogs, quick-edit SidePanel and Popover.
Reuse components/loaders for page, button, linear, circular, SVG wave and skeleton loading.
Keep new reusable components in components; feature-specific screens belong in features.
Demonstrate new component variants and important states in the Components page before spreading them across the product.
Use no external UI component library. Existing stack: React, Vite, TypeScript, Tailwind, Redux Toolkit, RTK Query, React Router, Lucide icons.

## Navigation and information hierarchy
Workspace -> project -> named boards -> tasks.
Example: a web design project can have Frontend, Backend and Graphics boards. Boards are not merely separate views of one shared task collection.
At workspace level show project cards. Inside a project show its boards. Inside a board offer List/Board views.
Only add project and board breadcrumb segments once the user enters them. Add small workspace/project/board icons.
Sprints are optional: group sprint boards as active, upcoming and completed. Keep completed ones discoverable.
Full-page task details are the default; a side quick-view is an additional option.
Keep Ctrl/Cmd+K search/navigation available; provide a visible trigger too.

Primary approved direction: compact breadcrumb dropdowns with no persistent sidebar.
New alternative for review: a left drawer opened by a menu button next to MYNAA. Closed by default; approximately 296px wide, workspace switcher, Projects, My tasks, Notifications, Settings at bottom. Close after destination selection, on Escape or outside click; restore focus. Do not expand all projects/boards into a permanent tree.
The alternative is in Components -> Navigation. It is a local interaction preview, not approved application-wide navigation or a wired API feature.
Keep the right task-details panel distinct from this left navigation drawer.

## URLs
Preserve flat routes and strict lowercase rules:
- /_/{page}
- /{workspaceSlug}/_/{page}
- /{workspaceSlug}/{projectSlug}/_/{page}
- /{workspaceSlug}/{projectSlug}/{displayId}
No /w/ or /p/ prefixes. Underscore separates structural pages from entity slugs.
Display IDs must match ^[a-z]+-\\d+$. Mixed case and malformed paths return 404; no automatic lowercasing.
Reuse path helpers. Do not infer board-specific routes until their API/identifier contract is agreed. Task links must remain independent of board membership.
The final workspace/project landing hierarchy is product intent; verify actual router support before linking new screens.

## API and state
Read the actual current backend api_list.md, relevant controllers/DTOs and current frontend auth integration files before integrating.
Use RTK Query for server data and Redux only for suitable client state. Avoid duplicating query responses in slices.
Preserve the current auth/session implementation; do not replace it from this handoff or stale README assumptions.
Use real endpoints for production screens. Mock content is permitted only in clearly labelled component/design previews.
Handle loading, empty, error, unauthorized and retry states. Keep mutations pending/disabled appropriately and invalidate relevant caches.
Do not claim integration is tested by a static build or mocked transport test.

## Customization backlog
Workspace settings supply defaults; projects can override workflows.
Optional sprints, story points, time estimates and custom roles.
Admins manage shared workflows/permissions; individuals manage views, theme, motion and notification preferences.
Custom fields and AI-assisted workflow suggestions are future work, not part of the current UI build.

## Acceptance checks
Run npm run build and npm test. Verify relevant keyboard and responsive behaviour when the user has the app running.
Check both light and dark themes, reduced motion, focus visibility, labels, contrast and long names.
Dialogs must trap focus and restore it on dismissal; every icon-only action needs an accessible name.
Preserve existing changes, avoid unrelated refactoring, and implement one vertical at a time so the user can follow.
Do not start a background app/server; the user runs it per AGENTS.md.

## Suggested prompt
“Read ANTIGRAVITY_FRONTEND_HANDOFF.md and AGENTS.md. Continue MYNAA using the existing Components page, tokens and shared components as the design contract. Preserve the approved minimal theme and existing authentication. Build the next agreed screen using verified backend APIs. Do not redesign the app, add a UI library, or treat component-preview data as production data. Report what changed and what you verified.”

