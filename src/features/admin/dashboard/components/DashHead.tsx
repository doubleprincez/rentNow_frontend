'use client'
import React from 'react';
import { Menu, UserCircle2, X, LogOut } from 'lucide-react';
import Sidenav from '@/features/agent/dashboard/components/Sidenav';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { logoutAdmin } from '@/redux/adminSlice';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContext';

const DashHead = () => {
    const [isMenu, setIsMenu] = React.useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { showAlert } = useAlert();
    const { firstName, lastName } = useSelector((state: RootState) => state.admin);

    const handleLogout = async () => {
        try {
            await dispatch(logoutAdmin()).unwrap();
            showAlert('Logged out successfully', 'success');
            router.push('/admin/login');
        } catch (error) {
            showAlert('Error logging out', 'error');
        }
    };

    return (
        <div className='relative w-full h-full px-4 flex justify-between items-center bg-gradient-to-l from-[bg-gradient-to-l from-black to-black/85'>
            <div className='lg:hidden flex flex-col w-full leading-5'>
                <div className="text-[1.8em] font-semibold text-orange-500">
                    Rent<span className="text-green-500">Naija</span>
                </div>
                <span className='ml-[120px] text-[.8em] text-white/90'>Admin</span>
            </div>
            
            <div className='flex items-center gap-4 ml-auto'>
                <div className='flex items-center gap-2'>
                    <div className='hidden md:flex flex-col text-right'>
                        <span className='text-white text-[.8em] font-medium capitalize'>
                            {firstName} {lastName}
                        </span>
                        <span className='text-white/70 text-[.7em]'>
                            Administrator
                        </span>
                    </div>
                    <UserCircle2 className='text-white/80 w-10 h-10'/>
                </div>
                
                {/* <button 
                    onClick={handleLogout}
                    className='hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors'
                >
                    <LogOut className='w-4 h-4 text-red-500' />
                    <span className='text-red-500 text-sm'>Logout</span>
                </button> */}
            </div>

            <div
                onClick={() => setIsMenu(!isMenu)}
                className='block lg:hidden ml-4'
            >
                <Menu className='text-black w-10 h-10'/>
            </div>

            {isMenu && (
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className='w-[300px] flex flex-col gap-10 py-20 px-4 rounded-l-xl fixed top-0 right-0 h-screen z-50 bg-black/70'
                >
                    <div
                        onClick={() => setIsMenu(false)}
                        className='absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex justify-center items-center'
                    >
                        <X className='w-5 h-5 text-orange-500' />
                    </div>

                    <div className='flex flex-col items-center gap-2 mb-4'>
                        <UserCircle2 className='text-white/80 w-16 h-16'/>
                        <span className='text-white text-[.8em] font-medium capitalize'>
                            {firstName} {lastName}
                        </span>
                        <span className='text-white/70 text-sm'>
                            Administrator
                        </span>
                        {/* <button 
                            onClick={handleLogout}
                            className='flex items-center gap-2 px-3 py-1.5 mt-2 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors'
                        >
                            <LogOut className='w-4 h-4 text-red-500' />
                            <span className='text-red-500 text-sm'>Logout</span>
                        </button> */}
                    </div>

                    <Sidenav />
                </motion.div>
            )}
        </div>
    );
};

export default DashHead;