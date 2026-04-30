# Professional Big Data Loyihasi - 1-Click Ishga Tushirish Skripti
$ErrorActionPreference = "Stop"

Write-Host "`n--- Professional Hadoop + Spark Tahlil Tizimi ---" -ForegroundColor Cyan

# 1. Java muhitini tekshirish
Write-Host "[1/6] Java muhitini tekshirilmoqda..." -ForegroundColor Yellow
$JAVA_EXE = "java"
try {
    & $JAVA_EXE -version
} catch {
    # Microsoft OpenJDK uchun zaxira yo'li
    $FALLBACK_JAVA_BIN = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot\bin\java.exe"
    $FALLBACK_JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.18.8-hotspot"
    if (Test-Path $FALLBACK_JAVA_BIN) {
        $JAVA_EXE = $FALLBACK_JAVA_BIN
        $env:JAVA_HOME = $FALLBACK_JAVA_HOME
        $env:Path = "$FALLBACK_JAVA_HOME\bin;" + $env:Path
        Write-Host "Java topildi: $JAVA_EXE. JAVA_HOME sozlandi." -ForegroundColor Gray
    } else {
        Write-Error "Java o'rnatilmagan yoki PATH-da yo'q. Iltimos OpenJDK 11 yoki 17 o'rnating va terminalni qayta ishga tushiring."
        exit
    }
}

$BASE_DIR = Get-Location

# 1.1 Hadoop muhitini sozlash (Windows uchun)
Write-Host "[1.1/6] Hadoop muhitini sozlanmoqda..." -ForegroundColor Yellow
$HADOOP_HOME_LOCAL = Join-Path $BASE_DIR.Path "hadoop"
if (Test-Path "$HADOOP_HOME_LOCAL\bin\winutils.exe") {
    $env:HADOOP_HOME = $HADOOP_HOME_LOCAL
    $env:Path = "$HADOOP_HOME_LOCAL\bin;" + $env:Path
    Write-Host "HADOOP_HOME sozlandi: $env:HADOOP_HOME" -ForegroundColor Gray
} else {
    Write-Host "Ogohlantirish: winutils.exe topilmadi. Spark Windowsda xatolik berishi mumkin." -ForegroundColor Red
}

# 2. Spark muhitini tekshirish
Write-Host "[2/6] Spark muhitini tekshirilmoqda..." -ForegroundColor Yellow
$SPARK_SUBMIT = "spark-submit"
$VENV_SPARK = ".venv/Scripts/spark-submit.cmd"

if (!(Get-Command $SPARK_SUBMIT -ErrorAction SilentlyContinue)) {
    if (Test-Path $VENV_SPARK) {
        $SPARK_SUBMIT = Join-Path $BASE_DIR.Path $VENV_SPARK
        $env:SPARK_HOME = Join-Path $BASE_DIR.Path ".venv/Lib/site-packages/pyspark"
        $env:PYSPARK_PYTHON = Join-Path $BASE_DIR.Path ".venv/Scripts/python.exe"
        $env:PYSPARK_DRIVER_PYTHON = Join-Path $BASE_DIR.Path ".venv/Scripts/python.exe"
        Write-Host "Virtual muhitdagi Spark ishlatilmoqda: $SPARK_SUBMIT" -ForegroundColor Gray
    }
}

# 3. Kutubxonalarni o'rnatish
Write-Host "[3/6] Python virtual muhiti va kutubxonalari sozlanmoqda..." -ForegroundColor Yellow
if (!(Test-Path ".venv")) {
    python -m venv .venv
}
& .venv/Scripts/python -m pip install --upgrade pip
& .venv/Scripts/python -m pip install -r requirements.txt

# 4. Ma'lumotlarni generatsiya qilish (O'chirildi - Admin paneldan qo'shiladi)
# & .venv/Scripts/python src/generate_sample_data.py

# 5. Spark Jobni ishga tushirish
Write-Host "[5/6] Spark Job ishga tushirilmoqda (Lokal rejim)..." -ForegroundColor Yellow

$INPUT_PATH = "file:///$($BASE_DIR.Path.Replace('\','/'))/data/raw_orders/*.csv"
$OUTPUT_PATH = "file:///$($BASE_DIR.Path.Replace('\','/'))/data/output_analytics"
$CHECKPOINT_PATH = "file:///$($BASE_DIR.Path.Replace('\','/'))/data/temp/checkpoints"

& $SPARK_SUBMIT `
  --master "local[*]" `
  src/bigdata_hadoop_spark_job.py `
  --input-path "$INPUT_PATH" `
  --output-path "$OUTPUT_PATH" `
  --checkpoint-path "$CHECKPOINT_PATH" `
  --app-name "Uzbek-BigData-Analytics-Job"

Write-Host "`n--- SPARK JOB MUVAFFAQIYATLI YAKUNLANDI ---" -ForegroundColor Green

# 6. React Frontend va Backendni ishga tushirish
Write-Host "[6/6] React Dashboard va Backend ishga tushirilmoqda..." -ForegroundColor Cyan

# Backendni fonda ishga tushirish
$backendJob = Start-Job -ScriptBlock {
    param($path)
    cd $path
    & .venv/Scripts/python backend/main.py
} -ArgumentList $BASE_DIR.Path

# Frontendni fonda ishga tushirish
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    cd "$path\frontend-react"
    npm run dev
} -ArgumentList $BASE_DIR.Path

Write-Host "Backend: http://localhost:8000" -ForegroundColor Gray
Write-Host "Frontend: http://localhost:5180" -ForegroundColor Gray
Write-Host "`nBrauzerda dashboard ochilmoqda..." -ForegroundColor Yellow

Start-Sleep -Seconds 5
Start-Process "http://localhost:5180"

Write-Host "`nLoyiha 100% O'zbek tilida ishga tushdi! ✅" -ForegroundColor Green
Write-Host "Terminalni yopmang (Backend va Frontend ishlashi uchun)." -ForegroundColor Gray

# Joblarni kuzatish (ixtiyoriy)
Wait-Job $backendJob, $frontendJob
