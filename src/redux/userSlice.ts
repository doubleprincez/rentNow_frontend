import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {deleteFormData, getFormData, saveFormData} from "@/lib/utils";

export type UserState = {
    isLoggedIn: boolean;
    isSubscribed?: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number | null;
    userId: number | null;
    accountType: string | undefined;
    apartments: Array<any>;
    rentedApartments: Array<any>;
    token: string | undefined;
}

const initialState: UserState = {
    isLoggedIn: false,
    isSubscribed: false,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    userId: null,
    accountType: undefined,
    apartments: [],
    rentedApartments: [],
    token: undefined
};

// Improved loadState function with proper type checking and error handling
const loadState = (): UserState => {

    if (typeof window !== 'undefined') {
        try {
            const token = getFormData('token') as string;
            const saved = getFormData('userState') as UserState;
            if (saved && typeof saved === 'object' && 'userId' in saved) {
                const parsedState = saved;

                // Ensure userId is properly preserved
                const userId = Number(parsedState.userId);

                return {
                    ...initialState,
                    ...parsedState,
                    userId: userId, // Use the properly typed userId
                    phoneNumber: typeof parsedState.phoneNumber === 'number' ? parsedState.phoneNumber : null,
                    isLoggedIn: Boolean(parsedState.isLoggedIn),
                    token: token || undefined,
                    apartments: Array.isArray(parsedState.apartments) ? parsedState.apartments : [],
                    rentedApartments: Array.isArray(parsedState.rentedApartments) ? parsedState.rentedApartments : []
                };

            }
        } catch (error) {
            //console.error('Error loading state:', error);
            //console.error('LocalStorage content:', getFormData('userState'));
        }
    }
    return initialState;
};

export interface userSlicePayload {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number | null;
    userId: number;
    isSubscribed?: boolean;
    accountType?: string;
    apartments?: Array<any>;
    rentedApartments?: Array<any>;

}

const userSlice = createSlice({
    name: 'user',
    initialState: loadState(),
    reducers: {
        login: (state, action: PayloadAction<userSlicePayload>) => {
            state.isLoggedIn = true;
            state.isSubscribed = action.payload.isSubscribed;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
            state.phoneNumber = action.payload.phoneNumber;
            state.userId = action.payload.userId;
            state.accountType = action.payload.accountType;
            state.apartments = action.payload.apartments || [];
            state.rentedApartments = action.payload.rentedApartments || [];
            state.token = getFormData('token') || undefined;

            // Store in localStorage with explicit type preservation
            if (typeof window == 'undefined') {
                const stateToStore = {
                    isLoggedIn: true,
                    isSubscribed: action.payload.isSubscribed,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName,
                    email: action.payload.email,
                    phoneNumber: action.payload.phoneNumber,
                    userId: action.payload.userId, // Store userId as a number
                    accountType: action.payload.accountType,
                    apartments: action.payload.apartments || [],
                    rentedApartments: action.payload.rentedApartments || []
                };
                saveFormData('userState', JSON.stringify(stateToStore));
            }
        },
        updateSubscription: (state, action: PayloadAction<boolean>) => {
            state.isSubscribed = action.payload;

            if (typeof window == 'undefined') {
                const storedState = getFormData('userState') || {}
                saveFormData('userState', JSON.stringify({...storedState, isSubscribed: action.payload}));
            }
        },
        logout: (state) => {
            Object.assign(state, initialState);
            if (typeof window == 'undefined') {
                deleteFormData('userState');
                deleteFormData('token');
            }
        }
    }
});

export const {login, logout, updateSubscription} = userSlice.actions;
export default userSlice.reducer;