import {Suspense} from 'react';
import ProductMediaViewerWrapper from '@/features/user/ProductMediaViewerWrapper';
import {Loader2Icon} from 'lucide-react';
import {AxiosApiServer} from "@/lib/server-utils";
import {baseURL, frontendURL} from "@/../next.config";
import {Apartment} from "@/types/apartment";
import {Metadata} from "next";

/**
 * Generate metadata for individual apartment pages
 * This is critical for social media sharing (Facebook, Twitter, WhatsApp, etc.)
 */
export async function generateMetadata({params}: any): Promise<Metadata> {
    const {id} = await params;
    
    try {
        const axiosInstance = await AxiosApiServer();
        const response = await axiosInstance.get(`${baseURL}/apartment/${id}`);
        const apartment: Apartment = response.data.data;
        
        // Get the first image or use default
        const firstImage = apartment.images && Object.values(apartment.images)[0]?.preview_url;
        const imageUrl = firstImage 
            ? (firstImage.startsWith('http') ? firstImage : `${frontendURL}${firstImage}`)
            : `${frontendURL}/uploads/logo.png`;
        
        const pageUrl = `${frontendURL}/find-homes/${id}`;
        const title = apartment?.title || "Apartment Details - RentNow.ng";
        const description = apartment?.description || "Explore this beautiful apartment available for rent on RentNow.ng";
        
        return {
            title,
            description,
            openGraph: {
                type: 'website',
                url: pageUrl,
                title,
                description,
                siteName: "RentNow.ng",
                locale: 'en_NG',
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: apartment?.title || "Apartment Image",
                        type: 'image/jpeg',
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                site: "@RentNowNG",
                title,
                description,
                images: [imageUrl],
            },
            // Additional metadata for better social sharing
            alternates: {
                canonical: pageUrl,
            },
            robots: {
                index: true,
                follow: true,
            },
        };
    } catch (error) {
        // console.error('Error generating metadata:', error);
        
        // Fallback metadata if apartment fetch fails
        return {
            title: "Apartment Details - RentNow.ng",
            description: "Explore beautiful apartments available for rent on RentNow.ng",
            openGraph: {
                type: 'website',
                url: `${frontendURL}/find-homes/${id}`,
                title: "Apartment Details - RentNow.ng",
                description: "Explore beautiful apartments available for rent on RentNow.ng",
                siteName: "RentNow.ng",
                locale: 'en_NG',
                images: [
                    {
                        url: `${frontendURL}/uploads/logo.png`,
                        width: 1200,
                        height: 630,
                        alt: "RentNow.ng",
                    },
                ],
            },
        };
    }
}

export default async function Page({params}: any) {
    const {id} = await params;
    
    try {
        const axiosInstance = await AxiosApiServer();
        const response = await axiosInstance.get(`${baseURL}/apartment/${id}`);
        console.log('API Response:', response);
        const apartment: Apartment = response.data?.data || response.data;

        if (apartment) {
            return (
                <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
                    <Loader2Icon className="animate-spin"/> &nbsp;Loading...
                </div>}>
                    <ProductMediaViewerWrapper apartment={apartment}/>
                </Suspense>
            );
        } else {
            return (
                <div className="flex flex-col justify-center items-center min-h-screen">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Apartment Not Found</h1>
                    <p className="text-gray-600 mb-6">The apartment you're looking for doesn't exist or has been removed.</p>
                    <a href="/find-homes" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                        Browse Other Apartments
                    </a>
                </div>
            );
        }
    } catch (error: any) {
        console.error('Error loading apartment:', error);
        console.error('Error response:', error?.response);
        const isNotFound = error?.response?.status === 404;
        
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    {isNotFound ? 'Apartment Not Found' : 'Something Went Wrong'}
                </h1>
                <p className="text-gray-600 mb-6">
                    {isNotFound 
                        ? "The apartment you're looking for doesn't exist or has been removed."
                        : "We're having trouble loading this apartment. Please try again later."
                    }
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <pre className="text-xs text-red-600 max-w-2xl overflow-auto p-4 bg-gray-100 rounded">
                        {JSON.stringify(error?.response?.data || error?.message || error, null, 2)}
                    </pre>
                )}
                <a href="/find-homes" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mt-4">
                    Browse Other Apartments
                </a>
            </div>
        );
    }
}
