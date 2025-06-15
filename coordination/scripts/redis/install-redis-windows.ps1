# Redis Installation Script for Windows
# Run this in PowerShell as Administrator

Write-Host "Installing Redis for Hirable AI..." -ForegroundColor Blue

# Check if Chocolatey is installed
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Redis
Write-Host "Installing Redis..." -ForegroundColor Yellow
choco install redis-64 -y

# Start Redis service
Write-Host "Starting Redis service..." -ForegroundColor Yellow
Start-Service redis

# Set Redis to start automatically
Set-Service -Name redis -StartupType Automatic

# Test Redis connection
Write-Host "Testing Redis connection..." -ForegroundColor Yellow
$testResult = redis-cli ping
if ($testResult -eq "PONG") {
    Write-Host "✅ Redis installed and running successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Redis installation failed" -ForegroundColor Red
}

Write-Host @"
Redis Configuration:
- Host: localhost
- Port: 6379
- Service: redis (Windows Service)
- Commands:
  - Start: Start-Service redis
  - Stop: Stop-Service redis
  - Status: Get-Service redis
"@ -ForegroundColor Cyan