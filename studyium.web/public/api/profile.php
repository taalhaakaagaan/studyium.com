<?php
require_once 'db.php';

// Check Auth (Simple)
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? 0;

if(!$user_id) {
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'get_appointments') {
    // Upcoming and Past Bookings
    $sql = "SELECT b.id, b.booking_date, b.status, 
                   tp.name as lesson_name, 
                   COALESCE(b.payment, tp.price) as lesson_price,
                   u.name as tutor_name, u.surname as tutor_surname,
                   t.account_name, t.iban
            FROM bookings b
            JOIN tutors t ON b.tutor_id = t.id
            JOIN user_data u ON t.user_id = u.id
            LEFT JOIN topics tp ON b.lesson_id = tp.id
            WHERE b.student_id = $user_id
            ORDER BY b.booking_date DESC";
    
    $result = $conn->query($sql);
    $bookings = [];
    while($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
    echo json_encode($bookings);

} else if ($action === 'get_messages') {
    $sql = "SELECT id, title, content, created_at as date, is_read FROM messages WHERE user_id = $user_id ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $messages = [];
    while($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }
    echo json_encode($messages);
}
?>
