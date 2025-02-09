'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    if (!token) {
      router.push('/admin/auth/login');
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;