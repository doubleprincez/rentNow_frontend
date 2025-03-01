import axios from 'axios';
import {baseURL} from "@/../next.config";

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };
};

export interface Conversation {
    id: number;
    messages: Message[];
    participants: User[];
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    from_id: number;
    to_id: number;
    message: string;
    created_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    account: {
        id: number;
        name: string;
        slug: string;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface CreateMessageParams {
    from_id: number;
    to_id: number;
    message: string;
}

export const agentConversationApi = {
    getAllConversations: async () => {
        const response = await axios.get<ApiResponse<Conversation[]>>(
            `${baseURL}/conversations`,
            getAuthHeader()
        );
        return response.data.data;
    },

    getConversation: async (id: number) => {
        const response = await axios.get<ApiResponse<Message[]>>(
            `${baseURL}/conversation/${id}`,
            getAuthHeader()
        );
        return response.data.data;
    },

    createConversation: async (params: CreateMessageParams) => {
        const response = await axios.post<ApiResponse<Conversation>>(
            `${baseURL}/conversation`,
            params,
            getAuthHeader()
        );
        return response.data.data;
    },

    updateConversation: async (id: number, params: CreateMessageParams) => {
        const response = await axios.put<ApiResponse<Conversation>>(
            `${baseURL}/conversation/${id}`,
            params,
            getAuthHeader()
        );
        return response.data.data;
    },

    deleteConversation: async (id: number) => {
        await axios.delete(
            `${baseURL}/conversation/${id}`,
            getAuthHeader()
        );
    },

    getConversationRatings: async (id: number) => {
        const response = await axios.get<ApiResponse<any[]>>(
            `${baseURL}/conversation/${id}/ratings`,
            getAuthHeader()
        );
        return response.data.data;
    },

    rateConversation: async (id: number, rating: number, comment?: string) => {
        const response = await axios.post<ApiResponse<any>>(
            `${baseURL}/conversation/${id}/rate`,
            { rating, comment },
            getAuthHeader()
        );
        return response.data.data;
    }
};