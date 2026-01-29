<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'];
    $category = $data['category'];

    $stmt = $conn->prepare("INSERT INTO lessons (name, category) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $category);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Ders eklendi"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Hata oluştu"]);
    }
}
?>
