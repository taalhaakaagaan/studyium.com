<?php
require_once 'db.php';
header('Content-Type: application/json');

try {
    // Check if hourly_rate exists
    $res = $conn->query("SHOW COLUMNS FROM tutors LIKE 'hourly_rate'");
    if ($res->num_rows == 0) {
        $conn->query("ALTER TABLE tutors ADD COLUMN hourly_rate DECIMAL(10,2) DEFAULT 0.00");
        echo json_encode(["message" => "Added hourly_rate column"]);
    } else {
        echo json_encode(["message" => "hourly_rate column already exists"]);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
