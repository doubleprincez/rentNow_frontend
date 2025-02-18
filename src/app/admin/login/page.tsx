'use client'
import AdminLogin from '@/features/admin/auth/components/AdminLogin';
import Image from 'next/image';
import Logo from '@/components/assets/logo/logo.png'

export default function LoginPage() {
  return (
    <div className='w-full h-screen flex items-center justify-center flex-col gap-4 bg-gradient-to-br from-green-700 to-gray-900'>
      <div>
        <Image src={Logo} alt='logo' width={500} height={500} className='w-[120px] h-[50px] object-contain'/>
      </div>
      <AdminLogin /> 
    </div>
  );
}