<?php
require_once 'db.php';
header('Content-Type: text/plain');

echo "=== DEBUGGING DATABASE RELATIONS ===\n\n";

// 1. List all Tutors (User ID -> Tutor ID)
echo "--- TUTORS TABLE ---\n";
$sql = "SELECT t.id as tutor_id, t.user_id, u.email, u.name, u.surname 
        FROM tutors t 
        JOIN user_data u ON t.user_id = u.id";
$res = $conn->query($sql);
$tutors = [];
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $tutors[$row['tutor_id']] = $row;
        echo "Tutor ID: {$row['tutor_id']} | User ID: {$row['user_id']} | Name: {$row['name']} {$row['surname']} | Email: {$row['email']}\n";
    }
} else {
    echo "Query failed: " . $conn->error . "\n";
}

echo "\n--- BOOKINGS TABLE (First 20) ---\n";
$sql = "SELECT id, tutor_id, student_id, booking_date FROM bookings LIMIT 20";
$res = $conn->query($sql);
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $tid = $row['tutor_id'];
        $linked_user = isset($tutors[$tid]) ? $tutors[$tid]['email'] : "UNKNOWN TUTOR ID";
        echo "Booking ID: {$row['id']} | Tutor ID: $tid ($linked_user) | Student ID: {$row['student_id']}\n";
    }
}

echo "\n--- CHECKING FOR ID MISMATCH ---\n";
// Check if any booking uses a User ID as Tutor ID (User ID that is also a Tutor)
$sql = "SELECT b.id, b.tutor_id, t.id as actual_tutor_id 
        FROM bookings b 
        JOIN tutors t ON b.tutor_id = t.user_id"; // Joining on USER_ID means booking used user_id instead of tutor_id
$res = $conn->query($sql);
if ($res && $res->num_rows > 0) {
    echo "WARNING: Found bookings where tutor_id matches a USER_ID instead of a TUTOR_ID:\n";
    while ($row = $res->fetch_assoc()) {
        echo "Booking {$row['id']} has tutor_id {$row['tutor_id']} (which is User ID for Tutor {$row['actual_tutor_id']})\n";
    }
} else {
    echo "No obvious User ID vs Tutor ID usage detected (bookings joined on tutors.user_id yielded 0 results).\n";
}
?>
