<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$response = [];

try {
    // 1. Update 'bookings' table
    $check_price = $conn->query("SHOW COLUMNS FROM bookings LIKE 'payment'");
    if ($check_price->num_rows == 0) {
        $sql = "ALTER TABLE bookings ADD COLUMN payment DECIMAL(10,2) DEFAULT NULL AFTER status";
        if ($conn->query($sql) === TRUE) {
            $response[] = "Column 'payment' added to 'bookings'.";
        } else {
             $response[] = "Error adding 'payment': " . $conn->error;
        }
    } else {
        $response[] = "Column 'payment' already exists in 'bookings'.";
    }

    $check_note = $conn->query("SHOW COLUMNS FROM bookings LIKE 'note'");
    if ($check_note->num_rows == 0) {
        $sql = "ALTER TABLE bookings ADD COLUMN note TEXT AFTER payment";
        if ($conn->query($sql) === TRUE) {
            $response[] = "Column 'note' added to 'bookings'.";
        } else {
             $response[] = "Error adding 'note': " . $conn->error;
        }
    } else {
         $response[] = "Column 'note' already exists in 'bookings'.";
    }

    // 2. Create 'site_visits' table
    $sql_visits = "CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        visit_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_daily_visit (ip_address, visit_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql_visits) === TRUE) {
        $response[] = "Table 'site_visits' synced successfully.";
    } else {
        $response[] = "Error creating 'site_visits': " . $conn->error;
    }

    echo json_encode(["status" => "success", "messages" => $response]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Patch Error: " . $e->getMessage()]);
}

$conn->close();
?>
