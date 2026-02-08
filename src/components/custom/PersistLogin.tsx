'use client';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {AuthState} from '@/redux/authSlice';
import {getFormData} from "@/lib/utils";

export const PersistLogin = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const savedState = getFormData('authState') as AuthState;
        if (savedState && typeof savedState === 'object' && 'userId' in savedState && savedState.isLoggedIn) {
            // State is already persisted via redux-persist
        }
    }, [dispatch]);

    return null;
};
