<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "ID gerekli"]);
    exit;
}

// Allowed fields for update
$allowed_fields = ['bio', 'subjects', 'account_name', 'iban', 'active', 'hourly_rate', 'course_details'];
$updates = [];
$types = "";
$params = [];

foreach ($allowed_fields as $field) {
    if (isset($data[$field])) {
        $updates[] = "$field = ?";
        $params[] = $data[$field];
        // Assume all are strings for simplicity, except invalid ones.
        // bio, subjects, account, iban, active, course_details -> string (s)
        // hourly_rate -> usually string or decimal, treated as s is safe for bind
        $types .= "s";
    }
}

if (!empty($updates)) {
    $sql = "UPDATE tutors SET " . implode(", ", $updates) . " WHERE id = ?";
    $params[] = $id;
    $types .= "i";

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param($types, ...$params);
        if (!$stmt->execute()) {
             http_response_code(500);
             echo json_encode(["message" => "Update Error: " . $stmt->error]);
             exit;
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Prepare Error: " . $conn->error]);
        exit;
    }
}

// Handle Topics Update
// ONLY if 'topic_ids' is explicitly provided in the request
if (array_key_exists('topic_ids', $data) && is_array($data['topic_ids'])) {
    $topic_ids = $data['topic_ids'];
    
    // Clear existing topics
    $conn->query("DELETE FROM tutor_topics WHERE tutor_id = $id");
    
    // Prepare insert statement
    $t_stmt = $conn->prepare("INSERT INTO tutor_topics (tutor_id, topic_id) VALUES (?, ?)");
    
    if ($t_stmt) {
        $current_tid = 0; // Container for binding
        $t_stmt->bind_param("ii", $id, $current_tid);
        
        foreach ($topic_ids as $tid) {
            $current_tid = $tid;
            if (!$t_stmt->execute()) {
                error_log("Topic Insert Error (Tutor: $id, Topic: $tid): " . $t_stmt->error);
            }
        }
    }
}

echo json_encode(["message" => "Eğitmen güncellendi"]);
?>
