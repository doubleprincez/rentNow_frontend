import type {NextConfig} from "next";

// LOCAL
// export const frontendURL = 'http://localhost:3000';
// export const backendUrl = 'http://localhost:8000';
// export const PAYSTACK_PUBLIC_KEY = "pk_test_d196b71372349b838d7a0aa834a9d359874f1ac3"

export const   frontendURL = 'https://rentnow.ng';
export const     backendUrl = 'https://app.rentnow.ng';
export const     PAYSTACK_PUBLIC_KEY = "pk_live_eeefde6e6c7a8c005b5d1ec9eeef98550543d535"

export const MAILCHIMP_API_KEY = "9f9e0b3216195985c0d179ad071dc65a"
export const MAILCHIMP_AUDIENCE_ID = "c7f48b07e2"
export const MAILCHIMP_API_SERVER = "us2"

export const baseURL = backendUrl + '/api';

const nextConfig: NextConfig = {
    images: {
        domains: ['images.unsplash.com', 'www.lummi.ai', 'www.rentnow.ng', 'api.rentnow.ng', "localhost"],
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    {key: 'Access-Control-Allow-Credentials', value: 'true'},
                    {key: 'Access-Control-Allow-Origin', value: '*'},
                    {key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT'},
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: baseURL + '/:path*',
            },
        ];
    },
};


export default nextConfig;