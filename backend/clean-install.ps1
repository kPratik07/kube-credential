# Clean Installation Script for Kube Credential Backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kube Credential - Clean Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to clean and install
function Install-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath
    )
    
    Write-Host "Installing $ServiceName..." -ForegroundColor Yellow
    Write-Host "  Location: $ServicePath" -ForegroundColor Gray
    
    Push-Location $ServicePath
    
    # Clean up
    Write-Host "  Cleaning old files..." -ForegroundColor Gray
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    
    # Install
    Write-Host "  Running npm install..." -ForegroundColor Gray
    npm install 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $ServiceName installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $ServiceName installation failed!" -ForegroundColor Red
        Pop-Location
        return $false
    }
    
    Pop-Location
    return $true
}

# Install Issuance Service
$success1 = Install-Service -ServiceName "Issuance Service" -ServicePath "issuance-service"
Write-Host ""

# Install Verification Service
$success2 = Install-Service -ServiceName "Verification Service" -ServicePath "verification-service"
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
if ($success1 -and $success2) {
    Write-Host "✓ All services installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To run the services:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Development Mode (2 terminals):" -ForegroundColor Cyan
    Write-Host "    Terminal 1: cd issuance-service && npm run dev" -ForegroundColor White
    Write-Host "    Terminal 2: cd verification-service && npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "  Production Mode:" -ForegroundColor Cyan
    Write-Host "    cd issuance-service && npm run build && npm start" -ForegroundColor White
    Write-Host "    cd verification-service && npm run build && npm start" -ForegroundColor White
    Write-Host ""
    Write-Host "  Test Services:" -ForegroundColor Cyan
    Write-Host "    ..\test-services.ps1" -ForegroundColor White
} else {
    Write-Host "✗ Installation failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
