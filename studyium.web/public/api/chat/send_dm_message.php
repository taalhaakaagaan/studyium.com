<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$receiverId = $data['receiverId'] ?? 0;
$senderId = $_SESSION['user_id'];
$content = $data['content'] ?? '';
$type = $data['type'] ?? 'text';

if (!$receiverId || empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit;
}

if ($type === 'video') {
    echo json_encode(["success" => false, "message" => "Video not supported"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO chat_direct_messages (sender_id, receiver_id, content, message_type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $senderId, $receiverId, $content, $type);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}
?>
