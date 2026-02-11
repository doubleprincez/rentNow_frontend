import {baseURL} from "@/../next.config";
import {AxiosApi} from "@/lib/utils";
import {ApiSubscriptionResponse} from "@/types/subscription";
import {ApiResponse} from "@/types/apartment";


export async function getApartments(queryParams:any=null) {
    try {
        const response = await fetch(`${baseURL}/apartments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
        return response.json();
    } catch (error) {
        throw error;
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