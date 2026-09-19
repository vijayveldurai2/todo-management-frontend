# MYNAA authentication

Routes: `/_/login`, `/_/register`, `/_/verify?token=...`, `/_/account`. The root opens the authenticated account page or redirects to login. Existing task mockups remain the earlier design checkpoint; authentication never redirects into sample workspaces.

Verified against AuthController, AuthServiceImpl and their DTOs:
- POST /api/auth/login: { login, password }; returns { accessToken, tokenType, userId, email, username, role }. Sets `refresh_token` in an `HttpOnly; SameSite=Strict; Path=/api/auth` cookie.
- POST /api/auth/refresh: uses `refresh_token` cookie; validates against Redis, rotates the refresh token cookie, and returns a new short-lived { accessToken, tokenType }.
- POST /api/auth/signup: { name, username, email, password }. Returns { message, email }. Email verification is required; signup does not log in.
- POST /api/auth/verify: { token }; returns { message, userId, email, username }.
- GET /api/auth/me: authenticated UserDto, with distinct name and username fields.
- POST /api/auth/logout: revokes current Redis session and refresh token, and clears the `refresh_token` cookie (Max-Age=0).

Authentication uses a production-grade two-token pattern:
1. **Access Token**: Short-lived (15 min), stored strictly **in memory** in JavaScript. Never written to localStorage or sessionStorage, completely immune to storage-based XSS persistence.
2. **Refresh Token**: Long-lived (7 days), stored in **Redis**, transmitted via browser-managed **`HttpOnly; SameSite=Strict`** cookie. Inaccessible to JavaScript.
3. **Silent Re-Authentication & Token Rotation**: On page load / refresh or when an authenticated request receives a 401, RTK Query's baseQuery automatically calls `/api/auth/refresh` (protected by a single-flight mutex), saves the new access token in memory, and seamlessly replays the request without user interruption. If refresh fails, session state is cleared and the user is redirected to login. Redux DevTools remains disabled for auth credential safety.

Run the backend on localhost:8080 (with its configured database and Redis), and npm run dev for the frontend. Vite proxies /api with `credentials: 'include'` support. To use the frontend verification page in emails, set backend VERIFICATION_BASE_URL=http://localhost:5173/_/verify and use the same hostname consistently. The default backend verification link also verifies the account, but returns JSON. Email delivery depends on app.mail.enabled; with mail disabled the backend logs verification links instead.

Known backend gaps: expected auth failures (bad credentials, duplicate username/email, expired verification) currently become generic HTTP 500 responses. The UI does not invent a specific reason. No reset-password or resend-verification endpoint was found, so no nonfunctional controls are shown. Backend validation requires nonblank credentials but does not yet enforce a password strength policy.

Auth transport tests simulate the two-token exchange, in-memory token hygiene, silent refresh re-auth retry, and session expiry; product pages always use the real API with credentials.
