<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Add price column to bookings table if it doesn't exist
    // Check if column exists first
    $check = $conn->query("SHOW COLUMNS FROM bookings LIKE 'price'");
    
    if ($check->num_rows == 0) {
        $sql = "ALTER TABLE bookings ADD COLUMN price DECIMAL(10,2) DEFAULT NULL AFTER status";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["message" => "Column 'price' added successfully to 'bookings' table."]);
        } else {
            throw new Exception("Error altering table: " . $conn->error);
        }
    } else {
        echo json_encode(["message" => "Column 'price' already exists."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Schema Update Error: " . $e->getMessage()]);
}

$conn->close();
?>
