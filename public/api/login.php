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
        // Secure Session Start for Admin
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', 1);
            ini_set('session.cookie_same_site', 'Lax'); // Or None if cross-origin needed, but Lax is better for safety
            ini_set('session.gc_maxlifetime', 3600);
            session_start();
        }
        session_regenerate_id(true);
        $_SESSION['role'] = 'admin';
        $_SESSION['email'] = $email;
        $_SESSION['user_id'] = 0; // Admin ID

        echo json_encode([
            "message" => "Admin girişi başarılı",
            "role" => "admin",
            "redirectUrl" => "/admin"
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
        
        // Start Session if not already
        if (session_status() === PHP_SESSION_NONE) {
             ini_set('session.cookie_httponly', 1);
             session_start();
        }
        
        $_SESSION['user_id'] = $user['id']; 
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'] ?? 'user';

        echo json_encode([
            "message" => "Giriş başarılı",
            "role" => $user['role'],
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
