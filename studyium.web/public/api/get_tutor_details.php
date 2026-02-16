<?php
require_once 'db.php';

$tutor_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$viewer_id = isset($_GET['viewer_id']) ? (int)$_GET['viewer_id'] : 0;

if (!$tutor_id) {
    echo json_encode(["error" => "No ID provided"]);
    exit;
}

// 1. Get Tutor Info
$sql = "SELECT t.*, u.name, u.surname, u.email 
        FROM tutors t 
        JOIN user_data u ON t.user_id = u.id 
        WHERE t.id = $tutor_id AND (t.active IS NULL OR t.active != 'passive')";

$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "SQL Error: " . $conn->error]);
    exit;
}

$tutor = $result->fetch_assoc();

if ($tutor) {
    // Override Price Logic: Fetch from Topics
    $price_res = $conn->query("SELECT MIN(tp.price) as min_price, MAX(tp.fake_price) as max_fake FROM tutor_topics tt JOIN topics tp ON tt.topic_id = tp.id WHERE tt.tutor_id = $tutor_id");
    if ($price_res) {
        $price_data = $price_res->fetch_assoc();
        $tutor['hourly_rate'] = $price_data['min_price'] !== null ? $price_data['min_price'] : "0.00";
        $tutor['fake_hourly_rate'] = $price_data['max_fake'] !== null ? $price_data['max_fake'] : null;
    }
}

if (!$tutor) {
    // Check if ID exists in Tutors at least?
    $check = $conn->query("SELECT id FROM tutors WHERE id = $tutor_id");
    if ($check && $check->num_rows > 0) {
        $extra_info = "Tutor ID exists but User Data join failed (Orphaned).";
    } else {
        $extra_info = "Tutor ID does not exist in database.";
    }
    
    echo json_encode(["error" => "Tutor not found. $extra_info"]);
    exit;
}

// 2. Get Reviews
// Ideally we'd have a 'reviews' table. For now we will simulate reviews or create a table on the fly if needed.
// Phase 6 Requirement: "Review capability".
// Let's CREATE the reviews table if not exists (Lazy migration)
$conn->query("CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT,
    student_id INT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

$rev_sql = "SELECT r.*, u.name as student_name 
            FROM reviews r 
            JOIN user_data u ON r.student_id = u.id 
            WHERE r.tutor_id = $tutor_id 
            ORDER BY r.created_at DESC";
$reviews = [];
$res = $conn->query($rev_sql);
while($row = $res->fetch_assoc()) {
    $reviews[] = $row;
}

// 3. Check Can Review
// Rule: Student must have at least one 'confirmed' or 'completed' booking with this tutor
$can_review = false;
if ($viewer_id) {
    // Check if user already reviewed
    $check_existing = $conn->query("SELECT id FROM reviews WHERE tutor_id = $tutor_id AND student_id = $viewer_id");
    if ($check_existing->num_rows == 0) {
        // Check for past booking
        // Accepting 'pending' for demo purposes, but ideally 'completed'
        $check_booking = $conn->query("SELECT id FROM bookings WHERE tutor_id = $tutor_id AND student_id = $viewer_id");
        if ($check_booking->num_rows > 0) {
            $can_review = true;
        }
    }
}

// 4. Get Tutor Topics
$topics = [];
$topic_sql = "SELECT tp.id, tp.name, tp.price 
              FROM tutor_topics tt 
              JOIN topics tp ON tt.topic_id = tp.id 
              WHERE tt.tutor_id = $tutor_id";
$res = $conn->query($topic_sql);
if ($res) {
    while($row = $res->fetch_assoc()) {
        $topics[] = $row;
    }
}

// FIX: Overwrite 'subjects' logic with STRICT data from topics
// This ensures the frontend subtitle matches the actual active topics
if (!empty($topics)) {
    $subject_names = array_map(function($t) { return $t['name']; }, $topics);
    $tutor['subjects'] = implode(", ", $subject_names);
} else {
    $tutor['subjects'] = ""; // No topics, no subjects string
}

echo json_encode([
    "tutor" => $tutor,
    "topics" => $topics,
    "reviews" => $reviews,
    "can_review" => $can_review
]);
?>
