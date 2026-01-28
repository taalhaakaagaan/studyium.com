<?php
require_once 'db.php';

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $tutor_id = $data['tutor_id'] ?? 0;
    $student_id = $data['student_id'] ?? 0;
    $lesson_id = $data['lesson_id'] ?? 1; // Default to 1 (General) if not specified
    $booking_date = $data['booking_date'] ?? date('Y-m-d H:i:s');
    $note = $data['note'] ?? '';
    // Contact pref can be stored if we add a column, for now we just process the booking
    
    if (!$tutor_id || !$student_id) {
        http_response_code(400);
        echo json_encode(["message" => "Eksik bilgi."]);
        exit;
    }

    // Insert Booking
    $stmt = $conn->prepare("INSERT INTO bookings (tutor_id, student_id, lesson_id, booking_date, status) VALUES (?, ?, ?, ?, 'pending')");
    $stmt->bind_param("iiis", $tutor_id, $student_id, $lesson_id, $booking_date);
    
    if ($stmt->execute()) {
        // NOTIFICATION LOGIC REMOVED - MOVED TO ADMIN APPROVAL
        // The booking is saved as 'pending'. Admin will approve it later.
        
        echo json_encode(["message" => "Randevu talebiniz alındı. Yönetici onayının ardından eğitmene iletilecektir."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Veritabanı hatası: " . $stmt->error]);
    }
    
    $stmt->close();
}
$conn->close();
?>
