<?php
require_once __DIR__ . '/../db.php';

header('Content-Type: text/plain');

echo "Database Diagnostic Tool\n";
echo "Connected to: " . $db_name . "\n\n";

// 1. Table Counts
$tables = ['user_data', 'tutors', 'bookings', 'lessons', 'site_visits'];
foreach ($tables as $table) {
    $res = $conn->query("SELECT COUNT(*) as c FROM $table");
    if ($res) {
        $count = $res->fetch_assoc()['c'];
        echo "Table '$table': $count rows\n";
    } else {
        echo "Table '$table': Error - " . $conn->error . "\n";
    }
}

// 2. Role Distribution
echo "\nRole Distribution in user_data:\n";
$res = $conn->query("SELECT role, COUNT(*) as c FROM user_data GROUP BY role");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "Role '{$row['role']}': {$row['c']}\n";
    }
} else {
    echo "Error fetching roles: " . $conn->error . "\n";
}

// 3. Status Distribution in Bookings
echo "\nBooking Status Distribution:\n";
$res = $conn->query("SELECT status, COUNT(*) as c FROM bookings GROUP BY status");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        echo "Status '{$row['status']}': {$row['c']}\n";
    }
} else {
    echo "Error fetching booking statuses: " . $conn->error . "\n";
}
?>
