'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const { isLoggedIn } = useSelector((state: RootState) => state.agent);

    useEffect(() => {
        if (!isLoggedIn) {
        router.push('/agents/auth/login');
        }
    }, [isLoggedIn, router]);

    return isLoggedIn ? <>{children}</> : null;
}