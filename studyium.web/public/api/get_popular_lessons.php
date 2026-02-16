<?php
require_once 'db.php';

// Get Top 4 Tutors by Rating
// STRICT MODE: Only show subjects that actually exist in tutor_topics
$sql = "SELECT t.id, t.user_id, t.rating, t.hourly_rate, t.fake_hourly_rate, t.review_count, u.name, u.surname,
        (
            SELECT GROUP_CONCAT(DISTINCT l.name SEPARATOR ', ')
            FROM tutor_topics tt
            JOIN topics top ON tt.topic_id = top.id
            JOIN lessons l ON top.lesson_id = l.id
            WHERE tt.tutor_id = t.id
        ) as subjects
        FROM tutors t 
        JOIN user_data u ON t.user_id = u.id 
        WHERE (t.active = 'active' OR t.active IS NULL OR t.active = '')
        GROUP BY t.id -- Ensure unique tutors
        ORDER BY t.rating DESC, t.review_count DESC 
        LIMIT 4";

$result = $conn->query($sql);

$popular = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        // If subjects is null or empty, it means no topics assigned via Admin Panel.
        // We set it to empty string. Frontend should handle empty string by not showing random badges.
        if (empty($row['subjects'])) { 
            $row['subjects'] = ""; 
        }
        $popular[] = $row;
    }
}

echo json_encode($popular);
?>
