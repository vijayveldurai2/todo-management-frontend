import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { readToken, clearToken } from '../features/auth/session';
const rawQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'omit',
  prepareHeaders(headers, { endpoint }) {
    const token = readToken();
    if (token && !['login','signup','verifyEmail'].includes(endpoint)) headers.set('Authorization', 'Bearer ' + token);
    return headers;
  },
});
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, options) => {
  const token = readToken();
  const result = await rawQuery(args, api, options);
  if (result.error?.status === 401 && token && token === readToken() && !['login','signup','verifyEmail'].includes(api.endpoint)) {
    clearToken();
    api.dispatch({ type: 'session/expired' });
  }
  return result;
};
export const api = createApi({ reducerPath: 'api', baseQuery, tagTypes: ['Session','Workspace','Project','Todo'], endpoints: () => ({}) });
