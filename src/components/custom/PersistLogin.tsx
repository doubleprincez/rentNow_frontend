'use client';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {login, UserState} from '@/redux/userSlice';
import {getFormData} from "@/lib/utils";

export const PersistLogin = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const savedState = getFormData('userState') as UserState;
        if (savedState && typeof savedState === 'object' && 'userId' in savedState) {
            const userData = savedState;
            const userId = Number(userData.userId);
            try {
                if (userData.isLoggedIn ?? false) {
                    dispatch(login({
                        isSubscribed: userData.isSubscribed,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                        phoneNumber: userData.phoneNumber,
                        userId: userId,
                        accountType: userData.accountType
                    }));
                }
            } catch (e) {

            }

        }
    }, [dispatch]);

    return null;
};