<?php
require_once 'db.php';

echo "<h2>Mesajlar Tablosu Kurulumu</h2>";

// Create messages table
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE
)";

if ($conn->query($sql)) {
    echo "Table 'messages' checked/created successfully.<br>";
} else {
    echo "Error creating table: " . $conn->error . "<br>";
}

echo "<hr>Done. Try sending an announcement now.";
?>
