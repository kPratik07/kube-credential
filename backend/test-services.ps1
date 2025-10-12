# Test script for Kube Credential Services

Write-Host "Testing Kube Credential Services" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test Issuance Service
Write-Host "`nTesting Issuance Service Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method Get
    Write-Host "✓ Issuance Service is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Issuance Service health check failed" -ForegroundColor Red
    Write-Host "Make sure the service is running on port 3001" -ForegroundColor Yellow
    exit 1
}

# Test Credential Issuance
Write-Host "`nTesting Credential Issuance..." -ForegroundColor Yellow
$credential = @{
    name = "John Doe"
    email = "john@example.com"
    course = "Kubernetes Fundamentals"
    grade = "A+"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/issue" -Method Post -Body $credential -ContentType "application/json"
    Write-Host "✓ Credential issued successfully" -ForegroundColor Green
    Write-Host "  Worker: $($response.issuedBy)" -ForegroundColor Cyan
    Write-Host "  Message: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Credential issuance failed" -ForegroundColor Red
    exit 1
}

# Test Duplicate Issuance
Write-Host "`nTesting Duplicate Credential Detection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/issue" -Method Post -Body $credential -ContentType "application/json" -ErrorAction Stop
    Write-Host "✗ Should have rejected duplicate credential" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✓ Duplicate credential correctly rejected" -ForegroundColor Green
    } else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test Verification Service
Write-Host "`nTesting Verification Service Health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/health" -Method Get
    Write-Host "✓ Verification Service is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Verification Service health check failed" -ForegroundColor Red
    Write-Host "Make sure the service is running on port 3002" -ForegroundColor Yellow
    exit 1
}

# Test Credential Verification (Valid)
Write-Host "`nTesting Valid Credential Verification..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/verify" -Method Post -Body $credential -ContentType "application/json"
    Write-Host "✓ Credential verified successfully" -ForegroundColor Green
    Write-Host "  Valid: $($response.valid)" -ForegroundColor Cyan
    Write-Host "  Issued By: $($response.issuedBy)" -ForegroundColor Cyan
    Write-Host "  Verified By: $($response.verifiedBy)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Credential verification failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Invalid Credential Verification
Write-Host "`nTesting Invalid Credential Verification..." -ForegroundColor Yellow
$invalidCredential = @{
    name = "Jane Smith"
    email = "jane@example.com"
    course = "Docker"
    grade = "B"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/verify" -Method Post -Body $invalidCredential -ContentType "application/json" -ErrorAction Stop
    if ($response.valid -eq $false) {
        Write-Host "✓ Invalid credential correctly identified" -ForegroundColor Green
    } else {
        Write-Host "✗ Should have rejected invalid credential" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✓ Invalid credential correctly rejected" -ForegroundColor Green
    } else {
        Write-Host "Verification returned: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "All tests completed!" -ForegroundColor Green
