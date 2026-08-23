import { api } from '../../services/api';
import { setCredentials } from './authSlice';
import { 
    SignupRequest, 
    SignupResponse, 
    LoginRequest, 
    LoginResponse, 
    VerifyResponse 
} from '../../types';

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setCredentials({
                        user: {
                            id: data.userId,
                            name: data.username, // Assuming username as name for now
                            email: data.email,
                            role: data.role,
                            avatar: '' // You can update this based on your API
                        },
                        accessToken: data.accessToken
                    }));
                } catch (err) {
                    // Ignore, let the component handle the error
                }
            }
        }),
        signup: builder.mutation<SignupResponse, SignupRequest>({
            query: (userData) => ({
                url: '/api/auth/signup',
                method: 'POST',
                body: userData,
            }),
        }),
        verifyEmail: builder.mutation<VerifyResponse, { token: string }>({
            query: (data) => ({
                url: '/api/auth/verify',
                method: 'POST',
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const { 
    useLoginMutation, 
    useSignupMutation, 
    useVerifyEmailMutation 
} = authApi;
