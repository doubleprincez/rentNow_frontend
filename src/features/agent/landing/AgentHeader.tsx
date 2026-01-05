'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Logo from '@/components/assets/logo/logo.png'

const Header = () => {
  const pathname = usePathname();
  const [ isMenu, setIsMenu ] = useState(false);
  const agent = useSelector((state: RootState) => state.agent);

  const links = [
    { title: 'Home', link: '/' },
    { title: 'Find Homes', link: '/find-homes' },
    { title: 'About', link: '/about' },
    { title: 'Contact Us', link: '/contact' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-70 backdrop-blur-md z-[99] px-2 py-2 md:px-4 md:py-4 flex justify-between items-center">
      <Link href="/">
        <Image src={Logo} alt='logo' width={500} height={500} className='w-[120px] h-[50px] object-contain'/>
      </Link>

    

      <div className="hidden lg:flex justify-center items-center gap-4">
        {agent.accountType === 'agents' ? (
          <div className='flex items-center justify-center gap-4'>
            <span className="text-orange-500 font-semibold">
              Hello {agent.firstName.toUpperCase()}
            </span>
            <Link
              href="/agents/dashboard"
              className="hover:bg-transparent border border-orange-500 text-orange-500 bg-white px-4 py-2 rounded-md transition-all duration-300"
            >
              Dashboard
            </Link>
          </div>
        ) : (
          <div className='flex gap-4'>
            <Link
              href="/agents/auth/login"
              className="bg-transparent border border-orange-500 text-orange-500 hover:bg-white px-4 py-2 rounded-md transition-all duration-300"
            >
              Login
            </Link>

            <Link
              href="/agents/auth/register"
              className="bg-orange-500 text-white px-4 py-2 rounded-md"
            >
              Register!
            </Link>
          </div>
        )}
        
      </div>

      <div className="lg:hidden flex justify-center items-center gap-4">
          <div onClick={()=>setIsMenu(true)}>
            <Menu className='w-7 h-7 text-orange-500'/>
          </div>

          {isMenu && (
            <motion.div
            initial={{x:0, opacity:0}}
            animate={{x:0, opacity:1}}
            className='w-[200px] flex flex-col gap-10 py-20 px-4 rounded-l-xl fixed top-0 right-0 h-screen z-50 bg-black/70'
            >
              <div 
              onClick={()=>setIsMenu(false)} 
              className='absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex justify-center items-center'
              >
                <X className='w-5 h-5 text-orange-500' />
              </div>

              <div className="flex flex-col justify-start items-end gap-2 text-[.8em]">
                {agent.isLoggedIn ? (
                  <div className='w-full flex flex-col gap-2'>
                    <span className="text-orange-500 font-semibold">
                      Hello! {agent?.firstName.toUpperCase()}
                    </span>

                    <Link
                      href="/agents/dashboard"
                      className="bg-transparent border border-orange-500 text-orange-500 hover:bg-white px-4 py-2 rounded-md transition-all duration-300"
                    >
                      Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className='w-full flex flex-col gap-2'>
                    <Link
                      href="/agents/auth/login"
                      className="bg-transparent border border-orange-500 text-orange-500 hover:bg-white px-8 py-2 rounded-md transition-all duration-300"
                    >
                      Login
                    </Link>

                    <Link
                      href="/agents/auth/register"
                      className="bg-orange-500 text-white px-8 py-2 rounded-md"
                    >
                      Register
                    </Link>
                  </div>
                )}
                
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
};

export default Header;
