<?php
require_once 'db.php';
header('Content-Type: application/json');

$category = $_GET['category'] ?? 'TYT';

$stmt = $conn->prepare("SELECT * FROM lessons WHERE category = ? ORDER BY name ASC");
$stmt->bind_param("s", $category);
$stmt->execute();
$result = $stmt->get_result();

$lessons = [];
while ($row = $result->fetch_assoc()) {
    $lessons[] = $row;
}

echo json_encode($lessons);
?>
