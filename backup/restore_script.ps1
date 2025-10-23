# 데이터 복원 스크립트
# 실행: PowerShell에서 .\restore_script.ps1 -BackupFile "mysql_backup_20251024_030643.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$BackupDir = "backup"
)

Write-Host "🔄 데이터 복원 시작: $BackupFile" -ForegroundColor Green

if (!(Test-Path "$BackupDir/$BackupFile")) {
    Write-Host "❌ 백업 파일을 찾을 수 없습니다: $BackupDir/$BackupFile" -ForegroundColor Red
    exit 1
}

Write-Host "📊 MySQL 데이터베이스 복원 중..." -ForegroundColor Yellow
try {
    # MySQL 컨테이너가 실행 중인지 확인
    $mysqlStatus = docker ps --filter "name=project-mysql" --format "{{.Status}}"
    if ($mysqlStatus -notlike "*Up*") {
        Write-Host "❌ MySQL 컨테이너가 실행 중이 아닙니다. 먼저 Docker를 시작하세요." -ForegroundColor Red
        exit 1
    }
    
    # 데이터베이스 복원
    Get-Content "$BackupDir/$BackupFile" | docker exec -i project-mysql mysql -u ytuser -pytpw yt
    Write-Host "✅ MySQL 복원 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL 복원 실패: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 복원 완료!" -ForegroundColor Green
