import {cookies} from 'next/headers';
import axios from "axios";

export const getServerFormData = async (name: string) => {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);
    if (!cookie) return null;

    try {
        return decodeURIComponent(cookie.value);
    } catch {
        return null;
    }
}

export const hasServerFormData = async (name: string) =>{
    const cookieStore = await cookies();
    return !!cookieStore.get(name);
}


export const AxiosApiServer = (tokenFor = 'user') => {
    const instance = axios.create({
        withCredentials: true,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    let token;

    if (tokenFor === 'user') {
        token = getServerFormData('token');
    } else if (tokenFor === 'agent') {
        token = getServerFormData('agentToken');
    } else {
        token = getServerFormData('adminToken');
    }

    if (token) {
        instance.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return instance;
};