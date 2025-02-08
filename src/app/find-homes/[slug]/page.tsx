import { Suspense } from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page(props: PageProps) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams
  ]);
  
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ApartmentClient params={params} searchParams={searchParams} />
    </Suspense>
  );
}