import axios from "axios";
import {type ClassValue, clsx} from "clsx"
import {formatDistanceToNow} from "date-fns";

import {twMerge} from "tailwind-merge"
import {retrieveFromLocalStorage} from "@/lib/localStorage";
import {APPROVAL_STATUS} from "@/lib/enums";
import {toast} from "@/components/ui/use-toast";
import {Pagination} from "@/types/base";

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
        if (typeof window === 'undefined') return;
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
    if (typeof window === 'undefined') return null;
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
    if (typeof window === 'undefined') return;
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
                'Content-Type': 'application/json'
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

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.log('401 Unauthorized - Logging out...');
                
                // Get account_id before clearing to determine correct login route
                const authState = getFormData('authState');
                let loginRoute = '/auth/login';
                
                if (authState && typeof authState === 'object' && 'account_id' in authState) {
                    const accountId = (authState as any).account_id;
                    switch (accountId) {
                        case 2: loginRoute = '/agents/auth/login'; break;
                        case 3: loginRoute = '/partners/auth/login'; break;
                        case 4:
                        case 5: loginRoute = '/admin/auth/login'; break;
                        default: loginRoute = '/auth/login';
                    }
                }
                
                // Clear all auth data
                deleteFormData('authToken');
                deleteFormData('authState');
                deleteFormData('token');
                deleteFormData('agentToken');
                deleteFormData('adminToken');
                
                if (typeof window !== 'undefined') {
                    setTimeout(() => {
                        window.location.href = loginRoute;
                    }, 100);
                }
            }
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
        // Always try to get the unified authToken first
        csrfTokenMeta = getFormData('authToken');
        
        // Fallback to old token keys for backward compatibility
        if (!csrfTokenMeta) {
            if (strictType) {
                if (tokenFor == 'admin') {
                    csrfTokenMeta = getFormData('adminToken');
                } else if (tokenFor == 'agent') {
                    csrfTokenMeta = getFormData('agentToken');
                } else {
                    csrfTokenMeta = getFormData('token');
                }
            } else {
                csrfTokenMeta = getFormData('adminToken') ?? getFormData('agentToken') ?? getFormData('token');
            }

            if (!csrfTokenMeta) {
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
        }
    }
    return csrfTokenMeta;
}
interface PlaceholderImageProps {
    text?: string;
    size?: string;
    backgroundColor?: string;
    fontColor?: string;
}

export const generatePlaceholderImage = ({
                                             text = "No Image",
                                             size = "400",
                                             backgroundColor = "eee",
                                             fontColor = "000",
                                         }: PlaceholderImageProps = {}): string => {
    const encodedText = encodeURIComponent(text);
    return `https://placehold.co/${size}/${backgroundColor}/${fontColor}.png?text=${encodedText}`;
};


// const currencySymbols: Record<string, string> = {
//     USD: '$',
//     NGN: '₦',
//     EUR: '€',
//     GBP: '£',
// };

export const truncateString = (input: string, maxLength = 100): string => {
    if (!input?.trim()) return "";
    if (input.length > maxLength) {
        return input.substring(0, maxLength) + "...";
    }

    return input;
};

export const formatNumberWithCommas = (value: number | string): string => {
    const number = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(number)) return '0';
    return number.toLocaleString('en-US');
}


export const formatCurrency = (amount: number, currency: string, decimals: number = 2, dec_point: string = '.', thousands_sep: string = ','): string => {
    // Strip all characters but numerical ones.
    const number = (amount + '').replace(/[^0-9+\-Ee.]/g, '');
    const n: number = !isFinite(+number) ? 0 : +number,
        prec: number = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep: string = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec: string | number = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n: any, prec: any) {
            const k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    let s: string[] | string = '';
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return `${currencySymbolSystem(currency)}${s.join(dec)}`;

    // const symbol = currencySymbols[currency] || currency + ' ';
    // const hasFraction = amount % 1 !== 0;
    //
    // return `${symbol}${amount.toLocaleString('en-US', {
    //     minimumFractionDigits: hasFraction ? 2 : 0,
    //     maximumFractionDigits: hasFraction ? 2 : 0,
    // })}`;
}

