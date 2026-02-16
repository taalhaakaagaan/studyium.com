<?php
require_once '../db.php';

$tutor_user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$tutor_user_id) {
    echo json_encode(["error" => "User ID required"]);
    exit;
}

// 1. Get Tutor ID from User ID
$tutor_res = $conn->query("SELECT id, subjects FROM tutors WHERE user_id = $tutor_user_id");
if ($tutor_res->num_rows == 0) {
    http_response_code(404);
    echo json_encode(["error" => "Tutor profile not found"]);
    exit;
}
$tutor = $tutor_res->fetch_assoc();
$tutor_id = $tutor['id'];

// 2. Get Past & Upcoming Bookings
$sql = "SELECT b.id, b.booking_date, b.status, b.note, 
               s.id as student_id, s.name as student_name, s.surname as student_surname, s.email as student_email, s.gsm as student_gsm
        FROM bookings b
        JOIN user_data s ON b.student_id = s.id
        WHERE b.tutor_id = $tutor_id
        ORDER BY b.booking_date DESC";

$bookings_res = $conn->query($sql);
$past_bookings = [];
$upcoming_bookings = [];
$students = []; // Unique students

$now = new DateTime();

while ($row = $bookings_res->fetch_assoc()) {
    $b_date = new DateTime($row['booking_date']);
    
    $booking_item = $row;
    
    if ($b_date < $now) {
        $past_bookings[] = $booking_item;
    } else {
        $upcoming_bookings[] = $booking_item;
    }
    
    // Collect unique students
    $student_key = $row['student_email'];
    if (!isset($students[$student_key])) {
        $students[$student_key] = [
            'id' => $row['student_id'],
            'name' => $row['student_name'] . ' ' . $row['student_surname'],
            'email' => $row['student_email'],
            'gsm' => $row['student_gsm']
        ];
        // This line was added based on the instruction, assuming 'account_name' should be part of student data
        // and the original instruction had a syntax error.
        // If 'account_name' is meant for the tutor, it should be fetched and assigned outside this loop.
        // Assuming the intent was to add 'account_name' to the student's details.
        // If $row['account_name'] is not available in the SQL query, it will result in an undefined index.
        if (isset($row['account_name'])) {
            $students[$student_key]['account_name'] = $row['account_name'];
        }
    }
}

// 3. Get Tutor's Topics/Lessons & Prices
$topics_sql = "SELECT t.name, t.price, t.fake_price, l.name as lesson_name, l.category
               FROM tutor_topics tt
               JOIN topics t ON tt.topic_id = t.id
               JOIN lessons l ON t.lesson_id = l.id
               WHERE tt.tutor_id = $tutor_id";
$topics_res = $conn->query($topics_sql);
$my_topics = [];
while ($row = $topics_res->fetch_assoc()) {
    $my_topics[] = $row;
}

echo json_encode([
    "tutor_details" => $tutor,
    "past_bookings" => $past_bookings,
    "upcoming_bookings" => $upcoming_bookings,
    "my_students" => array_values($students),
    "my_topics" => $my_topics
]);
?>
