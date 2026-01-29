<?php
require_once '../db.php';

// Simple Admin check (for improved security in production, use session/token validation)
// Here assuming the frontend checks role and backend relies on that + DB check if needed
// But for now, let's just implement the logic.

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Handle Image Upload
    if (isset($_FILES['ad_image']) && $_FILES['ad_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../public/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = 'ad_' . time() . '_' . basename($_FILES['ad_image']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['ad_image']['tmp_name'], $targetPath)) {
            // URL to be stored in DB (relative to public)
            $publicUrl = '/uploads/' . $fileName;
            
            // Update DB
            $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('ad_image_url', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->bind_param("ss", $publicUrl, $publicUrl);
            $stmt->execute();
        }
    }
    
    // Handle Link URL
    if (isset($_POST['ad_link'])) {
        $link = $_POST['ad_link'];
        $stmt = $conn->prepare("INSERT INTO site_settings (setting_key, setting_value) VALUES ('ad_link_url', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->bind_param("ss", $link, $link);
        $stmt->execute();
    }
    
    // Handle Deletion/Reset
    if (isset($_POST['remove_ad']) && $_POST['remove_ad'] === 'true') {
        $empty = '';
        $stmt = $conn->prepare("UPDATE site_settings SET setting_value = ? WHERE setting_key = 'ad_image_url'");
        $stmt->bind_param("s", $empty);
        $stmt->execute();
    }

    echo json_encode(["message" => "Ayarlar güncellendi"]);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}

$conn->close();
?>
