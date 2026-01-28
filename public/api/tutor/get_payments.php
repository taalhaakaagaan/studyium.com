<?php
require_once '../db.php';

header('Content-Type: application/json');

$tutor_user_id = $_GET['user_id'] ?? 0; // The user_id of the tutor (logged in user)

if (!$tutor_user_id) {
    echo json_encode(['total_amount' => 0, 'transactions' => []]);
    exit;
}

// Find tutor_id from user_id
$stmt = $conn->prepare("SELECT id FROM tutors WHERE user_id = ?");
$stmt->bind_param("i", $tutor_user_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows == 0) {
    echo json_encode(['total_amount' => 0, 'transactions' => []]);
    exit;
}
$tutor_id = $res->fetch_assoc()['id'];
$stmt->close();

$total_earnings = 0;
$payments = [];

$sql = "SELECT b.id, b.payment as price, b.booking_date, b.created_at, 
               s.name as student_name, s.surname as student_surname
        FROM bookings b
        JOIN user_data s ON b.student_id = s.id
        WHERE b.tutor_id = $tutor_id AND b.status = 'approved' AND b.payment IS NOT NULL
        ORDER BY b.created_at DESC";

$result = $conn->query($sql);

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $payments[] = [
            'id' => $row['id'],
            'amount' => $row['price'],
            'date' => $row['booking_date'] ? $row['booking_date'] : $row['created_at'],
            'student' => $row['student_name'] . ' ' . $row['student_surname']
        ];
        $total_earnings += floatval($row['price']);
    }
}

echo json_encode([
    'total_amount' => $total_earnings,
    'transactions' => $payments
]);

$conn->close();
?>
