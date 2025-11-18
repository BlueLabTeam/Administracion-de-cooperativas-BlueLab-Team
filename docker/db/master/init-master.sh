#!/bin/bash
set -e

echo "⏳ Creando usuario replicador..."

mysql -uroot -p"$DB_ROOT_PASSWORD" -e "
CREATE USER IF NOT EXISTS '${DB_REPLICATOR_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${DB_REPLICATOR_PASSWORD}';
GRANT REPLICATION SLAVE ON *.* TO '${DB_REPLICATOR_USER}'@'%';
FLUSH PRIVILEGES;
"

echo " Master inicializado correctamente."