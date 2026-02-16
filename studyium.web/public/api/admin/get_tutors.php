<?php
require_once '../db.php';

// Prevent any output before JSON
ob_start();

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'debug_log.txt');
error_reporting(E_ALL);

header('Content-Type: application/json');

try {
    $sql = "SELECT t.*, u.name, u.surname, u.email FROM tutors t JOIN user_data u ON t.user_id = u.id";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Main Query Failed: " . $conn->error);
    }

    $tutors = [];
    while ($row = $result->fetch_assoc()) {
        $tutor_id = $row['id'];
        
        // Fetch real topics
        $topic_sql = "SELECT topic_id, (SELECT name FROM topics WHERE id = topic_id) as name FROM tutor_topics WHERE tutor_id = $tutor_id";
        $topic_res = $conn->query($topic_sql);
        $topic_ids = [];
        $topic_names = [];
        
        if ($topic_res) {
            while($t_row = $topic_res->fetch_assoc()) {
                 $topic_ids[] = $t_row['topic_id'];
                 $topic_names[] = $t_row['name'];
            }
        }
        
        $row['topic_ids'] = $topic_ids;
        $row['topic_names'] = $topic_names;
        $row['active'] = $row['active'] ?? 'active';
        
        $tutors[] = $row;
    }

    $count = count($tutors);
    error_log("get_tutors: Returning $count tutors.");

    ob_clean(); // Clean any warnings
    echo json_encode($tutors);

} catch (Exception $e) {
    error_log("Critical Error in get_tutors: " . $e->getMessage());
    ob_clean();
    echo json_encode([]); // Return empty array on failure
}
?>
