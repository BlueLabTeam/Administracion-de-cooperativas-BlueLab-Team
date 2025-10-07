CREATE DATABASE IF NOT EXISTS testdb;

CREATE USER 'replicador'@'%' IDENTIFIED WITH mysql_native_password BY 'replicapass';
GRANT REPLICATION SLAVE ON *.* TO 'replicador'@'%';
FLUSH PRIVILEGES;