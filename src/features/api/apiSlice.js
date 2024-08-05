import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_BASE_URL  || 'http://localhost:5001/api/',
  responseHandler: async (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  },
  prepareHeaders: (headers) => {
    console.log('prepareHeaders');
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login', 
        method: 'POST',
        body: credentials,
        
      }),
    }),
    signup: builder.mutation({
      query: (credentials) => ({
        url: 'auth/signup', 
        method: 'POST',
        body: credentials,
      }),
    }),
    fetchTasks: builder.query({
      query: () => 'tasks',
      providesTags: ['Tasks'],
    }),
    addTask: builder.mutation({
      invalidatesTags: ['Tasks'],
      query: (task) => ({
        url: 'tasks',
        method: 'POST',
        body: task,

      }),
    }),
    deleteTask: builder.mutation({
      invalidatesTags: ['Tasks'],
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: 'DELETE',

      }),
    }),
    updateTask: builder.mutation({
      invalidatesTags: ['Tasks'],
      query: ({ id, ...task }) => ({
        url: `tasks/${id}`,
        method: 'PUT',
        body: task,
        
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useFetchTasksQuery,
  useAddTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} = apiSlice;
export default apiSlice;
