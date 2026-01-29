<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // pending_registrations Table
    $sql = "CREATE TABLE IF NOT EXISTS pending_registrations (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        gsm VARCHAR(20),
        password VARCHAR(255),
        role VARCHAR(10) DEFAULT 'user',
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["message" => "Table 'pending_registrations' created successfully."]);
    } else {
        throw new Exception("Error creating table: " . $conn->error);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Setup Error: " . $e->getMessage()]);
}

$conn->close();
?>
