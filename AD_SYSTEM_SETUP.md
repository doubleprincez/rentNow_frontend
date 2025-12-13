# Video Ad Gate System Setup

## ✅ Current Status: WORKING!

Your ad system is **fully functional** and uses the fallback video at `/videos/platform-promo.mp4`.

**No additional setup required for testing!**

## Configuration

All ad system settings are configured in `next.config.ts` using simple constants. No `.env` files needed!

### Current Configuration (in `next.config.ts`)

```typescript
// Google IMA SDK URL (usually doesn't need to be changed)
export const GOOGLE_IMA_SDK_URL = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';

// Google AdSense Client ID - Leave empty to use fallback video
export const GOOGLE_ADSENSE_CLIENT_ID = '';

// Google Ad Manager Network Code - Leave empty to use fallback video
export const GOOGLE_AD_MANAGER_NETWORK_CODE = '';

// Custom Ad Endpoint - Leave empty to use fallback video
export const CUSTOM_AD_ENDPOINT = '';

// Ad skip delay in seconds
export const AD_SKIP_DELAY = 5;

// Session duration in seconds (4 minutes)
export const AD_SESSION_DURATION = 240;

// Analytics endpoint
export const ANALYTICS_ENDPOINT = '/api/ad-analytics';
```

## How It Works

### Current Setup (Fallback Video)
- Ad system automatically uses `/videos/platform-promo.mp4`
- Video plays when users click "View Agent Contact"
- Users can skip after 5 seconds
- Contact details unlock for 4 minutes
- Perfect for development and testing

### To Add Google Ads (Optional - For Revenue)

**Option 1: Google AdSense**

1. Sign up at https://www.google.com/adsense/
2. Get your Client ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Update `next.config.ts`:
   ```typescript
   export const GOOGLE_ADSENSE_CLIENT_ID = 'ca-pub-XXXXXXXXXXXXXXXX';
   ```
4. Restart your dev server

**Option 2: Google Ad Manager**

1. Sign up at https://admanager.google.com/
2. Get your Network Code (8-10 digit number)
3. Update `next.config.ts`:
   ```typescript
   export const GOOGLE_AD_MANAGER_NETWORK_CODE = '123456789';
   ```
4. Restart your dev server

**Option 3: Custom Video URL**

1. Upload your video to a server or CDN
2. Update `next.config.ts`:
   ```typescript
   export const CUSTOM_AD_ENDPOINT = 'https://yourdomain.com/videos/promo.mp4';
   ```
3. Restart your dev server

## Testing

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to any apartment listing**

3. **Click "View Agent Contact"**

4. **The ad modal opens with the fallback video**

5. **After 5 seconds, you can skip**

6. **Contact details unlock!**

## Customization

### Change Skip Delay

```typescript
// In next.config.ts
export const AD_SKIP_DELAY = 10; // 10 seconds instead of 5
```

### Change Session Duration

```typescript
// In next.config.ts
export const AD_SESSION_DURATION = 600; // 10 minutes instead of 4
```

## Troubleshooting

### Video Not Loading

1. Check if `/public/videos/platform-promo.mp4` exists
2. Verify the video file is not corrupted
3. Check browser console for errors

### Google Ads Not Showing

1. Verify your credentials are correct in `next.config.ts`
2. Restart the development server after making changes
3. Check browser console for IMA SDK errors
4. Verify your AdSense/Ad Manager account is approved

### Analytics Not Working

1. Verify CSRF protection is disabled for `/api/ad-analytics`
2. Check `rentnow_back/app/Http/Middleware/VerifyCsrfToken.php`
3. Should include: `'api/ad-analytics', 'api/ad-analytics/*'`

## Analytics Dashboard

View ad performance metrics:

1. Log in as admin (account_id > 3)
2. Navigate to: `/admin/ad-analytics`
3. View metrics:
   - Total impressions
   - Completion rates
   - Skip rates
   - User breakdown

## Summary

🎉 **Your ad system is ready to use!**

- ✅ No `.env` files needed
- ✅ All configuration in `next.config.ts`
- ✅ Fallback video works out of the box
- ✅ Easy to add Google credentials later

To monetize with real ads, just update the constants in `next.config.ts` and restart the server.
