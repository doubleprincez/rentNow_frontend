import {Suspense} from 'react';
import ApartmentClient from '@/features/landing/components/ApartmentClient';
import {Loader2Icon} from 'lucide-react';
import {AxiosApiServer} from "@/lib/server-utils";
import {ApiSubscriptionResponse} from "@/types/subscription";
import {baseURL} from "@/../next.config";

export default async function Page({params}:any) {
    const { id } = await params;
    const response = await AxiosApiServer().get(
        `${baseURL}/apartment/${id}`
    );

    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">
            <Loader2Icon className="animate-spin" /> &nbsp;Loading...</div>}>
            <ApartmentClient prevApartment={response.data} />
        </Suspense>
    );
}