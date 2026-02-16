<?php
require_once 'db.php';
header('Content-Type: text/plain');

echo "--- TABLES ---\n";
$res = $conn->query("SHOW TABLES");
while($row = $res->fetch_array()) {
    echo $row[0] . "\n";
    $m = $conn->query("SHOW COLUMNS FROM " . $row[0]);
    while($c = $m->fetch_assoc()) {
        echo "  - " . $c['Field'] . " (" . $c['Type'] . ")\n";
    }
}

echo "\n--- TUTOR TOPICS SAMPLE ---\n";
$res = $conn->query("SELECT * FROM tutor_topics LIMIT 5");
while($row = $res->fetch_assoc()) {
    print_r($row);
}

echo "\n--- TUTORS SAMPLE ---\n";
$res = $conn->query("SELECT id, user_id FROM tutors LIMIT 5");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
