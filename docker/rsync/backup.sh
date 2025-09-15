#!/bin/bash
logger "Backup iniciado"

SRC=/data/uploads
DEST=/backups/gestcoop-$(date +%F)
mkdir -p $DEST

rsync -av --delete $SRC/ $DEST/ | logger -t rsync


mysqldump -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME > /backups/db-$(date +%F).sql
logger "mysqldump completado"

logger "Backup completado"
