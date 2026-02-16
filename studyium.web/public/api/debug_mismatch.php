<?php
require_once '../db.php';
header('Content-Type: application/json');

// Check for ID ranges
$tutors = $conn->query("SELECT id, user_id FROM tutors");
$tutor_map = [];
while($row = $tutors->fetch_assoc()) {
    $tutor_map[$row['id']] = $row['user_id'];
}

$topics = $conn->query("SELECT DISTINCT tutor_id FROM tutor_topics");
$topic_tutor_ids = [];
while($row = $topics->fetch_assoc()) {
    $topic_tutor_ids[] = $row['tutor_id'];
}

$mismatches = [];
$matches = [];
$possible_user_id_usage = [];

foreach ($topic_tutor_ids as $tid) {
    if (isset($tutor_map[$tid])) {
        $matches[] = $tid;
    } else {
        // This ID is NOT in tutors table as 'id'.
        // Is it in tutors table as 'user_id'?
        $found_as_user = false;
        foreach ($tutor_map as $ real_tid => $uid) {
            if ($uid == $tid) {
                 $possible_user_id_usage[] = ["topic_tutor_id_refers_to_user_id" => $tid, "real_tutor_id" => $real_tid];
                 $found_as_user = true;
                 break;
            }
        }
        if (!$found_as_user) {
            $mismatches[] = $tid;
        }
    }
}

echo json_encode([
    "total_tutors" => count($tutor_map),
    "tutors_with_topics_count" => count($topic_tutor_ids),
    "valid_links" => count($matches),
    "suspicious_links_using_user_id" => $possible_user_id_usage,
    "orphaned_links" => $mismatches,
    "sample_tutor_map" => array_slice($tutor_map, 0, 5, true)
]);
?>
