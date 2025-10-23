# 데이터 백업 자동화 스크립트
# 실행: PowerShell에서 .\backup_script.ps1

param(
    [string]$BackupDir = "backup",
    [string]$Date = (Get-Date -Format "yyyyMMdd_HHmmss")
)

Write-Host "🔄 데이터 백업 시작: $Date" -ForegroundColor Green

# 백업 디렉토리 생성
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir
}

Write-Host "📊 MySQL 데이터베이스 백업 중..." -ForegroundColor Yellow
try {
    docker exec project-mysql mysqldump -u ytuser -pytpw yt --single-transaction > "$BackupDir/mysql_backup_$Date.sql"
    Write-Host "✅ MySQL 백업 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL 백업 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "💾 MySQL 볼륨 백업 중..." -ForegroundColor Yellow
try {
    docker run --rm -v project2_mysql_data:/data -v "${PWD}/$BackupDir":/backup alpine tar czf "/backup/mysql_volume_$Date.tar.gz" /data
    Write-Host "✅ MySQL 볼륨 백업 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL 볼륨 백업 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🔴 Redis 데이터 백업 중..." -ForegroundColor Yellow
try {
    docker exec project-redis redis-cli BGSAVE
    Start-Sleep -Seconds 2
    docker run --rm -v project2_redis_data:/data -v "${PWD}/$BackupDir":/backup alpine tar czf "/backup/redis_volume_$Date.tar.gz" /data
    Write-Host "✅ Redis 백업 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis 백업 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🌪️ Airflow 메타데이터 백업 중..." -ForegroundColor Yellow
try {
    docker run --rm -v project2_airflow_db:/data -v "${PWD}/$BackupDir":/backup alpine tar czf "/backup/airflow_db_$Date.tar.gz" /data
    Write-Host "✅ Airflow 백업 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ Airflow 백업 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "📁 백업 파일 목록:" -ForegroundColor Cyan
Get-ChildItem $BackupDir | Where-Object { $_.Name -like "*$Date*" } | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  📄 $($_.Name) ($size MB)" -ForegroundColor White
}

Write-Host "🎉 백업 완료!" -ForegroundColor Green
