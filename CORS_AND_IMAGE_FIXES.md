# CORS and Image Configuration Fixes

## Issues Fixed

### 1. CORS Error
**Problem**: Frontend at `http://localhost:3001` was blocked from accessing `https://app.rentnow.ng/api/apartments` because the server only allows `https://www.rentnow.ng` as the origin.

**Solution**: Changed the API call in `Home.tsx` to use the local `/api` proxy path instead of directly calling the backend URL. This leverages the Next.js rewrite configuration that proxies `/api/*` requests to the backend.

**Change Made**:
```typescript
// Before
const response = await fetch(baseURL + '/apartments');

// After
const response = await fetch('/api/apartments');
```

### 2. Next.js Image Configuration Error
**Problem**: Images from `rent9ja-s3-storage.s3.eu-north-1.amazonaws.com` were not configured in the `next.config.ts` file, causing Next.js Image component to reject them.

**Solution**: Added the S3 bucket hostname to the `images.domains` array in `next.config.ts`.

**Change Made**:
```typescript
images: {
    domains: [
        'images.unsplash.com', 
        'www.lummi.ai', 
        'www.rentnow.ng', 
        'api.rentnow.ng', 
        'localhost',
        'rent9ja-s3-storage.s3.eu-north-1.amazonaws.com'  // Added
    ],
}
```

## How It Works

### API Proxy Pattern
Your Next.js configuration already has a rewrite rule:
```typescript
async rewrites() {
    return [
        {
            source: '/api/:path*',
            destination: baseURL + '/:path*',
        },
    ];
}
```

This means:
- Frontend calls `/api/apartments` (same origin, no CORS)
- Next.js server proxies it to `https://app.rentnow.ng/api/apartments`
- Backend responds to Next.js server
- Next.js server forwards response to frontend

### Benefits
1. **No CORS issues**: All API calls appear to come from the same origin
2. **Environment flexibility**: Easy to switch between local and production backends
3. **Security**: API keys and backend URLs can be kept server-side

## Testing
After these changes:
1. Restart your development server
2. Navigate to the home page
3. Check that apartment data loads without CORS errors
4. Verify that images from S3 display correctly

## Additional Recommendations

### For Production
Consider using environment variables for better configuration management:

```typescript
// .env.local
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
PAYSTACK_PUBLIC_KEY=pk_test_...

// .env.production
NEXT_PUBLIC_FRONTEND_URL=https://rentnow.ng
BACKEND_URL=https://app.rentnow.ng
PAYSTACK_PUBLIC_KEY=pk_live_...
```

### For All API Calls
Ensure all fetch calls in your application use the `/api` prefix instead of `baseURL` directly to avoid CORS issues during development.
