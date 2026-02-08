'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ACCOUNT_TYPES } from '@/lib/authUtils';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isLoggedIn, token, account_id } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoggedIn || !token || (account_id !== ACCOUNT_TYPES.ADMIN && account_id !== ACCOUNT_TYPES.APP_ADMIN)) {
        router.push('/admin/auth/login');
    }
  }, [isLoggedIn, token, account_id, router]);

  if (!isLoggedIn || !token || (account_id !== ACCOUNT_TYPES.ADMIN && account_id !== ACCOUNT_TYPES.APP_ADMIN)) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
