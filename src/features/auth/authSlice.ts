import { createSlice } from '@reduxjs/toolkit';
import { readToken } from './session';
const session = createSlice({
  name: 'session',
  initialState: { authenticated: !!readToken(), initialized: false },
  reducers: {
    signedIn(state) { state.authenticated = true; state.initialized = true; },
    expired(state) { state.authenticated = false; state.initialized = true; },
    booted(state) { state.initialized = true; },
  },
});
export const { signedIn, expired, booted } = session.actions;
export default session.reducer;
