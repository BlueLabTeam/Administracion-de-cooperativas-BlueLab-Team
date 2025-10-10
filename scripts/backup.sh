#!/bin/bash
#/scripts/backup.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_PATH="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_PATH/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró el archivo .env en: $ENV_FILE"
    exit 1
fi

DATE=$(date +%Y-%m-%d_%H-%M)
BACKUP_PATH="${BACKUP_PATH:-$PROJECT_PATH/storage/backups}"
FILE="$BACKUP_PATH/backup_$DATE.sql"

DB_HOST_SLAVE="${DB_HOST_SLAVE:-gestcoop_db}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_ROOT_PASSWORD}"
DB_NAME="${DB_NAME:-proyecto2025}"

pwd

export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "⏳ Realizando backup..."

mkdir -p "$BACKUP_PATH"

docker exec "$DB_HOST_SLAVE" \
mysqldump -uroot -p"$DB_ROOT_PASSWORD" --databases "$DB_NAME" > "$FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup completado: $BACKUP_FILE"
else
    echo "❌ Error al realizar el backup"
    exit 1
fi