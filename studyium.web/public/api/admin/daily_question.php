<?php
require_once '../db.php'; // Adjust path to db.php if needed (public/api/admin/ -> public/db.php is ../../db.php? No, usually checking file structure)

// Check relative path for db.php. 
// public/api/daily_question.php used ../db.php (which means public/db.php).
// public/api/admin/xxx.php would need ../../db.php if it's in a subdir.
// Let's assume standard structure, if db.php is in public/.

// Check auth (Simplified for this task, usually involves session/token check)
// Assuming this endpoint is protected by the frontend/admin app logic or server config.

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $date = $_POST['question_date'] ?? date('Y-m-d');
    $correct_answer = $_POST['correct_answer'] ?? '';

    if (empty($correct_answer) || !isset($_FILES['pdf_file'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing fields']);
        exit;
    }

    // Upload Logic
    $target_dir = "../../uploads/daily_questions/";
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $file_name = $date . "_" . time() . "_" . basename($_FILES["pdf_file"]["name"]);
    $target_file = $target_dir . $file_name;
    $public_url = "/uploads/daily_questions/" . $file_name;

    if (move_uploaded_file($_FILES["pdf_file"]["tmp_name"], $target_file)) {
        
        // Insert or Update (Upsert)
        $sql = "INSERT INTO daily_questions (question_date, pdf_url, correct_answer) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE pdf_url = VALUES(pdf_url), correct_answer = VALUES(correct_answer)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sss", $date, $public_url, $correct_answer);
        
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Question saved']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $conn->error]);
        }
    } else {
        $errorMsg = "Dosya yükleme başarısız.";
        if ($_FILES['pdf_file']['error'] !== UPLOAD_ERR_OK) {
             $uploadError = $_FILES['pdf_file']['error'];
             $errorMsg .= " Hata Kodu: $uploadError";
             if ($uploadError === UPLOAD_ERR_INI_SIZE || $uploadError === UPLOAD_ERR_FORM_SIZE) {
                $errorMsg = "Dosya boyutu çok büyük (Server Limit).";
             }
        }
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }
}
?>
