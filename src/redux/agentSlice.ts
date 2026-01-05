import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from 'axios';
import {baseURL} from "@/../next.config";
import {deleteFormData, getFormData, saveFormData} from "@/lib/utils";

interface AgentState {
    isLoggedIn: boolean;
    token: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    account_id: number | null;
    isLoading: boolean;
    error: string | null;
    userId?: number;
    accountType?: string;
    apartments?: Array<any>;
    rentedApartments?: Array<any>;
    businessDetails?: {
        businessName: string | null;
        businessEmail: string | null;
        businessPhone: string | null;
        businessAddress: string | null;
        country: string | null;
        state: string | null;
        city: string | null;
    };
}

interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: {
        id: number;
        account_id: string;
        name: string;
        email: string;
        phone: string | null;
        business_name: string | null;
        business_email: string | null;
        business_phone: string | null;
        business_address: string | null;
        country: string | null;
        state: string | null;
        city: string | null;
        account: {
            id: number;
            name: string;
            slug: string;
        };
        apartments: Array<any>;
        rented_apartments: Array<any>;
    };
}

const initialState: AgentState = {
    isLoggedIn: false,
    token: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    account_id: null,
    isLoading: false,
    error: null,
    userId: undefined,
    accountType: undefined,
    apartments: [],
    rentedApartments: [],
    businessDetails: {
        businessName: null,
        businessEmail: null,
        businessPhone: null,
        businessAddress: null,
        country: null,
        state: null,
        city: null
    }
};

// Safe localStorage access
const isClient = typeof window !== 'undefined';

const getFromStorage = (key: string): string | null => {
    if (!isClient) return null;
    try {
        return getFormData(key);
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
    }
};

const setToStorage = (key: string, value: any): void => {
    if (!isClient) return;
    try {
        saveFormData(key, value);
    } catch (error) {
        console.error('Error setting localStorage:', error);
    }
};

const removeFromStorage = (key: string): void => {
    if (!isClient) return;
    try {
        deleteFormData(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
};

// Load initial state from localStorage
const loadInitialState = (): AgentState => {
    let saved: string;
    const token = getFromStorage('agentToken') as string;
    const ready = getFromStorage('agentState');
    if (ready) {
        saved = JSON.parse(ready);
    } else {
        saved = '';
    }


    // console.log(typeof saved, saved, inArray('isLoggedIn', saved));
    if (saved && typeof saved === 'object' && 'isLoggedIn' in saved) {
        const savedState = saved as AgentState;
        if (token && savedState) {
            try {

                return {
                    ...initialState,
                    ...(savedState),
                    token: token,
                    isLoading: false,
                    error: null
                };
            } catch (error) {
                console.error('Error parsing stored state:', error);
            }
        }// now safe to use
    }
    return initialState;
};

export const loginAgent = createAsyncThunk(
    'agent/login',
    async ({email, password, account_id}: {
        email: string;
        password: string;
        account_id: number
    }, {rejectWithValue}) => {
        try {
            const response: any = await axios.post<LoginResponse>(baseURL + "/login", {
                email,
                password,
                account_id
            });

            const {data} = response;

            const nameParts = data.user.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // const account_id = data.user.account_id ? parseInt(data.user.account_id) : null;

            const persistState = {
                isLoggedIn: true,
                userId: data.user.id,
                accountType: data.user.account.slug,
                firstName,
                lastName,
                email: data.user.email,
                phoneNumber: data.user.phone,
                account_id,
                apartments: data.user.apartments,
                rentedApartments: data.user.rented_apartments,
                businessDetails: {
                    businessName: data.user.business_name,
                    businessEmail: data.user.business_email,
                    businessPhone: data.user.business_phone,
                    businessAddress: data.user.business_address,
                    country: data.user.country,
                    state: data.user.state,
                    city: data.user.city
                }
            };

            setToStorage('agentToken', data.token);
            setToStorage('agentState', persistState);

            return {
                token: data.token,
                ...persistState
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);


export const logoutAgent = createAsyncThunk(
    'agent/logout',
    async (_, {rejectWithValue}) => {
        try {
            const token = getFromStorage('agentToken');
            if (token) {
                await axios.post(
                    baseURL + '/logout',
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    }
                );
            }
            removeFromStorage('agentToken');
            removeFromStorage('agentState');
            return null;
        } catch (error) {
            // Even if the logout API fails, we still want to clear local state
            removeFromStorage('agentToken');
            removeFromStorage('agentState');
            return null;
        }
    }
);

const agentSlice = createSlice({
    name: 'agent',
    initialState: loadInitialState(),
    reducers: {
        logout: (state) => {
            Object.assign(state, initialState);
            removeFromStorage('agentToken');
            removeFromStorage('agentState');
        },
        initializeFromStorage: (state) => {
            const storedState = loadInitialState();
            Object.assign(state, storedState);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAgent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginAgent.fulfilled, (state, action) => {
                state.isLoggedIn = true;
                state.isLoading = false;
                state.token = action.payload.token;
                state.firstName = action.payload.firstName;
                state.lastName = action.payload.lastName;
                state.email = action.payload.email;
                state.phoneNumber = action.payload.phoneNumber;
                state.account_id = action.payload.account_id;
                state.userId = action.payload.userId;
                state.accountType = action.payload.accountType;
                state.apartments = action.payload.apartments;
                state.rentedApartments = action.payload.rentedApartments;
                state.businessDetails = action.payload.businessDetails;
            })
            .addCase(loginAgent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isLoggedIn = false;
            })
            .addCase(logoutAgent.fulfilled, (state) => {
                Object.assign(state, initialState);
            });
    }
});


export const {logout, initializeFromStorage} = agentSlice.actions;
export default agentSlice.reducer;
