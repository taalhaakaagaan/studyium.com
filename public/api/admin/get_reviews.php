<?php
require_once '../db.php';

// Ensure table exists just in case
$conn->query("CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT,
    student_id INT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$sql = "
    SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at,
        t.name as tutor_name, 
        t.surname as tutor_surname,
        u.name as student_name, 
        u.surname as student_surname
    FROM reviews r
    LEFT JOIN tutors t ON r.tutor_id = t.id
    LEFT JOIN user_data u ON r.student_id = u.id
    ORDER BY r.created_at DESC
";

$result = $conn->query($sql);
$reviews = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
}

echo json_encode($reviews);
?>
