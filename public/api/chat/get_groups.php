<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT g.*, MAX(m.created_at) as last_msg_time 
    FROM chat_groups g
    LEFT JOIN chat_group_messages m ON m.group_id = g.id
    GROUP BY g.id
    ORDER BY (MAX(m.created_at) IS NULL), MAX(m.created_at) DESC, g.name ASC
");
$stmt->execute();
$result = $stmt->get_result();
$groups = [];
while ($row = $result->fetch_assoc()) {
    $groups[] = $row;
}

echo json_encode(["success" => true, "groups" => $groups]);
?>
