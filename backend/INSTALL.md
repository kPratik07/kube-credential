# Backend Installation Guide

## Fixed: No Native Compilation Required!

I've replaced `better-sqlite3` (which requires C++ compilation) with `sql.js` (pure JavaScript).
This eliminates the build errors you were experiencing on Windows.

## Installation Steps

### Step 1: Clean Install for Issuance Service

```powershell
cd backend\issuance-service
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install
```

### Step 2: Clean Install for Verification Service

```powershell
cd ..\verification-service
Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install
cd ..\..
```

### Step 3: Run the Services

**Option A: Run Locally (Development)**

Terminal 1 - Issuance Service:
```powershell
cd backend\issuance-service
npm run dev
```

Terminal 2 - Verification Service:
```powershell
cd backend\verification-service
npm run dev
```

**Option B: Build and Run Production**

```powershell
# Build both services
cd backend\issuance-service
npm run build
cd ..\verification-service
npm run build
cd ..

# Run both services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd issuance-service; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd verification-service; npm start"
```

## Verify Installation

Once services are running, test them:

```powershell
# Test Issuance Service
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get

# Test Verification Service
Invoke-RestMethod -Uri "http://localhost:3002/api/health" -Method Get
```

## What Was Changed

1. **Removed**: `better-sqlite3` (requires native compilation)
2. **Added**: `sql.js` (pure JavaScript, no compilation needed)
3. **Updated**: All database code to use async/await pattern
4. **Fixed**: All routes now properly handle async database operations

## Key Changes in Code

- `IssuanceDatabase` methods are now async
- `VerificationDatabase` methods are now async
- All route handlers use `async/await`
- Database persists to disk automatically

## Troubleshooting

### If npm install still fails:

1. **Clear npm cache**:
   ```powershell
   npm cache clean --force
   ```

2. **Use a different Node version** (if needed):
   ```powershell
   nvm install 20
   nvm use 20
   ```

3. **Check Node version**:
   ```powershell
   node --version  # Should be 18+ or 20+
   ```

### If services won't start:

1. **Check if ports are in use**:
   ```powershell
   netstat -ano | findstr :3001
   netstat -ano | findstr :3002
   ```

2. **Kill processes if needed**:
   ```powershell
   # Replace PID with actual process ID from netstat
   taskkill /PID <PID> /F
   ```

## All Lint Errors Will Disappear

Once `npm install` completes successfully, all TypeScript lint errors will disappear because:
- Type definitions will be installed (`@types/node`, `@types/express`, etc.)
- Dependencies will be available (`express`, `cors`, `sql.js`, etc.)
- TypeScript will be able to resolve all imports

## Next Steps After Installation

1. ✅ Backend services running
2. 🔄 Install frontend dependencies
3. 🔄 Create Kubernetes manifests
4. 🔄 Write comprehensive README
5. 🔄 Deploy to cloud (AWS free tier)
