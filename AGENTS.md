# Agent Guidelines & Linked Repositories

## Linked Project Overview
This repository (`todo-management-frontend`) is the **React/Vite frontend** for the companion backend service **`todo-management`**.
The two repositories are kept strictly separate (distinct Git remotes and histories — do NOT merge or combine repositories).

- **Frontend Repository**: `todo-management-frontend` (`c:/Projects/Vijay/random/todo-management-frontend`)
  - **Tech Stack**: React 18, Vite, TypeScript, Redux Toolkit (RTK Query), Tailwind CSS, React Router v6
  - **Git Remote**: `git@github.com:vijayveldurai2/todo-management-frontend.git`
- **Backend Repository**: `todo-management` (`c:/Projects/Vijay/random/todo-management` or `../todo-management`)
  - **Tech Stack**: Java 21, Spring Boot 3.x, Spring Data JPA, Spring Security with JWT, PostgreSQL / H2, Maven
  - **Git Remote**: `git@github.com:vijayveldurai2/todo-management.git`
  - **Server Base URL**: `http://localhost:8080` (endpoints prefixed with `/api`)

---

## Shared Context & Cross-Repository References

Whenever updating API service hooks, RTK Query endpoints, data models, or authentication flows, you **MUST** consult and align with the corresponding backend specifications and controllers:

| Context Area | Frontend File | Linked Backend File |
| :--- | :--- | :--- |
| **API Contract & Schemas** | [`api_list.md`](file:///c:/Projects/Vijay/random/todo-management-frontend/api_list.md) | [`api_list.md`](file:///c:/Projects/Vijay/random/todo-management/api_list.md) |
| **Backend Controllers** | [`src/services/api.ts`](file:///c:/Projects/Vijay/random/todo-management-frontend/src/services/api.ts) | `src/main/java/com/vijay/todo_management/controller/` in `../todo-management` |
| **Auth Specifications** | [`AUTH_INTEGRATION.md`](file:///c:/Projects/Vijay/random/todo-management-frontend/AUTH_INTEGRATION.md) | [`docs/implementation_plan_auth_me_endpoint.md`](file:///c:/Projects/Vijay/random/todo-management/docs/implementation_plan_auth_me_endpoint.md) |
| **Backend Documentation** | [`KNOWLEDGE_TRANSFER.md`](file:///c:/Projects/Vijay/random/todo-management-frontend/KNOWLEDGE_TRANSFER.md) | `docs/` in `../todo-management` |

---

## Cross-Repository Coordination Rules

1. **Repository Boundary**:
   - Never commit or stage backend files into the frontend git repository, and vice versa.
2. **API Endpoint & Model Alignment**:
   - Verify payload field names match Spring Boot DTOs (`camelCase`).
   - Standardize query parameters and pagination keys (`page`, `size`, `sort`).
3. **Multi-Root IDE Workspace**:
   - Open [`todo-management.code-workspace`](file:///c:/Projects/Vijay/random/todo-management.code-workspace) to work on both frontend and backend side-by-side in Antigravity IDE.
4. **Git Branching & Protected Branches Policy**:
   - **NEVER merge branches into `dev`, `stage`, `staging`, `main`, or `master`**.
   - Merges into base branches must strictly happen via Pull Requests (PRs) created by the user with descriptions.
   - All agent work must be committed and kept on dedicated feature branches (e.g., `feat/...`, `fix/...`).
5. **Application Execution Policy**:
   - **DO NOT keep dev servers or applications running in the background**.
   - You may compile, build, lint, and run automated tests, but do NOT launch or leave running applications/servers. The user runs and monitors the applications themselves.
