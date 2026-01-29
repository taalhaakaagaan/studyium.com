<?php
require_once '../db.php';

$result = $conn->query("SELECT * FROM lessons");

$lessons = [];
while ($row = $result->fetch_assoc()) {
    $lessons[] = $row;
}

echo json_encode($lessons);
?>
