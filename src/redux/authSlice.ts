import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from "@/../next.config";
import { deleteFormData, getFormData, saveFormData } from "@/lib/utils";

export interface AuthState {
    isLoggedIn: boolean;
    token: string | null;
    userId: number | null;
    accountType: string | null;
    account_id: number | null;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    isSubscribed?: boolean;
    apartments: Array<any>;
    rentedApartments: Array<any>;
    businessDetails?: {
        businessName: string | null;
        businessEmail: string | null;
        businessPhone: string | null;
        businessAddress: string | null;
        country: string | null;
        state: string | null;
        city: string | null;
    };
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isLoggedIn: false,
    token: null,
    userId: null,
    accountType: null,
    account_id: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    isSubscribed: false,
    apartments: [],
    rentedApartments: [],
    businessDetails: undefined,
    isLoading: false,
    error: null,
};

const loadState = (): AuthState => {
    if (typeof window !== 'undefined') {
        try {
            const token = getFormData('authToken') as string;
            const saved = getFormData('authState');
            if (saved && token) {
                const parsedState = typeof saved === 'string' ? JSON.parse(saved) : saved;
                return {
                    ...initialState,
                    ...parsedState,
                    token,
                    isLoading: false,
                    error: null,
                };
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        }
    }
    return initialState;
};

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password, account_id }: { email: string; password: string; account_id: number }, { rejectWithValue }) => {
        try {
            const response: any = await axios.post(baseURL + "/login", { email, password, account_id });
            const { data } = response;

            const nameParts = data.user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const persistState = {
                isLoggedIn: true,
                userId: data.user.id,
                accountType: data.user.account.slug,
                account_id: data.user.account.id,
                firstName,
                lastName,
                email: data.user.email,
                phoneNumber: data.user.phone,
                apartments: data.user.apartments || [],
                rentedApartments: data.user.rented_apartments || [],
                businessDetails: {
                    businessName: data.user.business_name,
                    businessEmail: data.user.business_email,
                    businessPhone: data.user.business_phone,
                    businessAddress: data.user.business_address,
                    country: data.user.country,
                    state: data.user.state,
                    city: data.user.city,
                },
            };

            saveFormData('authToken', data.token);
            saveFormData('authState', JSON.stringify(persistState));

            return { token: data.token, ...persistState };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
    try {
        const token = getFormData('authToken');
        if (token) {
            await axios.post(baseURL + '/logout', {}, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
        }
    } catch (error) {
        console.error('Logout API error:', error);
    } finally {
        deleteFormData('authToken');
        deleteFormData('authState');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: loadState(),
    reducers: {
        setAuth: (state, action: PayloadAction<{ token: string; user: Partial<AuthState> }>) => {
            const { token, user } = action.payload;
            Object.assign(state, {
                ...user,
                token,
                isLoggedIn: true,
                isLoading: false,
                error: null,
            });
            if (typeof window !== 'undefined') {
                saveFormData('authToken', token);
                saveFormData('authState', JSON.stringify(state));
            }
        },
        updateSubscription: (state, action: PayloadAction<boolean>) => {
            state.isSubscribed = action.payload;
            if (typeof window !== 'undefined') {
                const saved = getFormData('authState');
                const parsedState = saved ? (typeof saved === 'string' ? JSON.parse(saved) : saved) : {};
                saveFormData('authState', JSON.stringify({ ...parsedState, isSubscribed: action.payload }));
            }
        },
        updateProfile: (state, action: PayloadAction<Partial<AuthState>>) => {
            Object.assign(state, action.payload);
            state.error = null; // Clear any previous errors
            if (typeof window !== 'undefined') {
                const saved = getFormData('authState');
                const parsedState = saved ? (typeof saved === 'string' ? JSON.parse(saved) : saved) : {};
                saveFormData('authState', JSON.stringify({ ...parsedState, ...action.payload }));
            }
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                Object.assign(state, { ...action.payload, isLoading: false, error: null });
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                Object.assign(state, initialState);
            });
    },
});

export const { setAuth, updateSubscription, updateProfile, clearError } = authSlice.actions;
export default authSlice.reducer;
