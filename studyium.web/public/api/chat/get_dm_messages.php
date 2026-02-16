<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$contactId = $_GET['contactId'] ?? 0;
$userId = $_SESSION['user_id'];

if (!$contactId) {
    http_response_code(400);
    echo json_encode(["message" => "Missing contactId"]);
    exit;
}

$sql = "SELECT m.id, m.content, m.message_type, m.created_at, m.sender_id, u.name as sender_name
        FROM chat_direct_messages m
        LEFT JOIN user_data u ON m.sender_id = u.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiii", $userId, $contactId, $contactId, $userId);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}
// Mark as read? (Optional enhancement)

echo json_encode(["success" => true, "messages" => $messages]);
?>
