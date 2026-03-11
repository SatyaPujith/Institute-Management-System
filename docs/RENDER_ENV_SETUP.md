# 🔧 Set Up Environment Variables in Render

## Problem
Your backend deployment is failing with:
```
[dotenv@17.3.1] injecting env (0) from .env
==> Exited with status 1
```

This means the server can't find required environment variables and is exiting.

## Root Cause
- The `.env` file is not deployed to Render (for security reasons)
- Environment variables must be set in the Render dashboard
- The server requires `MONGODB_URI` and `JWT_SECRET` to start

## ✅ How to Set Environment Variables in Render

### Step 1: Access Your Render Service
1. Go to [render.com](https://render.com)
2. Click on your backend service (e.g., "forex-institute-backend")
3. Go to the **Environment** tab (or **Settings** → **Environment Variables**)

### Step 2: Add Required Environment Variables
Click **Add Environment Variable** for each of these:

#### 🔑 Required Variables (Server won't start without these)

**1. MONGODB_URI**
- **Key**: `MONGODB_URI`
- **Value**: `mongodb+srv://satyapujith:Satya%409100@cluster0.qtr33fw.mongodb.net/institute_management`
- This is your MongoDB Atlas connection string

**2. JWT_SECRET**
- **Key**: `JWT_SECRET`
- **Value**: `your-super-secret-jwt-key-minimum-32-characters-long`
- Generate a secure random string (at least 32 characters)

#### 🌐 Recommended Variables

**3. NODE_ENV**
- **Key**: `NODE_ENV`
- **Value**: `production`

**4. FRONTEND_URL** (for CORS)
- **Key**: `FRONTEND_URL`
- **Value**: `https://your-frontend-app.vercel.app`
- Replace with your actual Vercel frontend URL

#### 💳 Optional Variables (for Razorpay payments)

**5. RAZORPAY_KEY_ID**
- **Key**: `RAZORPAY_KEY_ID`
- **Value**: `your_razorpay_key_id`

**6. RAZORPAY_KEY_SECRET**
- **Key**: `RAZORPAY_KEY_SECRET`
- **Value**: `your_razorpay_key_secret`

### Step 3: Save and Deploy
1. Click **Save Changes** after adding all variables
2. Render will automatically redeploy your service
3. Check the logs to verify successful startup

## 🔐 Security Notes

### JWT_SECRET Generation
Generate a secure JWT secret using one of these methods:

**Option 1: Online Generator**
- Go to https://generate-secret.vercel.app/32
- Copy the generated string

**Option 2: Command Line**
```bash
# On your local machine
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 3: Manual**
- Use a random string at least 32 characters long
- Mix letters, numbers, and symbols
- Example: `mySecretKey123!@#ForexInstitute2026$%^`

### MongoDB URI
- Use the connection string from your MongoDB Atlas dashboard
- Make sure to URL-encode the password if it contains special characters
- Example: `mongodb+srv://username:password@cluster0.abc123.mongodb.net/database_name`

## ✅ Expected Result

After setting the environment variables, your Render logs should show:
```
> forex-institute-backend@1.0.0 start
> node dist/server.js

[dotenv@17.3.1] injecting env (6) from .env
✅ Connected to MongoDB
🔄 Checking for students to migrate...
🚀 Production mode
📡 API Server ready
🚀 Server running on port 10000
```

## 🐛 Troubleshooting

### Server Still Exits with Status 1
**Check these in order:**

1. **Missing JWT_SECRET**
   - Error: `❌ JWT_SECRET environment variable is required`
   - Solution: Add `JWT_SECRET` in Render environment variables

2. **Missing MONGODB_URI**
   - Error: `❌ MONGODB_URI environment variable is required`
   - Solution: Add `MONGODB_URI` in Render environment variables

3. **MongoDB Connection Failed**
   - Error: `❌ MongoDB connection error:`
   - Solutions:
     - Check MongoDB Atlas is running
     - Verify connection string is correct
     - Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
     - Ensure database user has proper permissions

### Environment Variables Not Loading
- Make sure you clicked **Save Changes** in Render
- Wait for automatic redeploy to complete
- Check the **Environment** tab shows your variables

### CORS Issues (After Backend Starts)
- Set `FRONTEND_URL` to your actual Vercel domain
- Make sure it starts with `https://`
- No trailing slash

## 📋 Complete Environment Variables Checklist

```
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=your-32-char-secret
✅ NODE_ENV=production
✅ FRONTEND_URL=https://your-app.vercel.app
⚪ RAZORPAY_KEY_ID=... (optional)
⚪ RAZORPAY_KEY_SECRET=... (optional)
```

## 🎯 Next Steps

1. **Set the environment variables** in Render dashboard
2. **Wait for automatic redeploy** (2-3 minutes)
3. **Check logs** for successful startup
4. **Test health endpoint**: `https://your-backend.onrender.com/health`
5. **Deploy frontend** to Vercel and update `FRONTEND_URL`

Your backend should start successfully after setting `MONGODB_URI` and `JWT_SECRET`!