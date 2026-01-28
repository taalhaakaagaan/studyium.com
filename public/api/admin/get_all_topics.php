<?php
require_once '../db.php';

header('Content-Type: application/json');

$sql = "SELECT t.id, t.name, t.lesson_id, l.name as lesson_name, l.category, t.price, t.fake_price 
        FROM topics t 
        JOIN lessons l ON t.lesson_id = l.id 
        ORDER BY l.category, l.name, t.name";

$result = $conn->query($sql);

$topics = [];
while ($row = $result->fetch_assoc()) {
    $topics[] = $row;
}

echo json_encode($topics);
?>
