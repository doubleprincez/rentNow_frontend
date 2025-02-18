'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isLoggedIn, token } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (!isLoggedIn || !token) {
        router.push('/admin/login');
    }
  }, [isLoggedIn, token, router]);

  if (!isLoggedIn || !token) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;