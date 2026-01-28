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
        
        // Simplified Mode: Disable complex inner queries for debugging
        $row['topic_ids'] = [];
        $row['topic_names'] = ['Matematik (Debug)'];
        $row['hourly_rate'] = "500.00"; // Static debug price
        $row['fake_hourly_rate'] = null;
        
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
