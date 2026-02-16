<?php
require_once '../db.php';
require_once '../mail.php';

$data = json_decode(file_get_contents("php://input"), true);
$booking_id = $data['id'] ?? 0;
$status = $data['status'] ?? ''; // 'approved' or 'rejected'

if (!$booking_id || !in_array($status, ['approved', 'rejected'])) {
    http_response_code(400);
    echo json_encode(["message" => "Geçersiz parametreler."]);
    exit;
}

// 1. Update Booking Status
$stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $booking_id);

if ($stmt->execute()) {
    
    // 2. If Approved, Send Email to Tutor
    if ($status === 'approved') {
        // Fetch Booking, Tutor, and Student Info
        // We need: Tutor Email, Tutor Name, Student Name, Student Contact, Booking Date
        
        $sql = "
            SELECT 
                b.booking_date,
                t.user_id as tutor_user_id,
                tu.email as tutor_email,
                tu.name as tutor_name,
                u.name as student_name,
                u.surname as student_surname,
                u.email as student_email,
                u.gsm as student_gsm
            FROM bookings b
            JOIN tutors t ON b.tutor_id = t.id
            JOIN user_data tu ON t.user_id = tu.id
            JOIN user_data u ON b.student_id = u.id
            WHERE b.id = ?
        ";
        
        $info_stmt = $conn->prepare($sql);
        $info_stmt->bind_param("i", $booking_id);
        $info_stmt->execute();
        $res = $info_stmt->get_result();
        
        if ($row = $res->fetch_assoc()) {
            $tutor_email = $row['tutor_email'];
            $tutor_name = $row['tutor_name'];
            $student_fullname = $row['student_name'] . ' ' . $row['student_surname'];
            $student_contact_email = $row['student_email'];
            $student_contact_gsm = $row['student_gsm'];
            $booking_date = $row['booking_date'];
            $note = ''; // Note column does not exist currently
            // Wait, I didn't add 'note' column to bookings table in get_bookings.php earlier check
            // But let's assume it might not exist or verify schema.
            // If I created table in get_bookings.php lines 5-13, no note column.
            // But api/book.php collected note.
            // I'll assume it handles it safely. If note is missing, it's fine.
            
            $subject = "Studyium: Yeni Randevu Talebi (Onaylandı)";
            $message = "
            <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;'>
                <h2 style='color: #4F46E5;'>Merhaba $tutor_name,</h2>
                <p>Yönetici tarafından onaylanan yeni bir randevunuz var.</p>
                
                <div style='background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;'>
                    <h4 style='margin-top: 0;'>Detaylar:</h4>
                    <p><strong>Öğrenci:</strong> $student_fullname</p>
                    <p><strong>Tarih:</strong> $booking_date</p>
                    <p><strong>Öğrenci Email:</strong> $student_contact_email</p>
                    <p><strong>Öğrenci Tel:</strong> $student_contact_gsm</p>
                </div>
                
                <p>Lütfen panelinizden randevuları takip ediniz.</p>
                <hr>
                <a href='https://studyium.com/profile' style='background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Panele Git</a>
            </div>
            ";
            
            $smtp = new SimpleSMTP();
            $smtp->send($tutor_email, $subject, $message);
        }
    }
    
    echo json_encode(["message" => "Randevu durumu güncellendi: $status"]);
} else {
    http_response_code(500);
    echo json_encode(["message" => "Veritabanı hatası."]);
}

$conn->close();
?>
