# React Project Architecture & Implementation Style Guide

When creating or modifying React applications for this workspace and future projects, follow this exact feature-first, RTK-Query centered architectural blueprint.

---

## 1. Directory Structure

```
src/
├── app/                  # Application configuration & root setup
│   ├── store.js          # Redux Toolkit store setup & middleware
│   └── router.jsx        # React Router (createBrowserRouter) routing config
│
├── services/             # API Data Layer (RTK Query)
│   └── api.js            # Centralized RTK Query service (createApi, fetchBaseQuery, baseQueryWithReauth, tags)
│
├── features/             # Feature-Sliced Domain Modules
│   ├── auth/             # Auth domain feature
│   │   ├── authSlice.js  # Feature state slice
│   │   └── pages/        # Feature pages (e.g., LoginPage.jsx)
│   ├── dashboard/        # Dashboard domain feature
│   │   └── pages/        # Feature pages (e.g., DashboardPage.jsx)
│   ├── products/         # Products domain feature
│   │   └── pages/        # Feature pages (e.g., ProductsPage.jsx, ProductDetailsPage.jsx)
│   ├── posts/            # Posts domain feature
│   │   └── pages/
│   ├── profile/          # Profile domain feature
│   │   └── pages/
│   ├── users/            # Users domain feature
│   │   └── pages/
│   └── ui/               # UI state feature (e.g., uiSlice.js)
│
├── components/           # Shared & Layout Components
│   ├── auth/             # Auth guards & wrappers (e.g., ProtectedRoute.jsx)
│   ├── layout/           # Global layout shells (e.g., RootLayout.jsx with Header/Sidebar/Outlet)
│   └── common/           # Generic reusable components (e.g., Pagination.jsx, Status.jsx)
│
├── styles/               # Global styling
│   └── index.css         # Main stylesheet / CSS design system
│
└── main.jsx              # React root entrypoint (Provider + RouterProvider)
```

---

## 2. Core Architectural Principles

### A. Centralized Service API Layer (`src/services/api.js`)
- Use **RTK Query** (`createApi`, `fetchBaseQuery`).
- Implement automatic header injection (e.g., authorization bearer tokens from Redux state).
- Handle global error/auth interception (e.g., `baseQueryWithReauth` to handle `401` status and dispatch `clearCredentials`).
- Define explicit `tagTypes` for intelligent caching and automatic tag invalidation across queries and mutations.

### B. Feature-Sliced Organization (`src/features/<domain>/`)
- Organize code by feature domains (`auth`, `dashboard`, `products`, `posts`, etc.).
- Place feature-specific Redux slices (`<domain>Slice.js`) directly in the feature root directory.
- Place feature pages inside `<domain>/pages/`.

### C. App Setup & Routing (`src/app/`)
- `src/app/store.js`: Centralized Redux store configuration concatenating RTK Query middleware and registering feature reducers.
- `src/app/router.jsx`: Router definition using React Router Data Router API (`createBrowserRouter`). Route structure must use nested children with `ProtectedRoute` and `RootLayout` shells.

### D. Component Hierarchy (`src/components/`)
- `components/layout/`: Holds main layout components (`RootLayout.jsx`) rendering global header/navigation and `<Outlet />`.
- `components/auth/`: Guards routes (e.g. `ProtectedRoute.jsx` checking auth state and rendering `<Outlet />` or `<Navigate to="/login" />`).
- `components/common/`: Reusable primitive components (Pagination, Status indicators, Modals, Spinners).

### E. Root Entrypoint (`src/main.jsx`)
- Mounts app with standard wrappers:
  ```jsx
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
  ```
