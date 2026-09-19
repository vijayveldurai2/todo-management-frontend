# Business Requirements Document (BRD)
## Project: Todo Management Application

**Document Version:** 1.3 (Draft — for alignment review; updated with routing/slug scheme, Project vertical frontend, and Workspace invite/member management frontend)
**Prepared for:** VK
**Status:** Draft

---

## 1. Executive Summary

`todo-management` is a full-stack, Linear/Jira-inspired task and project management application. The primary purpose of the project is dual: (1) deliver a usable, minimal, modern task-management tool, and (2) serve as a deep-dive learning vehicle for backend Java/Spring Boot development, given the author's existing 15 years of frontend/UI expertise.

The system organizes work using a strict hierarchy:

**Workspace → Project → Board → Column → Todo**

Boards support two distinct types — **Kanban** (continuous flow) and **Sprint** (time-boxed, with backlog, burndown, and story points) — reflecting real-world agile team needs.

---

## 2. Business Objectives

| # | Objective | Rationale |
|---|-----------|-----------|
| 1 | Build a functioning multi-user task management system | Core product goal |
| 2 | Deepen hands-on Spring Boot 4 / JDK 21 backend skills | Personal learning objective |
| 3 | Practice production-grade architectural decision-making (schema design, auth, RBAC) | Learning objective |
| 4 | Deliver a clean, Linear/Notion-style UI/UX | Product quality bar, leverages existing frontend strength |
| 5 | Support real agile workflows (Kanban + Sprint) | Differentiator vs. a basic to-do app |

---

## 3. Scope

### 3.1 In Scope
- Multi-tenant-style **Workspace** management (single shared database, not physically multi-tenant)
- **Project** management within a workspace, with immutable prefix codes (e.g., `WR`) and sequential `display_id`s (e.g., `WR-546`)
- **Board** management — both Kanban and Sprint types
- **Column** management — user-configurable, drag-and-drop orderable
- **Todo (task)** management — creation, editing, completion, tagging, priority, drag-and-drop across columns
- **Membership & roles** — workspace-level membership, project-level role assignment, `SUPER_ADMIN` enforced via authorization logic
- **Authentication** — user login/session management (being implemented separately)
- **Authorization** — role-based access control at project level
- Drag-and-drop interactions (cross-column, within-column, column reorder) with mobile touch support

### 3.2 Out of Scope (for current phase)
- True multi-tenancy (separate DBs per workspace)
- Third-party integrations (Slack, GitHub, email notifications, etc.) — not yet defined
- Mobile native apps (web-responsive only, via touch-friendly drag-and-drop)
- Billing/subscription management
- Public API / webhooks
- AI integration (e.g., smart task suggestions, auto-summarization, natural-language task creation) — not yet defined, noted here to keep in mind for a future phase
- Request-access flow for non-members viewing a public project detail page (see BR-2) — deferred; non-members simply get a read-only view for now

---

## 4. Stakeholders

| Role | Person / Entity |
|------|------------------|
| Product Owner / Sole Developer | VK |
| Backend Development | VK (Spring Boot, primary learning focus) |
| Frontend Development | VK (React/TypeScript, existing expertise) |
| Auth Implementation | VK, via Cursor AI-assisted development |
| Architecture Review / Advisory | Claude (structural guidance, code review) |
| End Users | VK and any future collaborators/teams using the tool |

---

## 5. Business Requirements

### BR-1: Workspace Management
- Users can create a Workspace.
- The workspace creator automatically becomes `SUPER_ADMIN` atomically at creation.
- `SUPER_ADMIN` is enforced purely through authorization logic and never appears as a row in `project_members`.
- Users can be added as members at the workspace level, **exclusively via an invite-only flow** (no open join, no free-text add without an invite):
  - Invites are sent **one email per backend request** (no bulk-invite endpoint) — the frontend batches multiple invites as parallel individual requests and reports **per-email success/failure** rather than an all-or-nothing result, so one duplicate/invalid email doesn't block the rest of the batch.
  - Inviting an email that is already an active workspace member is a distinct, explicitly surfaced error per invite — not a generic failure.
  - Invited role (`USER` or `SUPER_ADMIN`, this pass) is chosen per batch, not per individual email.
  - Invites are actioned by the **recipient**, not auto-accepted: recipients see pending invites (as a card/prompt) when selecting/switching workspaces, or via an emailed link containing a token, and choose **Accept** or **Decline** explicitly.
  - Accepting an invite adds the user as a workspace member with the role specified at invite time; declining simply dismisses it — both are one-way actions once actioned.
  - The email-link path and in-app card path both resolve to the same accept/decline action; the token-based path additionally requires the recipient to be authenticated first, carrying the invite token through login/signup if needed.
