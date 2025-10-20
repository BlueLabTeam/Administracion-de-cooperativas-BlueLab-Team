#!/bin/bash
# === Configuración general ===
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/storage/backups"
UPLOADS_DIR="$PROJECT_DIR/storage/uploads"
LOGS_DIR="$PROJECT_DIR/logs"

# === Configuración de base de datos ===
HOST="gestcoop_db_slave"
USER="root"
PASS="rootbluelab2025"
DB="proyecto2025"

# === Preparación de directorios ===
mkdir -p "$BACKUP_DIR" "$LOGS_DIR"

# === Variables de fecha ===
FECHA=$(date +%Y%m%d_%H%M)
SQL_FILE="$BACKUP_DIR/backup_${DB}_$FECHA.sql"
UPLOADS_FILE="$BACKUP_DIR/uploads_$FECHA.tar.gz"
LOG_FILE="$LOGS_DIR/backup.log"

echo "📦 Iniciando proceso de backup - $FECHA"

# === Backup de la base de datos ===
echo "🗄️  Respaldo de base de datos..."
docker exec "$HOST" mysqldump -u"$USER" -p"$PASS" "$DB" > "$SQL_FILE" 2>> "$LOG_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Base de datos respaldada correctamente: $SQL_FILE"
    echo "$(date '+%F %T') - DB backup OK" >> "$LOG_FILE"
else
    echo "❌ Error durante el backup de la base de datos"
    echo "$(date '+%F %T') - ERROR en DB $DB" >> "$LOG_FILE"
fi

# === Backup de los archivos subidos ===
if [ -d "$UPLOADS_DIR" ]; then
    echo "📂 Respaldo de archivos de usuario..."
    tar -czf "$UPLOADS_FILE" -C "$UPLOADS_DIR" . 2>> "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        echo "✅ Archivos de uploads respaldados: $UPLOADS_FILE"
        echo "$(date '+%F %T') - Uploads backup OK" >> "$LOG_FILE"
    else
        echo "❌ Error durante el backup de uploads"
        echo "$(date '+%F %T') - ERROR en uploads backup" >> "$LOG_FILE"
    fi
else
    echo "⚠️  Carpeta de uploads no encontrada, se omite."
    echo "$(date '+%F %T') - WARNING: uploads folder not found" >> "$LOG_FILE"
fi

echo "🎉 Backup completado."
echo "   Archivos guardados en: $BACKUP_DIR"

# 📤 Sincronizar con el servidor de respaldo remoto
REMOTE_USER="gestbackup"
REMOTE_HOST="localhost"
REMOTE_PORT="2222"
REMOTE_PATH="/data/backups"
KEY_PATH="$PROJECT_DIR/storage/backup-server/keys/backup_key"


echo "🔁 Sincronizando backups con el servidor remoto..."
rsync -av -e "ssh -p $REMOTE_PORT -i $KEY_PATH -o StrictHostKeyChecking=no" "$BACKUP_DIR/" $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH

if [ $? -eq 0 ]; then
  echo "✅ Sincronización completada con el servidor remoto."
else
  echo "❌ Error durante la sincronización remota."
fi