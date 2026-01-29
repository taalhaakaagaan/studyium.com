<?php
require_once '../db.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
// Use empty string as default, NOT null
$bio = $data['bio'] ?? '';
$subjects = $data['subjects'] ?? '';
$hourly_rate = $data['hourly_rate'] ?? '';
$course_details = $data['course_details'] ?? '';

if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "ID gerekli"]);
    exit;
}

// Schema checks removed as per strict schema requirements.

$account_name = $data['account_name'] ?? '';
$iban = $data['iban'] ?? '';

$stmt = $conn->prepare("UPDATE tutors SET bio = ?, subjects = ?, account_name = ?, iban = ? WHERE id = ?");
$stmt->bind_param("ssssi", $bio, $subjects, $account_name, $iban, $id);

if ($stmt->execute()) {
    // Handle Topics Update
    if (isset($data['topic_ids']) && is_array($data['topic_ids'])) {
        $topic_ids = $data['topic_ids'];
        
        // Clear existing topics
        $conn->query("DELETE FROM tutor_topics WHERE tutor_id = $id");
        
        // Prepare insert statement
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
        } else {
             error_log("Prepare Tutor Topics Error: " . $conn->error);
        }
    }

    echo json_encode(["message" => "Eğitmen güncellendi"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Hata oluştu: " . $conn->error]);
}
?>
