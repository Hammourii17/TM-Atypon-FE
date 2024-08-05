import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from '../api/apiSlice';

const initialState = { isAuthenticated: false, token: null, error: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login : (state ) => { 
      const token = localStorage.getItem('token');
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
      }
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.isAuthenticated = false;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        apiSlice.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          localStorage.setItem('token', payload.token);
          state.isAuthenticated = true;
          state.token = payload.token;
        }
      )
      .addMatcher(
        apiSlice.endpoints.login.matchRejected,
        (state, { error }) => {
          state.error = error.message;
        }
      )
      .addMatcher(
        apiSlice.endpoints.signup.matchFulfilled,
        (state) => {
          state.isAuthenticated = false;
        }
      )
      .addMatcher(
        apiSlice.endpoints.signup.matchRejected,
        (state, { error }) => {
          state.error = error.message;
        }
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
