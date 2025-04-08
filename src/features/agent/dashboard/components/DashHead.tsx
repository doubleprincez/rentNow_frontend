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
  const user = useSelector((state: RootState) => state.agent);
  const { isLoggedIn, firstName, lastName } = useSelector((state: RootState) => state.agent);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/agents/auth/login');
    }
  }, [isLoggedIn, router]);

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
      {/* <div onClick={() => setIsMenu(!isMenu)} className='block lg:hidden'>
        <Menu className='text-black w-10 h-10'/>
      </div>


      {isMenu && (
        <motion.div
          initial={{x:0, opacity:0}}
          animate={{x:0, opacity:1}}
          className='w-[300px] flex flex-col gap-10 py-20 px-4 rounded-l-xl fixed top-0 right-0 h-screen z-50 bg-black/70'
        >
          <div
            onClick={() => setIsMenu(false)}
            className='absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex justify-center items-center'
          >
            <X className='w-5 h-5 text-orange-500' />
          </div>
          <Sidenav/>
        </motion.div>
      )} */}
    </div>
  );
};

export default DashHead;


// 'use client'
// import React from 'react';
// import { Menu, UserCircle2, X } from 'lucide-react';
// import Sidenav from '@/features/agent/dashboard/components/Sidenav';
// import { motion } from 'framer-motion';

// const DashHead = () => {
//   const [ isMenu, setIsMenu ] = React.useState(false);

//   return (
//     <div className='relative w-full h-full px-4 flex justify-between items-center bg-gradient-to-l from-[bg-gradient-to-l from-green-500 to-black/85'>
//         <div className='lg:hidden flex flex-col w-full leading-5'>
//           <div className="text-[1.8em] font-semibold text-orange-500">
//               Rent<span className="text-green-500">Naija</span>
//           </div>
//           <span className='ml-[120px] text-[.8em] text-white/90'>Agent</span>
//         </div>

//         <div className='w-full'>
//           <UserCircle2 className='text-black/80 w-12 h-12 ml-auto'/>
//         </div>

//         {/* <div 
//         onClick={()=>(setIsMenu(!isMenu))} 
//         className='block lg:hidden'
//         >
//           <Menu className='text-black w-10 h-10'/>
//         </div>

//         {isMenu && (
//           <motion.div
//           initial={{x:0, opacity:0}}
//           animate={{x:0, opacity:1}}
//           className='w-[300px] flex flex-col gap-10 py-20 px-4 rounded-l-xl fixed top-0 right-0 h-screen z-50 bg-black/70'
//           >
//             <div 
//             onClick={()=>setIsMenu(false)} 
//             className='absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex justify-center items-center'
//             >
//               <X className='w-5 h-5 text-orange-500' />
//             </div>
//             <Sidenav/>
//           </motion.div>
//         )} */}
//     </div>
//   )
// }

// export default DashHead