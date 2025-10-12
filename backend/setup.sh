#!/bin/bash

# Setup script for Kube Credential Backend Services

echo "Setting up Issuance Service..."
cd issuance-service
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install issuance-service dependencies"
    exit 1
fi
cd ..

echo ""
echo "Setting up Verification Service..."
cd verification-service
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install verification-service dependencies"
    exit 1
fi
cd ..

echo ""
echo "Setup completed successfully!"
echo ""
echo "To run the services:"
echo "  Option 1 - Docker Compose: docker-compose up --build"
echo "  Option 2 - Locally:"
echo "    - Issuance: cd issuance-service && npm run dev"
echo "    - Verification: cd verification-service && npm run dev"
