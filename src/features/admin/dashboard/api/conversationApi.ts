import axios from 'axios';
const BASE_URL = 'https://api.rent9ja.com.ng/api';

// Helper to get auth token
const getAuthHeader = () => ({
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Accept': 'application/json',
    }
});


export interface Conversation {
    [x: string]: any;
    id: number;
    messages: Message[];
    participants: User[];
    createdAt: string;
    updatedAt: string;
}


export interface Message {
    id: number;
    content: string;
    senderId: number;
    conversationId: number;
    createdAt: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    accountType: string;
}

export interface Rating {
    id: number;
    rating: number;
    comment?: string;
    userId: number;
    conversationId: number;
    createdAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// New interface for creating conversation
export interface CreateConversationParams {
    from_id: number;
    to_id: number;
    message: string;
}

// New interface for sending message
export interface SendMessageParams {
    from_id: number;
    to_id: number;
    message: string;
}

export interface CreateMessageParams {
    from_id: number;
    to_id: number;
    message: string;
}

export const conversationApi = {
    // Fetch all conversations
    getAllConversations: async () => {
        const response = await axios.get<ApiResponse<Conversation[]>>(
            `${BASE_URL}/conversations`,
            getAuthHeader()
        );
        return response.data.data || [];
    },

    // Fetch single conversation
    getConversation: async (id: number) => {
        const response = await axios.get<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation/${id}`,
            getAuthHeader()
        );
        return response.data.data;
    },

    // Create new conversation with initial message
    createConversation: async (params: CreateMessageParams) => {
        const response = await axios.post<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation`,
            params,
            getAuthHeader()
        );
        return response.data.data;
    },

    // Send a message by creating a new conversation or updating existing one
    sendMessage: async (conversationId: number | null, params: CreateMessageParams) => {
        const response = await axios.put<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation${conversationId ? `/${conversationId}` : ''}`,
            params,
            getAuthHeader()
        );
        return response.data.data;
    },

    // Other methods remain the same...
    deleteConversation: async (id: number) => {
        await axios.delete(
            `${BASE_URL}/conversation/${id}`,
            getAuthHeader()
        );
    },

    getConversationRatings: async (id: number) => {
        const response = await axios.get<ApiResponse<Rating[]>>(
            `${BASE_URL}/conversation/${id}/ratings`,
            getAuthHeader()
        );
        return response.data.data || [];
    },

    rateConversation: async (id: number, rating: number, comment?: string) => {
        const response = await axios.post<ApiResponse<Rating>>(
            `${BASE_URL}/conversation/${id}/rate`,
            { rating, comment },
            getAuthHeader()
        );
        return response.data.data;
    }
};