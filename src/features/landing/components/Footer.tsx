// 'use client'
// import React from 'react';
// import Link from 'next/link';
// import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
// import Image from 'next/image';
// import Logo from '@/components/assets/logo/logo.png'

// const Footer = () => {
//   return (
//     <div className='w-full flex flex-col bg-black'>
//       <div className='px-4 lg:px-8 py-10 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4'>
//         <div className='cols-span-1 w-full flex flex-col gap-2 md:gap-3'>
//           <Link href="/">
//           <Image src={Logo} alt='logo' width={500} height={500} className='w-[120px] h-[50px] object-contain'/>
//           </Link>
//           <p className="text-[.8em] md:text-[.9em] md:leading-6 md:font-medium text-white">
//               Perfect Firm For Selling Or Leasing Houses, Flats, And Villas.
//           </p>
//           <div className='flex items-center gap-5 md:mt-4'>
//             <Facebook className='text-white'/>
//             <Instagram className='text-white'/>
//             <Linkedin className='text-white'/>
//             <Twitter className='text-white'/>
//           </div>
//         </div>

//         <div className='w-full cols-span-1 lg:col-span-2 flex flex-col mt-4 md:mt-0'>
//           <div></div>

//           <div className='grid grid-cols-2 mdl:grid-cols-4 gap-4'>
//             <div className='col-span-1 w-full flex flex-col gap-2 md:gap-4'>
//               <h1 className='text-[.9em] md:text-[1.2em] text-orange-500 font-medium'>About</h1>
//               <ul className='text-gray-200 text-[.8em] md:text-[.9em] flex flex-col gap-1 md:gap-2'>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>About us</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>How it works</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>FAQs</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Privacy Policy</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Terms & Condition</li>
//               </ul>
//             </div>

//             <div className='col-span-1 w-full flex flex-col gap-2 md:gap-4'>
//               <h1 className='text-[.9em] md:text-[1.2em] font-medium text-orange-500'>Product</h1>
//               <ul className='text-gray-200 text-[.8em] md:text-[.9em] flex flex-col gap-1 md:gap-2'>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Identification</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Business Card</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Payment</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>More+</li>
//               </ul>
//             </div>

//             <div className='col-span-1 w-full flex flex-col gap-2 md:gap-4'>
//               <h1 className='text-[.9em] md:text-[1.2em] font-medium text-orange-500'>Experience</h1>
//               <ul className='text-gray-200 text-[.8em] md:text-[.9em] flex flex-col gap-1 md:gap-2'>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Signup as Agent</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>House samples </li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Security</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Career</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Blog</li>
//               </ul>
//             </div>

//             <div className='col-span-1 w-full flex flex-col gap-2 md:gap-4 lg:items-end'>
//               <h1 className='text-[.9em] md:text-[1.2em] font-medium text-orange-500'>Contact us</h1>
//               <ul className='text-gray-200 text-[.8em] md:text-[.9em] flex flex-col gap-1 md:gap-2 lg:items-end'>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>+234 123 456 7890</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>info@rentnow.com</li>
//                 <li className='hover:underline duration-300 ease-in-out hover:text-orange-500 cursor-pointer'>Support</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className='w-full px-2 md:px-8 py-4 md:py-8 flex flex-col md:flex-row items-center justify-center md:justify-between text-[.7em] md:text-[.8em] font-medium text-orange-500 border-t border-orange-500'>
//         <span>Copyright &copy; 2025 RentNow, All rights reserved</span>
//         <span>Developed by DEENOluwatobi</span>
//       </div>
//     </div>
//   )
// }

// export default Footer


'use client'
import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/assets/logo/logo.png'

const Footer = () => {
  return (
    <div className='w-full flex flex-col justify-center items-center bg-black'>
      <div className=' w-full flex flex-col justify-center items-center py-10 gap-2 md:gap-3'>
          <Link href="/">
          <Image src={Logo} alt='logo' width={500} height={500} className='w-[120px] h-[50px] object-contain'/>
          </Link>
          <p className="text-[.8em] md:text-[.9em] md:leading-6 md:font-medium text-white">
              Perfect Firm For Renting and Leasing Houses, Flats and Duplexes all over Nigeria.

          </p>
          <div className='flex items-center gap-5 md:mt-4'>
            <a href={"https://www.facebook.com/share/16UZ45mRaX/"} > <Facebook className='text-white'/></a>
              <a href={"https://www.instagram.com/tenantplus?igsh=MWxpYXZvMDdrOXM1dA=="} > <Instagram className='text-white'/> </a>
                    <Linkedin className='text-white'/>
                    <Twitter className='text-white'/>
          </div>
        </div>

      <div className='w-full px-2 md:px-8 py-4 md:py-8 flex flex-col md:flex-row items-center justify-center md:justify-between text-[.7em] md:text-[.8em] font-medium text-orange-500 border-t border-orange-500'>
        <span>Copyright &copy; 2025 RentNow, All rights reserved</span>
        <span>Developed by DEENOluwatobi</span>
      </div>
    </div>
  )
}

export default Footer