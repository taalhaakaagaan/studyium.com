<?php
require_once '../db.php';

$topicId = $_GET['topicId'] ?? 0;

if (!$topicId) {
    http_response_code(400);
    echo json_encode(["message" => "Topic ID required"]);
    exit;
}

// Get the note
$stmt = $conn->prepare("SELECT * FROM lecture_notes WHERE topic_id = ?");
$stmt->bind_param("i", $topicId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["success" => true, "note" => $result->fetch_assoc()]);
} else {
    // Return empty success so frontend knows no note exists yet
    echo json_encode(["success" => true, "note" => null]);
}
?>
