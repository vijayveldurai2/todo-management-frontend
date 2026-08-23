import { api } from "./api";
import { Project } from "../types";

export const projectApi = api.injectEndpoints({
    endpoints: (build) => ({
        getWorkspaceProjects: build.query<Project[], { workspaceSlug: string; userId: string }>({
            query: ({ workspaceSlug, userId }) => `/workspaces/${workspaceSlug}/projects?userId=${userId}`,
            providesTags: ["Projects"],
        }),
        getProjectBySlug: build.query<Project, { workspaceSlug: string; projectSlug: string; userId: string }>({
            query: ({ workspaceSlug, projectSlug, userId }) => `/workspaces/${workspaceSlug}/projects/${projectSlug}?userId=${userId}`,
            providesTags: (result, error, arg) => [{ type: "Projects", id: arg.projectSlug }],
        }),
        createProject: build.mutation<Project, { workspaceSlug: string; userId: string; project: Partial<Project> }>({
            query: ({ workspaceSlug, userId, project }) => ({
                url: `/workspaces/${workspaceSlug}/projects?userId=${userId}`,
                method: "POST",
                body: project,
            }),
            invalidatesTags: ["Projects"],
        }),
        updateProject: build.mutation<Project, { workspaceSlug: string; projectSlug: string; userId: string; project: Partial<Project> }>({
            query: ({ workspaceSlug, projectSlug, userId, project }) => ({
                url: `/workspaces/${workspaceSlug}/projects/${projectSlug}?userId=${userId}`,
                method: "PATCH",
                body: project,
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Projects", id: arg.projectSlug }],
        }),
        deleteProject: build.mutation<void, { workspaceSlug: string; projectSlug: string; userId: string }>({
            query: ({ workspaceSlug, projectSlug, userId }) => ({
                url: `/workspaces/${workspaceSlug}/projects/${projectSlug}?userId=${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, arg) => [{ type: "Projects", id: arg.projectSlug }],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetWorkspaceProjectsQuery,
    useGetProjectBySlugQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
} = projectApi;
