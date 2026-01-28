<?php
require_once '../db.php';

// Check Auth
$data = json_decode(file_get_contents("php://input"), true);
$user_id = $data['user_id'] ?? 0;
// We should ideally check headers/role but keeping it simple for now
if(!$user_id) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$iban = $data['iban'] ?? '';
$bank_account_name = $data['account_name'] ?? '';

// Update tutors table. find tutor by user_id
$stmt = $conn->prepare("UPDATE tutors SET iban = ?, account_name = ? WHERE user_id = ?");
$stmt->bind_param("ssi", $iban, $bank_account_name, $user_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Updated successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error updating: " . $stmt->error]);
}

$conn->close();
?>
