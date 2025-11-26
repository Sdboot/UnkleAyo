# Setup ngrok and configure VITE_PUBLIC_URL automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UnkleAyo ngrok Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
Write-Host "Checking ngrok installation..." -ForegroundColor Yellow
try {
    ngrok --version | Out-Null
    Write-Host "OK ngrok is installed" -ForegroundColor Green
}
catch {
    Write-Host "ERROR ngrok not found" -ForegroundColor Red
    exit
}

# Start ngrok in background
Write-Host "Starting ngrok tunnel on port 3001..." -ForegroundColor Yellow
$ngrokProcess = Start-Process -FilePath ngrok -ArgumentList "http 3001" -PassThru -NoNewWindow
Start-Sleep -Seconds 3

# Try to get the forwarding URL from ngrok API
Write-Host "Retrieving your ngrok URL..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
    $publicUrl = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1 -ExpandProperty public_url
    
    if ($publicUrl) {
        Write-Host "Found ngrok URL: $publicUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "Updating .env file..." -ForegroundColor Yellow
        
        $envPath = "$(Get-Location)\.env"
        $envContent = Get-Content $envPath -Raw
        $envContent = $envContent -replace 'VITE_PUBLIC_URL=.*', "VITE_PUBLIC_URL=$publicUrl"
        Set-Content $envPath $envContent
        
        Write-Host "Updated .env with VITE_PUBLIC_URL=$publicUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Setup Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Your public URL: $publicUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. ngrok is running in the background"
        Write-Host "2. Run: npm run dev"
        Write-Host "3. Users can access at: http://YOUR-COMPUTER-IP:5173"
        Write-Host ""
    }
    else {
        Write-Host "ERROR Could not find ngrok URL" -ForegroundColor Red
        Stop-Process -InputObject $ngrokProcess
    }
}
catch {
    Write-Host "ERROR Could not retrieve ngrok URL: $_" -ForegroundColor Red
    Stop-Process -InputObject $ngrokProcess -ErrorAction SilentlyContinue
}
