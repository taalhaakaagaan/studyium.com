<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Modify bookings table to allow NULL booking_date
    $sql = "ALTER TABLE bookings MODIFY booking_date DATETIME NULL";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Table 'bookings' altered successfully to allow NULL dates."]);
    } else {
        throw new Exception("Error altering table: " . $conn->error);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Setup Error: " . $e->getMessage()]);
}

$conn->close();
?>
