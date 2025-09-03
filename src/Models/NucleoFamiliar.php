<?php
require_once 'Model.php';

class NucleoFamiliar extends Model
{

    public function create($nombre, $direccion)
    {
        $sql = "INSERT INTO Nucleo_Familiar (nombre_nucleo, direccion) VALUES (?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("ss", $nombre, $direccion);
        return $stmt->execute();
    }

    public function findAll()
    {
        $sql = "SELECT * FROM Nucleo_Familiar";
        $result = $this->db->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
