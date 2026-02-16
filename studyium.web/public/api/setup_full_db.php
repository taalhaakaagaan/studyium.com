<?php
require_once 'db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/plain');

echo "Veritabanı kontrolü ve kurulumu başlıyor...\n";
echo "Mevcut veriler KORUNACAK. Sadece eksik tablolar ve sütunlar eklenecek.\n\n";

function checkAndAddColumn($conn, $table, $column, $definition) {
    try {
        $check = $conn->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
        if ($check->num_rows == 0) {
            $sql = "ALTER TABLE `$table` ADD COLUMN $column $definition";
            if ($conn->query($sql) === TRUE) {
                echo "[OK] '$table' tablosuna '$column' sütunu eklendi.\n";
            } else {
                echo "[HATA] '$table' tablosuna '$column' eklenemedi: " . $conn->error . "\n";
            }
        }
    } catch (Exception $e) {
        // Table might not exist yet, which is fine
    }
}

// 1. USERS Table
$sql = "CREATE TABLE IF NOT EXISTS users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'tutor', 'admin') DEFAULT 'student',
    verification_code VARCHAR(6),
    is_verified TINYINT(1) DEFAULT 0,
    reset_token VARCHAR(64) DEFAULT NULL,
    reset_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'users' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'users' tablosu: " . $conn->error . "\n";

// Check potential missing columns in users
checkAndAddColumn($conn, 'users', 'verification_code', 'VARCHAR(6)');
checkAndAddColumn($conn, 'users', 'is_verified', 'TINYINT(1) DEFAULT 0');
checkAndAddColumn($conn, 'users', 'reset_token', 'VARCHAR(64) DEFAULT NULL');
checkAndAddColumn($conn, 'users', 'reset_expiry', 'DATETIME DEFAULT NULL');


// 2. TUTORS Table
$sql = "CREATE TABLE IF NOT EXISTS tutors (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    bio TEXT,
    city VARCHAR(50),
    subjects TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    image VARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    course_details TEXT,
    account_name VARCHAR(100),
    iban VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'tutors' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'tutors' tablosu: " . $conn->error . "\n";

checkAndAddColumn($conn, 'tutors', 'account_name', 'VARCHAR(100)');
checkAndAddColumn($conn, 'tutors', 'iban', 'VARCHAR(50)');
checkAndAddColumn($conn, 'tutors', 'course_details', 'TEXT');
checkAndAddColumn($conn, 'tutors', 'user_id', 'INT(6) UNSIGNED'); // Ensure link exists


// 3. LESSONS Table
$sql = "CREATE TABLE IF NOT EXISTS lessons (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'lessons' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'lessons' tablosu: " . $conn->error . "\n";


// 4. TOPICS Table
$sql = "CREATE TABLE IF NOT EXISTS topics (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT(6) UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'topics' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'topics' tablosu: " . $conn->error . "\n";

checkAndAddColumn($conn, 'topics', 'price', 'DECIMAL(10,2)');


// 5. BOOKINGS Table
$sql = "CREATE TABLE IF NOT EXISTS bookings (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT(6) UNSIGNED NOT NULL,
    student_id INT(6) UNSIGNED NOT NULL,
    booking_date DATETIME NOT NULL,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    note TEXT,
    lesson_id INT(6) UNSIGNED,
    lesson_name VARCHAR(100),
    session_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'bookings' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'bookings' tablosu: " . $conn->error . "\n";

checkAndAddColumn($conn, 'bookings', 'lesson_id', 'INT(6) UNSIGNED');
checkAndAddColumn($conn, 'bookings', 'lesson_name', 'VARCHAR(100)');
checkAndAddColumn($conn, 'bookings', 'session_link', 'VARCHAR(255)');


// 6. MESSAGES Table
$sql = "CREATE TABLE IF NOT EXISTS messages (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sender_id INT(6) UNSIGNED NOT NULL,
    receiver_id INT(6) UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    file_path VARCHAR(255),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'messages' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'messages' tablosu: " . $conn->error . "\n";

checkAndAddColumn($conn, 'messages', 'file_path', 'VARCHAR(255)');
checkAndAddColumn($conn, 'messages', 'file_name', 'VARCHAR(255)');


// 7. REVIEWS Table
$sql = "CREATE TABLE IF NOT EXISTS reviews (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT(6) UNSIGNED NOT NULL,
    student_id INT(6) UNSIGNED NOT NULL,
    rating INT(1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'reviews' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'reviews' tablosu: " . $conn->error . "\n";


// 8. BLOG POSTS Table
$sql = "CREATE TABLE IF NOT EXISTS blog_posts (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    excerpt TEXT,
    content LONGTEXT,
    image VARCHAR(255),
    author_id INT(6) UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'blog_posts' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'blog_posts' tablosu: " . $conn->error . "\n";


// 9. LECTURE NOTES Table (New)
$sql = "CREATE TABLE IF NOT EXISTS lecture_notes (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    topic_id INT(6) UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_topic_note (topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'lecture_notes' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'lecture_notes' tablosu: " . $conn->error . "\n";


// 10. PAYMENTS Table
$sql = "CREATE TABLE IF NOT EXISTS payments (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT(6) UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'payments' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'payments' tablosu: " . $conn->error . "\n";


// 11. VISITS Table (Analytics)
$sql = "CREATE TABLE IF NOT EXISTS visits (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    page_url VARCHAR(255),
    user_agent VARCHAR(255),
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

if ($conn->query($sql) === TRUE) echo "[OK] 'visits' tablosu kontrol edildi/oluşturuldu.\n";
else echo "[HATA] 'visits' tablosu: " . $conn->error . "\n";


echo "\n\nİşlem tamamlandı. Veritabanı yapısı artık güncel.";
$conn->close();
?>
