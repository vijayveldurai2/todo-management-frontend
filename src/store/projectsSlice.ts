import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, Board, ProjectRole, ProjectMember } from '../types';
import { apiService } from '../services/apiService';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  projectRoles: ProjectRole[];
  projectMembers: ProjectMember[];
  boards: Board[];

  isLoading: boolean;
  isProjectDetailLoading: boolean;
  isRolesLoading: boolean;
  isMembersLoading: boolean;

  error: string | null;
  projectDetailError: string | null;
  rolesError: string | null;
  membersError: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  projectRoles: [],
  projectMembers: [],
  boards: [],
  isLoading: false,
  isProjectDetailLoading: false,
  isRolesLoading: false,
  isMembersLoading: false,
  error: null,
  projectDetailError: null,
  rolesError: null,
  membersError: null,
};

// ---------- Projects ----------

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async ({ workspaceSlug, userId }: { workspaceSlug: string; userId: string }) => {
    return await apiService.getProjects(workspaceSlug, userId);
  }
);

export const fetchProjectDetails = createAsyncThunk(
  'projects/fetchProjectDetails',
  async ({ workspaceSlug, projectSlug, userId }: { workspaceSlug: string; projectSlug: string; userId?: string }) => {
    return await apiService.getProjectDetails(workspaceSlug, projectSlug, userId);
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({
    workspaceSlug,
    userId,
    data,
  }: {
    workspaceSlug: string;
    userId: string;
    data: { name: string; description?: string; prefixCode?: string };
  }) => {
    return await apiService.createProject(workspaceSlug, userId, data);
  }
);

export const createNewProject = createAsyncThunk(
  'projects/createNewProject',
  async (
    projectData: Partial<Project> & { workspaceSlug?: string; userId?: string }
  ) => {
    const wsSlug = projectData.workspaceSlug || 'main-workspace';
    const uId = projectData.userId || 'u-1';
    return await apiService.createProject(wsSlug, uId, {
      name: projectData.name || 'Untitled Project',
      description: projectData.description,
      prefixCode: projectData.prefix || projectData.prefixCode,
    });
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({
    workspaceSlug,
    projectSlug,
    userId,
    data,
  }: {
    workspaceSlug: string;
    projectSlug: string;
    userId: string;
    data: { name?: string; description?: string; status?: string };
  }) => {
    return await apiService.updateProject(workspaceSlug, projectSlug, userId, data);
  }
);

export const archiveProject = createAsyncThunk(
  'projects/archiveProject',
  async ({
    workspaceSlug,
    projectSlug,
    userId,
  }: {
    workspaceSlug: string;
    projectSlug: string;
    userId: string;
  }) => {
    await apiService.archiveProject(workspaceSlug, projectSlug, userId);
    return projectSlug;
  }
);

// ---------- Project Roles ----------

export const fetchProjectRoles = createAsyncThunk(
  'projects/fetchProjectRoles',
  async ({ projectSlug, userId }: { projectSlug: string; userId: string }) => {
    return await apiService.getProjectRoles(projectSlug, userId);
  }
);

export const createProjectRole = createAsyncThunk(
  'projects/createProjectRole',
  async ({
    projectSlug,
    userId,
    data,
  }: {
    projectSlug: string;
    userId: string;
    data: { name: string; isAdmin: boolean };
  }) => {
    return await apiService.createProjectRole(projectSlug, userId, data);
  }
);

export const updateProjectRole = createAsyncThunk(
  'projects/updateProjectRole',
  async ({
    projectSlug,
    userId,
    roleId,
    data,
  }: {
    projectSlug: string;
    userId: string;
    roleId: string;
    data: { name?: string; isAdmin?: boolean };
  }) => {
    return await apiService.updateProjectRole(projectSlug, userId, roleId, data);
  }
);

export const deleteProjectRole = createAsyncThunk(
  'projects/deleteProjectRole',
  async ({
    projectSlug,
    userId,
    roleId,
  }: {
    projectSlug: string;
    userId: string;
    roleId: string;
  }) => {
    await apiService.deleteProjectRole(projectSlug, userId, roleId);
    return roleId;
  }
);

// ---------- Project Members ----------

export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchProjectMembers',
  async ({ projectSlug, userId }: { projectSlug: string; userId: string }) => {
    return await apiService.getProjectMembers(projectSlug, userId);
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addProjectMember',
  async ({
    projectSlug,
    userId,
    data,
  }: {
    projectSlug: string;
    userId: string;
    data: { userId: string; roleId?: string };
  }) => {
    return await apiService.addProjectMember(projectSlug, userId, data);
  }
);

export const updateProjectMemberRole = createAsyncThunk(
  'projects/updateProjectMemberRole',
  async ({
    projectSlug,
    userId,
    targetUserId,
    data,
  }: {
    projectSlug: string;
    userId: string;
    targetUserId: string;
    data: { roleId: string };
  }) => {
    return await apiService.updateProjectMemberRole(projectSlug, userId, targetUserId, data);
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({
    projectSlug,
    userId,
    targetUserId,
  }: {
    projectSlug: string;
    userId: string;
    targetUserId: string;
  }) => {
    await apiService.removeProjectMember(projectSlug, userId, targetUserId);
    return targetUserId;
  }
);

// ---------- Boards ----------

export const fetchBoards = createAsyncThunk(
  'projects/fetchBoards',
  async (projectId?: string) => {
    return await apiService.getBoards(projectId);
  }
);

export const createNewBoard = createAsyncThunk(
  'projects/createNewBoard',
  async (boardData: Partial<Board>) => {
    return await apiService.createBoard(boardData);
  }
);

// ---------- Slice ----------

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateProjectLocally: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const proj = state.projects.find((p) => p.id === action.payload.id);
      if (proj) proj.name = action.payload.name;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.projectRoles = [];
      state.projectMembers = [];
      state.projectDetailError = null;
      state.rolesError = null;
      state.membersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchProjects ---
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })

      // --- fetchProjectDetails ---
      .addCase(fetchProjectDetails.pending, (state) => {
        state.isProjectDetailLoading = true;
        state.projectDetailError = null;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.isProjectDetailLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.isProjectDetailLoading = false;
        state.projectDetailError = action.error.message || 'Failed to fetch project';
      })

      // --- createProject & createNewProject ---
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(createNewProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })

      // --- updateProject ---
      .addCase(updateProject.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.projects.findIndex((p) => p.slug === updated.slug || p.id === updated.id);
        if (idx !== -1) state.projects[idx] = updated;
        if (state.currentProject?.id === updated.id || state.currentProject?.slug === updated.slug) {
          state.currentProject = updated;
        }
      })

      // --- archiveProject ---
      .addCase(archiveProject.fulfilled, (state, action) => {
        const slug = action.payload;
        const proj = state.projects.find((p) => p.slug === slug || p.id === slug);
        if (proj) proj.status = 'ARCHIVED';
        if (state.currentProject && (state.currentProject.slug === slug || state.currentProject.id === slug)) {
          state.currentProject.status = 'ARCHIVED';
        }
      })

      // --- fetchProjectRoles ---
      .addCase(fetchProjectRoles.pending, (state) => {
        state.isRolesLoading = true;
        state.rolesError = null;
      })
      .addCase(fetchProjectRoles.fulfilled, (state, action) => {
        state.isRolesLoading = false;
        state.projectRoles = action.payload;
      })
      .addCase(fetchProjectRoles.rejected, (state, action) => {
        state.isRolesLoading = false;
        state.rolesError = action.error.message || 'Failed to fetch roles';
      })

      // --- createProjectRole ---
      .addCase(createProjectRole.fulfilled, (state, action) => {
        state.projectRoles.push(action.payload);
      })

      // --- updateProjectRole ---
      .addCase(updateProjectRole.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.projectRoles.findIndex((r) => r.id === updated.id);
        if (idx !== -1) state.projectRoles[idx] = updated;
      })

      // --- deleteProjectRole ---
      .addCase(deleteProjectRole.fulfilled, (state, action) => {
        state.projectRoles = state.projectRoles.filter((r) => r.id !== action.payload);
      })

      // --- fetchProjectMembers ---
      .addCase(fetchProjectMembers.pending, (state) => {
        state.isMembersLoading = true;
        state.membersError = null;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.isMembersLoading = false;
        state.projectMembers = action.payload;
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.isMembersLoading = false;
        state.membersError = action.error.message || 'Failed to fetch members';
      })

      // --- addProjectMember ---
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.projectMembers.push(action.payload);
      })

      // --- updateProjectMemberRole ---
      .addCase(updateProjectMemberRole.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.projectMembers.findIndex((m) => m.userId === updated.userId);
        if (idx !== -1) state.projectMembers[idx] = updated;
      })

      // --- removeProjectMember ---
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.projectMembers = state.projectMembers.filter((m) => m.userId !== action.payload);
      })

      // --- fetchBoards ---
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.boards = action.payload;
      })

      // --- createNewBoard ---
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      });
  },
});

export const { updateProjectLocally, clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;

// ---------- Selectors ----------

export const selectIsProjectMember = (userId: string | undefined, members: ProjectMember[]) =>
  !!userId && members.some((m) => m.userId === userId);

export const selectIsProjectAdmin = (
  userId: string | undefined,
  members: ProjectMember[],
  roles: ProjectRole[]
) => {
  if (!userId) return false;
  const myMembership = members.find((m) => m.userId === userId);
  if (!myMembership) return false;
  const myRole = roles.find((r) => r.id === myMembership.roleId);
  return !!myRole?.isAdmin;
};
