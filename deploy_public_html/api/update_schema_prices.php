<?php
require_once 'db.php';

header('Content-Type: application/json');

try {
    // Add price and fake_price columns to topics table if they don't exist
    $conn->query("ALTER TABLE topics ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00");
    $conn->query("ALTER TABLE topics ADD COLUMN IF NOT EXISTS fake_price DECIMAL(10,2) DEFAULT NULL");

    echo json_encode(["message" => "Database schema updated successfully. Added price columns to topics table."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error updating schema: " . $e->getMessage()]);
}

$conn->close();
?>
