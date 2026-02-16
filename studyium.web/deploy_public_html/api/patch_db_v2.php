<?php
require_once 'db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$response = [];

try {
    // 1. Add IBAN and Account Name to Tutors Table
    $check_iban = $conn->query("SHOW COLUMNS FROM tutors LIKE 'iban'");
    if ($check_iban->num_rows == 0) {
        // bank_account_name
        $sql = "ALTER TABLE tutors ADD COLUMN bank_account_name VARCHAR(100) DEFAULT NULL AFTER subjects";
        if ($conn->query($sql) === TRUE) {
            $response[] = "Column 'bank_account_name' added to 'tutors'.";
        } else {
             $response[] = "Error adding 'bank_account_name': " . $conn->error;
        }

        // iban
        $sql = "ALTER TABLE tutors ADD COLUMN iban VARCHAR(50) DEFAULT NULL AFTER bank_account_name";
        if ($conn->query($sql) === TRUE) {
            $response[] = "Column 'iban' added to 'tutors'.";
        } else {
             $response[] = "Error adding 'iban': " . $conn->error;
        }

    } else {
        $response[] = "Columns 'iban'/'bank_account_name' already exist in 'tutors'.";
    }

    echo json_encode(["status" => "success", "messages" => $response]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Patch Error: " . $e->getMessage()]);
}

$conn->close();
?>
