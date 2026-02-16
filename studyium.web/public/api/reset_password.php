<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    $new_password = $data['new_password'] ?? '';

    if (empty($email) || empty($code) || empty($new_password)) {
        http_response_code(400);
        echo json_encode(["message" => "Eksik bilgi."]);
        exit;
    }

    // Verify Token
    $stmt = $conn->prepare("SELECT id FROM user_data WHERE email = ? AND verification_token = ?");
    $stmt->bind_param("ss", $email, $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Update Password
        // Note: Password should ideally be hashed if the system uses hashing. 
        // Based on previous login.php (Step 169), it seems passwords are stored as plain text currently ($password === $data['password']).
        // I will stick to plain text to match existing system.
        
        $update = $conn->prepare("UPDATE user_data SET password = ?, verification_token = NULL WHERE email = ?");
        $update->bind_param("ss", $new_password, $email);
        
        if ($update->execute()) {
            echo json_encode(["message" => "Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Güncelleme hatası."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Geçersiz doğrulama kodu."]);
    }
}
?>
