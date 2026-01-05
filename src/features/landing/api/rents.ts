import { NextResponse } from 'next/server';
import axios from 'axios';
import {baseURL} from "@/../next.config"; 
import { Apartment, PaginationLink } from '@/types/apartment';
import {redirect} from "next/navigation";
import {useSelector} from "react-redux";
import { number } from 'zod';
import { ApiRentResponse } from '@/types/rent';
import {getFormData} from "@/lib/utils";



export const getUserRents = async (page: number = 1, search: string = '') => {
    try {
        const token = getFormData('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.get<ApiRentResponse>(
            baseURL + `/rented-apartments?page=${page}&search=${search}`,
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

export const getUserVisits = async (page: number = 1, search: string = '') => {
    try {
        const token = getFormData('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await axios.get<ApiRentResponse>(
            baseURL + `/visitations?page=${page}&search=${search}`,
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
