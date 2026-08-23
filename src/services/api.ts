import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
    prepareHeaders: (headers, { getState }) => {
        // Retrieve the token from our new authSlice
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    // If we receive a 401 Unauthorized, automatically log out the user locally
    if (result.error && result.error.status === 401) {
        api.dispatch(logout());
    }
    return result;
}

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["Auth", "Workspace", "Members", "Projects", "Boards", "Tasks"],
    endpoints: () => ({}),
});