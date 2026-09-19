# Next session: authentication integration

Start with login and registration pages using the actual backend APIs through RTK Query. Do not implement the next screens with sample data. Current demo data remains only as the saved design foundation.

Branch: codex/login-register, created from the committed codex/minimal-ui-foundation checkpoint.

Agreed navigation for later implementation:
- Company logo at far left; workspace home contains project cards.
- Project home contains named boards (Frontend, Backend, Graphics) with separate task collections.
- Group optional sprints into Active, Upcoming and Completed (collapsed by default).
- Breadcrumbs grow only as the user enters a project and board.
- Each board/sprint supports List and Kanban presentation.
- Task URLs remain project-scoped, independent of board and sprint membership.

Respect URL_ROUTING.md. Backend resolver and subtasks are saved separately on codex/todo-subtasks. Historical uppercase display IDs still require a migration decision.

Work order: confirm real authentication contracts, build login/register UI and states, integrate session handling, then continue workspace/project/board navigation. Do not start implementation as part of this checkpoint.
