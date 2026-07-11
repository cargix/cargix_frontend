# Environment Configuration Guide

## Overview
The frontend can connect to different backend servers using environment variables.

## Environment Files

### `.env.local` (Local Development)
Use this when developing with a local backend server:
```bash
VITE_API_URL=http://localhost:5000/api
```

### `.env.production` (Deployed Backend)
Use this when testing with the deployed backend:
```bash
VITE_API_URL=http://68.210.185.118:5000/api
```

## How to Switch Between Backends

### Method 1: Edit .env.local (Recommended)
Simply change the URL in `.env.local`:

**For Local Backend:**
```bash
VITE_API_URL=http://localhost:5000/api
```

**For Deployed Backend:**
```bash
VITE_API_URL=http://68.210.185.118:5000/api
```

Then restart your dev server.

### Method 2: Use Different Commands
Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:local": "vite --mode local",
    "dev:prod": "vite --mode production",
    "build": "vite build"
  }
}
```

Then run:
- `npm run dev:local` - Uses local backend
- `npm run dev:prod` - Uses deployed backend

### Method 3: Inline Environment Variable
Set the variable when starting the dev server:

**For Local:**
```bash
VITE_API_URL=http://localhost:5000/api npm run dev
```

**For Deployed:**
```bash
VITE_API_URL=http://68.210.185.118:5000/api npm run dev
```

## Verification
When you start the frontend, check the console for:
```
🌐 API Base URL: http://localhost:5000/api
```

This confirms which backend you're connected to.

## Important Notes

1. **Restart Required**: After changing `.env.local`, you must restart the Vite dev server
2. **Git Ignore**: `.env.local` is gitignored to prevent committing local configurations
3. **Default**: If no env variable is set, it defaults to `http://localhost:5000/api`

## Quick Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your preferred backend URL

3. Start the dev server:
   ```bash
   npm run dev
   ```
