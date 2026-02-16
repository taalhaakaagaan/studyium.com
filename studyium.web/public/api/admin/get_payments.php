<?php
require_once '../db.php';

header('Content-Type: application/json');

// Admin check should be here

$total_revenue = 0;
$payments = [];

$sql = "SELECT b.id, b.payment as price, b.booking_date, b.created_at, 
               t.name as tutor_name, t.surname as tutor_surname, 
               s.name as student_name, s.surname as student_surname
        FROM bookings b
        JOIN user_data t ON b.tutor_id = t.id -- t is actually tutor's user_id, wait. bookings.tutor_id links to tutors.id
        -- Correct join: bookings.tutor_id -> tutors.id -> tutors.user_id -> user_data
        JOIN tutors tu ON b.tutor_id = tu.id
        JOIN user_data tup ON tu.user_id = tup.id
        JOIN user_data s ON b.student_id = s.id
        WHERE b.status = 'approved' AND b.payment IS NOT NULL";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $payments[] = [
            'id' => $row['id'],
            'amount' => $row['price'],
            'date' => $row['booking_date'] ? $row['booking_date'] : $row['created_at'],
            'tutor' => $row['tutor_name'] . ' ' . $row['tutor_surname'],
            'student' => $row['student_name'] . ' ' . $row['student_surname']
        ];
        $total_revenue += floatval($row['price']);
    }
}

echo json_encode([
    'total_amount' => $total_revenue,
    'transactions' => $payments
]);

$conn->close();
?>
