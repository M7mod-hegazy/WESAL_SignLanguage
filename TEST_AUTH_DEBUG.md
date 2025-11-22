# Auth Debugging Guide

## What Was Added

Detailed logging for authentication flow in both **Post Creation** and **Story Creation**:

### Debug Logs You'll See:

#### 1. **Auth Debug Start**
```
🔐 [Post Create] AUTH DEBUG START
   Token present: true/false
   Token length: 1234
   Body keys: ['content', 'authorName', 'authorPhoto', 'author', 'media']
   Body authorName: "Your Name" (type: string)
   Body authorPhoto: "https://..." (type: string)
   Body author: "uid123" (type: string)
```

#### 2. **Token Verification**
```
🔐 [Post Create] Verifying Firebase token...
✅ [Post Create] Token verified successfully
   Decoded token keys: ['iss', 'aud', 'auth_time', 'user_id', 'sub', 'iat', 'exp', 'email', 'email_verified', 'firebase', 'name', 'picture']
   Token name: "Your Real Name"
   Token email: "your@email.com"
   Token picture: "https://..."
   Token uid: "uid123"
✅ [Post Create] Final user data from token: { authorName: 'Your Real Name', authorPhoto: 'https://...', author: 'uid123' }
```

#### 3. **Auth Debug End**
```
🔐 [Post Create] AUTH DEBUG END - Final values: { authorName: 'Your Real Name', authorPhoto: 'https://...', author: 'uid123' }
```

## How to Test Locally

1. **Start the API**:
   ```bash
   cd api
   npm start
   ```

2. **Create a post with image** in the frontend

3. **Check the terminal** for the debug logs

## What to Look For

### ✅ Success Case
- Token is present and verified
- `Token name` shows your real name
- Final values show your real name (not "مستخدم")

### ❌ Problem Case 1: No Token
```
⚠️ [Post Create] No token provided, using body data
```
**Fix**: Frontend not sending Authorization header

### ❌ Problem Case 2: Token Verification Failed
```
❌ [Post Create] Token verification FAILED: ...
   Error code: auth/invalid-id-token
```
**Fix**: Token is invalid or expired

### ❌ Problem Case 3: Token Missing Name
```
Token name: undefined
Token email: "your@email.com"
```
**Fix**: Firebase user profile doesn't have displayName set

## Vercel Logs

To see these logs on Vercel:
1. Go to https://vercel.com/dashboard
2. Select **wesal-sign-language** project
3. Go to **Deployments**
4. Click the latest deployment
5. Go to **Logs** tab
6. Create a post/story and watch the logs appear

## Next Steps

1. Create a post with your real name
2. Check the logs to see where the name is being lost
3. Report back with the debug output
