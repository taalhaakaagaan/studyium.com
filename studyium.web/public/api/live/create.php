<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$topic = $data['topic'] ?? '';
$link = $data['link'] ?? '';
$teacherId = $data['teacherId'] ?? $_SESSION['user_id'];
$participants = $data['participants'] ?? []; // JSON

if (empty($topic) || empty($link)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing fields"]);
    exit;
}

// Mark old sessions as inactive?
$update = $conn->prepare("UPDATE live_sessions SET is_active = 0 WHERE teacher_id = ?");
$update->bind_param("i", $teacherId);
$update->execute();

$stmt = $conn->prepare("INSERT INTO live_sessions (teacher_id, topic, participants_json, join_link, is_active) VALUES (?, ?, ?, ?, 1)");
$pJson = json_encode($participants);
$stmt->bind_param("isss", $teacherId, $topic, $pJson, $link);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id, "broadcast" => [
        "id" => $stmt->insert_id,
        "topic" => $topic,
        "link" => $link,
        "teacherId" => $teacherId
    ]]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error creating session"]);
}
?>
