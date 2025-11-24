# Social Media Link Testing Guide

## Quick Testing Checklist

### Before Posting on Facebook

1. **Deploy to Production**
   - Ensure all changes are live on your production server
   - Don't test with localhost URLs (Facebook can't access them)

2. **Test with Facebook Debugger**
   ```
   URL: https://developers.facebook.com/tools/debug/
   
   Steps:
   1. Enter your apartment URL
   2. Click "Debug"
   3. Review all Open Graph tags
   4. Click "Scrape Again" if needed
   5. Verify image loads correctly
   ```

3. **Check Required Tags**
   - ✅ og:type
   - ✅ og:url
   - ✅ og:title
   - ✅ og:description
   - ✅ og:image (absolute URL)
   - ✅ og:site_name

### Testing Different Scenarios

#### Test 1: New Apartment Link
```
URL: https://rentnow.ng/find-homes/[apartment-id]

Expected:
- Image preview shows
- Title displays
- Description visible
- Link is clickable in post body
```

#### Test 2: Existing Link (Cached)
```
If link was shared before:
1. Use Facebook Debugger
2. Click "Scrape Again"
3. Wait 5 minutes
4. Try posting again
```

#### Test 3: Different Platforms
- [ ] Facebook Page Post
- [ ] Facebook Personal Post
- [ ] Facebook Comment
- [ ] Facebook Messenger
- [ ] WhatsApp
- [ ] Twitter/X
- [ ] LinkedIn

### Common Problems & Quick Fixes

#### Problem: "Link not clickable in post body"
**Cause**: Facebook hasn't scraped the URL yet or cache is stale
**Fix**:
1. Go to Facebook Debugger
2. Enter URL and click "Debug"
3. Click "Scrape Again"
4. Wait 5-10 minutes
5. Try posting again

#### Problem: "Image not showing"
**Cause**: Image URL is relative or not accessible
**Fix**:
1. Check image URL starts with https://
2. Test image URL in browser (should load)
3. Ensure image is at least 200x200px
4. Use JPG or PNG format

#### Problem: "Old information showing"
**Cause**: Facebook cache hasn't updated
**Fix**:
1. Use Facebook Debugger "Scrape Again"
2. Wait 24 hours for cache to expire
3. Or add ?v=2 to URL to force new cache

#### Problem: "Link works in comments but not posts"
**Cause**: Missing or incorrect Open Graph tags
**Fix**:
1. Verify all OG tags are present
2. Use Facebook Debugger to check
3. Ensure og:type is set to 'website'
4. Verify og:url is absolute

### Manual Verification Steps

#### Step 1: View Page Source
```
1. Open apartment page in browser
2. Right-click → "View Page Source"
3. Search for "og:" in source
4. Verify all tags are present
```

Expected tags in source:
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://rentnow.ng/find-homes/123" />
<meta property="og:title" content="Beautiful 3 Bedroom Apartment..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="https://rentnow.ng/uploads/..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="RentNow.ng" />
<meta property="og:locale" content="en_NG" />
```

#### Step 2: Test Image URL
```
1. Copy og:image URL from page source
2. Paste in new browser tab
3. Image should load without errors
4. Check image size (should be 1200x630 recommended)
```

#### Step 3: Test with curl (Technical)
```bash
curl -I https://rentnow.ng/find-homes/123
```
Should return:
- Status: 200 OK
- Content-Type: text/html

### Facebook Debugger Interpretation

#### Good Result:
```
✅ All required properties present
✅ Image loaded successfully
✅ No warnings or errors
✅ Preview looks correct
```

#### Bad Result:
```
❌ Missing required properties
❌ Image failed to load
⚠️ Warnings about image size
⚠️ Redirect detected
```

### Testing Timeline

**Immediate (0-5 minutes)**:
- View page source
- Check Facebook Debugger
- Verify image loads

**Short-term (5-30 minutes)**:
- Test posting on Facebook
- Check link clickability
- Verify preview appearance

**Long-term (24-48 hours)**:
- Monitor click-through rates
- Check Facebook Insights
- Gather user feedback

### Debugging Tools

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Use: Check OG tags, clear cache

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Use: Test Twitter sharing

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Use: Test LinkedIn sharing

4. **WhatsApp Link Preview**
   - Just paste link in WhatsApp chat
   - Preview should appear automatically

### Success Metrics

After fix, you should see:
- ✅ Links clickable in Facebook posts
- ✅ Rich preview with image
- ✅ Increased click-through rate
- ✅ More traffic from Facebook
- ✅ Better engagement on posts

### Monitoring

Track these metrics:
1. **Facebook Insights**
   - Link clicks
   - Post reach
   - Engagement rate

2. **Google Analytics**
   - Traffic from Facebook
   - Referral sources
   - Conversion rate

3. **User Feedback**
   - Comments about links
   - Support tickets
   - Direct messages

### Emergency Contacts

If issues persist:
- Facebook Business Support
- Your hosting provider
- Your development team

### Best Practices for Future Posts

1. **Always test new links** in Facebook Debugger first
2. **Use high-quality images** (1200x630px)
3. **Write compelling descriptions** (under 160 characters)
4. **Include call-to-action** in post text
5. **Post during peak hours** (7-9 PM Nigerian time)
6. **Monitor performance** and adjust strategy

---

**Remember**: Facebook caches link previews for 24-48 hours. Always use the Debugger tool to force a refresh when testing!
