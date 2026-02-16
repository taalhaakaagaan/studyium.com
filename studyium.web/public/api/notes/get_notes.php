<?php
require_once '../db.php';

// Optional filters
$category = $_GET['category'] ?? null; // TYT, AYT
$lesson_id = $_GET['lesson_id'] ?? null;
$slug = $_GET['slug'] ?? null;

    if ($slug) {
    // Detail view
    $stmt = $conn->prepare("SELECT n.*, l.name as lesson_name FROM lesson_notes n LEFT JOIN lessons l ON n.lesson_id = l.id WHERE n.slug = ? AND n.is_active = 1");
    $stmt->bind_param("s", $slug);
} elseif ($lesson_id) {
    $stmt = $conn->prepare("SELECT n.id, n.title, n.slug, n.category, n.lesson_id, n.created_at, n.pdf_url, l.name as lesson_name FROM lesson_notes n LEFT JOIN lessons l ON n.lesson_id = l.id WHERE n.lesson_id = ? AND n.is_active = 1 ORDER BY n.created_at DESC");
    $stmt->bind_param("i", $lesson_id);
} elseif ($category) {
    $stmt = $conn->prepare("SELECT n.id, n.title, n.slug, n.category, n.lesson_id, n.created_at, n.pdf_url, l.name as lesson_name FROM lesson_notes n LEFT JOIN lessons l ON n.lesson_id = l.id WHERE n.category = ? AND n.is_active = 1 ORDER BY n.created_at DESC");
    $stmt->bind_param("s", $category);
} else {
    // List all
    $stmt = $conn->prepare("SELECT n.id, n.title, n.slug, n.category, n.lesson_id, n.created_at, n.pdf_url, l.name as lesson_name FROM lesson_notes n LEFT JOIN lessons l ON n.lesson_id = l.id WHERE n.is_active = 1 ORDER BY n.created_at DESC LIMIT 50");
}

$stmt->execute();
$result = $stmt->get_result();

$notes = [];
if ($slug) {
    $notes = $result->fetch_assoc();
} else {
    while ($row = $result->fetch_assoc()) {
        $notes[] = $row;
    }
}

echo json_encode($notes);

$conn->close();
?>
