import { Project, Board, Task, User, Workspace, Subtask, Comment, Column, SignupRequest, SignupResponse, LoginRequest, LoginResponse, VerifyResponse, ProjectRole, ProjectMember } from '../types';
import { backendStore } from './backendStore';

const BASE_URL = ((import.meta as any).env && (import.meta as any).env.VITE_API_BASE_URL) || '';

const fetchJson = async <T>(url: string, options?: RequestInit): Promise<T | null> => {
  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    const res = await fetch(fullUrl, options);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('not_found');
      }
      const errorData = await res.json().catch(() => ({}));
      const message = errorData.message || errorData.error || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return await res.json();
  } catch (e: any) {
    if (e.message === 'not_found' || e.message?.startsWith('HTTP') || e.message) {
      // Re-throw API error messages
      throw e;
    }
    console.warn(`Fetch to ${url} failed, using local store fallback:`, e);
    return null;
  }
};

export const apiService = {
  // Auth API Endpoints
  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || `Signup failed with status ${res.status}`);
      }

      return await res.json();
    } catch (e: any) {
      // Re-throw genuine API errors (e.g. status code errors, explicit backend responses)
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      if (BASE_URL) {
        throw e; // Hard failure when explicit backend URL is configured
      }

      console.warn('Backend server signup unreachable. Simulating signup response for preview mode:', e);
      return {
        message: 'Signup successful, please verify your email',
        email: data.email,
      };
    }
  },

  async loginApi(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Invalid credentials or user not verified.');
      }

      const responseData: LoginResponse = await res.json();
      if (responseData.accessToken) {
        localStorage.setItem('auth_token', responseData.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(responseData));
      }
      return responseData;
    } catch (e: any) {
      // Re-throw genuine API error responses (400, 401, 403, 500)
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      if (BASE_URL) {
        throw e; // Hard failure when explicit backend URL is configured
      }

      console.warn('Backend server unreachable. Falling back to local store login for preview mode:', e);
      const isEmail = data.login.includes('@');
      const mockUsername = isEmail ? data.login.split('@')[0] : data.login;
      const mockUser: LoginResponse = {
        accessToken: `jwt_mock_token_${Date.now()}`,
        tokenType: 'Bearer',
        userId: `u-${Date.now()}`,
        email: isEmail ? data.login : `${data.login}@example.com`,
        username: mockUsername,
        role: 'USER',
      };
      localStorage.setItem('auth_token', mockUser.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      return mockUser;
    }
  },

  async verifyEmail(token: string): Promise<VerifyResponse> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Verification failed. Invalid or expired token.');
      }

      return await res.json();
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      if (BASE_URL) {
        throw e;
      }

      console.warn('Backend verify unreachable. Simulating successful verification for preview mode:', e);
      return {
        message: 'Email verified successfully',
        userId: `u-${Date.now()}`,
        email: 'user@example.com',
        username: 'verified_user',
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const uid = parsed.userId || parsed.id;
        if (uid) {
          return {
            id: uid,
            name: parsed.name || parsed.username || (parsed.email ? parsed.email.split('@')[0] : 'User'),
            email: parsed.email || '',
            username: parsed.username || parsed.email,
            avatar: parsed.avatar || '',
            role: parsed.role || 'USER',
            accessToken: parsed.accessToken,
            provider: parsed.provider || 'email',
          };
        }
      } catch (err) {
        console.error('Failed to parse saved auth user:', err);
      }
    }

    return null;
  },

  async loginOAuth(provider: 'google' | 'github'): Promise<User> {
    return {
      id: `u-${Date.now()}`,
      name: provider === 'google' ? 'OAuth User (Google)' : 'OAuth User (GitHub)',
      email: 'user@example.com',
      avatar: '',
      role: 'USER',
      provider,
    };
  },

  async loginEmail(email: string): Promise<User> {
    const displayName = email.split('@')[0].replace(/[\._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
    return {
      id: `u-${Date.now()}`,
      name: displayName,
      email: email,
      avatar: '',
      role: 'USER',
      provider: 'email',
    };
  },

  async logout(): Promise<void> {},

  async resetToDefaults(): Promise<void> {
    backendStore.resetToDefaults();
  },

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    const user = await this.getCurrentUser();
    if (!user?.id) {
      return backendStore.getWorkspaces();
    }
    return this.getWorkspacesForUser(user.id);
  },

  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    const apiRes = await fetchJson<Workspace[]>(`/api/workspaces?userId=${encodeURIComponent(userId)}`);
    return apiRes || backendStore.getWorkspaces();
  },

  async createWorkspace(data: { name: string; description?: string }, creatorId: string): Promise<Workspace> {
    const res = await fetch(`${BASE_URL}/api/workspaces?creatorId=${encodeURIComponent(creatorId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        description: data.description || '',
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Create workspace failed with status ${res.status}`);
    }

    const created = await res.json();
    if (created && created.slug) {
      return created;
    }

    return backendStore.createWorkspace(data.name, data.description);
  },

  async getWorkspaceBySlug(workspaceSlug: string): Promise<Workspace> {
    const apiRes = await fetchJson<Workspace>(`/api/workspaces/slug/${encodeURIComponent(workspaceSlug)}`);
    if (apiRes) return apiRes;
    const fallback = backendStore.getWorkspaceBySlug(workspaceSlug);
    if (!fallback) throw new Error('not_found');
    return fallback;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<any[]> {
    const apiRes = await fetchJson<any[]>(`/api/workspaces/${workspaceId}/members`);
    return apiRes || [];
  },

  async updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/members/${encodeURIComponent(userId)}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to update role`);
    }
    return await res.json();
  },

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/members/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to remove member`);
    }
  },

  async inviteWorkspaceMember(workspaceId: string, inviterId: string, email: string, role: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/invites?inviterId=${encodeURIComponent(inviterId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to send invite`);
    }

    return await res.json();
  },

  async getMyPendingInvites(userId: string): Promise<any[]> {
    const apiRes = await fetchJson<any[]>(`/api/workspaces/invites/mine?userId=${encodeURIComponent(userId)}`);
    return apiRes || [];
  },

  async getWorkspaceInvites(workspaceId: string): Promise<any[]> {
    const apiRes = await fetchJson<any[]>(`/api/workspaces/${workspaceId}/invites`);
    return apiRes || [];
  },

  async acceptInvite(inviteId: string, acceptingUserId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/workspaces/invites/${inviteId}/accept?acceptingUserId=${encodeURIComponent(acceptingUserId)}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to accept invite`);
    }

    return await res.json();
  },

  async declineInvite(inviteId: string, decliningUserId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/workspaces/invites/${inviteId}/decline?decliningUserId=${encodeURIComponent(decliningUserId)}`, {
      method: 'POST',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to decline invite`);
    }
  },

  async revokeInvite(inviteId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/workspaces/invites/${inviteId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || errJson.error || `Failed to revoke invite`);
    }
  },

  async resolveUserId(userId?: string): Promise<string> {
    if (userId) return userId;
    const currentUser = await this.getCurrentUser();
    return currentUser?.id || 'u-1';
  },

  // Projects
  async getProjects(workspaceSlug: string, userId?: string): Promise<Project[]> {
    const u = await this.resolveUserId(userId);
    const apiRes = await fetchJson<Project[]>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects?userId=${encodeURIComponent(u)}`
    );
    return apiRes || backendStore.getProjects();
  },

  async createProject(
    workspaceSlug: string,
    userId?: string,
    data?: { name: string; description?: string; prefixCode?: string }
  ): Promise<Project> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects?userId=${encodeURIComponent(u)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data?.name || '',
            description: data?.description || '',
            prefixCode: data?.prefixCode,
          }),
        }
      );
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API createProject failed, using backendStore:', e);
    }
    return backendStore.createProject(workspaceSlug, {
      name: data?.name || '',
      description: data?.description,
      prefix: data?.prefixCode,
    });
  },

  async getProjectBySlug(workspaceSlug: string, projectSlug: string, userId?: string): Promise<Project> {
    const u = await this.resolveUserId(userId);
    const apiRes = await fetchJson<Project>(
      `/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}?userId=${encodeURIComponent(u)}`
    );
    if (apiRes) return apiRes;
    const fallback = backendStore.getProjectBySlug(workspaceSlug, projectSlug);
    if (!fallback) throw new Error('not_found');
    return fallback.project;
  },

  async getProjectDetails(workspaceSlug: string, projectSlug: string, userId?: string): Promise<Project> {
    return this.getProjectBySlug(workspaceSlug, projectSlug, userId);
  },

  async updateProject(
    workspaceSlug: string,
    projectSlug: string,
    userId?: string,
    data?: { name?: string; description?: string; status?: string }
  ): Promise<Project> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}?userId=${encodeURIComponent(u)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data || {}),
        }
      );
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API updateProject failed, using backendStore:', e);
    }
    return backendStore.updateProject(projectSlug, data || {});
  },

  async archiveProject(workspaceSlug: string, projectSlug: string, userId?: string): Promise<void> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectSlug)}?userId=${encodeURIComponent(u)}`,
        { method: 'DELETE' }
      );
      if (res.ok) return;
    } catch (e) {
      console.warn('API archiveProject failed, using backendStore:', e);
    }
    backendStore.archiveProject(projectSlug);
  },

  // Project Roles
  async getProjectRoles(projectSlug: string, userId?: string): Promise<ProjectRole[]> {
    const u = await this.resolveUserId(userId);
    const apiRes = await fetchJson<ProjectRole[]>(
      `/api/projects/${encodeURIComponent(projectSlug)}/roles?userId=${encodeURIComponent(u)}`
    );
    return apiRes || backendStore.getProjectRoles(projectSlug);
  },

  async createProjectRole(
    projectSlug: string,
    userId: string,
    data: { name: string; isAdmin: boolean }
  ): Promise<ProjectRole> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/roles?userId=${encodeURIComponent(u)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) return await res.json();
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return backendStore.createProjectRole(projectSlug, data);
  },

  async updateProjectRole(
    projectSlug: string,
    userId: string,
    roleId: string,
    data: { name?: string; isAdmin?: boolean }
  ): Promise<ProjectRole> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/roles/${encodeURIComponent(roleId)}?userId=${encodeURIComponent(u)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) return await res.json();
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return backendStore.updateProjectRole(projectSlug, roleId, data);
  },

  async deleteProjectRole(projectSlug: string, userId: string, roleId: string): Promise<void> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/roles/${encodeURIComponent(roleId)}?userId=${encodeURIComponent(u)}`,
        { method: 'DELETE' }
      );
      if (res.ok) return;
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    backendStore.deleteProjectRole(projectSlug, roleId);
  },

  // Project Members
  async getProjectMembers(projectSlug: string, userId?: string): Promise<ProjectMember[]> {
    const u = await this.resolveUserId(userId);
    const apiRes = await fetchJson<ProjectMember[]>(
      `/api/projects/${encodeURIComponent(projectSlug)}/members?userId=${encodeURIComponent(u)}`
    );
    return apiRes || backendStore.getProjectMembers(projectSlug);
  },

  async addProjectMember(
    projectSlug: string,
    userId: string,
    data: { userId: string; roleId?: string }
  ): Promise<ProjectMember> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/members?userId=${encodeURIComponent(u)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) return await res.json();
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return backendStore.addProjectMember(projectSlug, data);
  },

  async updateProjectMemberRole(
    projectSlug: string,
    userId: string,
    targetUserId: string,
    data: { roleId: string }
  ): Promise<ProjectMember> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/members/${encodeURIComponent(targetUserId)}?userId=${encodeURIComponent(u)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) return await res.json();
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return backendStore.updateProjectMemberRole(projectSlug, targetUserId, data);
  },

  async removeProjectMember(projectSlug: string, userId: string, targetUserId: string): Promise<void> {
    const u = await this.resolveUserId(userId);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${encodeURIComponent(projectSlug)}/members/${encodeURIComponent(targetUserId)}?userId=${encodeURIComponent(u)}`,
        { method: 'DELETE' }
      );
      if (res.ok) return;
      const errJson = await res.json().catch(() => ({}));
      if (errJson.message || errJson.error) throw new Error(errJson.message || errJson.error);
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    backendStore.removeProjectMember(projectSlug, targetUserId);
  },

  // Boards
  async getBoards(workspaceSlugOrProjectId?: string, projectSlug?: string): Promise<Board[]> {
    if (workspaceSlugOrProjectId && projectSlug) {
      const apiRes = await fetchJson<Board[]>(`/api/workspaces/${workspaceSlugOrProjectId}/projects/${projectSlug}/boards`);
      if (apiRes) return apiRes;
      const projData = backendStore.getProjectBySlug(workspaceSlugOrProjectId, projectSlug);
      return projData ? backendStore.getBoards(projData.project.id) : backendStore.getBoards();
    }
    return backendStore.getBoards(workspaceSlugOrProjectId);
  },

  async getBoardBySlug(workspaceSlug: string, projectSlug: string, boardSlug: string): Promise<Board> {
    const apiRes = await fetchJson<Board>(`/api/workspaces/${workspaceSlug}/projects/${projectSlug}/boards/${boardSlug}`);
    if (apiRes) return apiRes;
    const fallback = backendStore.getBoardBySlug(workspaceSlug, projectSlug, boardSlug);
    if (!fallback) throw new Error('not_found');
    return fallback.board;
  },

  async createBoard(
    workspaceSlugOrBoardData: string | Partial<Board>,
    projectSlugOrOptionalBoardData?: string | Partial<Board>,
    optionalBoardData?: Partial<Board>
  ): Promise<Board> {
    let workspaceSlug = 'main-workspace';
    let projectSlug = 'brand-refresh';
    let boardData: Partial<Board> = {};

    if (typeof workspaceSlugOrBoardData === 'string' && typeof projectSlugOrOptionalBoardData === 'string') {
      workspaceSlug = workspaceSlugOrBoardData;
      projectSlug = projectSlugOrOptionalBoardData;
      boardData = optionalBoardData || {};
    } else if (typeof workspaceSlugOrBoardData === 'object') {
      boardData = workspaceSlugOrBoardData;
    } else if (typeof projectSlugOrOptionalBoardData === 'object') {
      boardData = projectSlugOrOptionalBoardData;
    }

    try {
      const res = await fetch(`/api/workspaces/${workspaceSlug}/projects/${projectSlug}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API createBoard failed, using backendStore:', e);
    }
    return backendStore.createBoard(workspaceSlug, projectSlug, boardData);
  },

  // Todos / Tasks
  async getTasks(workspaceSlugOrProjectId?: string, projectSlugOrBoardId?: string, boardSlug?: string): Promise<Task[]> {
    if (workspaceSlugOrProjectId && projectSlugOrBoardId && boardSlug) {
      const apiRes = await fetchJson<Task[]>(
        `/api/workspaces/${workspaceSlugOrProjectId}/projects/${projectSlugOrBoardId}/boards/${boardSlug}/todos`
      );
      if (apiRes) return apiRes;
      const boardData = backendStore.getBoardBySlug(workspaceSlugOrProjectId, projectSlugOrBoardId, boardSlug);
      return boardData ? backendStore.getTasks(boardData.project.id, boardData.board.id) : backendStore.getTasks();
    }
    return backendStore.getTasks(workspaceSlugOrProjectId, projectSlugOrBoardId);
  },

  async getTaskBySlug(workspaceSlug: string, projectSlug: string, boardSlug: string, todoSlug: string): Promise<Task> {
    const apiRes = await fetchJson<Task>(
      `/api/workspaces/${workspaceSlug}/projects/${projectSlug}/boards/${boardSlug}/todos/${todoSlug}`
    );
    if (apiRes) return apiRes;
    const fallback = backendStore.getTaskBySlug(workspaceSlug, projectSlug, boardSlug, todoSlug);
    if (!fallback) throw new Error('not_found');
    return fallback.task;
  },

  async getTaskByDisplayId(workspaceSlug: string, projectSlug: string, displayId: string): Promise<Task> {
    const apiRes = await fetchJson<Task>(
      `/api/workspaces/${workspaceSlug}/projects/${projectSlug}/todos/${displayId}`
    );
    if (apiRes) return apiRes;
    const fallback = backendStore.getTaskByDisplayId(workspaceSlug, projectSlug, displayId);
    if (!fallback) throw new Error('not_found');
    return fallback.task;
  },

  async createTask(
    workspaceSlugOrTaskData: string | Partial<Task>,
    projectSlugOrOptionalTaskData?: string | Partial<Task>,
    boardSlug?: string,
    optionalTaskData?: Partial<Task>
  ): Promise<Task> {
    let wsSlug = 'main-workspace';
    let projSlug = 'brand-refresh';
    let bSlug = 'visual-identity';
    let taskData: Partial<Task> = {};

    if (typeof workspaceSlugOrTaskData === 'string' && typeof projectSlugOrOptionalTaskData === 'string' && boardSlug) {
      wsSlug = workspaceSlugOrTaskData;
      projSlug = projectSlugOrOptionalTaskData;
      bSlug = boardSlug;
      taskData = optionalTaskData || {};
    } else if (typeof workspaceSlugOrTaskData === 'object') {
      taskData = workspaceSlugOrTaskData;
    }

    try {
      const res = await fetch(`/api/workspaces/${wsSlug}/projects/${projSlug}/boards/${bSlug}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API createTask failed, using backendStore:', e);
    }
    return backendStore.createTask(wsSlug, projSlug, bSlug, taskData);
  },

  // Columns & Drag-and-Drop
  async getColumns(boardId?: string): Promise<Column[]> {
    const apiRes = await fetchJson<Column[]>('/api/columns');
    return apiRes || backendStore.getColumns(boardId);
  },

  async moveCard(cardId: string, newColumnId: string | undefined, newPosition: number): Promise<Task> {
    try {
      const res = await fetch(`/api/cards/${cardId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newColumnId, newPosition }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API moveCard failed, using backendStore:', e);
    }
    return backendStore.moveCard(cardId, newColumnId, newPosition);
  },

  async moveColumn(columnId: string, newPosition: number): Promise<Column> {
    try {
      const res = await fetch(`/api/columns/${columnId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPosition }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API moveColumn failed, using backendStore:', e);
    }
    return backendStore.moveColumn(columnId, newPosition);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const res = await fetch(`/api/todos/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API updateTask failed:', e);
    }
    return backendStore.updateTask(taskId, updates);
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task> {
    const tasks = backendStore.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    const updatedSubtasks = task.subtasks.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st));
    return this.updateTask(taskId, { subtasks: updatedSubtasks });
  },

  async addSubtask(taskId: string, title: string): Promise<Task> {
    const tasks = backendStore.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    const newSt: Subtask = { id: `st-${Date.now()}`, title, completed: false };
    return this.updateTask(taskId, { subtasks: [...task.subtasks, newSt] });
  },

  async addComment(taskId: string, content: string, user: User): Promise<Task> {
    const tasks = backendStore.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorName: user.name,
      authorAvatar: user.avatar,
      content,
      createdAt: 'Just now',
    };
    return this.updateTask(taskId, { comments: [...task.comments, newComment] });
  },
};
