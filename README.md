# 🔐 Kube Credential System

A modern microservices-based credential management system built with **React**, **Node.js**, and **TypeScript**, designed for Kubernetes deployment.

## ✨ Features

- 📝 **Issue Credentials** - Create and store student credentials with validation
- 🔍 **Verify Credentials** - Validate credential authenticity in real-time
- 📊 **Verification History** - Track all verification attempts with timestamps
- 🎯 **Form Validation** - Comprehensive client-side validation with instant feedback
- 🎨 **Modern UI** - Responsive design that works on all devices
- 🔄 **Microservices Architecture** - Separate services for issuance and verification
- 🐳 **Kubernetes Ready** - Fully containerized with K8s deployment configs

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
┌─────────────────────────────────┐
│   Issuance Service (Port 3001)  │ ← Issues credentials
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Verification Service (Port 3002)│ ← Verifies & logs
└─────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd kube-credential
```

2. **Install dependencies**
```bash
# Backend - Issuance Service
cd backend/issuance-service
npm install

# Backend - Verification Service
cd ../verification-service
npm install

# Frontend
cd ../../frontend
npm install
```

3. **Build the services**
```bash
# Issuance Service
cd backend/issuance-service
npm run build

# Verification Service
cd ../verification-service
npm run build
```

4. **Start the services**
```bash
# Terminal 1 - Issuance Service
cd backend/issuance-service
npm start

# Terminal 2 - Verification Service
cd backend/verification-service
npm start

# Terminal 3 - Frontend
cd frontend
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

## 🧪 Testing

```bash
# Test Issuance Service
cd backend/issuance-service
npm test

# Test Verification Service
cd backend/verification-service
npm test
```

## 📦 Tech Stack

### Frontend
- ⚛️ React 19
- ⚡ Vite
- 🎨 CSS3 with CSS Variables
- 🔤 TypeScript

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🗄️ SQLite (sql.js)
- 🔤 TypeScript

### DevOps
- 🐳 Docker
- ☸️ Kubernetes
- 🧪 Jest (Testing)

## 📁 Project Structure

```
kube-credential/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── pages/        # Issue & Verify pages
│   │   ├── services/     # API service layer
│   │   └── App.tsx       # Main app component
│   └── package.json
│
├── backend/
│   ├── issuance-service/ # Credential issuance microservice
│   │   ├── src/
│   │   │   ├── db.ts     # Database layer
│   │   │   ├── routes/   # API routes
│   │   │   └── server.ts # Express server
│   │   └── package.json
│   │
│   └── verification-service/ # Credential verification microservice
│       ├── src/
│       │   ├── db.ts     # Database layer
│       │   ├── routes/   # API routes
│       │   └── server.ts # Express server
│       └── package.json
│
└── k8s/                  # Kubernetes deployment configs
    ├── issuance-deployment.yaml
    ├── verification-deployment.yaml
    └── ingress.yaml
```

## 🔧 API Endpoints

### Issuance Service (Port 3001)
- `POST /api/issue` - Issue a new credential
- `GET /api/health` - Health check

### Verification Service (Port 3002)
- `POST /api/verify` - Verify a credential
- `GET /api/history` - Get verification history
- `GET /api/health` - Health check

## 🎯 Validation Rules

### Name
- ✅ Required, 2-100 characters
- ✅ Letters, spaces, hyphens, apostrophes only

### Email
- ✅ Required, valid email format
- ✅ Must end with valid domain (.com, .org, .edu, etc.)
- ✅ Maximum 254 characters

### Course
- ✅ Required, 3-100 characters

## 🐳 Docker Deployment

```bash
# Build images
docker build -t issuance-service ./backend/issuance-service
docker build -t verification-service ./backend/verification-service
docker build -t frontend ./frontend

# Run containers
docker run -p 3001:3001 issuance-service
docker run -p 3002:3002 verification-service
docker run -p 5173:5173 frontend
```

## ☸️ Kubernetes Deployment

```bash
# Apply Kubernetes configs
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## 📝 License

MIT

## 👤 Author & Contact Information
Built with ❤️ By Pratik Raj 🚀
---

⭐ **Star this repo** if you find it helpful!
