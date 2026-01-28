<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "ID gerekli"]);
    exit;
}

// Delete booking links first? Usually CASCADE handles it, but let's be safe if no FK
$conn->query("DELETE FROM bookings WHERE tutor_id = $id");

$stmt = $conn->prepare("DELETE FROM tutors WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Eğitmen silindi"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Hata oluştu"]);
}
?>
