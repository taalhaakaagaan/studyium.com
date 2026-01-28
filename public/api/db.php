<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$host = '127.0.0.1';
$db_user = 'u302174108_egeceylan';
$db_pass = 'HelloWorld!21';
$db_name = 'u302174108_users_data';

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die(json_encode(["message" => "Connection failed: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

// Start Session for simplified state management if needed
session_start();
