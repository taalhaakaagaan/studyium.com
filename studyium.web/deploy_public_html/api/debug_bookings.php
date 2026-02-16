<?php
require_once 'db.php';

// Check for admin role or shared secret if possible, but for debugging we'll just output text
header('Content-Type: text/plain');

echo "--- BOOKINGS TABLE DUMP ---\n";
$sql = "SELECT * FROM bookings ORDER BY id DESC LIMIT 50";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        print_r($row);
        echo "----------------\n";
    }
} else {
    echo "No bookings found or query error: " . $conn->error . "\n";
}

echo "\n--- TOPICS TABLE DUMP ---\n";
$sql = "SELECT * FROM topics LIMIT 20";
$result = $conn->query($sql);
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        print_r($row);
    }
} else {
    echo "No topics found.\n";
}

$conn->close();
?>
