<?php
require_once 'db.php';
require_once 'mail.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data['email'] ?? '';

    if (empty($email)) {
        http_response_code(400);
        echo json_encode(["message" => "Email adresi gereklidir."]);
        exit;
    }

    // Check user exists
    $stmt = $conn->prepare("SELECT id, name FROM user_data WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        // Generate Token
        $token = rand(100000, 999999);
        
        // Update DB
        $update = $conn->prepare("UPDATE user_data SET verification_token = ? WHERE id = ?");
        $update->bind_param("si", $token, $user['id']);
        $update->execute();
        
        // Send Email
        $domain = $_SERVER['HTTP_HOST'] ?? 'studyium.com';
        $subject = "Studyium Şifre Sıfırlama Kodu";
        $message = "
        <div style='font-family: Arial, sans-serif; padding: 20px; text-align: center; border: 1px solid #ddd; border-radius: 10px; max-width: 500px; margin: 0 auto;'>
            <h2 style='color: #4F46E5;'>Şifre Sıfırlama</h2>
            <p>Merhaba {$user['name']},</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
            <div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;'>$token</div>
            <p style='font-size: 12px; color: #666;'>Bu işlemi siz yapmadıysanız güvenliğiniz için şifrenizi değiştirmeyiniz.</p>
        </div>
        ";
        
        $smtp = new SimpleSMTP();
        if ($smtp->send($email, $subject, $message)) {
            echo json_encode(["message" => "Doğrulama kodu email adresinize gönderildi."]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Mail gönderilemedi."]);
        }
    } else {
        // Return success even if user not found to prevent user enumeration security risk? 
        // Or for now just return error for UX. Explicit error is better for this dev stage.
        http_response_code(404);
        echo json_encode(["message" => "Bu email adresiyle kayıtlı kullanıcı bulunamadı."]);
    }
}
?>
