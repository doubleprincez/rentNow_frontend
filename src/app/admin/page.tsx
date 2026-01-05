'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const AdminHome = () => {
    const router = useRouter();
    const { isLoggedIn, token } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        if (isLoggedIn && token) {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/login');
        }
    }, [isLoggedIn, token, router]);

    return null;
};

export default AdminHome;