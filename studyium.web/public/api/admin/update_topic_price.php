<?php
require_once '../db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $topic_id = $data['id'];
    $price = $data['price'];
    $fake_price = isset($data['fake_price']) && $data['fake_price'] !== '' ? $data['fake_price'] : NULL;

    if (!$topic_id) {
        http_response_code(400);
        echo json_encode(["message" => "Topic ID required"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE topics SET price = ?, fake_price = ? WHERE id = ?");
    $stmt->bind_param("ddi", $price, $fake_price, $topic_id);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Fiyat güncellendi"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Hata oluştu: " . $conn->error]);
    }
}
?>
