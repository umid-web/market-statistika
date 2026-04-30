param(
    [switch]$DryRun,
    [switch]$Restart,
    [int]$WaitSeconds = 20
)

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $ROOT "backend"
$FRONTEND_DIR = Join-Path $ROOT "frontend-react"
$REQ_FILE = Join-Path $ROOT "requirements.txt"

function Test-PortListening {
    param([int]$Port)

    try {
        $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return $null -ne $listener
    } catch {
        return $false
    }
}

function Start-ServiceTerminal {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    if ($DryRun) {
        Write-Host "[DRY RUN] $Title -> $WorkingDirectory :: $Command" -ForegroundColor DarkGray
        return
    }

    $escapedDir = $WorkingDirectory.Replace("'", "''")
    $fullCommand = "Set-Location '$escapedDir'; $Command"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $fullCommand | Out-Null
}

function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds
    )

    $end = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $end) {
        if (Test-PortListening -Port $Port) {
            return $true
        }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Stop-ProcessOnPort {
    param([int]$Port)

    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $conn) {
            return $false
        }
        if ($DryRun) {
            Write-Host "[DRY RUN] Port $Port dagi PID $($conn.OwningProcess) to'xtatiladi" -ForegroundColor DarkGray
            return $true
        }
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
        Start-Sleep -Milliseconds 500
        return $true
    } catch {
        Write-Host "Port $Port dagi processni to'xtatib bo'lmadi: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-UrlOk {
    param([string]$Url)
    try {
        $resp = Invoke-WebRequest -Uri $Url -Method Get -UseBasicParsing -TimeoutSec 5
        return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500)
    } catch {
        return $false
    }
}

Write-Host "`n--- Frontend + Backend Starter ---" -ForegroundColor Cyan

if (!(Test-Path $BACKEND_DIR)) {
    throw "Backend papkasi topilmadi: $BACKEND_DIR"
}
if (!(Test-Path $FRONTEND_DIR)) {
    throw "Frontend papkasi topilmadi: $FRONTEND_DIR"
}

# Frontend dependencies are missing
if (!(Test-Path (Join-Path $FRONTEND_DIR "node_modules"))) {
    Write-Host "Frontend kutubxonalari o'rnatilmoqda..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "[DRY RUN] npm install ($FRONTEND_DIR)" -ForegroundColor DarkGray
    } else {
        npm install --prefix "$FRONTEND_DIR"
    }
}

# Backend dependencies quick-check
if (!(Test-Path (Join-Path $ROOT ".venv"))) {
    Write-Host ".venv topilmadi, global Python bilan dependencies o'rnatiladi..." -ForegroundColor Yellow
    if (!$DryRun) {
        python -m pip install -r "$REQ_FILE"
    }
}

$backendRunning = Test-PortListening -Port 8000
$frontendRunning = Test-PortListening -Port 5180

if ($Restart) {
    Write-Host "Restart rejimi: mavjud servislar to'xtatiladi..." -ForegroundColor Yellow
    if ($backendRunning) { [void](Stop-ProcessOnPort -Port 8000) }
    if ($frontendRunning) { [void](Stop-ProcessOnPort -Port 5180) }
    $backendRunning = Test-PortListening -Port 8000
    $frontendRunning = Test-PortListening -Port 5180
}

if ($backendRunning) {
    Write-Host "Backend allaqachon ishlayapti (http://localhost:8000)" -ForegroundColor Green
} else {
    Write-Host "Backend ishga tushirilmoqda..." -ForegroundColor Yellow
    Start-ServiceTerminal -Title "Backend" -WorkingDirectory $BACKEND_DIR -Command "python main.py"
}

if ($frontendRunning) {
    Write-Host "Frontend allaqachon ishlayapti (http://localhost:5180)" -ForegroundColor Green
} else {
    Write-Host "Frontend ishga tushirilmoqda..." -ForegroundColor Yellow
    Start-ServiceTerminal -Title "Frontend" -WorkingDirectory $FRONTEND_DIR -Command "npm run dev -- --force"
}

Write-Host "`nManzillar:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5180" -ForegroundColor Gray
Write-Host "- Backend:  http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "`nBitta buyruq: .\run_web.ps1" -ForegroundColor Magenta
Write-Host "To'liq restart: .\run_web.ps1 -Restart" -ForegroundColor Magenta

if ($DryRun) {
    return
}

Write-Host "`nServislar tayyorligini kutyapman (max $WaitSeconds soniya)..." -ForegroundColor Yellow
$backendUp = Wait-ForPort -Port 8000 -TimeoutSeconds $WaitSeconds
$frontendUp = Wait-ForPort -Port 5180 -TimeoutSeconds $WaitSeconds

$backendHttpOk = $false
$frontendHttpOk = $false
if ($backendUp) { $backendHttpOk = Test-UrlOk -Url "http://localhost:8000/docs" }
if ($frontendUp) { $frontendHttpOk = Test-UrlOk -Url "http://localhost:5180" }

Write-Host "`nNatija:" -ForegroundColor Cyan
if ($backendHttpOk) {
    Write-Host "Backend: ISHLAYAPTI (http://localhost:8000/docs)" -ForegroundColor Green
} else {
    Write-Host "Backend: MUAMMO BOR (port yoki HTTP javob yo'q)" -ForegroundColor Red
}

if ($frontendHttpOk) {
    Write-Host "Frontend: ISHLAYAPTI (http://localhost:5180)" -ForegroundColor Green
} else {
    Write-Host "Frontend: MUAMMO BOR (port yoki HTTP javob yo'q)" -ForegroundColor Red
}
