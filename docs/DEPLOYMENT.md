# 🚀 Deployment Guide

## Deployment Options

### Option 1: Single Server Deployment (Recommended for Small Scale)

Deploy both frontend and backend on the same server/platform.

#### A. Heroku (Full Stack)

**Step 1: Prepare for Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name
```

**Step 2: Configure for Production**

Create `package.json` scripts for production:
```json
{
  "scripts": {
    "start": "node --import tsx server.ts",
    "build": "npm run build:frontend",
    "build:frontend": "vite build",
    "heroku-postbuild": "npm run build:frontend"
  }
}
```

**Step 3: Update server.ts for production**
```javascript
// Add this to server.ts after all API routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}
```

**Step 4: Set Environment Variables**
```bash
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set RAZORPAY_KEY_ID="your_razorpay_key"
heroku config:set RAZORPAY_KEY_SECRET="your_razorpay_secret"
heroku config:set NODE_ENV="production"
```

**Step 5: Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### B. Railway (Full Stack)

**Step 1: Connect Repository**
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select "Deploy from GitHub repo"

**Step 2: Configure Environment Variables**
In Railway dashboard:
- Add `MONGODB_URI`
- Add `JWT_SECRET`
- Add `RAZORPAY_KEY_ID`
- Add `RAZORPAY_KEY_SECRET`
- Add `NODE_ENV=production`

**Step 3: Configure Build**
Railway will automatically detect and build your app.

#### C. Render (Full Stack)

**Step 1: Create Web Service**
1. Go to [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"

**Step 2: Configure Build Settings**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Step 3: Set Environment Variables**
Add all required environment variables in Render dashboard.

### Option 2: Separate Frontend and Backend Deployment

Deploy frontend and backend on different platforms for better scalability.

#### Backend Deployment Options

**A. Heroku (Backend Only)**
```bash
# Create separate backend app
heroku create your-app-backend

# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set RAZORPAY_KEY_ID="your_razorpay_key"
heroku config:set RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Deploy
git push heroku main
```

**B. Railway (Backend Only)**
- Deploy only the backend code
- Get the backend URL (e.g., `https://your-app.railway.app`)

**C. DigitalOcean App Platform**
- Create a new app
- Connect repository
- Configure as Node.js service
- Set environment variables

#### Frontend Deployment Options

**A. Vercel (Frontend Only)**

**Step 1: Configure for Vercel**
Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://your-backend-url.herokuapp.com', // Your backend URL
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist'
  }
});
```

**Step 2: Create `vercel.json`**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.herokuapp.com/api/$1"
    }
  ]
}
```

**Step 3: Deploy to Vercel**
```bash
npm install -g vercel
vercel --prod
```

**B. Netlify (Frontend Only)**

**Step 1: Create `_redirects` file in `public/`**
```
/api/* https://your-backend-url.herokuapp.com/api/:splat 200
/* /index.html 200
```

**Step 2: Deploy**
```bash
npm run build
# Upload dist folder to Netlify or connect GitHub repo
```

**C. GitHub Pages (Frontend Only)**
```bash
npm install --save-dev gh-pages

# Add to package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run build
npm run deploy
```

### Option 3: Docker Deployment

#### Single Container (Full Stack)

**Create `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
      - NODE_ENV=production
    env_file:
      - .env
```

**Deploy:**
```bash
docker-compose up -d
```

#### Multi-Container (Separate Services)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY server.ts server/
CMD ["npm", "run", "backend"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

## Configuration for Different Deployments

### 1. Update Server for Production

Add this to `server.ts`:
```javascript
import path from 'path';

// ... existing code ...

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 2. Update Package.json

```json
{
  "scripts": {
    "start": "node --import tsx server.ts",
    "backend": "node --import tsx server.ts",
    "frontend": "vite",
    "build": "vite build",
    "build:backend": "tsc server.ts --outDir dist-server",
    "heroku-postbuild": "npm run build",
    "dev": "concurrently \"npm run backend\" \"npm run frontend\""
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

### 3. Environment Variables for Different Platforms

**Heroku:**
```bash
heroku config:set VARIABLE_NAME="value"
```

**Vercel:**
```bash
vercel env add VARIABLE_NAME
```

**Netlify:**
- Go to Site Settings → Environment Variables

**Railway:**
- Add in Variables tab

**Render:**
- Add in Environment tab

## Recommended Deployment Strategies

### For Development/Testing
- **Heroku Free Tier** (if available) or **Railway**
- Single server deployment
- Easy setup and management

### For Small Production
- **Railway** or **Render**
- Single server with automatic scaling
- Built-in SSL and domain management

### For Medium Production
- **Frontend**: Vercel/Netlify
- **Backend**: Heroku/Railway/DigitalOcean
- Better performance and scalability

### For Large Production
- **Frontend**: Vercel/Netlify + CDN
- **Backend**: AWS/GCP/Azure with load balancing
- **Database**: MongoDB Atlas with clustering
- **Monitoring**: DataDog/New Relic

## Post-Deployment Checklist

### Security
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database IP whitelist updated
- [ ] CORS configured for production domain
- [ ] Security headers implemented

### Performance
- [ ] Frontend assets minified and compressed
- [ ] Database indexes optimized
- [ ] CDN configured (if applicable)
- [ ] Monitoring and logging set up

### Functionality
- [ ] All API endpoints working
- [ ] Authentication flow working
- [ ] Payment gateway working (test mode first)
- [ ] File uploads working (if applicable)
- [ ] Email notifications working (if implemented)

## Troubleshooting Common Issues

### CORS Errors
Update server.ts:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173'],
  credentials: true
}));
```

### Build Errors
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Database Connection Issues
- Verify MongoDB URI format
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

### Environment Variable Issues
- Double-check variable names (case-sensitive)
- Verify values are properly encoded
- Check platform-specific configuration

## Monitoring and Maintenance

### Logging
```javascript
// Add to server.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Database Monitoring
- Set up MongoDB Atlas alerts
- Monitor connection pool usage
- Track query performance

---

Choose the deployment option that best fits your needs, budget, and technical requirements!