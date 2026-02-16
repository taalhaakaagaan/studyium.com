<?php
require_once '../db.php';

session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
     http_response_code(403);
     echo json_encode(["message" => "Unauthorized"]);
     exit;
}

$stats = [];

// Total Users
$res = $conn->query("SELECT COUNT(*) as c FROM user_data WHERE role='user'");
$stats['total_users'] = (int)$res->fetch_assoc()['c'];

// Total Tutors
$res = $conn->query("SELECT COUNT(*) as c FROM tutors");
$stats['total_tutors'] = (int)$res->fetch_assoc()['c'];

// Total Lessons
$res = $conn->query("SELECT COUNT(*) as c FROM lessons");
$stats['total_lessons'] = (int)$res->fetch_assoc()['c'];

// Total Bookings
$res = $conn->query("SELECT COUNT(*) as c FROM bookings");
$stats['pending_bookings'] = (int)$res->fetch_assoc()['c']; // Keeping key 'pending_bookings' for compatibility, but it is total bookings now as per request

// Visitor Stats
// Check if table exists first (handling fresh install case)
$tableExists = $conn->query("SHOW TABLES LIKE 'site_visits'")->num_rows > 0;

if ($tableExists) {
    $today = date('Y-m-d');
    $res = $conn->query("SELECT COUNT(*) as c FROM site_visits WHERE visit_date = '$today'");
    $stats['daily_visitors'] = (int)$res->fetch_assoc()['c'];

    $currentMonth = date('Y-m');
    $res = $conn->query("SELECT COUNT(DISTINCT ip_address) as c FROM site_visits WHERE visit_date LIKE '$currentMonth%'");
    $stats['monthly_visitors'] = (int)$res->fetch_assoc()['c'];
} else {
    $stats['daily_visitors'] = 0;
    $stats['monthly_visitors'] = 0;
}

echo json_encode($stats);
?>
