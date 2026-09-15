---
name: Backend Context Link
description: Contextual link and cross-repository rules between frontend (todo-management-frontend) and backend (todo-management).
always_on: true
---

# Backend Context & Cross-Repo Rule

This frontend repository (`todo-management-frontend`) connects to the companion Spring Boot backend repository located at:
`c:/Projects/Vijay/random/todo-management` (relative: `../todo-management`).

## Rules:
1. **No Merging**: Keep git repositories independent. Never commit backend code into this repo or vice versa.
2. **Context Awareness**: Whenever creating or altering RTK Query endpoints, API service calls, or authentication:
   - Check `../todo-management/api_list.md` and `../todo-management/src/main/java/com/vijay/todo_management/dto/` for expected schemas.
   - Maintain JSON camelCase field naming.
   - Target backend base URL (`http://localhost:8080/api` or via proxy).
3. **Cross-Reference Documents**:
   - Backend API List: `../todo-management/api_list.md`
   - Backend Plans & Docs: `../todo-management/docs/`
