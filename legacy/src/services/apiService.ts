// Mock apiService to allow the frontend to compile while we migrate to RTK Query
// The Board and Todo functionality is currently out-of-scope for the Workspace phase.
// See BRD-todo-management.md

export const apiService = {
  getColumns: async (_boardId: string) => {
    return [];
  },
  moveColumn: async (_activeColId: string, _newPos: number) => {
    return;
  },
  moveCard: async (_activeCardId: string, _targetColId: string, _newPos: number) => {
    return;
  },
  getTaskBySlug: async (_workspaceSlug: string, _projectSlug: string, _boardSlug: string, _targetIdOrSlug: string) => {
    return null;
  },
  resetToDefaults: async () => {
    return;
  },
  getProjectBySlug: async (_workspaceSlug: string, _projectSlug: string) => {
    return null;
  },
  getBoards: async (_workspaceSlug: string, _projectSlug: string) => {
    return [];
  },
  getTaskByDisplayId: async (_workspaceSlug: string, _projectSlug: string, _boardSlug: string, _displayId: string) => {
    return null;
  },
  getTasks: async (_boardId: string) => {
    return [];
  },
  getBoardBySlug: async (_workspaceSlug: string, _projectSlug: string, _boardSlug: string) => {
    return null;
  },
};

