import { createSlice } from '@reduxjs/toolkit';
import { readToken } from './session';
const session = createSlice({
  name: 'session', initialState: { authenticated: !!readToken() },
  reducers: { signedIn(state) { state.authenticated = true; }, expired(state) { state.authenticated = false; } },
});
export const { signedIn, expired } = session.actions;
export default session.reducer;
