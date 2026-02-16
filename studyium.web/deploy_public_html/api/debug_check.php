<?php
require_once 'db.php';
header('Content-Type: application/json');

$response = [];

// 1. Check Tutors Count
$res = $conn->query("SELECT COUNT(*) as c FROM tutors");
$response['tutors_count'] = $res ? $res->fetch_assoc()['c'] : "Error: " . $conn->error;

// 2. Check Topics Count
$res = $conn->query("SELECT COUNT(*) as c FROM topics");
$response['topics_count'] = $res ? $res->fetch_assoc()['c'] : "Error: " . $conn->error;

// 3. Check Tutors Columns
$res = $conn->query("SHOW COLUMNS FROM tutors");
$cols = [];
if ($res) {
    while($r = $res->fetch_assoc()) $cols[] = $r['Field'];
}
$response['tutors_columns'] = $cols;

// 4. Check Topics Columns
$res = $conn->query("SHOW COLUMNS FROM topics");
$cols = [];
if ($res) {
    while($r = $res->fetch_assoc()) $cols[] = $r['Field'];
}
$response['topics_columns'] = $cols;

// 5. Try Main Query of get_tutors
$sql = "SELECT t.*, u.name, u.surname, u.email FROM tutors t JOIN user_data u ON t.user_id = u.id LIMIT 1";
$res = $conn->query($sql);
$response['main_query_test'] = $res ? "Success" : "Fail: " . $conn->error;
if ($res && $res->num_rows > 0) {
    $response['first_tutor'] = $res->fetch_assoc();
}

// 6. Try Price Query (Simulate logic)
if (isset($response['first_tutor']['id'])) {
    $tid = $response['first_tutor']['id'];
    $response['test_tutor_id'] = $tid;
    $sql = "SELECT MIN(tp.price) as min_price, MAX(tp.fake_price) as max_fake FROM tutor_topics tt JOIN topics tp ON tt.topic_id = tp.id WHERE tt.tutor_id = $tid";
    $res = $conn->query($sql);
    $response['price_query_test'] = $res ? "Success" : "Fail: " . $conn->error;
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
