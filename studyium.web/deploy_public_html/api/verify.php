<?php
require_once 'db.php';

$email = $_GET['email'] ?? '';
$token = $_GET['token'] ?? '';

if (empty($email) || empty($token)) {
    die("Geçersiz istek.");
}

$stmt = $conn->prepare("SELECT id FROM user_data WHERE email = ? AND verification_token = ?");
$stmt->bind_param("ss", $email, $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $conn->query("UPDATE user_data SET is_verified = 1, verification_token = NULL WHERE id = " . $user['id']);
    echo "<h1>Email başarıyla doğrulandı!</h1><p>Şimdi <a href='/login.html'>Giriş Yapabilirsiniz</a>.</p>";
} else {
    echo "<h1>Doğrulama başarısız veya link geçersiz.</h1>";
}
?>