export const convertCamelKeysToSnakeCase = (
    value: any,
    option = {convertString: false}
): any => {
    if (Array.isArray(value)) {
        return value?.map((item) => convertCamelKeysToSnakeCase(item));
    } else if (typeof value === "object" && value !== null) {
        return Object?.keys(value)?.reduce((acc, key) => {
            const snakeKey = key?.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
            // @ts-expect-error: key
            acc[snakeKey] = convertCamelKeysToSnakeCase(value[key]);
            return acc;
        }, {});
    } else if (typeof value === "string" && option?.convertString) {
        return value?.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    } else {
        return value;
    }
};

export const currencySymbolSystem = (currency: string) => {
    if (currency) {
        const key = 'currency_' + currency;
        const stored = retrieveFromLocalStorage(key);
        if (stored) {
            return stored;
        }
        return currency;
    }
    return currency;
}

export const convertSnakeCaseKeysToCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map((item) => convertSnakeCaseKeysToCamelCase(item));
    } else if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_./g, (match) =>
                match.charAt(1).toUpperCase()
            );

            // @ts-expect-error: key
            acc[camelKey] = convertSnakeCaseKeysToCamelCase(obj[key]);
            return acc;
        }, {});
    } else {
        return obj;
    }
};



export const formatDateWithTime = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        // console.log(error);
        return dateString; // Return original string if formatting fails
    }
};


// export const formatDate = (date: string | undefined) => {
//     if (!date || date.toString() === "") return "N/A";
//
//     // check if date.split is a function
//     if (typeof date.split !== "function") return date;
//
//     const inputDate =
//         date?.split("-")[0]?.length === 4 ? new Date(date) : parseInputDate(date);
//
//     return inputDate.toLocaleDateString("en-us", {
//         weekday: "long",
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//     });
// };


const parseInputDate = (input: string): Date => {
    const [datePart] = input.split(" ");
    const [day, month, year] = datePart?.split("-") || [];

    // Ensure the date string is in the "yyyy-mm-dd" format
    const formattedDateString = `${year}-${month}-${day}`;

    return new Date(formattedDateString);
};


export const getApprovalStatusColor = (status: string) => {
    if (!status) return;
    switch (status) {
        case APPROVAL_STATUS.PENDING:
            return "bg-primary-500";
        case APPROVAL_STATUS.SUCCESS:
        case APPROVAL_STATUS.COMPLETED:
            return "bg-green-500";

        default:
            return "bg-gray-500";
    }
};

export const arrayToUrlQuery = (obj: any) => {
    const params = new URLSearchParams(obj);
    return (params.toString());
}



export const formatKey = (key: string): string => {
    if (!key) return '';

    // Step 1: Replace hyphens with spaces (handles kebab-case)
    let formatted = key.replace(/-/g, ' ');

    // Step 2: Add a space before uppercase letters that are not at the beginning of a word
    // This handles camelCase (e.g., "fuelSurcharge" -> "fuel Surcharge")
    formatted = formatted.replace(/([A-Z])/g, ' $1');

    // Step 3: Trim any leading/trailing spaces and convert to lowercase
    formatted = formatted.trim().toLowerCase();

    // Step 4: Capitalize only the first letter of the entire string
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};


export const getAbbreviation = (name: string = '') => {
    if (!name) {
        return ''; // Handle null, undefined, or non-string inputs
    }

    const parts = name.split(' ').filter(part => part.length > 0); // Split by space and filter out empty strings
    if (parts.length === 0) {
        return ''; // No valid parts
    }

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase(); // Just the first letter if only one word
    }

    // Get the first letter of the first part and the first letter of the last part
    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
};



export const numberToWord = (num: number): string | null => {
    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (num < 20) {
        return units[num];
    }
    if (num < 100) {
        return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" + units[num % 10] : "");
    }
    return null; // Or throw an error for unsupported numbers
};


export const showToast = (message: any = 'Error', type: string = 'error') => {
    if (type == 'success') {
         toast({
            title: "Success",
            description: message,
            variant: "default",
        }); return;
    }
    toast({
        title: "Error",
        description: message?.errors || message?.message || message || "Oops! Something went wrong.",
        variant: "destructive",
    });
    return;

}


export const extractPaginationFromGetResponse = (
    resolvedData: Pagination
): Pagination | null => {

    if (!resolvedData?.currentPage) {
        return null;
    }

    return {
        currentPage: resolvedData?.currentPage,
        hasMorePages: resolvedData?.hasMorePages,
        lastPage: resolvedData?.lastPage,
        perPage: resolvedData?.perPage,
        total: resolvedData?.total,
    };
};
