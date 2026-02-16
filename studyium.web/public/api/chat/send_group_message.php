<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$groupId = $data['groupId'] ?? 0;
// We use session user_id as sender, not the one from payload! Security fix.
$senderId = $_SESSION['user_id']; 
$content = $data['content'] ?? '';
$type = $data['type'] ?? 'text';

if (!$groupId || empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing data"]);
    exit;
}

if ($type === 'video') {
    echo json_encode(["success" => false, "message" => "Video not supported"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO chat_group_messages (group_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $groupId, $senderId, $content, $type);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}
?>
