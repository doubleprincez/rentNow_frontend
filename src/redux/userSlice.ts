import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    isLoggedIn: boolean;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: number | null;
    userId?: number;
    accountType?: string;
    apartments?: Array<any>;
    rentedApartments?: Array<any>;
    token?: string;
}

const initialState: UserState = {
    isLoggedIn: false,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: null,
    userId: undefined,
    accountType: undefined,
    apartments: [],
    rentedApartments: [],
    token: undefined
};

const loadState = (): UserState => {
    if (typeof window !== 'undefined') {
        const savedState = localStorage.getItem('userState');
        const token = localStorage.getItem('token');
        if (savedState) {
            return {
                ...JSON.parse(savedState),
                token: token || undefined
            };
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
            userId?: number;
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
            state.apartments = action.payload.apartments;
            state.rentedApartments = action.payload.rentedApartments;
            state.token = localStorage.getItem('token') || undefined;

            if (typeof window !== 'undefined') {
                localStorage.setItem('userState', JSON.stringify({
                    isLoggedIn: true,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName,
                    email: action.payload.email,
                    phoneNumber: action.payload.phoneNumber,
                    userId: action.payload.userId,
                    accountType: action.payload.accountType,
                    apartments: action.payload.apartments,
                    rentedApartments: action.payload.rentedApartments
                }));
            }
        },
        logout: (state) => {
            Object.assign(state, initialState);
            if (typeof window !== 'undefined') {
                localStorage.removeItem('userState');
                localStorage.removeItem('token');
            }
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;