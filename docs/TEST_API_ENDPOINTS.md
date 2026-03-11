# 🧪 Test API Endpoints - Backend is Running

## Current Status
✅ Backend is running and connected to MongoDB  
✅ Health endpoint works: `/health`  
❌ API endpoints return 404: `/api/auth/login`  

## 🔍 Debugging Steps

### Step 1: Test Login Endpoint Properly
The login endpoint expects a POST request with JSON data. Let's test it correctly:

#### Test in Browser Console
Go to your frontend (https://institute-management-system-gules.vercel.app) and run this in the browser console:

```javascript
// Test direct backend call
fetch('https://institute-management-system-3.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@institute.com',
    password: 'admin123'
  })
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
```

#### Expected Results
- **If working**: Status 200 with JWT token
- **If credentials wrong**: Status 400 with error message
- **If still 404**: Route registration issue

### Step 2: Test Other API Endpoints

#### Test Courses Endpoint (requires auth)
```javascript
// First login to get token
fetch('https://institute-management-system-3.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@institute.com', password: 'admin123' })
})
.then(r => r.json())
.then(data => {
  if (data.token) {
    // Test courses endpoint with token
    return fetch('https://institute-management-system-3.onrender.com/api/courses', {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
  }
})
.then(r => r.json())
.then(courses => console.log('Courses:', courses));
```

### Step 3: Check Route Registration Issue

If the API still returns 404, there might be an issue with route registration. Let's check:

#### Possible Causes
1. **Route registration order** - Routes defined after server starts
2. **Middleware blocking** - CORS or other middleware preventing requests
3. **Compilation issue** - TypeScript compilation problem
4. **Server restart needed** - Old compiled code still running

#### Quick Fix: Force Redeploy
1. Go to **Render Dashboard** → Your Service
2. Click **Manual Deploy** → **Deploy latest commit**
3. Wait for fresh deployment

## 🔧 Alternative: Test with curl

If you have access to command line:

```bash
# Test login endpoint
curl -X POST https://institute-management-system-3.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@institute.com","password":"admin123"}'
```

## 🎯 Expected Behavior

### Working Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@institute.com",
    "role": "admin"
  }
}
```

### Error Response (if credentials wrong)
```json
{
  "error": "Invalid credentials"
}
```

## 🚨 If Still Getting 404

### Check Render Logs
1. **Render Dashboard** → **Logs**
2. Look for any error messages during startup
3. Verify all routes are being registered

### Force Fresh Deployment
1. Make a small change (add a comment to server.ts)
2. Commit and push
3. Wait for redeploy

### Check Environment Variables
Verify in Render Dashboard → Environment:
- ✅ MONGODB_URI is set
- ✅ JWT_SECRET is set
- ✅ NODE_ENV=production
- ✅ FRONTEND_URL is set

## 🎯 Next Steps

1. **Test the login endpoint** with proper POST request
2. **Check the response** (should not be 404 if backend is working)
3. **If still 404**: Force redeploy in Render
4. **If working**: Test frontend login

The backend is definitely running and connected to MongoDB, so the API should work with proper testing!