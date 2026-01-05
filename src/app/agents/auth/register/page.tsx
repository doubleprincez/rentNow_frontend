'use client'
import React, {useEffect} from 'react'
import Register from '@/features/agent/auth/components/Register'
import {useRouter} from "next/navigation";
import {useSelector} from "react-redux";
import { RootState } from '@/redux/store';


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
    <div><Register/></div>
  )
}

export default page