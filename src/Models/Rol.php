<?php
require_once 'Model.php';

class Rol extends Model {

    public function findAll() {
        $sql = "SELECT * FROM Rol";
        $result = $this->db->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function findById($id) {
        $sql = "SELECT * FROM Rol WHERE id_rol = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}