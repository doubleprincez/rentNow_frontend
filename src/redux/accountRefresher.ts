'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from './authSlice';
import { useEffect, useState } from 'react';
import { AxiosApi } from '@/lib/utils';
import { baseURL } from '@/../next.config';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/redux/hook';
import { ACCOUNT_TYPES, getLoginRoute } from '@/lib/authUtils';

const accountRefresher = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isLoggedIn, token, account_id } = useSelector((state: RootState) => state.auth);
    const [counter, setCounter] = useState(0);

    const getAccountType = () => {
        switch (account_id) {
            case ACCOUNT_TYPES.ADMIN:
            case ACCOUNT_TYPES.APP_ADMIN:
                return 'admin';
            case ACCOUNT_TYPES.AGENT:
                return 'agent';
            case ACCOUNT_TYPES.USER:
            default:
                return 'user';
        }
    };

    const fetchUserData = async () => {
        if (!token) return;

        const accountType = getAccountType();
        
        try {
            const response = await AxiosApi(accountType, token).get(baseURL + '/profile');
            if (response.data) {
                const data = response.data.data;
                const nameParts = data.name.split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                // Don't call login() - just update the profile data
                // The user is already logged in, we're just refreshing their data
                
                setCounter(0);
            }
        } catch (error: any) {
            if (error.status === 401) {
                if (counter >= 2) {
                    logoutUserAutomatically();
                }
                setCounter(prev => prev + 1);
            }
        }
    };

    const logoutUserAutomatically = async () => {
        await dispatch(logout());
        const loginRoute = getLoginRoute(account_id || ACCOUNT_TYPES.USER);
        router.push(loginRoute);
    };

    useEffect(() => {
        if (isLoggedIn && token) {
            fetchUserData();
            const interval = setInterval(fetchUserData, 10 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn, token]);
};

export default accountRefresher;
