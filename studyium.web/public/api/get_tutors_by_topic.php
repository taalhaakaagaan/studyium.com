<?php
require_once 'db.php';
header('Content-Type: application/json');

$topic_id = $_GET['topic_id'] ?? null;

if (!$topic_id) {
    echo json_encode([]);
    exit;
}

// Join tutors, user_data, and tutor_topics to get full tutor info
$sql = "SELECT t.*, u.name, u.surname 
        FROM tutors t 
        JOIN user_data u ON t.user_id = u.id 
        JOIN tutor_topics tt ON t.id = tt.tutor_id 
        WHERE tt.topic_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $topic_id);
$stmt->execute();
$result = $stmt->get_result();

$tutors = [];
while ($row = $result->fetch_assoc()) {
    $tutors[] = $row;
}

echo json_encode($tutors);
?>
