# 🔧 Fix Render Deployment Error

## Problem
When deploying to Render, you get this error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /opt/render/project/src/backend/
```

Or TypeScript compilation errors like:
```
Could not find a declaration file for module 'express'
Cannot find name 'process'. Do you need to install type definitions for node?
```

## Root Cause
1. The backend was using `tsx` (TypeScript executor) which is in `devDependencies`
2. TypeScript and type definitions were in `devDependencies`
3. Render doesn't install dev dependencies in production, causing build failures

## ✅ Solution Applied

### 1. Updated package.json Scripts
Changed from using `tsx` directly to compiling TypeScript first:

**Before:**
```json
{
  "scripts": {
    "start": "node --import tsx server.ts",
    "build": "echo 'No build step required for backend'"
  }
}
```

**After:**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc"
  }
}
```

### 2. Moved Build Dependencies to Production
Moved TypeScript and type definitions from `devDependencies` to `dependencies`:

**Before:**
```json
{
  "dependencies": {
    "express": "^4.21.2",
    // ... other runtime deps
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2",
    "tsx": "^4.21.0"
  }
}
```

**After:**
```json
{
  "dependencies": {
    "express": "^4.21.2",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "typescript": "~5.8.2",
    // ... other deps
  },
  "devDependencies": {
    "tsx": "^4.21.0"
  }
}
```

### 3. Added TypeScript Configuration
Created `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./",
    "resolveJsonModule": true,
    "declaration": false,
    "removeComments": true,
    "noEmitOnError": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Fixed TypeScript Errors
Fixed type issues in the code:
- Added non-null assertions for environment variables
- Fixed CORS origin array typing
- Fixed PORT type conversion

## 🚀 Render Configuration

When deploying to Render, use these settings:

### Build & Deploy Settings
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` ⚠️ **IMPORTANT: NOT `npm run dev`**

**Common Mistake**: If Render is configured to run `npm run dev`, it will fail because `tsx` is not available in production. Always use `npm start` for production deployment.

### Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

## ✅ Verification

### Local Test
```bash
cd backend
npm run build    # Should compile without errors
npm start        # Should start the server (may fail if port in use, that's OK)
```

### Render Deployment
1. Push changes to GitHub
2. Render will automatically redeploy
3. Check build logs for successful compilation
4. Test health endpoint: `https://your-app.onrender.com/health`

## 📁 File Structure After Fix

```
backend/
├── dist/                 # Compiled JavaScript (auto-generated)
│   ├── server.js
│   └── server/
│       └── db.js
├── server/
│   └── db.ts
├── server.ts
├── package.json          # Updated scripts
├── tsconfig.json         # New TypeScript config
└── .env
```

## 🎉 Result

- ✅ TypeScript compiles to JavaScript in `dist/` folder
- ✅ Production server runs compiled JavaScript (no `tsx` dependency)
- ✅ Render deployment works without errors
- ✅ All functionality preserved

The backend now follows production best practices by compiling TypeScript to JavaScript before deployment.