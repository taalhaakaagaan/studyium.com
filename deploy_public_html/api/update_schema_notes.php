<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    // Lecture Notes Table
    // Links to topics. One topic can have one note (or multiple? Let's assume one detailed note per topic for simplifying the UI).
    // Actually, "Ders Notları" might be a long text.
    // Let's use LONGTEXT.
    
    // Check if table exists
    $check = $conn->query("SHOW TABLES LIKE 'lecture_notes'");
    if ($check->num_rows == 0) {
        $sql = "CREATE TABLE lecture_notes (
            id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            topic_id INT(6) UNSIGNED NOT NULL,
            title VARCHAR(255) NOT NULL, -- Optional title, default to topic name
            content LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
            UNIQUE KEY unique_topic_note (topic_id) -- One note per topic for now
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Table 'lecture_notes' created successfully."]);
        } else {
             throw new Exception("Error creating table: " . $conn->error);
        }
    } else {
        echo json_encode(["success" => true, "message" => "Table 'lecture_notes' already exists."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
