import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Endpoint injection follows backend integration. Cookies stay HTTP-only.
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL || '/api', credentials: 'include' }),
  tagTypes: ['Session', 'Workspace', 'Project', 'Todo'],
  endpoints: () => ({}),
});
