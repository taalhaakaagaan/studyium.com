<?php
require_once '../db.php';

$standardGroups = ["TYT Matematik", "TYT Türkçe", "TYT Fizik", "TYT Kimya", "TYT Biyoloji", "TYT Tarih", "TYT Coğrafya", "AYT Matematik", "AYT Fizik", "AYT Kimya", "AYT Biyoloji", "AYT Edebiyat", "AYT Tarih", "AYT Coğrafya"];

foreach ($standardGroups as $groupName) {
    $stmt = $conn->prepare("SELECT id FROM chat_groups WHERE name = ?");
    $stmt->bind_param("s", $groupName);
    $stmt->execute();
    if ($stmt->get_result()->num_rows === 0) {
        $insert = $conn->prepare("INSERT INTO chat_groups (name, type) VALUES (?, 'lesson')");
        $insert->bind_param("s", $groupName);
        $insert->execute();
    }
}
echo json_encode(["success" => true]);
?>