- Workspace membership is displayed with each member's name, email, role (`SUPER_ADMIN` / `USER`), and status (only surfaced visually when a member is not `ACTIVE`).
- **Role-gating on invite/member-management actions is not yet enforced in the UI**, matching the backend's current state — this is a known, temporary gap (see §8), not an intended long-term permission model.

### BR-2: Project Management
- A workspace can contain multiple projects.
- Each project has a **mandatory, immutable, unique-per-workspace prefix code** (e.g., `WR`).
- Each project has a backend-generated, **immutable slug**, unique within its workspace.
- Each project has a **status** field (editable by project admins, alongside name/description) and supports **archiving** (soft state change, not hard delete).
- Roles are assigned at the **project level** (not just workspace level).
- Todos are assigned a `display_id` (e.g., `WR-546` displayed on cards; `wr-546` in URLs — see BR-8), atomically incremented, persisted (not computed on the fly), and **never reused**, even after deletion.
- Todo/task URLs are resolved via `projectSlug + displayId`, intentionally **not board-scoped**, so links remain valid even if a task moves between boards or columns.
- **Project detail is public/read-only by slug**, reachable even by users who are not project members: non-members see name, description, status, and `prefixCode` (display-only metadata, never used for navigation), with no editing, role management, or member management UI. This is a valid, expected view — not an error state.
- **Project list is member-scoped server-side**: it returns only projects the caller belongs to, or all projects if the caller is workspace `SUPER_ADMIN`. No request-access flow for non-members in this phase (see §3.2).
- **Project Roles**: full CRUD (name + `isAdmin` boolean), restricted to project admins. A role cannot be deleted while still in use or if it is the last remaining admin role — this validation is enforced backend-side and must be surfaced to the user as a specific inline message, not a generic failure.
- **Project Members**: added, role-changed, and removed by project admins. Members can only be added from users who are **already workspace members** — there is no free-text/email invite at the project level, consistent with the workspace-level invite-only model (BR-1).
- **"New Project" creation** is gated to users holding `ADMIN` or `SUPER_ADMIN` at the **workspace** level (not the project level, since the project doesn't exist yet).

### BR-8: Routing & Slug Resolution (Locked)
- **URL structure is flat, Linear-style**, with no `/workspaces/` or `/projects/` path prefixes and no board/column segment at any level:
  - `/{workspaceSlug}` → workspace home/dashboard
  - `/{workspaceSlug}/{projectSlug}` → project default board view
  - `/{workspaceSlug}/{projectSlug}/{displayId}` → todo detail (board-agnostic)
- **Platform- and workspace-level pages** (settings, notifications, members, profile) are namespaced under a literal `_` path segment instead of a reserved-words blocklist:
  - `/_/{page}` → platform-level (e.g. `/_/settings`, `/_/notifications`, `/_/profile`)
  - `/{workspaceSlug}/_/{page}` → workspace-level (e.g. `/acme/_/settings`, `/acme/_/members`)
  - This is collision-proof by construction: standard slugify never emits `_`, so no real slug can ever collide with these routes.
- **Case sensitivity:** all slugs and `display_id` route values are **lowercase only**, generated lowercase by the backend at creation time. The backend does **not** auto-normalize uppercase input — an uppercase URL variant simply resolves as not-found. Card/badge display (e.g. `WR-546`) may show uppercase, but the underlying `href` must always use the lowercase form.
- **Todo resolution** is by the tuple `(projectSlug, displayId)`, via an endpoint shaped like `GET /projects/{projectSlug}/todos/{displayId}`, deliberately board-agnostic so a todo's URL survives a board/column move.
- **Frontend never constructs slugs or display_ids client-side** — always consumed as-is from API responses and stored in Redux exactly as returned; never reconstructed from `prefixCode` + sequence number.
- **Open item:** the frontend router (and backend resolution endpoint, as an early-exit validation) need an explicit pattern guard (e.g. `^[a-z]+-\d+$`) to distinguish a valid `displayId` segment from an unknown/invalid project slug, so malformed URLs 404 predictably instead of being misrouted.

### BR-3: Board Management
- A project can contain multiple boards.
- Two distinct board types are supported:
  - **Kanban Board** — continuous flow, no time-boxing.
  - **Sprint Board** — time-boxed, includes backlog, burndown chart, and story points.
- Sprint is implemented as a **first-class distinct board type**, not a feature bolted onto Kanban.

### BR-4: Column Management
- Each board has user-configurable columns.
- Four default columns are seeded automatically at board creation (via service layer, not SQL): **Todo, Working, Testing, Done**.
- Columns support drag-and-drop reordering via a `position` field (integer, intentionally without a `UNIQUE` constraint to support bulk reorder operations).
- Column reordering is restricted to interaction via the column header only.

### BR-5: Todo (Task) Management
- Users can create, edit, and delete todos within a column.
- Each todo has: title, description, completion status, priority (enum), and tags (many-to-many `Tags` relationship).
- Todos support drag-and-drop movement both within a column (reordering) and across columns (status change).
- Drag-and-drop must work on both desktop (mouse) and mobile (press-and-hold touch).

### BR-6: Access Control & Roles
- Membership is workspace-level; permissions/roles are project-level.
- `SUPER_ADMIN` (workspace creator) has implicit full authority, enforced in code rather than stored as an explicit role assignment.
- **"Is current user a project member/admin" is a derived check**, not a stored flag: the frontend determines it by checking whether the current user's id appears in the project's member list, and — if so — whether their assigned role maps to a project role with `isAdmin: true`. This lookup is only performed after confirming membership (or for a user who arrived via the member-scoped project list); it is **not** fetched speculatively on the public, non-member project detail view.
- Admin-only actions (edit project name/description/status, archive project, project role CRUD, add/remove/change-role for project members) are gated on the `isAdmin` derivation above — being a member alone is not sufficient.
- Authenticated user identity should ultimately be resolved via `SecurityContextHolder` (planned), replacing temporary `userId` query parameters used during early development; until then, `userId` is threaded explicitly through Redux auth state and passed as a query parameter on every call, never read directly from `localStorage` inside a component.

### BR-7: Authentication
- User registration/login is implemented as a separate initiative (via Cursor-assisted development).
- Full Spring Security integration (via `SecurityFilterChain`) is planned but deferred; a dedicated `CorsConfigurationSource` bean will be added alongside the current CORS configuration once wired in.

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Usability** | Minimal, light-mode UI; indigo accent color; rounded corners; soft shadows (Linear/Notion aesthetic) |
| **Performance** | Drag-and-drop interactions must feel responsive; bulk reorder should not require unique-position constraints that block batch updates |
| **Data Integrity** | `display_id` sequencing must be atomic (`UPDATE ... SET display_id_seq = display_id_seq + 1`) to prevent race conditions/duplicates |
| **Portability** | Development must work across Mac and Windows machines, and in GitHub Codespaces |
| **Maintainability** | Database schema changes tracked via Flyway migrations; naming must avoid MySQL reserved keywords (e.g., avoid `groups`) |
| **Security** | Passwords never exposed in API responses (`@JsonProperty(access = WRITE_ONLY)`); credentials rotated immediately if ever exposed |
| **Compatibility** | CORS configured with `allowCredentials(true)` to support httpOnly-cookie-based refresh tokens |

---

## 7. Technical Context (Reference)

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 4, JDK 21, Maven (wrapper only) |
| Database | MySQL (local dev), Flyway migrations |
| Frontend | React + TypeScript (Vite), running on `localhost:5173` |
| Backend API | `localhost:8080` |
| Env Config | `me.paulschwarz:springboot4-dotenv` |
| Drag & Drop | `@dnd-kit` with `TouchSensor` |
| Diagramming | Mermaid (`architecture-diagram.md`) |

*(This section is descriptive context, not a business requirement — included for traceability between business needs and current implementation.)*

---

## 8. Current Implementation Status (as of this draft)

| Area | Status |
|------|--------|
| Workspace vertical slice | ✅ Complete, safe for frontend integration |
| Board & Todo write endpoints | ⚠️ Compile, but fail at runtime — pending `ProjectService` and `BoardColumn` seeding |
| Auth (Spring Security) | ⏳ Deferred — using temporary `userId` query params |
| CORS | ✅ Implemented (`CorsConfig.java`) — separate `CorsConfigurationSource` needed once Security is wired in |
| Database migration (Aiven → local) | ✅ Complete, `V1__baseline_schema.sql` reconstructed |
| Frontend | ✅ Built and ready for integration |
| Routing & slug scheme (BR-8) | ✅ Design locked; `prefixCode` + `display_id_seq` fields/generation exist as part of Project creation. ⏳ **Not yet wired** into Todo creation/resolution endpoints — blocked on Board/BoardColumn verticals |
| Frontend slug/display-id routing | ⏳ Not yet consumed by frontend — planned only after Board/BoardColumn stabilize on the backend, to avoid building against an unstable Todo API |
| Display-ID pattern guard (open item) | ⏳ Not yet implemented on frontend router or backend resolution endpoint |
| Project vertical — frontend | 📝 Implementation prompt drafted (apiService methods, `projectsSlice` thunks, access-model logic, screens/components) — following existing `fetchJson`/`backendStore` mock/Redux-thunk pattern used for Workspaces/Invites. Not yet delegated to Antigravity / not yet built |
| Project vertical — backend | ⏳ In progress (see Board & Todo write endpoints row above); frontend prompt is written against the intended contract, not a confirmed-stable one |
| Workspace Overview screen | 📝 Tab container specified: **Members** tab fully functional this pass; **Projects** tab is a placeholder ("coming soon", disabled Add), structured so a real project list can slot in later without restructuring the tab container |
| Workspace member list + invite modal | 📝 Prompt drafted — member list (name/email/role/status), multi-email chip invite modal with per-email parallel submission and per-email error surfacing (e.g. already-active-member). Not yet built |
| Workspace invite accept/decline (in-app + email link) | 📝 Prompt drafted — pending-invite cards on workspace selection screen, plus token-based email-link path gated on auth. Not yet built |

---

## 9. Assumptions & Constraints

- Single shared database is acceptable for current scale (no physical multi-tenancy required).
- The application is primarily single-developer built, with AI-assisted tooling (Cursor for boilerplate/auth, Claude for architecture/review).
- `SUPER_ADMIN` logic-based enforcement is an accepted trade-off over an explicit row-based role for simplicity and to avoid conflicting-permission edge cases.
- **Routing sequencing:** frontend slug/display-id-based routing (BR-8) will only be built once (1) Board/BoardColumn verticals are complete on the backend, (2) the `TodoServiceImpl` project/column-not-set-before-save gap is resolved, and (3) the `GET /projects/{projectSlug}/todos/{displayId}` resolution endpoint is live and stable — consistent with the "stabilize backend contracts before frontend work" principle already applied elsewhere in this project.
- **Note/tension to confirm:** the Project vertical frontend implementation prompt has been drafted ahead of the backend Project vertical being confirmed stable. This is a narrower exception than the routing sequencing above — worth explicitly confirming whether the Project API contract is considered locked enough to proceed, or whether frontend work should wait, consistent with the sequencing principle used for routing/Todo.
- **UI role-gating gap:** the workspace invite/member-management UI intentionally has no role-based gating yet (e.g. "Invite Members" is visible to everyone), matching the backend's current lack of enforced authorization. This is consistent with, and expected to resolve alongside, the broader `SecurityContextHolder`/auth wiring already tracked as a gap in BR-6 and §8 — not a separate decision.

---

## 10. Open Questions for Alignment

Use this section to flag anything that doesn't match your vision:

1. Is the Workspace → Project → Board → Column → Todo hierarchy exactly as you intend, or should there be an additional/different layer?
2. Should role assignment ever happen at the workspace level (in addition to project level), e.g., for workspace-wide admins who aren't `SUPER_ADMIN`?
3. Any requirements around notifications, activity logs/audit trails, or comments on todos that should be captured?
4. Any reporting/analytics requirements beyond Sprint burndown (e.g., velocity tracking, cross-project dashboards)?
5. Any requirements for archiving/soft-deleting workspaces, projects, boards, or todos (vs. hard delete)?

---

*This document is a draft intended to validate scope and direction. Please mark up sections 5–10 with corrections, additions, or removals.*