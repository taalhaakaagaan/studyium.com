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

$stmt = $conn->prepare("SELECT id, name, surname, email, role FROM user_data WHERE email = ? AND verification_token = ?");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Clear code
    $update = $conn->prepare("UPDATE user_data SET verification_token = NULL WHERE id = ?");
    $update->bind_param("i", $user['id']);
    $update->execute();

    // Set Session (Same as login.php)
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];

    echo json_encode([
        "success" => true,
        "message" => "Doğrulama başarılı.",
        "role" => $user['role'],
        "user" => $user,
        "email" => $user['email']
    ]);
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Kod hatalı."]);
}

$stmt->close();
$conn->close();
?>
