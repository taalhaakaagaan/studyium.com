<?php
require_once '../db.php';

// Check if tables exist
$conn->query("CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT,
    student_id INT,
    lesson_id INT,
    booking_date DATETIME,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$sql = "
    SELECT 
        b.id, 
        b.booking_date, 
        b.status, 
        b.created_at,
        tu.name as tutor_name, 
        tu.surname as tutor_surname,
        tu.email as tutor_email,
        u.name as student_name, 
        u.surname as student_surname,
        u.email as student_email,
        u.gsm as student_phone
    FROM bookings b
    LEFT JOIN tutors t ON b.tutor_id = t.id
    LEFT JOIN user_data tu ON t.user_id = tu.id
    LEFT JOIN user_data u ON b.student_id = u.id
    ORDER BY b.created_at DESC
";

$result = $conn->query($sql);
$bookings = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $bookings[] = $row;
    }
}

echo json_encode($bookings);
?>
