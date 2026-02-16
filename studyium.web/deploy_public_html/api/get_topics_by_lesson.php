<?php
require_once 'db.php';
header('Content-Type: application/json');

$lesson_id = $_GET['lesson_id'] ?? null;

if (!$lesson_id) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM topics WHERE lesson_id = ? ORDER BY id ASC");
$stmt->bind_param("i", $lesson_id);
$stmt->execute();
$result = $stmt->get_result();

$topics = [];
while ($row = $result->fetch_assoc()) {
    $topics[] = $row;
}

echo json_encode($topics);
?>
