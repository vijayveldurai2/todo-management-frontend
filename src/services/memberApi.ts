import { api } from "./api";

export interface WorkspaceMember {
    id: string;
    userId: string;
    workspaceId: string;
    role: string;
    userEmail: string;
    userName: string;
}

export interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    roleId: string;
}

export const memberApi = api.injectEndpoints({
    endpoints: (build) => ({
        // Workspace Members API
        getWorkspaceMembers: build.query<WorkspaceMember[], string>({
            query: (workspaceId) => `/workspaces/${workspaceId}/members`,
            providesTags: ["Members"],
        }),
        changeWorkspaceMemberRole: build.mutation<WorkspaceMember, { workspaceId: string; userId: string; role: string }>({
            query: ({ workspaceId, userId, role }) => ({
                url: `/workspaces/${workspaceId}/members/${userId}/role`,
                method: "PUT",
                body: { role },
            }),
            invalidatesTags: ["Members"],
        }),
        removeWorkspaceMember: build.mutation<void, { workspaceId: string; userId: string }>({
            query: ({ workspaceId, userId }) => ({
                url: `/workspaces/${workspaceId}/members/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Members"],
        }),

        // Project Members API
        getProjectMembers: build.query<ProjectMember[], { projectSlug: string; userId: string }>({
            query: ({ projectSlug, userId }) => `/projects/${projectSlug}/members?userId=${userId}`,
            providesTags: ["Members"],
        }),
        addProjectMember: build.mutation<ProjectMember, { projectSlug: string; userId: string; targetUserId: string; roleId: string }>({
            query: ({ projectSlug, userId, targetUserId, roleId }) => ({
                url: `/projects/${projectSlug}/members?userId=${userId}`,
                method: "POST",
                body: { userId: targetUserId, roleId },
            }),
            invalidatesTags: ["Members"],
        }),
        changeProjectMemberRole: build.mutation<ProjectMember, { projectSlug: string; targetUserId: string; userId: string; roleId: string }>({
            query: ({ projectSlug, targetUserId, userId, roleId }) => ({
                url: `/projects/${projectSlug}/members/${targetUserId}?userId=${userId}`,
                method: "PATCH",
                body: { roleId },
            }),
            invalidatesTags: ["Members"],
        }),
        removeProjectMember: build.mutation<void, { projectSlug: string; targetUserId: string; userId: string }>({
            query: ({ projectSlug, targetUserId, userId }) => ({
                url: `/projects/${projectSlug}/members/${targetUserId}?userId=${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Members"],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetWorkspaceMembersQuery,
    useChangeWorkspaceMemberRoleMutation,
    useRemoveWorkspaceMemberMutation,
    useGetProjectMembersQuery,
    useAddProjectMemberMutation,
    useChangeProjectMemberRoleMutation,
    useRemoveProjectMemberMutation,
} = memberApi;
