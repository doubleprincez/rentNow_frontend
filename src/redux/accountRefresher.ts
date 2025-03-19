'use client';

import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '@/redux/store';
import { login, userSlicePayload } from "./userSlice";
import { useEffect } from "react";
import { AxiosApi } from "@/lib/utils";
import { baseURL } from '@/../next.config';
import { UserState } from '@/types/chats';
import { User } from '@/features/admin/dashboard/api/conversationApi';


const accountRefresher =()=>{
    const dispatch = useDispatch();
    const isLoggedin =  useSelector((state: RootState) => state.user.isLoggedIn);

    const fetchUserData = async () => {
        await AxiosApi().get(baseURL+"/profile")  
             .then((response: { data: any })=>{
                if (response.data) {
                    let data = response.data.data; 
                    const nameParts = data.name.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                dispatch(login({ 
                    isSubscribed:data.is_subscribed,
                    firstName: firstName,
                    lastName: lastName,
                    email: data.email,
                    phoneNumber: data.phone ? parseInt(data.phone) : null,
                    userId: data.id, 
                    accountType: data.account.slug,
                    apartments: data.apartments || [],
                    rentedApartments: data.rented_apartments || []
                }));
            }
            
    }).catch ((error:any) => console.log( error?.response?.data?.message||  error?.message ))
    }


    useEffect(() => {
        if(isLoggedin){
            
        fetchUserData(); // Initial fetch
        const interval = setInterval(fetchUserData, 10 * 60 * 1000); // Refresh every 4 minutes

        return () => clearInterval(interval);
        }
        return ()=>{}
    }, [dispatch,isLoggedin]); 




}

export default accountRefresher;