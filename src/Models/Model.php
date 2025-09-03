<?php
//MODELO BASE

class Model
{
    protected $db;

    public function __construct($pdo)
    {
        $this->db = $pdo;
    }
}
