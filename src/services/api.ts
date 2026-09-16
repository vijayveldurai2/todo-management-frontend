import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError, type BaseQueryApi } from '@reduxjs/toolkit/query/react';
import { readToken, saveToken, clearToken } from '../features/auth/session';
import { signedIn, expired } from '../features/auth/authSlice';

const publicEndpoints = ['login', 'signup', 'verifyEmail', 'refresh'];

const rawQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  credentials: 'include',
  prepareHeaders(headers, { endpoint }) {
    const token = readToken();
    if (token && !publicEndpoints.includes(endpoint)) {
      headers.set('Authorization', 'Bearer ' + token);
    }
    return headers;
  },
});

let refreshPromise: Promise<string | null> | null = null;

export async function silentRefresh(api: BaseQueryApi): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshResult = await rawQuery({ url: '/auth/refresh', method: 'POST' }, api, {});
        if (refreshResult.data && typeof refreshResult.data === 'object' && 'accessToken' in refreshResult.data) {
          const newToken = (refreshResult.data as { accessToken: string }).accessToken;
          saveToken(newToken);
          api.dispatch(signedIn());
          return newToken;
        } else {
          clearToken();
          api.dispatch(expired());
          return null;
        }
      } catch {
        clearToken();
        api.dispatch(expired());
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, options) => {
  let result = await rawQuery(args, api, options);
  if (result.error?.status === 401 && !publicEndpoints.includes(api.endpoint)) {
    const newToken = await silentRefresh(api);
    if (newToken) {
      result = await rawQuery(args, api, options);
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Session', 'Workspace', 'Project', 'Todo'],
  endpoints: () => ({}),
});

