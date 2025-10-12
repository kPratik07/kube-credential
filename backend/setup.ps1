# Setup script for Kube Credential Backend Services

Write-Host "Setting up Issuance Service..." -ForegroundColor Green
Set-Location issuance-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install issuance-service dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "`nSetting up Verification Service..." -ForegroundColor Green
Set-Location verification-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install verification-service dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "`nSetup completed successfully!" -ForegroundColor Green
Write-Host "`nTo run the services:" -ForegroundColor Yellow
Write-Host "  Option 1 - Docker Compose: docker-compose up --build" -ForegroundColor Cyan
Write-Host "  Option 2 - Locally:" -ForegroundColor Cyan
Write-Host "    - Issuance: cd issuance-service && npm run dev" -ForegroundColor Cyan
Write-Host "    - Verification: cd verification-service && npm run dev" -ForegroundColor Cyan
