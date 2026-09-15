# MYNAA authentication

Routes: `/_/login`, `/_/register`, `/_/verify?token=...`, `/_/account`. The root opens the authenticated account page or redirects to login. Existing task mockups remain the earlier design checkpoint; authentication never redirects into sample workspaces.

Verified against AuthController, AuthServiceImpl and their DTOs (the older api_list.md examples are stale):
- POST /api/auth/login: { login, password }; login is email or username. Returns { accessToken, tokenType, userId, email, username, role }.
- POST /api/auth/signup: { name, username, email, password }. Returns { message, email }. Email verification is required; signup does not log in.
- POST /api/auth/verify: { token }; returns { message, userId, email, username }.
- GET /api/auth/me: authenticated UserDto, with distinct name and username fields.
- POST /api/auth/logout: revokes the current Redis session.

The current backend returns a bearer token and does not set an HTTP-only login cookie. The frontend uses Authorization and keeps the token in sessionStorage for tab-scoped reload persistence (memory fallback if storage is unavailable). No invented cookie TTL, remember-me or refresh endpoint. Login/signup/verification omit authentication headers. A protected 401 clears the session. Logout clears local state after confirmed server revocation. Redux DevTools is disabled for the auth forms; passwords are not persisted to browser storage.

Run the backend on localhost:8080 (with its configured database and Redis), and npm run dev for the frontend. Vite proxies /api. To use the frontend verification page in emails, set backend VERIFICATION_BASE_URL=http://localhost:5173/_/verify and use the same hostname consistently. The default backend verification link also verifies the account, but returns JSON. Email delivery depends on app.mail.enabled; with mail disabled the backend logs verification links instead.

Known backend gaps: expected auth failures (bad credentials, duplicate username/email, expired verification) currently become generic HTTP 500 responses. The UI does not invent a specific reason. No reset-password or resend-verification endpoint was found, so no nonfunctional controls are shown. Backend validation requires nonblank credentials but does not yet enforce a password strength policy.

Auth transport tests stub HTTP only in the test process; product pages always use the real API. A full real login/signup/verification smoke test still requires running database/Redis/mail services and a test account. No backend source changes are part of this frontend task.
