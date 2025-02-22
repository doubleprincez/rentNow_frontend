import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    isLoggedIn: boolean;
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
            const savedState = localStorage.getItem('userState');
            const token = localStorage.getItem('token');
            
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                
                // Log the parsed state for debugging
                console.log('Parsed state from localStorage:', parsedState);
                
                // Ensure userId is properly preserved
                const userId = parsedState.userId !== undefined ? Number(parsedState.userId) : null;
                
                return {
                    ...initialState,
                    ...parsedState,
                    userId, // Use the properly typed userId
                    phoneNumber: typeof parsedState.phoneNumber === 'number' ? parsedState.phoneNumber : null,
                    isLoggedIn: Boolean(parsedState.isLoggedIn),
                    token: token || undefined,
                    apartments: Array.isArray(parsedState.apartments) ? parsedState.apartments : [],
                    rentedApartments: Array.isArray(parsedState.rentedApartments) ? parsedState.rentedApartments : []
                };
            }
        } catch (error) {
            console.error('Error loading state:', error);
            // Add more detailed error logging
            console.error('LocalStorage content:', localStorage.getItem('userState'));
        }
    }
    return initialState;
};

const userSlice = createSlice({
    name: 'user',
    initialState: loadState(),
    reducers: {
        login: (state, action: PayloadAction<{
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: number | null;
            userId: number;
            accountType?: string;
            apartments?: Array<any>;
            rentedApartments?: Array<any>;
        }>) => {
            state.isLoggedIn = true;
            state.firstName = action.payload.firstName;
            state.lastName = action.payload.lastName;
            state.email = action.payload.email;
            state.phoneNumber = action.payload.phoneNumber;
            state.userId = action.payload.userId;
            state.accountType = action.payload.accountType;
            state.apartments = action.payload.apartments || [];
            state.rentedApartments = action.payload.rentedApartments || [];
            state.token = localStorage.getItem('token') || undefined;

            // Store in localStorage with explicit type preservation
            if (typeof window !== 'undefined') {
                const stateToStore = {
                    isLoggedIn: true,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName,
                    email: action.payload.email,
                    phoneNumber: action.payload.phoneNumber,
                    userId: action.payload.userId, // Store userId as a number
                    accountType: action.payload.accountType,
                    apartments: action.payload.apartments || [],
                    rentedApartments: action.payload.rentedApartments || []
                };
                localStorage.setItem('userState', JSON.stringify(stateToStore));
            }
        },
        logout: (state) => {
            Object.assign(state, initialState);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userState');
                localStorage.removeItem('token');
            }
        }
    }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;