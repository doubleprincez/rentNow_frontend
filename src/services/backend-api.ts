import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig,} from "axios";
import {
    convertCamelKeysToSnakeCase,
    convertSnakeCaseKeysToCamelCase,
    extractPaginationFromGetResponse,
    showToast,
} from "@/lib/utils";
import {getCookie, setCookie} from "@/lib/cookie";

const service = () => {

    const service = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE_URL!,
        withCredentials: false,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
            Accept: "application/json",
            "Access-Control-Allow-Methods": "*",
        },
    });

    service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        // check if config has a data property, and it's not formData. Then convert all camel case keys to snake case
        if (config?.data && !(config?.data instanceof FormData)) {
            config.data = convertCamelKeysToSnakeCase(config.data);
        }

        // get token from localStorage
        const token = getCookie("gst-token");

        if (token) {
            // if token is present, add it to headers as Authorization
            config.headers!["Authorization"] = `Bearer ${token}`;
        }

        return config;
    });

    service.interceptors.response.use(
        (response: AxiosResponse) => {
            const responseData = response?.data;
            // check if data has a token property, and set it in localStorage
            if (responseData?.response?.original?.token) {
                // set token in localStorage
                setCookie("gst-token", responseData?.response?.original?.token);
            }

            // check if responseData has a data property, and the convert all snake case keys to camel case
            if (responseData?.response) {
                responseData.data = convertSnakeCaseKeysToCamelCase(responseData?.response);
            }

            return responseData;
        },
        (error: AxiosError) => {
            if (error?.response === undefined) {
                return Promise.reject("No internet connection");
            } else {
                const errors = error?.response?.data;

                // @ts-expect-error: Property 'errors' does not exist on type '{}'
                const serverErrors = errors?.errors;

                const statusCode = error?.response?.status;

                if (statusCode === 500 || statusCode === 405) {
                    showToast("Something went wrong. Please try again later!");

                    if (process.env.NODE_ENV === "development") {
                        console.log(error);
                    }
                } else if (serverErrors) {
                    // loop through serverErrors object and display value of each key
                    Object.keys(serverErrors).forEach((key) => {
                        const error = serverErrors[key];
                        if (Array.isArray(error)) {
                            error.forEach((err) => {
                                showToast(
                                    err?.errors || err?.message ||
                                    serverErrors[key]?.toString().replace(".", " ")
                                );
                            });
                        } else {
                            showToast(
                                error?.errors || error?.message ||
                                serverErrors[key]?.toString().replace(".", " ")
                            );
                        }
                    });
                } else {
                    showToast(
                        // @ts-expect-error: Property 'errors' does not exist on type '{}'
                        (errors?.error || errors?.message) ??
                        "Something went wrong! Please try again."
                    );
                }
                return Promise.reject(errors);
            }
        }
    );

    interface PostProps {
        url: string;
        payload?: object;
        config?: AxiosRequestConfig;
    }

    return {
        get: async (url: string, config?: AxiosRequestConfig) => {
            try {
                const data = service.get(url, config);
                const resolvedData = await Promise.resolve<any>(data);

                const exactData = resolvedData?.data ?? resolvedData;
                const pagination = extractPaginationFromGetResponse(resolvedData);

                if (pagination) {
                    return {data: exactData, pagination};
                } else {
                    return exactData;
                }
            } catch (error) {
                console.error(error);
                // throw error;
                return [];
            }
        },

        post: async ({url, payload, config}: PostProps) => {
            try {
                const data = service.post(url, payload, config);
                return await Promise.resolve(data);
            } catch (error) {
                console.error(error);
            }
        },

        patch: async ({url, payload, config}: PostProps) => {
            try {
                const data = service.patch(url, payload, config);
                return await Promise.resolve(data);
            } catch (error) {
                console.error(error);
            }
        },

        delete: async ({url, payload, config}: PostProps) => {
            try {
                const data = service.delete(url, {data: payload, ...config});
                return await Promise.resolve(data);
            } catch (error) {
                console.error(error);
            }
        },

        put: async ({url, payload, config}: PostProps) => {
            try {
                const data = service.put(url, payload, config);
                return await Promise.resolve(data);
            } catch (error) {
                console.error(error);
            }
        },
    };
};

export const clientRequestGateway = service()
