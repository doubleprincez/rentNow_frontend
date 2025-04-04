import {Suspense} from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';
import {Loader2Icon} from 'lucide-react';
import {AxiosApiServer} from "@/lib/server-utils";
import {baseURL} from "@/../next.config";
import {Metadata} from "next";
import {Apartment} from "@/types/apartment";
import Head from "next/head";

export default async function Page({params}: any) {

    const {id} = await params;
    const response = await AxiosApiServer().get(`${baseURL}/apartment/${id}`);
    const apartment: Apartment = response.data.data;
    const defaultImage = '/uploads/logo.png';

    // Dynamically update metadata based on fetched apartment data
    const metadata: Metadata = {
        title: apartment?.title || "Apartment Details",
        description: apartment?.description || "Explore this beautiful apartment available for rent.",
        openGraph: {
            url: `${baseURL}/apartment/${id}`,
            title: apartment?.title || "Apartment Details",
            description: apartment?.description || "Explore this beautiful apartment available for rent.",
            images: [
                {
                    url: apartment.images && Object.values(apartment.images)[0]?.preview_url || defaultImage, // Set a default image if not provided
                    width: 800,
                    height: 600,
                    alt: apartment?.title || "Apartment Image",
                    type: 'image/jpeg',
                },
            ],
            siteName: "RentNow.ng",
        },
        twitter: {
            card: "summary_large_image",
            site: "@RentNowNG",
            title: apartment?.title || "Apartment Details",
            description: apartment?.description || "Explore this beautiful apartment available for rent.",
            images: [
                {
                    url: apartment.images && Object.values(apartment.images)[0]?.preview_url || defaultImage, // Correctly use `images` here
                    width: 800,
                    height: 600,
                    alt: apartment?.title || "Apartment Image",
                    type: 'image/png',
                },
            ],
        },
    };

    return (
        <>
            <Head>
                <meta name="description" content={metadata?.description}/>
                <meta property="og:title" content={metadata?.openGraph?.title}/>
                <meta property="og:description" content={metadata?.openGraph?.description}/>
                <meta property="og:url" content={metadata?.openGraph?.url}/>
                <meta property="og:image" content={metadata?.openGraph?.images[0]?.url}/>
                <meta property="og:image:width" content={String(metadata?.openGraph?.images[0]?.width)}/>
                <meta property="og:image:height" content={String(metadata?.openGraph?.images[0]?.height)}/>
                <meta name="twitter:card" content={metadata?.twitter?.card}/>
                <meta name="twitter:title" content={metadata?.twitter?.title}/>
                <meta name="twitter:description" content={metadata?.twitter?.description}/>
                <meta name="twitter:image"
                      content={metadata?.twitter?.images && metadata?.twitter?.images[0]?.url ?? ''}/>
            </Head>

            <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                <Loader2Icon className="animate-spin"/> &nbsp;Loading...
            </div>}>
                <ApartmentClient prevApartment={apartment}/>
            </Suspense>
        </>
    );
}