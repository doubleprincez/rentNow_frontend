import axios from 'axios';

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
  city_code: string;
  images: Record<string, {
    preview_url: string;
    original_url: string;
  }>;
  videos: Record<string, {
    original_url: string;
  }>;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: Apartment[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: PaginationData;
}

export const getAllApartments = async (page: number = 1, search: string = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get<ApiResponse>(
      `https://api.rent9ja.com.ng/api/apartments?page=${page}&search=${search}`,
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
    const token = localStorage.getItem('adminToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete(
      `https://api.rent9ja.com.ng/api/apartment/${id}`,
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