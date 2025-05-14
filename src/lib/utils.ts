import axios from "axios";
import {type ClassValue, clsx} from "clsx"
import {formatDistanceToNow} from "date-fns";

import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const inArray = (key: any, value: []) => {
    try {
        return value[key] ?? false;
    } catch (e) {
        return false;
    }
}

export const formatAmountNumber = (num: number | string | null | undefined) => {
    if (num) {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas for thousands
    }
    return 0;
};

export const stringToNumber = (value: string | number | null | undefined): number | undefined => {
    if (typeof value === 'number') {
        return value;
    }
    if (!value) {
        return undefined; // Or 0, depending on your desired behavior for null/undefined
    }
    const cleanedValue = value.replace(/[^\d.]/g, ''); // Remove non-numeric characters except '.'
    const parsedNumber = parseFloat(cleanedValue);
    return isNaN(parsedNumber) ? undefined : parsedNumber; // Return undefined if parsing fails
}

export const setColor = (status: string) => {
    if (status == "success") {
        return 'text-green-300';
    }
    if (status == "reversed") {
        return 'text-blue-300';
    }
    if (status == "failed") {
        return 'text-red-300';
    }
    return " text-gray-700";
}


export const formatDate = (timestamp: any) => {
    return formatDistanceToNow(new Date(timestamp), {addSuffix: true});
};

export const extractClassName = (word: string) => {
    return word.replace("App\\Models\\", "").replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function simpleDateFormat(date: any) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

export const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    }
}

///////////////////////////////// COOKIE ///////////////////////////
export function isServer() {
    return typeof window === 'undefined';
}


export function hasFormData(name: string) {
    return getFormData(name) == null;
}

//
//
// export function hasFormData(name: string) {
//     const cookies = document.cookie.split("; ");
//     return cookies.some(cookie => cookie.startsWith(`${name}=`));
// }


export function saveFormData(name: string, data: any, duration = 30) {
    try {
        const record = typeof data === "string" ? data : JSON.stringify(data);
        localStorage.setItem(name, record);
    } catch (error) {
        console.error(`Failed to save ${name} to localStorage:`, error);
    }
}


//
//
// export function saveFormData(name: string, data: any, duration = 30) {
//     const expires = new Date();
//     expires.setTime(expires.getTime() + duration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
//     document.cookie = `${name}=${encodeURIComponent(JSON.stringify(data, getCircularReplacer(), 2))}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
// }

export function getFormData<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (typeof raw == 'string') return raw as T;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
    // }
    // const data = getFormData(name)?.trim();
    // console.log(data);
    // if (data) {
    //     return JSON.parse(String(data));
    // }
    //
    // return undefined;
}

// export function getFormData(name: string) {
//     const cookies = document.cookie.split("; ");
//     for (let cookie of cookies) {
//         const [key, value] = cookie.split("=");
//         if (key === name) {
//             return JSON.parse(decodeURIComponent(value));
//         }
//     }
//     return null;
// }

export function deleteFormData(name: string) {
    return localStorage.removeItem(name);
}

//
// export function deleteFormData(name: string) {
//     document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
// }


export const AxiosApi = (tokenFor: string = 'user', initialToken: string | undefined = '', customHeaders = {}, strictType = false) => {
    const csrfTokenMeta = getToken(tokenFor, initialToken, strictType);

    const instance = axios.create({
        withCredentials: true,
        headers: {
            ...{
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization': `Bearer ${csrfTokenMeta}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
            }, ...customHeaders
        },
    });

    instance.interceptors.request.use(
        (config) => {
            config.headers.Authorization = `Bearer ${csrfTokenMeta}`;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
    return instance;
}

export const getToken = (tokenFor = 'user', initialToken: string = '', strictType = false) => {
    let csrfTokenMeta;
    if (initialToken) {
        csrfTokenMeta = initialToken;
    } else {
        if (strictType) {
            if (tokenFor == 'admin') {
                csrfTokenMeta = getFormData('adminToken')
            } else if (tokenFor == 'agent') {
                csrfTokenMeta = getFormData('agentToken')
            } else {
                csrfTokenMeta = getFormData('token');
            }

        } else {
            csrfTokenMeta = getFormData('adminToken') ?? getFormData('agentToken') ?? getFormData('token');
        }

        if (tokenFor === 'user' && hasFormData('token')) {
            csrfTokenMeta = csrfTokenMeta ?? getFormData('token');
        }

        if (tokenFor === 'agent' && hasFormData('agentToken')) {
            csrfTokenMeta = csrfTokenMeta ?? getFormData('agentToken');
        }

        if (tokenFor === 'admin' && hasFormData('adminToken')) {
            csrfTokenMeta = csrfTokenMeta ?? getFormData('adminToken');
        }
    }
    return csrfTokenMeta;
}