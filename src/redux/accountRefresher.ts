'use client';

import {useSelector} from 'react-redux';
import {RootState} from '@/redux/store';
import {login, logout} from "./userSlice";
import {useEffect, useState} from "react";
import {AxiosApi} from "@/lib/utils";
import {baseURL} from '@/../next.config';
import {logoutAdmin} from './adminSlice';
import {useRouter} from 'next/navigation';
import {useAppDispatch} from "@/redux/hook";
import {logoutAgent} from "@/redux/agentSlice";


const accountRefresher = (account = 'user') => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    let userLoggedIn, token: any;

    if (account == 'admin') {
        userLoggedIn = useSelector((state: RootState) => state.admin.isLoggedIn);
        token = useSelector((state: RootState) => state.admin.token);
    } else if (account == 'agent') {
        userLoggedIn = useSelector((state: RootState) => state.agent.isLoggedIn);
        token = useSelector((state: RootState) => state.agent.token);
    } else {
        userLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
        token = useSelector((state: RootState) => state.user.token);
    }
    const [counter, setCounter] = useState(0);

    const fetchUserData = async () => {
        await AxiosApi(account, token).get(baseURL + "/profile")
            .then((response: { data: any }) => {
                if (response.data) {
                    let data = response.data.data;
                    const nameParts = data.name.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    dispatch(login({
                        isSubscribed: data.is_subscribed,
                        firstName: firstName,
                        lastName: lastName,
                        email: data.email,
                        phoneNumber: data.phone ? parseInt(data.phone) : null,
                        userId: data.id,
                        accountType: data.account.slug,
                        apartments: data.apartments || [],
                        rentedApartments: data.rented_apartments || []
                    }));
                    setCounter(() => 0)
                }
            }).catch((error: any) => {
                if (error.status == 401) {
                    console.log('Authentication failed for ' + account);
                    if (counter >= 2) {
                        logoutUserAutomatically(account);
                    }
                    setCounter(() => counter + 1);
                }
            })
    }
    const logoutUserAutomatically = async (account = 'user') => {
        if (account == 'admin') {
            await dispatch(logoutAdmin()).unwrap();
            router.push('/admin/login');
        } else if (account == 'agent') {
            await dispatch(logoutAgent()).wrap();
            router.push('/agents/auth/login');
        } else {
            await dispatch(logout()).wrap();
            return router.push('/');
        }

    }


    useEffect(() => {
        if (userLoggedIn) {
            fetchUserData(); // Initial fetch
            const interval = setInterval(fetchUserData, 10 * 60 * 1000); // Refresh every 10 minutes
            return () => clearInterval(interval);
        }
        return () => {
        }
    }, [dispatch, userLoggedIn]);


}

export default accountRefresher;