# Kube Credential - Backend Services

This directory contains two microservices for the Kube Credential system:

## Services

### 1. Issuance Service (Port 3001)
- Issues new credentials
- Stores credentials in SQLite database
- Returns worker ID that handled the request
- Prevents duplicate credential issuance

### 2. Verification Service (Port 3002)
- Verifies if credentials have been issued
- Accesses shared database to check credential validity
- Records verification attempts
- Returns issuer worker ID and timestamp for valid credentials

## Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)

### Install Dependencies

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual:**
```bash
cd issuance-service && npm install && cd ..
cd verification-service && npm install && cd ..
```

## Running the Services

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up --build
```

This will:
- Build both services
- Create shared volumes for database persistence
- Start services on ports 3001 and 3002

### Option 2: Local Development

**Terminal 1 - Issuance Service:**
```bash
cd issuance-service
npm run dev
```

**Terminal 2 - Verification Service:**
```bash
cd verification-service
npm run dev
```

## Testing

Run unit tests for each service:

```bash
# Issuance Service
cd issuance-service
npm test

# Verification Service
cd verification-service
npm test
```

## API Endpoints

### Issuance Service (http://localhost:3001)

**POST /api/issue**
- Issue a new credential
- Body: JSON credential data
- Returns: Success message with worker ID

**GET /api/health**
- Health check endpoint

### Verification Service (http://localhost:3002)

**POST /api/verify**
- Verify a credential
- Body: JSON credential data
- Returns: Validation result with issuer info

**GET /api/health**
- Health check endpoint

**GET /api/history?limit=10**
- Get verification history

## Architecture Notes

- Both services use SQLite for persistence
- In Docker/K8s, services share a volume for the issuance database
- Verification service reads from shared issuance database
- Each service reports its hostname/pod name as worker ID
- Credentials are identified by their JSON content hash
