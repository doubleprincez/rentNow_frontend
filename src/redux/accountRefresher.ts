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
    let loggedIn: boolean = false;
    let adminLoggedIn: boolean =false;
    let agentLoggedIn: boolean = false;
    let userLoggedIn: boolean = false;
    let token: string = '';
    let token1: string = '';
    let token2: string = '';
    let token3: string = '';

    adminLoggedIn = useSelector((state: RootState) => state.admin.isLoggedIn);
    token1 = useSelector((state: RootState) => state.admin.token??'');

    agentLoggedIn = useSelector((state: RootState) => state.agent.isLoggedIn);
    token2 = useSelector((state: RootState) => state.agent.token??'');

    userLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    token3 = useSelector((state: RootState) => state.user.token??'');


    if (token3) {
        loggedIn = userLoggedIn;
        token = token3;
    }
    if (token2) {
        loggedIn = agentLoggedIn;
        token = token2;
    }
    if (token1) {
        loggedIn = adminLoggedIn;
        token = token1;
    }

    // if (account == 'admin') {
    //     userLoggedIn = useSelector((state: RootState) => state.admin.isLoggedIn);
    //     token = useSelector((state: RootState) => state.admin.token);
    // } else if (account == 'agent') {
    //     userLoggedIn = useSelector((state: RootState) => state.agent.isLoggedIn);
    //     token = useSelector((state: RootState) => state.agent.token);
    // } else {
    //     userLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);
    //     token = useSelector((state: RootState) => state.user.token);
    // }

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
            await dispatch(logoutAgent());
            router.push('/agents/auth/login');
        } else {
            await dispatch(logout());
            return router.push('/');
        }

    }


    useEffect(() => {
        if (loggedIn) {
            fetchUserData(); // Initial fetch
            const interval = setInterval(fetchUserData, 10 * 60 * 1000); // Refresh every 10 minutes
            return () => clearInterval(interval);
        }
        return () => {
        }
    }, [dispatch, loggedIn]);


}

export default accountRefresher;