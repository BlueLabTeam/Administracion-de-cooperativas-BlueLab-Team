#!/bin/bash
set -e

echo "⏳ Esperando que el Master esté disponible..."
until mysql -h gestcoop_db -uroot -p${DB_ROOT_PASSWORD} -e "SELECT 1" &> /dev/null ; do
sleep 2
done
echo "✅ Master disponible, configurando Slave..."

# Obtener archivo y posición del Master
MASTER_STATUS=$(mysql -h gestcoop_db -uroot -p${DB_ROOT_PASSWORD} -e "SHOW MASTER STATUS\G")
FILE=$(echo "$MASTER_STATUS" | grep File: | awk '{print $2}')
POSITION=$(echo "$MASTER_STATUS" | grep Position: | awk '{print $2}')

# Configurar la replicación
mysql -uroot -p${DB_ROOT_PASSWORD} -e "
CHANGE REPLICATION SOURCE TO
SOURCE_HOST='gestcoop_db',
SOURCE_USER='replicador',
SOURCE_PASSWORD='replicapass',
SOURCE_LOG_FILE='$FILE',
SOURCE_LOG_POS=$POSITION;
START REPLICA;
"

echo "✅ Slave configurado correctamente."
