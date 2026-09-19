import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { sampleTasks, type Task } from './data';
// Demo data only. Server state belongs in RTK Query when integration starts.
const slice = createSlice({
  name: 'tasks', initialState: sampleTasks,
  reducers: {
    addTask(state, action: PayloadAction<Omit<Task, 'displayId'>>) { // Demo allocation only; production IDs will come from the backend.
      const sequence = state.reduce((max, task) => Math.max(max, Number(task.displayId.split('-')[1])), 0) + 1;
      state.push({ ...action.payload, displayId: 'task-' + sequence }); },
    updateTask(state, action: PayloadAction<{ id: string; changes: Partial<Omit<Task, 'id'>> }>) {
      const task = state.find(t => t.id === action.payload.id);
      if (task) Object.assign(task, action.payload.changes);
    },
  },
});
export const { addTask, updateTask } = slice.actions;
export default slice.reducer;
