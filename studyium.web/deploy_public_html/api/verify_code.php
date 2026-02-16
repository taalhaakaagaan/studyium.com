<?php
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$code = $data['code'] ?? '';

if (empty($email) || empty($code)) {
    http_response_code(400);
    echo json_encode(["message" => "Eksik bilgi."]);
    exit;
}

// Check Pending Registrations
$stmt = $conn->prepare("SELECT name, surname, email, gsm, password, role FROM pending_registrations WHERE email = ? AND verification_token = ?");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $pending_user = $result->fetch_assoc();
    
    // Transfer to user_data with default role 'visitor'
    $role = 'visitor';
    $insert = $conn->prepare("INSERT INTO user_data (name, surname, email, gsm, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)");
    $insert->bind_param("ssssss", $pending_user['name'], $pending_user['surname'], $pending_user['email'], $pending_user['gsm'], $pending_user['password'], $role);
    
    if ($insert->execute()) {
        $user_id = $conn->insert_id;
        
        // Delete from pending
        $del = $conn->prepare("DELETE FROM pending_registrations WHERE email = ?");
        $del->bind_param("s", $email);
        $del->execute();
        
        echo json_encode([
            "message" => "Hesabınız başarıyla doğrulandı! Giriş yapılıyor...",
            "user" => [
                "id" => $user_id,
                "name" => $pending_user['name'],
                "surname" => $pending_user['surname'],
                "email" => $pending_user['email'],
                "role" => $role
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Hesap oluşturulurken hata oluştu: " . $insert->error]);
    }
} else {
    // Fallback: Check if already verified in user_data (maybe they clicked twice?)
    $check = $conn->prepare("SELECT id FROM user_data WHERE email = ? AND is_verified = 1");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
         echo json_encode(["message" => "Bu hesap zaten doğrulanmış. Giriş yapabilirsiniz."]);
    } else {
         http_response_code(400);
         echo json_encode(["message" => "Doğrulama kodu hatalı veya geçersiz."]);
    }
}

$stmt->close();
$conn->close();
?>
