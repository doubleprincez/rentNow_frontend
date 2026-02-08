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


export const AxiosApiServer = async (tokenFor = 'user') => {
    const instance = axios.create({
        withCredentials: true,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    let token;

    if (tokenFor === 'user') {
        token = await getServerFormData('token');
    } else if (tokenFor === 'agent') {
        token = await getServerFormData('agentToken');
    } else {
        token = await getServerFormData('adminToken');
    }

    if(!token){
          token = await getServerFormData('token')??await getServerFormData('agentToken')?? await getServerFormData('adminToken')??null;
    }
    if (token) {
        instance.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return instance;
};
