<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$groupId = $_GET['groupId'] ?? 0;
if (!$groupId) {
    http_response_code(400);
    echo json_encode(["message" => "Missing groupId"]);
    exit;
}

$sql = "SELECT m.id, m.content, m.message_type, m.created_at,
        u.name as sender_name, u.email as sender_email, u.role as sender_role, m.sender_id
        FROM chat_group_messages m
        JOIN user_data u ON m.sender_id = u.id
        WHERE m.group_id = ?
        ORDER BY m.created_at ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $groupId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode(["success" => true, "messages" => $messages]);
?>
