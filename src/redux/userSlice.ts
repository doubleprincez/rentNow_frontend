import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isLoggedIn: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
}

const initialState: UserState = {
  isLoggedIn: false,
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: null,
};

const loadState = (): UserState => {
  if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('userState');
      if (savedState) {
          return JSON.parse(savedState);
      }
  }
  return {
      isLoggedIn: false,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: null,
  };
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
    }>) => {
      state.isLoggedIn = true;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;

      if (typeof window !== 'undefined') {
        localStorage.setItem('userState', JSON.stringify({
            isLoggedIn: true,
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
            email: action.payload.email,
            phoneNumber: action.payload.phoneNumber,
        }));
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.firstName = '';
      state.lastName = '';
      state.email = '';
      state.phoneNumber = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('userState');
      }
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;