# 🚀 OTC Recommender - Free Deployment Guide

## 📋 Overview
This guide provides step-by-step instructions for deploying the OTC Recommender application completely **FREE** using Vercel.

## 🌟 Features
- ✅ **100% Free Deployment**
- ✅ **Full-Stack Application** (Frontend + Backend)
- ✅ **SQLite Database** (No external DB required)
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Serverless Functions**

## 🔧 Prerequisites
- GitHub account
- Vercel account (free)
- Git installed locally

## 📦 Deployment Steps

### 1️⃣ **Prepare Repository**
```bash
# Clone the repository
git clone https://github.com/mohammadtavakoli1375/otc-recommender.git
cd otc-recommender
```

### 2️⃣ **Deploy to Vercel**

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `otc-recommender` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: Leave empty
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 3️⃣ **Environment Variables**
No environment variables needed! The app uses SQLite database included in the repository.

### 4️⃣ **Custom Domain (Optional)**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🎯 Architecture

### **Frontend (Next.js)**
- **Framework**: Next.js 15 with Turbopack
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **PWA**: Service Worker enabled
- **Language**: Persian/Farsi support

### **Backend (NestJS)**
- **Framework**: NestJS with Express
- **Database**: SQLite (file-based)
- **ORM**: Prisma
- **API**: RESTful endpoints
- **Serverless**: Optimized for Vercel Functions

### **Database**
- **Type**: SQLite (embedded)
- **File**: `backend/prisma/dev.db`
- **Migrations**: Included in repository
- **Seeding**: Pre-populated with drug data

## 📊 Vercel Configuration

### **vercel.json**
```json
{
  "version": 2,
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next" },
    { "src": "backend/api/server.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/api/server.ts" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ],
  "functions": {
    "backend/api/server.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔍 Health Checks

After deployment, test these endpoints:

### **Frontend**
- **Main App**: `https://your-domain.vercel.app/`
- **PWA**: Install prompt should appear

### **Backend API**
- **Health Check**: `https://your-domain.vercel.app/api/__ping` → `"ok"`
- **API Status**: `https://your-domain.vercel.app/api/` → `"API is up"`
- **Triage**: `https://your-domain.vercel.app/api/triage`
- **Drugs**: `https://your-domain.vercel.app/api/drugs`

## 💰 Cost Breakdown

### **Vercel Free Tier Limits**
- ✅ **Bandwidth**: 100GB/month
- ✅ **Function Executions**: 100GB-Hrs/month
- ✅ **Function Duration**: 10s max (we use 30s)
- ✅ **Deployments**: Unlimited
- ✅ **Custom Domains**: 1 included
- ✅ **HTTPS**: Automatic
- ✅ **Global CDN**: Included

### **Total Monthly Cost: $0** 🎉

## 🚀 Performance Optimizations

### **Frontend**
- **Next.js 15**: Latest performance improvements
- **Turbopack**: Faster builds
- **Image Optimization**: Automatic WebP conversion
- **Code Splitting**: Automatic route-based splitting
- **PWA**: Offline functionality

### **Backend**
- **Serverless Functions**: Auto-scaling
- **SQLite**: No network latency
- **Prisma**: Optimized queries
- **Caching**: Server-side caching
- **Compression**: Gzip enabled

## 🔧 Troubleshooting

### **Common Issues**

#### **Build Fails**
```bash
# Check build logs in Vercel Dashboard
# Common fixes:
1. Ensure all dependencies are in package.json
2. Check TypeScript errors
3. Verify file paths are correct
```

#### **API Not Working**
```bash
# Check function logs in Vercel Dashboard
# Common fixes:
1. Verify vercel.json routes
2. Check API endpoint paths
3. Ensure database file exists
```

#### **Database Issues**
```bash
# SQLite file not found
1. Ensure dev.db is committed to git
2. Check prisma/migrations are included
3. Verify schema.prisma provider is "sqlite"
```

## 📱 Mobile App (PWA)

The application is a Progressive Web App (PWA):

### **Installation**
1. Visit the website on mobile
2. Tap "Add to Home Screen"
3. App installs like native app

### **Features**
- ✅ **Offline Mode**: Works without internet
- ✅ **Push Notifications**: Medication reminders
- ✅ **Native Feel**: Full-screen experience
- ✅ **Auto Updates**: Automatic app updates

## 🎉 Success!

Your OTC Recommender is now deployed and accessible worldwide for **FREE**!

### **Next Steps**
1. **Test all features**: Triage, drug search, recommendations
2. **Monitor usage**: Check Vercel analytics
3. **Custom domain**: Add your own domain
4. **Share**: Send the link to users

---

**🌟 Enjoy your free, professional healthcare application!**