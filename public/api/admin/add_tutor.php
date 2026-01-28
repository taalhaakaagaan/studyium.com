<?php
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Create User First (simplified)
    $name = $data['name'];
    $surname = $data['surname'];
    $email = $data['email'];
    $password = 'tutor123'; // Default password
    $bio = $data['bio'];
    $subjects = $data['subjects'];

    $account_name = $data['account_name'] ?? '';
    $iban = $data['iban'] ?? '';

    // Check if email exists
    $check = $conn->prepare("SELECT id FROM user_data WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $res = $check->get_result();
    
    $user_id = null;
    
    if ($res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $user_id = $row['id'];
        
        // Check if already a tutor
        $checkTutor = $conn->query("SELECT id FROM tutors WHERE user_id = $user_id");
        if ($checkTutor->num_rows > 0) {
            http_response_code(400);
            echo json_encode(["message" => "Bu email adresi ile kayıtlı bir eğitmen zaten var."]);
            exit;
        }
        
        // User exists but not tutor: Upgrade user to tutor (update role and proceed)
        $conn->query("UPDATE user_data SET role='tutor' WHERE id=$user_id");
        $stmt_success = true; // Skip insert user
    } else {
        // Create new user
        $stmt = $conn->prepare("INSERT INTO user_data (name, surname, email, password, role, is_verified) VALUES (?, ?, ?, ?, 'tutor', 1)");
        $stmt->bind_param("ssss", $name, $surname, $email, $password);
        $stmt_success = $stmt->execute();
        if ($stmt_success) $user_id = $conn->insert_id;
    }

    if ($stmt_success && $user_id) {
        // Proceed to add to tutors table (CONTINUE BELOW)

        
        $stmt2 = $conn->prepare("INSERT INTO tutors (user_id, bio, subjects, account_name, iban) VALUES (?, ?, ?, ?, ?)");
        $stmt2->bind_param("issss", $user_id, $bio, $subjects, $account_name, $iban);
        
        if ($stmt2->execute()) {
            $tutor_id = $stmt2->insert_id;
    
            // Handle Topics
            if (isset($data['topic_ids']) && is_array($data['topic_ids'])) {
                $topic_ids = $data['topic_ids'];
                $t_stmt = $conn->prepare("INSERT INTO tutor_topics (tutor_id, topic_id) VALUES (?, ?)");
                foreach ($topic_ids as $tid) {
                    $dup = $conn->query("SELECT id FROM tutor_topics WHERE tutor_id = $tutor_id AND topic_id = $tid");
                    if ($dup->num_rows == 0) {
                        $t_stmt->bind_param("ii", $tutor_id, $tid);
                        $t_stmt->execute();
                    }
                }
            }
            
            echo json_encode(["message" => "Hoca eklendi"]);
        } else {
            error_log("Add Tutor SQL Error: " . $conn->error);
            http_response_code(500);
            echo json_encode(["message" => "Hoca tablosuna eklenirken hata: " . $conn->error]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Kullanıcı oluşturulurken hata: " . $conn->error]);
    }
}
?>
