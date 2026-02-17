import axios from 'axios';
import {AxiosApi} from "@/lib/utils";
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
    views?: number;
    likes?: number;
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
    dateFilter: 'all' | '24h' | '7d' | '30d' = 'all',
    categoryFilter: string = '',
    minPrice: string = '',
    maxPrice: string = '',
    roomsFilter: string = '',
    publishedFilter: string = 'all'
) => {
    try {
        let token: string | null | undefined = adminToken;

        if (!token) {
            token = getFormData('adminToken');
        }

        const params = new URLSearchParams();
        params.append('page', page.toString());
        if (search) params.append('search', search);
        if (sortByRecent) {
            params.append('sort', 'created_at');
            params.append('order', 'desc');
        }
        if (dateFilter !== 'all') params.append('date_filter', dateFilter);
        if (categoryFilter) {
            params.append('filter_name', 'category_id');
            params.append('filter_dir', 'eq');
            params.append('filter_val', categoryFilter);
        }
        if (minPrice) {
            params.append('filter_name', 'amount');
            params.append('filter_dir', 'gte');
            params.append('filter_val', minPrice);
        }
        if (maxPrice) {
            params.append('filter_name', 'amount');
            params.append('filter_dir', 'lte');
            params.append('filter_val', maxPrice);
        }
        if (roomsFilter) {
            params.append('filter_name', 'number_of_rooms');
            params.append('filter_dir', 'eq');
            params.append('filter_val', roomsFilter);
        }
        if (publishedFilter !== 'all') {
            params.append('published', publishedFilter === 'published' ? '1' : '0');
        }
        
        const response = await axios.get<ApiResponse>(
            `${baseURL}/apartments?${params.toString()}`,
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
        const token = getFormData('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await AxiosApi("admin").delete(
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

export const publishApartment = async (id: number, published: boolean) => {
    try {
        const token = getFormData('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await AxiosApi("admin").patch(
            baseURL + `/apartment/${id}/publish`,
            { published },
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
        const token = getFormData('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await AxiosApi("admin").put(
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