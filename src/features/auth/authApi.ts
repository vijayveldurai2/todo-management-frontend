import { api } from '../../services/api';
export interface User { id: string; username: string; email: string; name?: string; avatarUrl?: string; role: string }
export interface LoginInput { login: string; password: string }
export interface SignupInput { name: string; username: string; email: string; password: string }
export interface LoginResult { accessToken: string; tokenType: string; userId: string; email: string; username: string; role: string }
export const authApi = api.injectEndpoints({ endpoints: build => ({
  login: build.mutation<LoginResult, LoginInput>({ query: body => ({ url: '/auth/login', method: 'POST', body }) }),
  signup: build.mutation<{ message: string; email: string }, SignupInput>({ query: body => ({ url: '/auth/signup', method: 'POST', body }) }),
  verifyEmail: build.mutation<{ message: string; userId: string; email: string; username: string }, string>({ query: token => ({ url: '/auth/verify', method: 'POST', body: { token } }) }),
  me: build.query<User, void>({ query: () => '/auth/me', providesTags: ['Session'] }),
  logout: build.mutation<{ message: string }, void>({ query: () => ({ url: '/auth/logout', method: 'POST' }) }),
}) });
export const { useLoginMutation, useSignupMutation, useVerifyEmailMutation, useMeQuery, useLogoutMutation } = authApi;
