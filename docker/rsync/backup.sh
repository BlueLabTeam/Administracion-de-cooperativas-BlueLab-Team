#!/bin/bash
# Carpeta origen
SRC=/data
# Carpeta destino (puede ser otro volumen montado)
DEST=/backup/gestcoop-$(date +%F)
mkdir -p $DEST
rsync -av --delete $SRC/ $DEST/

mysqldump -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME > /backup/db-$(date +%F).sql
