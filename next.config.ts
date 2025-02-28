import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ['images.unsplash.com', 'www.lummi.ai', 'www.rent9ja.com.ng', "api.rent9ja.com.ng"],
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
                // destination: 'http://localhost:8000/api/:path*',
                destination: 'https://api.rent9ja.com.ng/api/:path*',
            },
        ];
    },
};


export const baseURL = 'https://api.rent9ja.com.ng/api';
// export const baseURL = 'http://localhost:8000/api';



export default nextConfig;