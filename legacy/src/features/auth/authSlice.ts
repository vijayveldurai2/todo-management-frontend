import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

// Check if there's a token in cookies on initialization
const tokenFromCookie = Cookies.get('accessToken') || null;

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!tokenFromCookie,
  accessToken: tokenFromCookie,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      
      // Store access token in cookies instead of localStorage
      Cookies.set('accessToken', accessToken, { 
        expires: 7, 
        secure: true, 
        sameSite: 'strict' 
      });
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      
      // Remove access token from cookies
      Cookies.remove('accessToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
