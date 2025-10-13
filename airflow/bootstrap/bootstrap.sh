#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] Starting Airflow bootstrap..."

# Variables
YOUTUBE_API_KEY_VAL="${YOUTUBE_API_KEY:-}"

# MySQL connection parameters (fallback to backend defaults)
MYSQL_HOST_VAL="${MYSQL_HOST:-host.docker.internal}"
MYSQL_PORT_VAL="${MYSQL_PORT:-3307}"
MYSQL_DB_VAL="${MYSQL_DB:-yt}"
MYSQL_USER_VAL="${MYSQL_USER:-ytuser}"
MYSQL_PW_VAL="${MYSQL_PW:-ytpw}"

if [ -n "$YOUTUBE_API_KEY_VAL" ]; then
  echo "[bootstrap] Setting Airflow Variable: YOUTUBE_API_KEY"
  airflow variables set YOUTUBE_API_KEY "$YOUTUBE_API_KEY_VAL" || true
else
  echo "[bootstrap] WARNING: YOUTUBE_API_KEY not provided; skipping variable set"
fi

MYSQL_URI="mysql+pymysql://${MYSQL_USER_VAL}:${MYSQL_PW_VAL}@${MYSQL_HOST_VAL}:${MYSQL_PORT_VAL}/${MYSQL_DB_VAL}"
echo "[bootstrap] Adding/Updating Airflow Connection: mysql_app -> ${MYSQL_URI}"
airflow connections delete mysql_app >/dev/null 2>&1 || true
airflow connections add mysql_app --conn-uri "$MYSQL_URI" || true

echo "[bootstrap] Done."


