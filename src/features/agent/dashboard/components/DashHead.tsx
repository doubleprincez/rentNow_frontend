'use client';
import React, { useEffect } from 'react';
import { Menu, UserCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Sidenav from '@/features/agent/dashboard/components/Sidenav';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Logo from '@/components/assets/logo/logo.png'

const DashHead = () => {
  const router = useRouter();
  // const [isMenu, setIsMenu] = React.useState(false);
  const user = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/agents/auth/login');
    }
  }, [user.isLoggedIn, router]);

  return (
    <div className='relative w-full h-full px-4 flex justify-between items-center bg-gradient-to-l from-green-500 to-black/85'>
      <div className='lg:hidden flex flex-col w-full leading-[1px] md:leading-[3px]'>
        <div>
          <Image src={Logo} alt='logo' width={500} height={500} className='w-[90px] md:w-[120px] h-[50px] object-contain'/>
        </div>
        <span className='ml-[90px] md:ml-[120px] text-[.7em] md:text-[.8em] text-white/90'>Agent</span>
      </div>

      <div className='w-full flex items-center justify-end gap-3'>
        <span className='text-white'>{user.firstName}</span>
        <UserCircle2 className='text-black/80 w-9 md:w-12 h-9 md:h-12'/>
      </div>

    </div>
  );
};

export default DashHead;

