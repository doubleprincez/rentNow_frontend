import { ApiUserChatResponse } from "@/types/chats";
import { baseURL } from "@/../next.config";
import axios from "axios";
import {getFormData} from "@/lib/utils";

export const getUserConversations = async (setToken='') => {
    try {
        const token = setToken??getFormData('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
 
        const response = await axios.get<ApiUserChatResponse>(
            baseURL + `/conversations`,
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
