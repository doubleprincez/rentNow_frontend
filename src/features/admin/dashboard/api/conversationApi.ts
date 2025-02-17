import axios from 'axios';

const BASE_URL = 'https://api.rent9ja.com.ng/api';

// Helper to get auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        }
    };
};

export interface Conversation {
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

export const conversationApi = {
    // Fetch all conversations
    getAllConversations: async () => {
        const response = await axios.get<ApiResponse<Conversation[]>>(
            `${BASE_URL}/conversations`,
            getAuthHeader()
        );
        return response.data.data || []; // Ensure we always return an array
    },

    // Fetch single conversation
    getConversation: async (id: number) => {
        const response = await axios.get<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation/${id}`,
            getAuthHeader()
        );
        return response.data.data;
    },

    // Create new conversation
    createConversation: async (participantIds: number[]) => {
        const response = await axios.post<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation`,
            { participantIds },
            getAuthHeader()
        );
        return response.data.data;
    },

    // Update conversation
    updateConversation: async (id: number, data: Partial<Conversation>) => {
        const response = await axios.put<ApiResponse<Conversation>>(
            `${BASE_URL}/conversation/${id}`,
            data,
            getAuthHeader()
        );
        return response.data.data;
    },

    // Delete conversation
    deleteConversation: async (id: number) => {
        await axios.delete(
            `${BASE_URL}/conversation/${id}`,
            getAuthHeader()
        );
    },

    // Get conversation ratings
    getConversationRatings: async (id: number) => {
        const response = await axios.get<ApiResponse<Rating[]>>(
            `${BASE_URL}/conversation/${id}/ratings`,
            getAuthHeader()
        );
        return response.data.data || [];
    },

    // Rate a conversation
    rateConversation: async (id: number, rating: number, comment?: string) => {
        const response = await axios.post<ApiResponse<Rating>>(
            `${BASE_URL}/conversation/${id}/rate`,
            { rating, comment },
            getAuthHeader()
        );
        return response.data.data;
    },

    // Send a message in a conversation
    sendMessage: async (conversationId: number, content: string) => {
        const response = await axios.post<ApiResponse<Message>>(
            `${BASE_URL}/conversation/${conversationId}/messages`,
            { content },
            getAuthHeader()
        );
        return response.data.data;
    }
};