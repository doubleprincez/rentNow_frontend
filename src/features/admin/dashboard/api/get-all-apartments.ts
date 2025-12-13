import axios from 'axios';
import {baseURL} from "@/../next.config";
import {getFormData} from "@/lib/utils";

export interface Apartment {
    id: number;
    agent: string;
    agent_email: string;
    category: string;
    title: string;
    description: string;
    number_of_rooms: string;
    amount: string;
    duration: string;
    state_code: string;
    published: boolean;
    can_rate: boolean;
    city_code: string;
    created_at: string;
    new: boolean;
    images: Record<string, {
        preview_url: string;
        original_url: string;
    }>;
    videos: Record<string, {
        original_url: string;
    }>;
}

export interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    filtered_count?: number; // Count after filters applied
    total_count?: number; // Total count before filters
    data: Record<string, Apartment>; // Server returns object with numeric keys, not array
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data: PaginationData;
}

export const getAllApartments = async (
    page: number = 1,
    search: string = '',
    adminToken: string | null | undefined = null,
    sortByRecent: boolean = false,
    dateFilter: 'all' | '24h' | '7d' | '30d' = 'all'
) => {
    try {
        let token: string | null | undefined = adminToken;

        if (!token) {
            token = getFormData('adminToken');
        }

        const sortParam = sortByRecent ? '&sort=created_at&order=desc' : '';
        const dateParam = dateFilter !== 'all' ? `&date_filter=${dateFilter}` : '';
        
        const response = await axios.get<ApiResponse>(
            baseURL + `/apartments?page=${page}&search=${search}${sortParam}${dateParam}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteApartment = async (id: number) => {
    try {
        const token = getFormData('adminToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.delete(
            baseURL + `/apartment/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};
export const updateApartment = async (id: number, data: object) => {
    try {
        const token = getFormData('adminToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.put(
            baseURL + `/apartment/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        throw error;
    }
};