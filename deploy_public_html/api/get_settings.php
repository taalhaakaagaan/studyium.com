<?php
require_once 'db.php';

$sql = "SELECT setting_key, setting_value FROM site_settings";
$result = $conn->query($sql);

$settings = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
}

echo json_encode($settings);

$conn->close();
?>
