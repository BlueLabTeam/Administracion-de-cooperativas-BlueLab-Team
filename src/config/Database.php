<?php

namespace App\config;

use PDO;
use PDOException;

class Database
{

    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {

            $host = "192.168.5.50";
            $db   = "agustin_fleitas";
            $user = "agustin.fleitas";
            $pass = "56751742";
            $charset = 'utf8mb4';


            
            $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
               
                self::$instance->exec("SET time_zone = '-03:00'");
                date_default_timezone_set('America/Montevideo');
                
            } catch (PDOException $e) {
                throw new PDOException($e->getMessage(), (int)$e->getCode());
            }
        }

        return self::$instance;
    }
}