#!/bin/bash

# === Configuración general ===
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/storage/backups"
UPLOADS_DIR="$PROJECT_DIR/storage/uploads"
LOGS_DIR="$PROJECT_DIR/logs"

# === Configuración de base de datos (local) ===
HOST="gestcoop_db"
USER="root"
PASS="rootbluelab2025"
DB="proyecto2025"

# === Configuración del servidor de backup remoto ===
REMOTE_USER="gestbackup"
REMOTE_HOST="localhost"
REMOTE_PORT="2222"
REMOTE_PATH="/data/backups"
KEY_PATH="$PROJECT_DIR/storage/backup-server/keys/backup_key"

# === Preparación de directorios ===
mkdir -p "$BACKUP_DIR" "$UPLOADS_DIR" "$LOGS_DIR"

# === Variables de fecha ===
FECHA=$(date +%Y%m%d_%H%M)
LOG_FILE="$LOGS_DIR/restore.log"

echo "♻️  Iniciando proceso de restauración - $FECHA"
echo "$(date '+%F %T') - START RESTORE" >> "$LOG_FILE"

# ----------------------------------------------------------
# 1) Obtener el último backup remoto
# ----------------------------------------------------------
echo "📡 Buscando último backup en el servidor remoto..."

LAST_BACKUP=$(ssh -p "$REMOTE_PORT" -i "$KEY_PATH" -o StrictHostKeyChecking=no \
    "$REMOTE_USER@$REMOTE_HOST" "ls -t $REMOTE_PATH/backup_${DB}_*.sql 2>/dev/null | head -n 1")

LAST_UPLOADS=$(ssh -p "$REMOTE_PORT" -i "$KEY_PATH" -o StrictHostKeyChecking=no \
    "$REMOTE_USER@$REMOTE_HOST" "ls -t $REMOTE_PATH/uploads_*.tar.gz 2>/dev/null | head -n 1")

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ No se encontró backup SQL remoto."
    echo "$(date '+%F %T') - ERROR: no remote SQL backup found" >> "$LOG_FILE"
    exit 1
fi

echo "📄 Último backup SQL encontrado: $LAST_BACKUP"

if [ -z "$LAST_UPLOADS" ]; then
    echo "⚠️  No se encontró backup de uploads remoto."
else
    echo "📦 Último backup de uploads encontrado: $LAST_UPLOADS"
fi

# ----------------------------------------------------------
# 2) Descargar archivos al servidor local
# ----------------------------------------------------------
echo "⬇️  Descargando backups..."

scp -P "$REMOTE_PORT" -i "$KEY_PATH" -o StrictHostKeyChecking=no \
    "$REMOTE_USER@$REMOTE_HOST:$LAST_BACKUP" "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1

SQL_FILE="$BACKUP_DIR/$(basename "$LAST_BACKUP")"

if [ -n "$LAST_UPLOADS" ]; then
    scp -P "$REMOTE_PORT" -i "$KEY_PATH" -o StrictHostKeyChecking=no \
        "$REMOTE_USER@$REMOTE_HOST:$LAST_UPLOADS" "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1
    UPLOADS_FILE="$BACKUP_DIR/$(basename "$LAST_UPLOADS")"
fi

echo "📁 Archivos descargados correctamente."

# ----------------------------------------------------------
# 3) Restaurar base de datos
# ----------------------------------------------------------
echo "🧩 Restaurando base de datos '$DB'..."

docker exec "$HOST" mysql -u"$USER" -p"$PASS" -e "DROP DATABASE IF EXISTS $DB;"
docker exec "$HOST" mysql -u"$USER" -p"$PASS" -e "CREATE DATABASE $DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

docker exec -i "$HOST" mysql -u"$USER" -p"$PASS" "$DB" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos restaurada correctamente."
    echo "$(date '+%F %T') - DB restore OK" >> "$LOG_FILE"
else
    echo "❌ Error al restaurar la base de datos."
    echo "$(date '+%F %T') - ERROR restoring DB" >> "$LOG_FILE"
    exit 1
fi

# ----------------------------------------------------------
# 4) Restaurar uploads (si existe)
# ----------------------------------------------------------
if [ -n "$UPLOADS_FILE" ]; then
    echo "📂 Restaurando uploads..."

    rm -rf "$UPLOADS_DIR"/*
    tar -xzf "$UPLOADS_FILE" -C "$UPLOADS_DIR"

    if [ $? -eq 0 ]; then
        echo "✅ Uploads restaurados correctamente."
        echo "$(date '+%F %T') - Uploads restore OK" >> "$LOG_FILE"
    else
        echo "❌ Error al restaurar uploads."
        echo "$(date '+%F %T') - ERROR restoring uploads" >> "$LOG_FILE"
    fi
else
    echo "⚠️  No hay backup de uploads para restaurar."
fi

echo "🎉 Restauración completa."
echo "$(date '+%F %T') - RESTORE FINISHED" >> "$LOG_FILE"
