<?php
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Fallback to $_POST if JSON payload is empty (e.g. form submission)
    if (!$data) {
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
    } else {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
    }

    // Admin Check
    if ($email === 'studyium.17@gmail.com' && $password === 'HelloWorld!21') {
        echo json_encode([
            "message" => "Admin girişi başarılı",
            "role" => "admin",
            "redirectUrl" => "/admin" // Note: This will need special handling in static site (probably admin/index.html)
        ]);
        exit;
    }

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(["message" => "Email ve şifre gereklidir."]);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, name, surname, email, role, is_verified FROM user_data WHERE email = ? AND password = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if ($user['is_verified'] == 0) {
            // Generate new token
            $new_token = rand(100000, 999999);
            
            // Update DB
            $update_stmt = $conn->prepare("UPDATE user_data SET verification_token = ? WHERE id = ?");
            // Assuming $user['id'] is not selected in the SELECT query above, I need to check if 'id' is in the SELECT.
            // The previous SELECT was: "SELECT name, surname, email FROM user_data ..."
            // I need to update the SELECT query to include 'id' first.
            
            // But wait, I can do this in two steps or simply fetch ID.
            // Let's first fix the SELECT query in a separate edit or assume I will fix it.
            // I will assume I need to fetch ID. 
            // Actually, in the ReplacementContent I cannot change lines outside the target scope easily if they are far away.
            // The SELECT is at line 32. 
            // I should update the SELECT first or in the same block if possible.
            // Since I am replacing a block inside the "if", I can't easily change the SELECT above.
            // But I can fetch the ID again or just trust email.
            // Better practice: Update the SELECT at line 32 to include ID.
            
            // Wait, I will use email for update since email is unique.
            $update_stmt = $conn->prepare("UPDATE user_data SET verification_token = ? WHERE email = ?");
            $update_stmt->bind_param("ss", $new_token, $email);
            $update_stmt->execute();
            
            // Send Email
            require_once 'mail.php';
            send_verification_email($email, $user['name'], $new_token, 'login');

            http_response_code(403);
            echo json_encode([
                "message" => "Doğrulama kodu yenilendi ve e-posta adresinize gönderildi. Lütfen kodu giriniz.",
                "require_verification" => true,
                "email" => $email
            ]);
            exit;
        }

        echo json_encode([
            "message" => "Giriş başarılı",
            "role" => "user",
            "user" => $user,
            "redirectUrl" => "/"
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Hatalı email veya şifre."]);
    }

    $stmt->close();
}
$conn->close();
?>
