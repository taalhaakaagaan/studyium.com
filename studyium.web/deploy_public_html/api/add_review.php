<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$tutor_id = $data['tutor_id'] ?? 0;
$student_id = $data['student_id'] ?? 0;
$rating = $data['rating'] ?? 5;
$comment = $data['comment'] ?? '';

if (!$tutor_id || !$student_id || empty($comment)) {
    http_response_code(400);
    echo json_encode(["message" => "Eksik bilgi."]);
    exit;
}

// Security Check: Verify booking exists again to prevent abuse
$check_booking = $conn->query("SELECT id FROM bookings WHERE tutor_id = $tutor_id AND student_id = $student_id");
if ($check_booking->num_rows == 0) {
    http_response_code(403);
    echo json_encode(["message" => "Bu hocayı değerlendirmek için ders almış olmalısınız."]);
    exit;
}

// Insert Review
$stmt = $conn->prepare("INSERT INTO reviews (tutor_id, student_id, rating, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiis", $tutor_id, $student_id, $rating, $comment);

if($stmt->execute()) {
    // Update Tutor Average Rating
    $conn->query("UPDATE tutors SET 
                  rating = (SELECT AVG(rating) FROM reviews WHERE tutor_id = $tutor_id),
                  review_count = (SELECT COUNT(*) FROM reviews WHERE tutor_id = $tutor_id)
                  WHERE id = $tutor_id");
    
    echo json_encode(["message" => "Yorumunuz kaydedildi."]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Hata oluştu."]);
}
?>
