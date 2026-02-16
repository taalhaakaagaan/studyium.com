<?php
require_once 'db.php';
header('Content-Type: application/json');

$lessons = $conn->query("SELECT * FROM lessons");
$topics = $conn->query("SELECT * FROM topics LIMIT 50");

$res = [
    'lesson_count' => $lessons->num_rows,
    'topic_count' => $topics->num_rows,
    'sample_topics' => []
];

while($row = $topics->fetch_assoc()) {
    $res['sample_topics'][] = $row;
}

echo json_encode($res, JSON_PRETTY_PRINT);
?>
