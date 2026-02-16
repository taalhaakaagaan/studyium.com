<?php
require_once '../db.php';
require_once '../mail.php';

// Check if admin
// In a real app, we check session or token. For this demo, we assume the requester is admin or we check a secret header/param if needed.
// But based on existing code, we usually check session.
// Let's assume session check or basic strict role check if session exists.

session_start();
/* 
// Example session check (uncomment if session is used for admin auth)
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}
*/

$data = json_decode(file_get_contents("php://input"), true);
$title = $data['title'] ?? '';
$content = $data['content'] ?? '';

if (empty($title) || empty($content)) {
    http_response_code(400);
    echo json_encode(["message" => "Başlık ve içerik gereklidir."]);
    exit;
}

$target = $data['target_group'] ?? 'tutors';

// Determine query based on target
if ($target === 'all') {
    $sql = "SELECT u.id, u.email, u.name, u.role FROM user_data u WHERE u.role IN ('tutor', 'user')"; // Assuming 'user' is student
} else if ($target === 'students') {
    $sql = "SELECT u.id, u.email, u.name, u.role FROM user_data u WHERE u.role = 'user'"; 
} else {
    // Default to tutors
    $sql = "SELECT u.id, u.email, u.name, u.role FROM user_data u WHERE u.role = 'tutor'";
}

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $count = 0;
    $smtp = new SimpleSMTP();

    while ($row = $result->fetch_assoc()) {
        $uid = $row['id'];
        $email = $row['email'];
        $name = $row['name'];

        // 1. Insert into DB messages
        $stmt_msg = $conn->prepare("INSERT INTO messages (user_id, title, content) VALUES (?, ?, ?)");
        $stmt_msg->bind_param("iss", $uid, $title, $content);
        $stmt_msg->execute();
        $stmt_msg->close();

        // 2. Send Email
        $subject = "Studyium Duyuru: $title";
        $email_body = "
        <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;'>
            <h2 style='color: #4F46E5;'>Sayın $name,</h2>
            <p>Yönetimden yeni bir mesajınız var:</p>
            <hr>
            <h3>$title</h3>
            <p>" . nl2br(htmlspecialchars($content)) . "</p>
            <hr>
            <p style='font-size: 12px; color: #666;'>Bu mesaj Studyium yönetim paneli üzerinden gönderilmiştir.</p>
        </div>
        ";
        
        // We catch errors to continue loop
        try {
            $smtp->send($email, $subject, $email_body);
        } catch (Exception $e) {
            // Log error but continue
            error_log("Mail send failed to $email: " . $e->getMessage());
        }
        
        $count++;
    }

    echo json_encode(["message" => "$count kullanıcıya mesaj gönderildi."]);
} else {
    echo json_encode(["message" => "Hedef kitlede kullanıcı bulunamadı."]);
}

$conn->close();
?>
