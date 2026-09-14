# Quiet Tasks frontend

Minimal task workspace UI based on the approved design. React + Vite + TypeScript + Tailwind CSS, Redux Toolkit / RTK Query, React Router and Lucide icons. No component UI library.

## Local development

Use Node.js 22. Run `npm install`, then `npm run dev`. The development server binds to localhost only. Run `npm run build` to type-check and produce the production bundle, or `npm run typecheck` for TypeScript alone.

## Current scope

Local sample data, workspace/project switching, List and Board views, Ctrl/Cmd + K search, full-page task routes, quick-view panel, task creation/completion, notes, sample subtasks and comments. Reload resets demo edits. Nothing is published.

RTK Query is wired into the store; endpoints and authentication will be integrated after the UI components are approved. The Vite development proxy forwards /api to localhost:8080. Override VITE_API_BASE_URL when necessary; never put secrets in VITE_ variables.

## Structure

- src/app: store and router
- src/services: RTK Query API foundation
- src/features/navigation: workspace/project/view switchers and search
- src/features/tasks: local demo state and task UI
- src/components: shared layout and dialog
- src/styles: neutral theme, shape and typography styles
- legacy: previous AI Studio implementation, excluded from the new build

## Next steps

Refine component states and keyboard interactions, then build authentication, workspace/project creation and settings, attachments and full subtask editing. Integrate against verified backend contracts, replace sample Redux data with RTK Query endpoints, and add behavioral tests for authenticated flows. Board dragging, calendar, right-click actions and persistent personal preferences are not implemented yet.

Workspace defaults and project-specific workflows remain planned. Optional sprints, estimates, custom roles and future custom fields should not make the default UI busier.
