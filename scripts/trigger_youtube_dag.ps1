Param(
  [Parameter(Mandatory = $true)] [int]$QueryId,
  [Parameter(Mandatory = $true)] [string]$Keyword,
  [string]$AirflowBase = "http://localhost:8080",
  [string]$AirflowToken = $env:AIRFLOW_TOKEN
)

$headers = @{ "Content-Type" = "application/json" }
if ($AirflowToken) { $headers["Authorization"] = "Bearer $AirflowToken" }

$body = @{ conf = @{ query_id = $QueryId; keyword = $Keyword } } | ConvertTo-Json -Depth 5

Write-Host "[trigger] POST $AirflowBase/api/v1/dags/youtube_ingest/dagRuns"
$resp = Invoke-RestMethod -Method Post -Uri "$AirflowBase/api/v1/dags/youtube_ingest/dagRuns" -Headers $headers -Body $body
Write-Host "[trigger] Done" $resp.dag_run_id


