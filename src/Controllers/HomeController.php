<?php

namespace App\Controllers;

class HomeController{
    public function render(){
        require_once __DIR__ . '/../views/home.php';
    }
}