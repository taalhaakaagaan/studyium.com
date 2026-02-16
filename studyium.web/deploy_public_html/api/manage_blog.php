<?php
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST') {
    $action = $data['action'] ?? '';
    
    if ($action === 'add') {
        $title = $data['title'];
        $excerpt = $data['excerpt'];
        $category = $data['category'];
        
        // Generate Slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $slug .= '-' . time(); // Ensure uniqueness
        
        $stmt = $conn->prepare("INSERT INTO blog_posts (title, excerpt, category, slug, content) VALUES (?, ?, ?, ?, '')");
        $stmt->bind_param("ssss", $title, $excerpt, $category, $slug);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Yazı eklendi"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Hata: " . $stmt->error]);
        }
    } elseif ($action === 'delete') {
        $id = $data['id'];
        $conn->query("DELETE FROM blog_posts WHERE id = $id");
        echo json_encode(["message" => "Yazı silindi"]);
    }
}
?>
