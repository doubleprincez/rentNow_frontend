import {Suspense} from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';
import {Loader2Icon} from 'lucide-react';
import {AxiosApiServer} from "@/lib/server-utils";
import {ApiSubscriptionResponse} from "@/types/subscription";
import {baseURL} from "@/../next.config";


const findApartment = async (apartmentId: string) => {
    try {
        const response = await AxiosApiServer().get<ApiSubscriptionResponse>(
            `${baseURL}/apartment/${apartmentId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
export async function getServerSideProps({ params }: { params: { id: string } }) {
    try {
        const apartmentData = await findApartment(params.id);
        return {
            props: {
                apartment: apartmentData.data,
            },
        };
    } catch (error) {
        return {
            notFound: true, // Or handle error as needed
        };
    }
}

export default function Page({ apartment }: { apartment: ApiSubscriptionResponse }) {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
            <Loader2Icon className="animate-spin" /> &nbsp;Loading...</div>}>
            <ApartmentClient prevApartment={apartment} />
        </Suspense>
    );
}