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
    
    // Expecting $data['bookings'] to be an array of booking objects
    if (!isset($data['bookings']) || !is_array($data['bookings'])) {
        http_response_code(400);
        echo json_encode(["message" => "Geçersiz veri formatı. 'bookings' listesi bekleniyor."]);
        exit;
    }

    $bookings = $data['bookings'];
    if (count($bookings) === 0) {
        http_response_code(400);
        echo json_encode(["message" => "Sepet boş."]);
        exit;
    }

    $successCount = 0;
    $errors = [];

    // Prepare statement once (Added payment column)
    $stmt = $conn->prepare("INSERT INTO bookings (tutor_id, student_id, lesson_id, booking_date, payment, status) VALUES (?, ?, ?, ?, ?, 'pending')");

    foreach ($bookings as $index => $booking) {
        $tutor_id = $booking['tutor_id'] ?? 0;
        $student_id = $booking['student_id'] ?? 0;
        $lesson_id = $booking['lesson_id'] ?? 1; // Default to 1 (General)
        $booking_date = $booking['booking_date'] ?? null;
        $note = $booking['note'] ?? '';

        if (!$tutor_id || !$student_id) {
            $errors[] = "Item #$index: Eksik bilgi (tutor veya student).";
            continue;
        }

        // Handle null date (use NULL in SQL if empty)
        if (empty($booking_date)) {
             $booking_date = null;
        }

        // Price handling - Save to 'payment' column as requested
        $payment = $booking['price'] ?? null;

        $stmt->bind_param("iiisd", $tutor_id, $student_id, $lesson_id, $booking_date, $payment);
        
        if ($stmt->execute()) {
            $successCount++;
        } else {
            $errors[] = "Item #$index: Veritabanı hatası: " . $stmt->error;
        }
    }

    $stmt->close();

    if ($successCount > 0) {
        // Check if user is 'visitor' and promote to 'student'
        // We assume all bookings in the batch belong to the same student (student_id of first item)
        // Or we check the student_id of the last successful one.
        // Safety: ensure distinct student_ids in batch shouldn't happen usually but handled properly.
        
        $bookingStudentIds = array_unique(array_column($bookings, 'student_id'));
        if (!empty($bookingStudentIds)) {
            $studentIdToPromote = $bookingStudentIds[0]; // Take the first one (usually logged in user)
            
            $checkRole = $conn->prepare("SELECT role FROM user_data WHERE id = ?");
            $checkRole->bind_param("i", $studentIdToPromote);
            $checkRole->execute();
            $resRole = $checkRole->get_result();
            if ($resRole->num_rows > 0) {
                $row = $resRole->fetch_assoc();
                if ($row['role'] === 'visitor') {
                    $promote = $conn->prepare("UPDATE user_data SET role = 'student' WHERE id = ?");
                    $promote->bind_param("i", $studentIdToPromote);
                    $promote->execute();
                }
            }
        }

        echo json_encode([
            "success" => true,
            "message" => "$successCount adet ders başarıyla rezerve edildi.",
            "errors" => $errors
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Hiçbir ders rezerve edilemedi.",
            "errors" => $errors
        ]);
    }
}
$conn->close();
?>
