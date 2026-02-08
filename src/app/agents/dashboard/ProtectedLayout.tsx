'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ACCOUNT_TYPES } from '@/lib/authUtils';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const { isLoggedIn, account_id } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (!isLoggedIn || account_id !== ACCOUNT_TYPES.AGENT) {
            router.push('/agents/auth/login');
        }
    }, [isLoggedIn, account_id, router]);

    return (isLoggedIn && account_id === ACCOUNT_TYPES.AGENT) ? <>{children}</> : null;
}
