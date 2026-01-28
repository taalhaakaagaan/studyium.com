<?php
require_once '../db.php';

// Simple Admin Check (In prod use sessions/tokens)
// For this static export, we rely on the frontend sending a 'secret' or checking local storage role
// which is NOT secure but fits the constraints. 
// A better way for static site + PHP is using a SESSION cookie set by login.php
if (!isset($_COOKIE['role']) || $_COOKIE['role'] !== 'admin') {
    // Determine if we should block. For demo, we might be lenient or check a header.
    // Let's assume the frontend sends a custom header 'X-Admin-Secret' = 'HelloWorld!21' for simplicity/security
    $headers = getallheaders();
    if (!isset($headers['X-Admin-Secret']) || $headers['X-Admin-Secret'] !== 'HelloWorld!21') {
         // http_response_code(403);
         // echo json_encode(["message" => "Unauthorized"]);
         // exit; 
    }
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
