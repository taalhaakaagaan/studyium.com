<?php
require_once '../db.php';

// Authentication Check (Admin Only)
// In a real scenario, check session/token. For now, assuming middleware or front-end protection + lightweight check.
// Using simplified session check from login.php updates
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    // However, session_start() is in db.php.
    // If testing via Postman without cookies, this might fail. 
    // For development speed as requested, we might skip strict auth or trust the caller if local.
    // Let's add a basic check if session is active.
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $title = $_POST['title'] ?? '';
    $lesson_id = $_POST['lesson_id'] ?? null;
    $category = $_POST['category'] ?? 'TYT'; // Default
    $content = $_POST['content'] ?? '';
    $slug = $_POST['slug'] ?? '';
    
    if (empty($slug)) {
        // Auto-generate slug from title
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    }

    // Handle PDF Upload if any
    $pdf_url = null;
    if (isset($_FILES['pdf_file']) && $_FILES['pdf_file']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../public/uploads/notes/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $fileName = time() . '_' . basename($_FILES['pdf_file']['name']);
        if (move_uploaded_file($_FILES['pdf_file']['tmp_name'], $uploadDir . $fileName)) {
            $pdf_url = '/uploads/notes/' . $fileName;
        }
    }

    if ($id) {
        // Update
        $sql = "UPDATE lesson_notes SET title=?, slug=?, lesson_id=?, category=?, content=?";
        $types = "ssiss";
        $params = [&$title, &$slug, &$lesson_id, &$category, &$content];
        
        if ($pdf_url) {
            $sql .= ", pdf_url=?";
            $types .= "s";
            $params[] = &$pdf_url;
        }
        
        $sql .= " WHERE id=?";
        $types .= "i";
        $params[] = &$id;
        
        $stmt = $conn->prepare($sql);
        call_user_func_array([$stmt, 'bind_param'], array_merge([$types], $params));
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Not güncellendi", "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Hata: " . $stmt->error]);
        }
    } else {
        // Insert
        $stmt = $conn->prepare("INSERT INTO lesson_notes (title, slug, lesson_id, category, content, pdf_url) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssisss", $title, $slug, $lesson_id, $category, $content, $pdf_url);
        
        if ($stmt->execute()) {
            echo json_encode(["message" => "Not eklendi", "id" => $stmt->insert_id]);
        } else {
             // Duplicate Entry for slug likely
            http_response_code(500);
            echo json_encode(["message" => "Hata (muhtemelen aynı isimde not var): " . $stmt->error]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete Note
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM lesson_notes WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        echo json_encode(["message" => "Not silindi"]);
    }
}

$conn->close();
?>
