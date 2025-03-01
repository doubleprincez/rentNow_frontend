'use client'
import React, {useEffect} from 'react'
import Login from '@/features/agent/auth/components/Login'
import {useSelector} from "react-redux";
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';


const page = () => {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.agent);
    const { isLoggedIn, firstName, lastName } = useSelector((state: RootState) => state.agent);

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/agents/dashboard');
        }
    }, [isLoggedIn, router]);

  return (
    <div>
        <Login/>
    </div>
  )
}

export default page