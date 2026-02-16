<?php
require_once 'db.php';

// Get Top 4 Tutors by Rating
$sql = "SELECT t.*, u.name, u.surname FROM tutors t 
        JOIN user_data u ON t.user_id = u.id 
        ORDER BY t.rating DESC, t.review_count DESC 
        LIMIT 4";

$result = $conn->query($sql);

$popular = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $popular[] = $row;
    }
}

echo json_encode($popular);
?>
