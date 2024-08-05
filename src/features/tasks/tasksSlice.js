import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('/api/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});

export const addTask = createAsyncThunk('tasks/addTask', async (task) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('/api/tasks', task, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (taskId) => {
  const token = localStorage.getItem('token');
  await axios.delete(`/api/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return taskId;
});

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { tasks: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: {
    [fetchTasks.fulfilled]: (state, action) => {
      state.tasks = action.payload;
      state.status = 'succeeded';
    },
    [fetchTasks.rejected]: (state, action) => {
      state.status = 'failed';
      state.error = action.error.message;
    },
    [addTask.fulfilled]: (state, action) => {
      state.tasks.push(action.payload);
    },
    [deleteTask.fulfilled]: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    },
  },
});

export default tasksSlice.reducer;
