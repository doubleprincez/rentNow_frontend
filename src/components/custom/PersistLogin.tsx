'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '@/redux/userSlice';
import {getFormData} from "@/lib/utils";

export const PersistLogin = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const savedState = getFormData('userState');
        if (savedState) {
            const userData = JSON.parse(savedState);
            if (userData.isLoggedIn) {
                dispatch(login({
                    isSubscribed:userData.isSubscribed,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    userId: userData.userId,
                    accountType: userData.accountType
                }));
            }
        }
    }, [dispatch]);

    return null; 
};