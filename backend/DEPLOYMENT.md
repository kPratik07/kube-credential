# Backend Deployment Guide

## Quick Start

### 1. Install Dependencies

```powershell
# Windows
.\setup.ps1

# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

### 2. Run Services

**Option A: Docker Compose (Recommended)**
```bash
docker-compose up --build
```

**Option B: Local Development**
```bash
# Terminal 1
cd issuance-service
npm run dev

# Terminal 2  
cd verification-service
npm run dev
```

### 3. Test Services

```powershell
# Windows
.\test-services.ps1

# Linux/Mac (use curl)
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
```

## Service Details

### Issuance Service (Port 3001)

**Endpoints:**
- `POST /api/issue` - Issue new credential
- `GET /api/health` - Health check

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "course": "Kubernetes",
    "grade": "A+"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "credential issued by worker-1",
  "credential": {...},
  "issuedBy": "worker-1",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Duplicate Response (409):**
```json
{
  "success": false,
  "message": "Credential already issued",
  "issuedBy": "worker-1"
}
```

### Verification Service (Port 3002)

**Endpoints:**
- `POST /api/verify` - Verify credential
- `GET /api/health` - Health check
- `GET /api/history?limit=10` - Get verification history

**Example Request:**
```bash
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "course": "Kubernetes",
    "grade": "A+"
  }'
```

**Valid Credential Response (200):**
```json
{
  "success": true,
  "valid": true,
  "message": "Credential is valid",
  "issuedBy": "worker-1",
  "issuedAt": "2025-01-01T00:00:00.000Z",
  "verifiedBy": "worker-2",
  "verifiedAt": "2025-01-01T00:01:00.000Z"
}
```

**Invalid Credential Response (404):**
```json
{
  "success": false,
  "valid": false,
  "message": "Credential not found or invalid",
  "verifiedBy": "worker-2",
  "verifiedAt": "2025-01-01T00:01:00.000Z"
}
```

## Running Tests

```bash
# Issuance Service
cd issuance-service
npm test

# Verification Service
cd verification-service
npm test
```

## Building for Production

```bash
# Build both services
cd issuance-service && npm run build && cd ..
cd verification-service && npm run build && cd ..

# Run production builds
cd issuance-service && npm start &
cd verification-service && npm start &
```

## Docker Deployment

### Build Images
```bash
# Issuance Service
cd issuance-service
docker build -t kube-credential-issuance:latest .

# Verification Service
cd verification-service
docker build -t kube-credential-verification:latest .
```

### Run Containers
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Services
```bash
docker-compose down
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# Linux/Mac
lsof -i :3001
lsof -i :3002
```

### Database Issues
- Delete `data/` directories in each service
- Restart services to recreate databases

### Module Not Found Errors
```bash
# Reinstall dependencies
cd issuance-service && rm -rf node_modules && npm install
cd verification-service && rm -rf node_modules && npm install
```

## Architecture Notes

1. **Database Sharing**: Both services access a shared SQLite database for credential verification
2. **Worker ID**: Each service instance reports its hostname (pod name in K8s)
3. **Credential Identity**: Credentials are uniquely identified by their JSON content
4. **Idempotency**: Issuing the same credential twice returns the original issue information
