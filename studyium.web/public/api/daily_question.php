<?php
require_once 'db.php';

header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to get today's date
$today = date('Y-m-d');

if ($method === 'GET') {
    // 1. Get the Question for Today
    $sql = "SELECT id, question_date, pdf_url FROM daily_questions WHERE question_date = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $result = $stmt->get_result();
    $question = $result->fetch_assoc();

    if (!$question) {
        echo json_encode(['status' => 'no_question', 'message' => 'No question for today.']);
        exit;
    }

    $q_id = $question['id'];

    // 2. Check if user answered (if user_id provided in query params)
    $user_status = null;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id > 0) {
        $checkSql = "SELECT given_answer, is_correct, answered_at FROM daily_question_answers WHERE user_id = ? AND question_id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("ii", $user_id, $q_id);
        $checkStmt->execute();
        $user_res = $checkStmt->get_result();
        $user_status = $user_res->fetch_assoc();
    }

    // 3. Get Leaderboard (Top 10 correct answers by time)
    $leaderboardSql = "SELECT u.name, u.surname, dqa.answered_at 
                       FROM daily_question_answers dqa
                       JOIN user_data u ON dqa.user_id = u.id
                       WHERE dqa.question_id = ? AND dqa.is_correct = 1
                       ORDER BY dqa.answered_at ASC
                       LIMIT 10";
    $lbStmt = $conn->prepare($leaderboardSql);
    $lbStmt->bind_param("i", $q_id);
    $lbStmt->execute();
    $lbRes = $lbStmt->get_result();
    
    $leaderboard = [];
    while ($row = $lbRes->fetch_assoc()) {
        // Mask surname for privacy if desired, or show full. Showing full for now based on typical request.
        $leaderboard[] = $row;
    }

    echo json_encode([
        'status' => 'success',
        'question' => $question,
        'user_status' => $user_status,
        'leaderboard' => $leaderboard
    ]);
    exit;

} elseif ($method === 'POST') {
    // Submit Answer
    $user_id = isset($data['user_id']) ? intval($data['user_id']) : 0;
    $question_id = isset($data['question_id']) ? intval($data['question_id']) : 0;
    $given_answer = isset($data['answer']) ? strtoupper(trim($data['answer'])) : '';

    if ($user_id <= 0 || $question_id <= 0 || empty($given_answer)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        exit;
    }

    // Verify Question and Get Correct Answer
    $qSql = "SELECT id, correct_answer FROM daily_questions WHERE id = ?";
    $qStmt = $conn->prepare($qSql);
    $qStmt->bind_param("i", $question_id);
    $qStmt->execute();
    $qRes = $qStmt->get_result();
    $qRow = $qRes->fetch_assoc();

    if (!$qRow) {
        echo json_encode(['status' => 'error', 'message' => 'Question not found']);
        exit;
    }

    // Check if already answered
    $checkSql = "SELECT id FROM daily_question_answers WHERE user_id = ? AND question_id = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("ii", $user_id, $question_id);
    $checkStmt->execute();
    if ($checkStmt->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Already answered']);
        exit;
    }

    $is_correct = ($given_answer === $qRow['correct_answer']) ? 1 : 0;

    // Insert Answer
    $insSql = "INSERT INTO daily_question_answers (user_id, question_id, given_answer, is_correct) VALUES (?, ?, ?, ?)";
    $insStmt = $conn->prepare($insSql);
    $insStmt->bind_param("iisi", $user_id, $question_id, $given_answer, $is_correct);
    
    if ($insStmt->execute()) {
        echo json_encode([
            'status' => 'success', 
            'is_correct' => (bool)$is_correct,
            'correct_answer' => $qRow['correct_answer'] // Return result
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
    exit;
}
?>
