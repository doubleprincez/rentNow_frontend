import {NextResponse} from 'next/server';
import axios from 'axios';
import {baseURL} from "@/../next.config";
import {AxiosApi} from "@/lib/utils";
import {ApiSubscriptionResponse} from "@/types/subscription";

export async function GET() {
    try {
        const response = await axios({
            method: 'GET',
            url: baseURL + '/apartments',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        return NextResponse.json(response.data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error: any) {
        //console.error('Error fetching apartments:', error);
        return NextResponse.json(
            {error: error.response?.data?.message || 'Failed to fetch apartments'},
            {status: error.response?.status || 500}
        );
    }
}


export const findApartment = async (apartmentId: number, account = 'user') => {
    try {
        const response = await AxiosApi(account).get<ApiSubscriptionResponse>(
            baseURL + `/apartment/` + apartmentId);

        return response.data;
    } catch (error) {
        throw error;
    }
};