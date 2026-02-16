<?php
// Mock GET
$_GET['id'] = 5;

require_once 'public/api/db.php';

echo "Checking Tutor ID 5...\n";

// Check Tutors Table
$res = $conn->query("SELECT * FROM tutors WHERE id = 5");
$tutor = $res->fetch_assoc();

if ($tutor) {
    echo "Tutor Row Found:\n";
    print_r($tutor);
    
    $uid = $tutor['user_id'];
    echo "Linked User ID: $uid\n";

    // Check User Table
    $res2 = $conn->query("SELECT * FROM user_data WHERE id = $uid");
    $user = $res2->fetch_assoc();
    
    if ($user) {
        echo "User Row Found:\n";
        print_r($user);
    } else {
        echo "User Row Missing! (Orphaned Tutor)\n";
    }

} else {
    echo "Tutor Row (id=5) NOT Found.\n";
}
?>
