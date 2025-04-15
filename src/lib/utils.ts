import axios from "axios";
import {type ClassValue, clsx} from "clsx"
import {formatDistanceToNow} from "date-fns";

import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatAmountNumber = (num: number | string | null | undefined) => {
    if (num) {
        return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ","); // Add commas for thousands
    }
    return 0;
};


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

/////////////////////////// COOKIE ////////////////////////////////////////////


export function isServer() {
    return typeof window === 'undefined';
}

export function hasFormData(name: string) {
    const cookies = document.cookie.split("; ");
    return cookies.some(cookie => cookie.startsWith(`${name}=`));
}


export function saveFormData(name: string, data: any, duration = 30) {
    const expires = new Date();
    expires.setTime(expires.getTime() + duration * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(data, getCircularReplacer(), 2))}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
}

export function getFormData(name: string) {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return JSON.parse(decodeURIComponent(value));
        }
    }
    return null;
}

export function deleteFormData(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}


export const AxiosApi = (tokenFor = 'user', initialToken = null, customHeaders = {}) => {
    let csrfTokenMeta;
    if (initialToken) {
        csrfTokenMeta = initialToken;
    } else {
        if (tokenFor === 'user') {
            csrfTokenMeta = localStorage.getItem('token');
        } else if (tokenFor === 'agent') {
            csrfTokenMeta = localStorage.getItem('agentToken') ?? localStorage.getItem('token');
        } else {
            csrfTokenMeta = localStorage.getItem('adminToken') ?? localStorage.getItem('token');
        }
    }


    const instance = axios.create({
        withCredentials: true,
        headers: {
            ...{
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Authorization':`Bearer ${csrfTokenMeta}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
            }, ...customHeaders
        },
    });

    instance.interceptors.request.use(
        (config) => {
            let csrfTokenMeta;
            if (initialToken) {
                csrfTokenMeta = initialToken;
            } else {
                if (tokenFor === 'user') {
                    csrfTokenMeta = localStorage.getItem('token');
                } else if (tokenFor === 'agent') {
                    csrfTokenMeta = localStorage.getItem('agentToken') ?? localStorage.getItem('token');
                } else {
                    csrfTokenMeta = localStorage.getItem('adminToken') ?? localStorage.getItem('token');
                }
            }

            if (csrfTokenMeta) {
                config.headers.Authorization = `Bearer ${csrfTokenMeta}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return instance;
}