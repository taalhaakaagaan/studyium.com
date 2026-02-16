<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = $data['name'] ?? '';
    $surname = $data['surname'] ?? '';
    $email = $data['email'] ?? '';
    $gsm = $data['gsm'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($name) || empty($surname) || empty($email) || empty($gsm) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Tüm alanları doldurunuz."]);
        exit;
    }

    // 0. Ensure table exists (Lazy setup)
    $conn->query("CREATE TABLE IF NOT EXISTS pending_registrations (
        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        gsm VARCHAR(20),
        password VARCHAR(255),
        role VARCHAR(10) DEFAULT 'user',
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Ensure 'role' column exists in case table was created earlier without it
    $conn->query("ALTER TABLE pending_registrations ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'user' AFTER password");

    // 1. Check if user already exists in MAIN table
    $stmt = $conn->prepare("SELECT email FROM user_data WHERE email = ?");
    if (!$stmt) {
        http_response_code(500);
        die(json_encode(["message" => "Sistem hatası (prepare failed): " . $conn->error]));
    }
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Bu email adresi zaten kayıtlı."]);
    } else {
        // 2. Clear any existing PENDING registration (restart process)
        $del = $conn->prepare("DELETE FROM pending_registrations WHERE email = ?");
        if ($del) {
            $del->bind_param("s", $email);
            $del->execute();
            $del->close();
        }

        // 3. Insert into PENDING table
        // Generate 6-Digit Verification Code
        $token = rand(100000, 999999);

        $stmt_ins = $conn->prepare("INSERT INTO pending_registrations (name, surname, email, gsm, password, verification_token) VALUES (?, ?, ?, ?, ?, ?)");
        
        if (!$stmt_ins) {
            http_response_code(500);
            die(json_encode(["message" => "Kayıt tablosu hazırlanamadı: " . $conn->error]));
        }

        $stmt_ins->bind_param("ssssss", $name, $surname, $email, $gsm, $password, $token);
        
        if ($stmt_ins->execute()) {
            // Send Email
            require_once 'mail.php';
            $sent = send_verification_email($email, $name, $token);
            
            http_response_code(201);
            if ($sent) {
                echo json_encode(["message" => "Kayıt doğrulama kodu gönderildi. Lütfen email adresinizi kontrol edin."]);
            } else {
                // If mail fails, we might still want to keep the pending record or delete it?
                // Keeping it allows manual retry if we had a resend endpoint. 
                // For now, warn user.
                echo json_encode(["message" => "Kayıt başlatıldı ancak doğrulama maili gönderilemedi. Lütfen tekrar deneyin."]);
            }
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Kayıt sırasında bir hata oluştu: " . $stmt->error]);
        }
    }
    
    $stmt->close();
}
$conn->close();
?>
