<?php
require_once 'db.php';

header('Content-Type: application/json');

// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

try {
    $search = $_GET['search'] ?? '';

    $sql = "SELECT DISTINCT t.*, u.name, u.surname, u.email
            FROM tutors t
            JOIN user_data u ON t.user_id = u.id
            LEFT JOIN tutor_topics tt ON t.id = tt.tutor_id
            LEFT JOIN topics tp ON tt.topic_id = tp.id
            WHERE t.active = 'active'";

    $params = [];
    $types = "";

    if (!empty($search)) {
        $searchWithWildcard = "%" . $search . "%";
        // Search by tutor name, surname, or TOPIC name
        $sql .= " AND (u.name LIKE ? OR u.surname LIKE ? OR tp.name LIKE ?)";
        $params[] = $searchWithWildcard;
        $params[] = $searchWithWildcard;
        $params[] = $searchWithWildcard;
        $types .= "sss";
    }

    $stmt = $conn->prepare($sql);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    if (!$stmt->execute()) {
         throw new Exception("Query failed: " . $stmt->error);
    }

    $result = $stmt->get_result();

    $tutors = [];
    // Use an array to track processed IDs to avoid duplicates if DISTINCT fails due to Left Join text data
    $processed_ids = []; 

    while ($row = $result->fetch_assoc()) {
        $tutor_id = $row['id'];
        
        if (in_array($tutor_id, $processed_ids)) continue;
        $processed_ids[] = $tutor_id;
        
        // Fetch topics for this tutor STRICTLY
        $topics_sql = "SELECT tp.name FROM topics tp 
                       JOIN tutor_topics tt ON tp.id = tt.topic_id 
                       WHERE tt.tutor_id = $tutor_id";
        $topics_res = $conn->query($topics_sql);
        $topic_names = [];
        while($t_row = $topics_res->fetch_assoc()) {
            $topic_names[] = $t_row['name'];
        }
        $row['topic_names'] = $topic_names;
        
        // FIX: Overwrite static 'subjects' column with actual dynamic topics
        $row['subjects'] = implode(", ", $topic_names);
        
        // Format hourly rate
        $row['hourly_rate'] = number_format((float)$row['hourly_rate'], 2, '.', '');
        if ($row['fake_hourly_rate']) {
             $row['fake_hourly_rate'] = number_format((float)$row['fake_hourly_rate'], 2, '.', '');
        }

        $tutors[] = $row;
    }

    echo json_encode($tutors);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
