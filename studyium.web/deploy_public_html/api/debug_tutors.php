<?php
require_once '../db.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/plain');

echo "--- Debugging get_tutors.php Logic ---\n";

// 1. Check Main Query
$sql = "SELECT t.*, u.name, u.surname, u.email FROM tutors t JOIN user_data u ON t.user_id = u.id";
echo "SQL: $sql\n";

$result = $conn->query($sql);

if (!$result) {
    echo "Error in Main Query: " . $conn->error . "\n";
    exit;
}

echo "Found " . $result->num_rows . " tutors.\n";

while ($row = $result->fetch_assoc()) {
    $tutor_id = $row['id'];
    echo "Processing Tutor ID: $tutor_id (" . $row['name'] . ")\n";

    // 2. Check Topic Query
    $topic_sql = "SELECT topic_id, tp.name as topic_name FROM tutor_topics tt JOIN topics tp ON tt.topic_id = tp.id WHERE tutor_id = $tutor_id";
    $topic_res = $conn->query($topic_sql);
    if (!$topic_res) {
        echo "  Error in Topic Query: " . $conn->error . "\n";
    } else {
        echo "  Topics found: " . $topic_res->num_rows . "\n";
    }

    // 3. Check Price Query
    $price_sql = "SELECT MIN(tp.price) as min_price, MAX(tp.fake_price) as max_fake FROM tutor_topics tt JOIN topics tp ON tt.topic_id = tp.id WHERE tt.tutor_id = $tutor_id";
    $price_res = $conn->query($price_sql);
    if (!$price_res) {
        echo "  Error in Price Query: " . $conn->error . "\n";
    } else {
        $price_data = $price_res->fetch_assoc();
        echo "  Price Data: " . print_r($price_data, true) . "\n";
    }
}
echo "--- End Debug ---\n";
?>
