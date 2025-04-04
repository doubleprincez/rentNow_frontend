import {Suspense} from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';
import {Loader2Icon} from 'lucide-react';
import {AxiosApiServer} from "@/lib/server-utils";
import {ApiSubscriptionResponse} from "@/types/subscription";
import {baseURL} from "@/../next.config";
export const findApartment = async (apartmentId: string, account = 'user') => {
    try {
        const response = await AxiosApiServer(account).get<ApiSubscriptionResponse>(
            `${baseURL}/apartment/${apartmentId}`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
export default async function Page({params}: { params: { id: string } }) {
    const response = await findApartment(params.id);

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
            <Loader2Icon className="animate-spin"/>&nbsp;Loading...</div>}>
            <ApartmentClient prevApartment={response.data}/>
        </Suspense>
    );
}