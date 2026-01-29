<?php
require_once 'db.php';
// Test the problematic query from get_bookings.php
$sql = "
    SELECT 
        b.id, 
        b.booking_date, 
        b.status, 
        b.created_at
    FROM bookings b
    ORDER BY b.created_at DESC
";

$result = $conn->query($sql);

if (!$result) {
    echo "SQL Error: " . $conn->error;
} else {
    echo "Query Success. Rows found: " . $result->num_rows . "<br>";
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        print_r($row);
    }
}

// Check database columns
echo "<hr>Columns in bookings:<br>";
$res = $conn->query("SHOW COLUMNS FROM bookings");
while ($row = $res->fetch_assoc()) {
    echo $row['Field'] . " (" . $row['Type'] . ")<br>";
}
?>
