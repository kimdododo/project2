# 자동 백업 스케줄러
# Windows 작업 스케줄러에 등록하여 매일 실행

param(
    [string]$BackupDir = "C:\Users\User\project2\project2\backup",
    [int]$RetentionDays = 7  # 7일간 백업 보관
)

$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = "$BackupDir\backup_log_$(Get-Date -Format 'yyyyMMdd').log"

# 로그 함수
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry
    Add-Content -Path $LogFile -Value $logEntry
}

Write-Log "🔄 자동 백업 시작: $Date"

# 오래된 백업 파일 삭제
Write-Log "🗑️ 오래된 백업 파일 정리 중..."
Get-ChildItem $BackupDir -File | Where-Object { 
    $_.CreationTime -lt (Get-Date).AddDays(-$RetentionDays) 
} | ForEach-Object {
    Write-Log "삭제: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Docker 컨테이너 상태 확인
Write-Log "🐳 Docker 컨테이너 상태 확인 중..."
$containers = @("project-mysql", "project-redis", "project2-airflow-webserver-1")
foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "{{.Status}}"
    if ($status -notlike "*Up*") {
        Write-Log "❌ 경고: $container 컨테이너가 실행 중이 아닙니다"
    } else {
        Write-Log "✅ $container 정상 실행 중"
    }
}

# 백업 실행
Write-Log "📊 MySQL 데이터베이스 백업 중..."
try {
    docker exec project-mysql mysqldump -u ytuser -pytpw yt --single-transaction > "$BackupDir/mysql_backup_$Date.sql"
    $size = [math]::Round((Get-Item "$BackupDir/mysql_backup_$Date.sql").Length / 1MB, 2)
    Write-Log "✅ MySQL 백업 완료 ($size MB)"
} catch {
    Write-Log "❌ MySQL 백업 실패: $($_.Exception.Message)"
}

Write-Log "🎉 자동 백업 완료"
