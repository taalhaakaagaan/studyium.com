<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$userId = $_SESSION['user_id'];
$search = $_GET['search'] ?? '';

// Fetch users with last message and unread count
// LEFT JOIN ensures we find users we haven't chatted with (recents first)
$query = "
    SELECT 
        u.id, u.name, u.email, u.role,
        MAX(m.created_at) as last_msg_time,
        (SELECT COUNT(*) FROM chat_direct_messages 
         WHERE sender_id = m.sender_id AND receiver_id = ? AND is_read = 0 AND sender_id = u.id) as unread_count_raw,
         (SELECT COUNT(*) FROM chat_direct_messages 
         WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
    FROM user_data u
    LEFT JOIN chat_direct_messages m 
        ON (m.sender_id = u.id AND m.receiver_id = ?) 
        OR (m.receiver_id = u.id AND m.sender_id = ?)
    WHERE 1=1
";

$params = [$userId, $userId, $userId, $userId];
$types = "iiii";

if ($search) {
    $query .= " AND (u.name LIKE ? OR u.email LIKE ?)";
    $searchTerm = "%$search%";
    $params[] = $searchTerm;
    $params[] = $searchTerm;
    $types .= "ss";
}

// Group by user to aggregate messages
$query .= " GROUP BY u.id";

// Sort by last message (desc), then name
// Users with messages come first (IS NOT NULL)
$query .= " ORDER BY (MAX(m.created_at) IS NULL), MAX(m.created_at) DESC, u.name ASC LIMIT 50";

$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);

$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode(["success" => true, "contacts" => $contacts]);
?>
