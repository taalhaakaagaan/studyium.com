<?php
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit;
}

$userId = $_GET['userId'] ?? $_SESSION['user_id'];
// Allow admin or self to view.
if ($userId != $_SESSION['user_id'] && $_SESSION['role'] !== 'admin') {
    // maybe allow viewing public profile? but this fetches bookings/money stats.
    // Restrict to self for now.
    $userId = $_SESSION['user_id'];
}

// Get User
$stmt = $conn->prepare("SELECT id, name, email, role, date(created_at) as created_at FROM user_data WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$userRes = $stmt->get_result();
if ($userRes->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}
$user = $userRes->fetch_assoc();

$stats = [];
$bookings = [];
$comments = [];

if ($user['role'] === 'student' || $user['role'] === 'user') {
    // Bookings
    $stmt = $conn->prepare("
        SELECT b.id, b.created_at as date, b.payment as amount, b.status,
            t_ud.name as teacher_name, 'Lesson' as topic_name
        FROM bookings b
        LEFT JOIN tutors t ON b.tutor_id = t.id
        LEFT JOIN user_data t_ud ON t.user_id = t_ud.id
        WHERE b.student_id = ?
        ORDER BY b.created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $bRes = $stmt->get_result();
    while ($row = $bRes->fetch_assoc()) $bookings[] = $row;

    // Comments/Reviews
    $stmt = $conn->prepare("
        SELECT r.*, t.name as tutor_name, r.comment as content 
        FROM reviews r
        LEFT JOIN user_data t ON r.tutor_id = t.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $rRes = $stmt->get_result();
    while ($row = $rRes->fetch_assoc()) $comments[] = $row;

} else if ($user['role'] === 'tutor' || $user['role'] === 'teacher') {
    // Teacher logic
    $stmt = $conn->prepare("
        SELECT b.id, b.created_at as date, b.payment as amount, b.status,
            s_ud.name as student_name, 'Lesson' as topic_name
        FROM bookings b
        LEFT JOIN user_data s_ud ON b.student_id = s_ud.id
        WHERE b.tutor_id = (SELECT id FROM tutors WHERE user_id = ?)
        ORDER BY b.created_at DESC
    ");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $bRes = $stmt->get_result();
    while ($row = $bRes->fetch_assoc()) $bookings[] = $row;

    // Calculate Earnings
    $totalEarnings = 0;
    foreach ($bookings as $b) {
        if ($b['status'] !== 'rejected' && $b['status'] !== 'pending') {
            $totalEarnings += (float)$b['amount'];
        }
    }
    $stats['totalEarnings'] = $totalEarnings;

    // Reviews
    $stmt = $conn->prepare("SELECT id FROM tutors WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $tRes = $stmt->get_result();
    if ($tRes->num_rows > 0) {
        $tutor = $tRes->fetch_assoc();
        $tutorId = $tutor['id'];
        
        $stmt = $conn->prepare("
            SELECT r.*, s.name as student_name, r.comment as content 
            FROM reviews r
            LEFT JOIN user_data s ON r.student_id = s.id
            WHERE r.tutor_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->bind_param("i", $tutorId);
        $stmt->execute();
        $rRes = $stmt->get_result();
        while ($row = $rRes->fetch_assoc()) $comments[] = $row;
    }
}

echo json_encode(["success" => true, "user" => $user, "bookings" => $bookings, "comments" => $comments, "stats" => $stats]);
?>
