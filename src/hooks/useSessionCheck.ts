'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AxiosApi, deleteFormData } from '@/lib/utils';
import { baseURL } from '@/../next.config';

const SESSION_CHECK_INTERVAL = 15 * 60 * 1000; // Increased to 15 minutes

export const useSessionCheck = () => {
    const { isLoggedIn, token, account_id } = useSelector((state: RootState) => state.auth);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isCheckingRef = useRef(false);

    const getLoginRoute = (accountId: number | null): string => {
        switch (accountId) {
            case 2: return '/agents/auth/login';
            case 3: return '/partners/auth/login';
            case 4:
            case 5: return '/admin/auth/login';
            default: return '/auth/login';
        }
    };

    const checkSession = async () => {
        if (!isLoggedIn || !token || isCheckingRef.current) return;

        isCheckingRef.current = true;
        try {
            await AxiosApi('user', token).get(`${baseURL}/me`);
        } catch (error: any) {
            if (error.response?.status === 401) {
                console.log('Session expired - logging out');
                deleteFormData('authToken');
                deleteFormData('authState');
                deleteFormData('token');
                deleteFormData('agentToken');
                deleteFormData('adminToken');
                
                const loginRoute = getLoginRoute(account_id);
                window.location.href = loginRoute;
            }
            // Ignore other errors (network issues, etc.)
        } finally {
            isCheckingRef.current = false;
        }
    };

    useEffect(() => {
        if (!isLoggedIn) return;

        // Check immediately when component mounts
        checkSession();

        // Set up interval check every 5 minutes
        intervalRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL);

        // Check when user returns to tab/window
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkSession();
            }
        };

        // Check when window regains focus
        const handleFocus = () => {
            checkSession();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [isLoggedIn, token, account_id]);
};
