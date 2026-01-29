<?php
require_once '../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$teacherId = $_GET['teacherId'] ?? null;
$studentId = $_GET['studentId'] ?? null;

$query = "SELECT ws.*, s.name as student_name, g.name as group_name
          FROM weekly_schedules ws
          LEFT JOIN user_data s ON ws.student_id = s.id
          LEFT JOIN chat_groups g ON ws.group_id = g.id
          WHERE 1=1";
$params = [];
$types = "";

if ($teacherId) {
    $query .= " AND ws.teacher_id = ?";
    $params[] = $teacherId;
    $types .= "i";
}

if ($studentId) {
    $query .= " AND ws.student_id = ?";
    $params[] = $studentId;
    $types .= "i";
}

$query .= ' ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time';

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();
$schedule = [];
while ($row = $result->fetch_assoc()) {
    $schedule[] = $row;
}
echo json_encode(["success" => true, "schedule" => $schedule]);
?>
