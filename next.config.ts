import type { NextConfig } from "next";

// LOCAL
// export const frontendURL = 'http://localhost:3000';
// export const backendUrl = 'http://localhost:8000';
// export const PAYSTACK_PUBLIC_KEY = "pk_test_d196b71372349b838d7a0aa834a9d359874f1ac3"

export const frontendURL = 'https://rentnow.ng';
export const backendUrl = 'https://app.rentnow.ng';
export const PAYSTACK_PUBLIC_KEY = "pk_live_eeefde6e6c7a8c005b5d1ec9eeef98550543d535"

export const MAILCHIMP_API_KEY = "9f9e0b3216195985c0d179ad071dc65a"
export const MAILCHIMP_AUDIENCE_ID = "c7f48b07e2"
export const MAILCHIMP_API_SERVER = "us2"

export const baseURL = backendUrl + '/api';

// ============================================
// Video Ad Gate Configuration
// ============================================
// Configure your ad system here. No .env files needed!

// Google IMA SDK URL (usually doesn't need to be changed)
export const GOOGLE_IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';

// Google AdSense Client ID (format: ca-pub-XXXXXXXXXXXXXXXX)
// Get this from: https://www.google.com/adsense/
// Leave empty to use fallback video
export const GOOGLE_ADSENSE_CLIENT_ID = 'ca-pub-3051384019314375';

// Google Ad Manager Network Code (8-10 digit number)
// Get this from: https://admanager.google.com/
// Leave empty to use fallback video
export const GOOGLE_AD_MANAGER_NETWORK_CODE = '134-671-0282';

// Custom Ad Endpoint (your own video URL)
// Example: 'https://yourdomain.com/videos/promo.mp4'
// Leave empty to use fallback video
export const CUSTOM_AD_ENDPOINT = '';

// Ad skip delay in seconds (how long before user can skip)
export const AD_SKIP_DELAY = 5;

// Session duration in seconds (how long contact details stay unlocked)
export const AD_SESSION_DURATION = 240; // 4 minutes

// Analytics endpoint for tracking ad events
export const ANALYTICS_ENDPOINT = '/api/ad-analytics';

// ============================================

const nextConfig: NextConfig = {
    env: {
        // Admin Dashboard Settings
        ADMIN_LISTINGS_PER_PAGE: '12',
        ADMIN_NEW_LISTING_HOURS: '24',
        ADMIN_RECENT_LISTING_HOURS: '48',
        ADMIN_URGENT_LISTING_HOURS: '48',
    },
    images: {
        domains: [
            'images.unsplash.com',
            'www.lummi.ai',
            'www.rentnow.ng',
            'wwww.api.rentnow.ng',
            'api.rentnow.ng',
            'localhost',
            'rent9ja-s3-storage.s3.eu-north-1.amazonaws.com'
        ],
    },
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' },
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
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