import { Suspense } from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';
import { baseURL } from '@/../next.config';
import { Apartment } from '@/types/apartment'; 
import { Loader } from 'lucide-react';

 
export default async function Page({params}:any) {
  const { id } = await params;  

   const response = await fetch (baseURL+'/apartment/'+id);
   const json =await response.json();
   const apartment:Apartment = json?.data; 

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader className="animate-spin"/>&nbsp;Loading...</div>}>
      <ApartmentClient apartment={apartment}   />
    </Suspense>
  );
}