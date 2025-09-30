<?php
// Esto no es una muestra final del producto, esta sujeto a cambios.
namespace App\controllers;

class dashboardAdminController
{
    public function facturacion()
    {
        require __DIR__ . '/../Views/pageAdmin/facturacion.php';
    }
    public function inicio()
    {
        require __DIR__ . '/../Views/pageAdmin/inicio.php';
    }
    public function inventario()
    {
        require __DIR__ . '/../Views/pageAdmin/inventario.php';
    }
    public function notificaciones()
    {
        require __DIR__ . '/../Views/pageAdmin/notificaciones.php';
    }
    public function nucleo()
    {
        require __DIR__ . '/../Views/pageAdmin/nucleo.php';
    }
    public function reportes()
    {
        require __DIR__ . '/../Views/pageAdmin/reportes.php';
    }
    public function tareas()
    {
        require __DIR__ . '/../Views/pageAdmin/tareas.php';
    }
    public function usuarios()
    {
        require __DIR__ . '/../Views/pageAdmin/usuarios.php';
    }
    public function viviendas()
    {
        require __DIR__ . '/../Views/pageAdmin/viviendas.php';
    }
}
