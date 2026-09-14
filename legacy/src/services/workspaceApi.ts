import { api } from "./api";
import { Workspace } from "../types";

export const workspaceApi = api.injectEndpoints({
    endpoints: (build) => ({
        getWorkspaces: build.query<Workspace[], string>({
            query: (userId) => `/api/workspaces?userId=${userId}`,
            providesTags: ["Workspace"],
        }),
        getWorkspaceById: build.query<Workspace, string>({
            query: (id) => `/api/workspaces/${id}`,
            providesTags: (result, error, id) => [{ type: "Workspace", id }],
        }),
        getWorkspaceBySlug: build.query<Workspace, string>({
            query: (slug) => `/api/workspaces/slug/${slug}`,
            providesTags: (result, error, slug) => [{ type: "Workspace", id: slug }],
        }),
        createWorkspace: build.mutation<Workspace, { creatorId: string; workspace: Partial<Workspace> }>({
            query: ({ creatorId, workspace }) => ({
                url: `/api/workspaces?creatorId=${creatorId}`,
                method: "POST",
                body: workspace,
            }),
            invalidatesTags: ["Workspace"],
        }),
        updateWorkspace: build.mutation<Workspace, { id: string; workspace: Partial<Workspace> }>({
            query: ({ id, workspace }) => ({
                url: `/api/workspaces/${id}`,
                method: "PUT",
                body: workspace,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Workspace", id }],
        }),
        deleteWorkspace: build.mutation<void, string>({
            query: (id) => ({
                url: `/api/workspaces/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Workspace", id }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetWorkspacesQuery,
    useGetWorkspaceByIdQuery,
    useGetWorkspaceBySlugQuery,
    useCreateWorkspaceMutation,
    useUpdateWorkspaceMutation,
    useDeleteWorkspaceMutation,
} = workspaceApi;
