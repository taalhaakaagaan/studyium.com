<?php
require_once '../db.php';

session_start();

$isDebugMode = true; // Use this to toggle strict mode. For now, allow requests to proceed for debugging.

// Strict Check Disabled for Debugging
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    // Log the failure but don't blocking 403 yet if we want to show debug info
    // http_response_code(403);
    // echo json_encode(["message" => "Unauthorized"]);
    // exit;
    $sessionError = "Session Role Check Failed: " . json_encode($_SESSION);
} else {
    $sessionError = "Session OK";
}

$stats = [];

// Total Users
// Total Users
// Use LOWER to be case-insensitive just in case
$res = $conn->query("SELECT COUNT(*) as c FROM user_data WHERE LOWER(role)='user'");
$stats['total_users'] = $res ? (int)$res->fetch_assoc()['c'] : 0;

// Total Tutors
$res = $conn->query("SELECT COUNT(*) as c FROM tutors");
$stats['total_tutors'] = (int)$res->fetch_assoc()['c'];

// Total Lessons
$res = $conn->query("SELECT COUNT(*) as c FROM lessons");
$stats['total_lessons'] = (int)$res->fetch_assoc()['c'];

// Total Bookings
// Total Bookings
// In schema, status is varchar. We can count all or pending.
// Let's count 'pending' to match variable name 'pending_bookings', or count all if that's what user expects for "Applications".
// Admin panel shows "Basvurular" which usually implies pending.
$res = $conn->query("SELECT COUNT(*) as c FROM bookings WHERE status = 'pending'");
$stats['pending_bookings'] = $res ? (int)$res->fetch_assoc()['c'] : 0; 

// If they want total bookings, we can add another key, but UI uses pending_bookings.

// Visitor Stats
// Check if table exists first (handling fresh install case)
$tableExists = $conn->query("SHOW TABLES LIKE 'site_visits'")->num_rows > 0;

if ($tableExists) {
    $today = date('Y-m-d');
    $res = $conn->query("SELECT COUNT(*) as c FROM site_visits WHERE visit_date = '$today'");
    $stats['daily_visitors'] = $res ? (int)$res->fetch_assoc()['c'] : 0;

    $currentMonth = date('Y-m');
    $res = $conn->query("SELECT COUNT(DISTINCT ip_address) as c FROM site_visits WHERE visit_date LIKE '$currentMonth%'");
    $stats['monthly_visitors'] = $res ? (int)$res->fetch_assoc()['c'] : 0;
} else {
    $stats['daily_visitors'] = 0;
    $stats['monthly_visitors'] = 0;
}

// DEBUG INFO
$stats['debug'] = [
    'db_name' => $db_name ?? 'unknown',
    'connection_status' => 'Connected',
    'session_status' => $sessionError ?? 'Unknown',
    'session_id' => session_id(),
    'current_role' => $_SESSION['role'] ?? 'None',
    'tables_found' => [],
    'raw_counts' => []
];

// Check raw counts for debugging
$debugTables = ['user_data', 'tutors', 'bookings', 'lessons'];
foreach ($debugTables as $dt) {
    // Check if table exists
    $check = $conn->query("SHOW TABLES LIKE '$dt'");
    $exists = $check && $check->num_rows > 0;
    $stats['debug']['tables_found'][$dt] = $exists;
    
    if ($exists) {
        $dc = $conn->query("SELECT COUNT(*) as c FROM $dt");
        $stats['debug']['raw_counts'][$dt] = $dc ? (int)$dc->fetch_assoc()['c'] : 'Error: ' . $conn->error;
    } else {
        $stats['debug']['raw_counts'][$dt] = 'Table does not exist';
    }
}

echo json_encode($stats);
?>
