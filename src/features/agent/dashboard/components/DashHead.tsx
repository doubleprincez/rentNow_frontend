'use client'
import React from 'react';
import { Menu, UserCircle2, X } from 'lucide-react';
import Sidenav from '@/features/agent/dashboard/components/Sidenav';
import { motion } from 'framer-motion';

const DashHead = () => {
  const [ isMenu, setIsMenu ] = React.useState(false);

  return (
    <div className='relative w-full h-full px-4 flex justify-between items-center bg-gradient-to-l from-[bg-gradient-to-l from-green-500 to-black/85'>
        <div className='lg:hidden flex flex-col w-full leading-5'>
          <div className="text-[1.8em] font-semibold text-orange-500">
              Rent<span className="text-green-500">Naija</span>
          </div>
          <span className='ml-[120px] text-[.8em] text-white/90'>Agent</span>
        </div>

        <div className='w-full'>
          <UserCircle2 className='text-black/80 w-12 h-12 ml-auto'/>
        </div>

        {/* <div 
        onClick={()=>(setIsMenu(!isMenu))} 
        className='block lg:hidden'
        >
          <Menu className='text-black w-10 h-10'/>
        </div>

        {isMenu && (
          <motion.div
          initial={{x:0, opacity:0}}
          animate={{x:0, opacity:1}}
          className='w-[300px] flex flex-col gap-10 py-20 px-4 rounded-l-xl fixed top-0 right-0 h-screen z-50 bg-black/70'
          >
            <div 
            onClick={()=>setIsMenu(false)} 
            className='absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex justify-center items-center'
            >
              <X className='w-5 h-5 text-orange-500' />
            </div>
            <Sidenav/>
          </motion.div>
        )} */}
    </div>
  )
}

export default DashHead