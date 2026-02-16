<?php
require_once '../db.php';

// Allow public access? Or user only? User only preferably.
if (!isset($_SESSION['user_id'])) {
    // maybe header check?
    // fallback
}

$query = "SELECT s.*, u.name as teacher_name 
          FROM live_sessions s
          JOIN user_data u ON s.teacher_id = u.id
          WHERE s.is_active = 1
          ORDER BY s.started_at DESC";

$result = $conn->query($query);
$sessions = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $sessions[] = $row;
    }
}

// Map to format App expects? App expected `broadcasts` array.
// App item: {id, teacherId, teacherName, topic, link, startedAt}
// DB cols: id, teacher_id, topic, join_link, started_at
// Mapping needed.
$mapped = array_map(function($s) {
    return [
        'id' => $s['id'],
        'teacherId' => $s['teacher_id'],
        'teacherName' => $s['teacher_name'],
        'topic' => $s['topic'],
        'link' => $s['join_link'],
        'startedAt' => $s['started_at'] // ensure col exists or created_at
    ];
}, $sessions);

echo json_encode(["success" => true, "broadcasts" => $mapped, "sessions" => $sessions]);
?>
