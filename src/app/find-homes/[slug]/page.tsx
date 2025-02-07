import { Metadata } from 'next';
import ApartmentPage from '@/features/landing/components/ApartmentPage';  

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    data?: string;
  };
}

export const metadata: Metadata = {
  title: 'Apartment Details | Rent9ja',
  description: 'View detailed information about this apartment',
};

export default function Page({ params, searchParams }: PageProps) {
  const apartmentData = searchParams.data ? JSON.parse(decodeURIComponent(searchParams.data)) : null;
  
  return <ApartmentPage params={Promise.resolve(params)} initialData={apartmentData} />;
}