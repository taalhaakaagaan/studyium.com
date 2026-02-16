<?php
require_once 'db.php';

echo "<h2>Veritabanı Şema Düzeltmesi</h2>";

// 1. Add created_at to bookings
echo "Checking bookings.created_at...<br>";
$sql = "ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP";
if ($conn->query($sql)) {
    echo "Column 'created_at' added to bookings.<br>";
} else {
    echo "Result: " . $conn->error . "<br>";
}

// 2. Add note to bookings (if missing)
echo "Checking bookings.note...<br>";
$sql = "ALTER TABLE bookings ADD COLUMN note TEXT";
if ($conn->query($sql)) {
    echo "Column 'note' added to bookings.<br>";
} else {
    echo "Result: " . $conn->error . "<br>";
}

// 3. Add gsm to user_data (if missing)
echo "Checking user_data.gsm...<br>";
$sql = "ALTER TABLE user_data ADD COLUMN gsm VARCHAR(20)";
if ($conn->query($sql)) {
    echo "Column 'gsm' added to user_data.<br>";
} else {
    echo "Result: " . $conn->error . "<br>";
}

echo "<hr>Done. Please check Admin Panel again.";
?>
