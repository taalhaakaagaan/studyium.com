<?php
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];
// $data = json_decode(file_get_contents("php://input"), true); // No longer using JSON input for POST

if ($method === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add') {
        $title = $_POST['title'] ?? '';
        $category = $_POST['category'] ?? '';
        $excerpt = $_POST['excerpt'] ?? '';
        $content = ''; // No longer using content directly from input, setting as empty
        
        // Generate Slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
        $slug .= '-' . time(); // Ensure uniqueness

        // PDF Upload
        $pdf_url = null;
        if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/blog/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            
            $fileName = time() . '_' . basename($_FILES['pdf_file']['name']);
            if (move_uploaded_file($_FILES['pdf_file']['tmp_name'], $uploadDir . $fileName)) {
                $pdf_url = '/uploads/blog/' . $fileName;
            }
        }
        
        $stmt = $conn->prepare("INSERT INTO blog_posts (title, slug, category, excerpt, content, pdf_url) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $title, $slug, $category, $excerpt, $content, $pdf_url);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Blog eklendi", "id" => $stmt->insert_id]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Hata: " . $stmt->error]);
        }
    } elseif ($action === 'delete') {
        // Support JSON input for delete if sent as JSON
        $id = $_POST['id'] ?? null;
        if (!$id) {
            $data = json_decode(file_get_contents("php://input"), true);
            $id = $data['id'] ?? null;
        }

        if ($id) {
            $stmt = $conn->prepare("DELETE FROM blog_posts WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            echo json_encode(["message" => "Silindi"]);
        }
    }
}
?>
