import axios from 'axios';

const BASE_URL = 'https://api.rent9ja.com.ng/api';

// Add authentication header to all requests
const authHeader = () => {
    const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface RentDetails {
  id: number;
  apartment_id: number;
  user_id: number;
  agent_id: number;
  status: string;
  duration: string;
  amount: string;
  move_in_date: string;
  created_at: string;
}

export interface PaginatedResponse {
  current_page: number;
  data: RentDetails[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const rentApi = {
  // Get all rented apartments
  getAllRents: async (): Promise<PaginatedResponse> => {
    try {
      const response = await axios.get(`${BASE_URL}/rented-apartments`, authHeader());
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to fetch rent details');
    }
  },

  // Get specific rent details
  getRentById: async (rentId: number): Promise<RentDetails> => {
    try {
      const response = await axios.get(`${BASE_URL}/rented-apartment/${rentId}`, authHeader());
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to fetch rent details');
    }
  },

  // Archive/Delete rent
  archiveRent: async (rentId: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/rented-apartment/${rentId}`, authHeader());
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to archive rent');
    }
  },

  // Activate/Confirm rent
  activateRent: async (rentId: number): Promise<void> => {
    try {
      await axios.post(`${BASE_URL}/rented-apartment/${rentId}/activate`, {}, authHeader());
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to activate rent');
    }
  },
};