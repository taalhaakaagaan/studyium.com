<?php
require_once '../db.php';

header('Content-Type: text/plain');

echo "--- Visitor Tracking Debugger ---\n";

// 1. Check Connection
if ($conn->connect_error) {
    die("Connection Failed: " . $conn->connect_error . "\n");
}
echo "Database Connected successfully.\n";

// 2. Check Table Existence
$tableExists = $conn->query("SHOW TABLES LIKE 'site_visits'")->num_rows > 0;
echo "Table 'site_visits' exists: " . ($tableExists ? "YES" : "NO") . "\n";

if (!$tableExists) {
    echo "Attempting to create table...\n";
    $sql = "CREATE TABLE IF NOT EXISTS site_visits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        visit_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_daily_visit (ip_address, visit_date)
    )";
    if ($conn->query($sql) === TRUE) {
        echo "Table created successfully.\n";
    } else {
        echo "Error creating table: " . $conn->error . "\n";
    }
}

// 3. Try to Record a Visit (Test)
$ip = $_SERVER['REMOTE_ADDR'];
$today = date('Y-m-d');
echo "Your IP: $ip\n";
echo "Today: $today\n";

$stmt = $conn->prepare("INSERT IGNORE INTO site_visits (ip_address, visit_date) VALUES (?, ?)");
$stmt->bind_param("ss", $ip, $today);
if ($stmt->execute()) {
    echo "Insert attempted (affected rows: " . $stmt->affected_rows . ")\n";
} else {
    echo "Insert failed: " . $stmt->error . "\n";
}

// 4. Dump Data
echo "\n--- Current Data in site_visits ---\n";
$result = $conn->query("SELECT * FROM site_visits ORDER BY id DESC LIMIT 10");
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"]. " - IP: " . $row["ip_address"]. " - Date: " . $row["visit_date"]. "\n";
    }
} else {
    echo "0 results in table.\n";
}

// 5. Check Stats Logic
echo "\n--- Stats Calculation Check ---\n";
$res = $conn->query("SELECT COUNT(*) as c FROM site_visits WHERE visit_date = '$today'");
$daily = (int)$res->fetch_assoc()['c'];
echo "Calculated Daily Visitors: $daily\n";

?>
