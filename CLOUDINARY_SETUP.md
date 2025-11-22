# Cloudinary Integration Setup

## Overview
The backend now uploads images and videos to Cloudinary instead of storing them as base64 in MongoDB. This provides:
- ✅ Faster image loading
- ✅ Smaller database size
- ✅ Better performance
- ✅ CDN distribution
- ✅ Automatic image optimization

## Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up with your email
3. Verify your email
4. You'll get a **Cloud Name** on the dashboard

## Step 2: Get API Credentials
1. Log in to Cloudinary dashboard
2. Go to **Settings** → **API Keys**
3. You'll see:
   - **Cloud Name** (already visible on dashboard)
   - **API Key**
   - **API Secret** (keep this private!)

## Step 3: Add Environment Variables

### Local Development (.env file)
Add to `/api/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Vercel Deployment
1. Go to Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add three variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
5. Click **Save**
6. Redeploy your project

## Step 4: Test the Integration

### Local Testing
```bash
cd api
npm install
npm start
```

Create a post with an image. Check the logs:
- ✅ `☁️ Cloudinary configured: ✓ ✓ ✓` - Credentials are set
- ✅ `☁️ [Post Create] File uploaded to Cloudinary: https://res.cloudinary.com/...` - Upload successful

### Vercel Testing
1. Push your code to GitHub
2. Vercel will auto-deploy
3. Create a post with an image
4. Check Vercel logs for the same success messages

## How It Works

### Before (Base64)
```
Post → File → Base64 String → MongoDB
Result: Huge database, slow loading
```

### After (Cloudinary)
```
Post → File → Cloudinary Upload → URL → MongoDB
Result: Small database, fast CDN delivery
```

## Fallback Behavior
If Cloudinary upload fails:
- ⚠️ System automatically falls back to base64
- Post still creates successfully
- Check logs for `❌ Cloudinary upload failed`

## Troubleshooting

### "Cloudinary configured: ✗ ✗ ✗"
- Environment variables not set
- Check `.env` file locally
- Check Vercel environment variables

### "Cloudinary upload failed: Invalid credentials"
- API key or secret is wrong
- Copy from Cloudinary dashboard again

### "Cloudinary upload failed: Request timeout"
- Network issue
- File too large
- Cloudinary service down

## File Limits
- **Free tier**: 25 GB storage
- **Max file size**: 100 MB
- **Supported formats**: JPG, PNG, GIF, WebP, MP4, WebM, etc.

## Next Steps
1. Set up Cloudinary account
2. Add environment variables
3. Push code to GitHub
4. Test on Vercel
5. Create posts with images - they should now be on Cloudinary!
