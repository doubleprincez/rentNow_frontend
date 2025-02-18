import axios from 'axios';

const BASE_URL = 'https://api.rent9ja.com.ng/api';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  account: {
    id: number;
    name: string;
    slug: string;
    description: string;
  };
}

export interface PaginatedResponse {
  current_page: number;
  data: User[];
  total: number;
  per_page: number;
}

// API functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
};

export const getUsers = async (page = 1, search = '', accountType: 'users' | 'agents' = 'users') => {
  const response = await axios.get<{ data: PaginatedResponse }>(
    `${BASE_URL}/users`,
    {
      headers: getAuthHeaders(),
      params: {
        page,
        per_page: 20,
        search,
        account_type: accountType
      },
    }
  );
  return response.data.data;
};

export const getUser = async (id: number) => {
  const response = await axios.get<{ data: User }>(
    `${BASE_URL}/user/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data.data;
};

export const createUser = async (userData: Partial<User>) => {
  const response = await axios.post(
    `${BASE_URL}/user`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>) => {
  const response = await axios.put(
    `${BASE_URL}/user/${id}`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await axios.delete(
    `${BASE_URL}/user/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};