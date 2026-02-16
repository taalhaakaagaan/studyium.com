<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? null;
$teacher_id = $data['teacher_id'] ?? $_SESSION['user_id']; // Default to self if teacher
// TODO: Verify if session user is actually the teacher or admin.
$student_id = $data['student_id'] ?? null;
$group_id = $data['group_id'] ?? null;
$day_of_week = $data['day_of_week'] ?? '';
$start_time = $data['start_time'] ?? '';
$end_time = $data['end_time'] ?? '';
$is_live = $data['is_live'] ?? 0;
$note = $data['note'] ?? '';

if (empty($day_of_week) || empty($start_time) || empty($end_time)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing fields"]);
    exit;
}

if ($id) {
    // Update
    $stmt = $conn->prepare("UPDATE weekly_schedules SET student_id=?, group_id=?, day_of_week=?, start_time=?, end_time=?, is_live=?, note=? WHERE id=? AND teacher_id=?");
    $stmt->bind_param("iisssisii", $student_id, $group_id, $day_of_week, $start_time, $end_time, $is_live, $note, $id, $teacher_id);
    $stmt->execute();
    echo json_encode(["success" => true, "id" => $id]);
} else {
    // Insert
    $stmt = $conn->prepare("INSERT INTO weekly_schedules (teacher_id, student_id, group_id, day_of_week, start_time, end_time, is_live, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iiisssis", $teacher_id, $student_id, $group_id, $day_of_week, $start_time, $end_time, $is_live, $note);
    $stmt->execute();
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
}
?>
