import type {NextConfig} from "next";


// export const baseURL = 'https://api.rentnow.ng/api';
export const frontendURL = 'https://rentnow.ng';
export const backendUrl = 'https://app.rentnow.ng';
export const baseURL = backendUrl+'/api';

const nextConfig: NextConfig = {
    images: {
        domains: ['images.unsplash.com', 'www.lummi.ai', 'www.rent9ja.com.ng','www.rentnow.ng','api.rentnow.ng', "api.rent9ja.com.ng","localhost"],
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
                 destination: baseURL+'/:path*',
            },
        ];
    },
};



export default nextConfig;