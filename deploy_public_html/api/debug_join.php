<?php
require_once 'db.php';
header('Content-Type: application/json');

// 1. Fetch Lessons
$lessons = [];
$res_l = $conn->query("SELECT * FROM lessons");
while($row = $res_l->fetch_assoc()) $lessons[] = $row;

// 2. Fetch Topics with Join (Logic from get_all_topics.php)
$sql = "SELECT t.id, t.name, t.lesson_id, l.name as lesson_name, l.category 
        FROM topics t 
        JOIN lessons l ON t.lesson_id = l.id 
        ORDER BY l.category, l.name, t.name";
$topics_join = [];
$res_t = $conn->query($sql);
if ($res_t) {
    while($row = $res_t->fetch_assoc()) $topics_join[] = $row;
} else {
    $topics_join_error = $conn->error;
}

echo json_encode([
    'lessons_count' => count($lessons),
    'lessons_sample' => array_slice($lessons, 0, 5),
    'topics_join_count' => count($topics_join),
    'topics_join_sample' => array_slice($topics_join, 0, 5),
    'join_error' => $topics_join_error ?? null
], JSON_PRETTY_PRINT);
?>
